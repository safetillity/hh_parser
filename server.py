from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import requests
import os
import json
from datetime import datetime, timedelta
import logging
import time

app = Flask(__name__, static_folder='frontend/build')

# Настройка CORS
CORS(app, supports_credentials=True)

# Добавляем CORS заголовки для всех ответов
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CACHE_DIR = 'cache'
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

def get_cache_path(query, region_id, num_vacancies, experience=None):
    # Создаем уникальный ключ кэша с учетом опыта работы
    cache_key = f"{query}_{region_id}_{num_vacancies}_{experience if experience else 'all'}"
    return os.path.join(CACHE_DIR, f"{cache_key}.json")

def get_cached_data(query, region_id, num_vacancies, experience=None):
    cache_path = get_cache_path(query, region_id, num_vacancies, experience)
    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_to_cache(query, region_id, num_vacancies, data, experience=None):
    cache_path = get_cache_path(query, region_id, num_vacancies, experience)
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_vacancy_details(vacancy_id):
    url = f'https://api.hh.ru/vacancies/{vacancy_id}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching vacancy details: {str(e)}")
        return None

def calculate_skill_statistics(vacancies):
    skill_counts = {}
    vacancies_with_skills = 0
    
    # Сначала собираем все навыки из вакансий, где они указаны
    for vacancy in vacancies:
        if vacancy.get('key_skills') and len(vacancy['key_skills']) > 0:
            vacancies_with_skills += 1
            for skill in vacancy['key_skills']:
                if skill and isinstance(skill, str) and skill.strip():
                    clean_skill = skill.strip()
                    skill_counts[clean_skill] = skill_counts.get(clean_skill, 0) + 1
    
    # Сортируем навыки по частоте и берем топ-20
    top_skills = dict(sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:20])
    
    # Добавляем информацию о количестве вакансий с навыками
    return {
        'skills': top_skills,
        'total_vacancies_with_skills': vacancies_with_skills
    }

@app.route('/api/search', methods=['GET', 'POST'])
def search():
    logger.info(f"Received {request.method} request to /api/search")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    try:
        if request.method == 'POST':
            data = request.get_json()
            query = data.get('query')
            num_vacancies = data.get('num_vacancies', 20)
            region_id = data.get('region', '113')
            experience = data.get('experience')
        else:
            query = request.args.get('query', '')
            num_vacancies = int(request.args.get('num_vacancies', 20))
            region_id = request.args.get('region', '113')
            experience = request.args.get('experience')

        logger.info(f"Search parameters: query={query}, region_id={region_id}, num_vacancies={num_vacancies}, experience={experience}")
        
        # Проверяем кэш с учетом опыта работы
        cached_data = get_cached_data(query, region_id, num_vacancies, experience)
        if cached_data:
            logger.info("Returning cached data")
            return jsonify(cached_data)
        
        url = f'https://api.hh.ru/vacancies'
        params = {
            'text': query,
            'area': region_id,
            'per_page': num_vacancies,
            'page': 0
        }
        
        # Добавляем параметр опыта работы, если он указан
        if experience:
            experience_map = {
                'noExperience': 'noExperience',
                'between1And3': 'between1And3',
                'between3And6': 'between3And6',
                'moreThan6': 'moreThan6'
            }
            if experience in experience_map:
                params['experience'] = experience_map[experience]
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        vacancies = []
        for item in data.get('items', [])[:num_vacancies]:
            try:
                vacancy_data = get_vacancy_details(item.get('id'))
                if not vacancy_data:
                    continue
                
                key_skills = []
                if vacancy_data and 'key_skills' in vacancy_data:
                    key_skills = [skill.get('name', '').strip() for skill in vacancy_data['key_skills'] if skill and skill.get('name')]
                    logger.info(f"Skills for vacancy {item.get('id')}: {key_skills}")
                
                salary = item.get('salary', {}) or {}
                vacancy = {
                    'id': item.get('id'),
                    'name': item.get('name'),
                    'employer': {
                        'name': item.get('employer', {}).get('name') if item.get('employer') else None,
                        'url': item.get('employer', {}).get('alternate_url') if item.get('employer') else None
                    },
                    'salary_from': salary.get('from') if salary else None,
                    'salary_to': salary.get('to') if salary else None,
                    'experience': item.get('experience', {}).get('name') if item.get('experience') else None,
                    'key_skills': key_skills
                }
                vacancies.append(vacancy)
                
                time.sleep(0.25)
            except Exception as e:
                logger.error(f"Error processing vacancy {item.get('id')}: {str(e)}")
                continue
        
        # Собираем статистику по всем вакансиям
        salary_stats = calculate_salary_stats(vacancies)
        experience_distribution = calculate_experience_distribution(vacancies)
        skills_stats = calculate_skill_statistics(vacancies)
        
        result = {
            'vacancies': vacancies,
            'statistics': {
                'total': data.get('found', 0),
                'salary_stats': salary_stats,
                'experience_distribution': experience_distribution,
                'top_skills': skills_stats['skills'],
                'skills_stats': {
                    'total_vacancies_with_skills': skills_stats['total_vacancies_with_skills']
                }
            }
        }
        
        # Сохраняем в кэш с учетом опыта работы
        save_to_cache(query, region_id, num_vacancies, result, experience)
        logger.info(f"Returning {len(vacancies)} vacancies")
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data: {str(e)}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def calculate_salary_stats(vacancies):
    salaries = []
    for vacancy in vacancies:
        if vacancy['salary_from']:
            salaries.append(vacancy['salary_from'])
        if vacancy['salary_to']:
            salaries.append(vacancy['salary_to'])
    
    if not salaries:
        return {'min': 0, 'max': 0, 'mean': 0, 'median': 0}
    
    salaries.sort()
    return {
        'min': min(salaries),
        'max': max(salaries),
        'mean': sum(salaries) / len(salaries),
        'median': salaries[len(salaries) // 2]
    }

def calculate_experience_distribution(vacancies):
    distribution = {}
    for vacancy in vacancies:
        exp = vacancy['experience'] or 'Не указан'
        distribution[exp] = distribution.get(exp, 0) + 1
    return distribution

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=3001) 