from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import traceback
import json
import pickle
import pandas as pd
from typing import Optional, Dict
import requests
import hashlib
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
from urllib.parse import urlencode
import re

# Add the parent directory to the Python path to import the parser
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
hh_dir = os.path.join(parent_dir, 'hh')
sys.path.append(hh_dir)

print(f"[INFO] Current directory: {current_dir}")
print(f"[INFO] Parent directory: {parent_dir}")
print(f"[INFO] HH directory: {hh_dir}")

# Import the researcher module
from researcher import ResearcherHH

app = Flask(__name__)
# Enable CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/search', methods=['POST', 'OPTIONS'])
def search():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        print("[INFO] Received request:", request.get_json())
        data = request.get_json()
        query = data.get('query')
        num_vacancies = data.get('num_vacancies', 20)  # Default to 20 if not specified
        region = data.get('region', '1')  # Default to Moscow (1) if not specified
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400

        print(f"[INFO] Received search query: {query} with {num_vacancies} vacancies in region {region}")
        
        # Initialize and run the parser
        print("[INFO] Initializing researcher...")
        settings_path = os.path.join(hh_dir, 'settings.json')
        print(f"[INFO] Settings path: {settings_path}")
        
        if not os.path.exists(settings_path):
            print(f"[ERROR] Settings file not found at: {settings_path}")
            return jsonify({'error': 'Settings file not found'}), 500
            
        # Read and update settings
        with open(settings_path, 'r', encoding='utf-8') as f:
            settings = json.load(f)
            settings['options'] = {
                'text': query,
                'per_page': num_vacancies,
                'area': int(region)  # Convert region string to integer
            }
            print(f"[INFO] Updated settings: {settings}")
            
        with open(settings_path, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=2)
            
        researcher = ResearcherHH(config_path=settings_path)
        
        print("[INFO] Updating researcher with query...")
        researcher.update()
        
        print("[INFO] Running researcher...")
        researcher()
        
        print("[INFO] Reading results from CSV...")
        # Read the results from the CSV file
        results = []
        csv_path = os.path.join(hh_dir, 'hh_results.csv')
        print(f"[INFO] CSV path: {csv_path}")
        
        if not os.path.exists(csv_path):
            print(f"[ERROR] CSV file not found at: {csv_path}")
            # Try to find the file in the current directory
            alt_csv_path = os.path.join(current_dir, 'hh_results.csv')
            if os.path.exists(alt_csv_path):
                csv_path = alt_csv_path
                print(f"[INFO] Found CSV file at alternative location: {csv_path}")
            else:
                return jsonify({'error': 'Results file not found'}), 500
        
        # Read CSV and calculate statistics
        df = pd.read_csv(csv_path)
        
        # Calculate statistics
        stats = {
            'total_vacancies': len(df),
            'salary_stats': {
                'min': int(df['salary_from'].min()) if 'salary_from' in df.columns else None,
                'max': int(df['salary_to'].max()) if 'salary_to' in df.columns else None,
                'mean': int(df['salary_from'].mean()) if 'salary_from' in df.columns else None,
                'median': int(df['salary_from'].median()) if 'salary_from' in df.columns else None
            },
            'experience_distribution': df['experience'].value_counts().to_dict() if 'experience' in df.columns else {},
            'top_skills': df['key_skills'].value_counts().head(10).to_dict() if 'key_skills' in df.columns else {}
        }
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            # Skip header
            next(f)
            for line in f:
                try:
                    # Parse the CSV line and create a vacancy object
                    parts = line.strip().split(',')
                    if len(parts) >= 7:  # Ensure we have all required fields
                        # Clean and validate each field
                        id_val = parts[0].strip()
                        name_val = parts[1].strip()
                        employer_val = parts[2].strip()
                        
                        # Handle salary fields
                        salary_from = None
                        salary_to = None
                        try:
                            if parts[3] and parts[3].strip() != 'None':
                                salary_from = int(float(parts[3].strip()))
                        except (ValueError, TypeError):
                            pass
                            
                        try:
                            if parts[4] and parts[4].strip() != 'None':
                                salary_to = int(float(parts[4].strip()))
                        except (ValueError, TypeError):
                            pass
                            
                        experience_val = parts[5].strip()
                        # Фильтруем опыт с числами больше 10
                        if any(c.isdigit() for c in experience_val):
                            # Извлекаем все числа из строки
                            numbers = [int(num) for num in re.findall(r'\d+', experience_val)]
                            # Если есть числа больше 10, заменяем на "Нет данных"
                            if any(num > 10 for num in numbers):
                                experience_val = "Нет данных"
                        
                        # Обработка навыков
                        skills_val = []
                        if parts[6] and parts[6].strip() != '[]':
                            # Убираем лишние кавычки и скобки
                            skills_str = parts[6].strip().strip('[]').strip('"').strip("'")
                            # Разбиваем по запятой и убираем лишние пробелы и кавычки
                            raw_skills = [skill.strip().strip('"').strip("'") for skill in skills_str.split(',')]
                            # Фильтруем пустые строки
                            skills_val = [skill for skill in raw_skills if skill and skill.strip()]
                            # Убираем лишние символы из каждого навыка
                            skills_val = [skill.replace('[', '').replace(']', '').replace("'", '').replace('"', '').strip() for skill in skills_val]
                            # Фильтруем пустые строки после очистки и навыки с числами 1, 3, 6
                            skills_val = [skill for skill in skills_val if skill and not any(num in skill for num in ['1', '3', '6'])]
                        
                        # Извлекаем навыки из названия вакансии
                        if name_val:
                            # Ищем навыки в формате "навык1/навык2/навык3"
                            title_skills = re.findall(r'([A-Za-zА-Яа-я]+(?:/[A-Za-zА-Яа-я]+)+)', name_val)
                            for skill_group in title_skills:
                                # Разбиваем группу навыков
                                for skill in skill_group.split('/'):
                                    # Очищаем и добавляем навык
                                    clean_skill = skill.strip()
                                    # Проверяем, что навык не содержит нежелательные числа
                                    if (clean_skill and 
                                        clean_skill not in skills_val and
                                        not any(num in clean_skill for num in ['1', '3', '6']) and
                                        not any(str(num) in clean_skill for num in range(11, 1000))):
                                        skills_val.append(clean_skill)
                            
                            # Ищем отдельные навыки в скобках
                            bracket_skills = re.findall(r'\(([^)]+)\)', name_val)
                            for skill_group in bracket_skills:
                                for skill in skill_group.split(','):
                                    clean_skill = skill.strip()
                                    if (clean_skill and 
                                        clean_skill not in skills_val and
                                        not any(num in clean_skill for num in ['1', '3', '6']) and
                                        not any(str(num) in clean_skill for num in range(11, 1000))):
                                        skills_val.append(clean_skill)
                            
                            # Ищем навыки после двоеточия
                            colon_skills = re.findall(r':\s*([^,]+)', name_val)
                            for skill in colon_skills:
                                clean_skill = skill.strip()
                                if (clean_skill and 
                                    clean_skill not in skills_val and
                                    not any(num in clean_skill for num in ['1', '3', '6']) and
                                    not any(str(num) in clean_skill for num in range(11, 1000))):
                                    skills_val.append(clean_skill)
                        
                        # Дополнительная фильтрация всех навыков
                        skills_val = [
                            skill for skill in skills_val 
                            if not any(num in skill for num in ['1', '3', '6']) and
                               not any(str(num) in skill for num in range(11, 1000)) and
                               len(skill) > 1  # Исключаем слишком короткие навыки
                        ]
                        
                        # Сортируем навыки по длине (сначала более длинные)
                        skills_val.sort(key=len, reverse=True)
                        
                        vacancy = {
                            'id': id_val,
                            'name': name_val,
                            'employer': employer_val,
                            'salary_from': salary_from,
                            'salary_to': salary_to,
                            'experience': experience_val,
                            'key_skills': skills_val
                        }
                        results.append(vacancy)
                except Exception as e:
                    print(f"[WARNING] Error parsing line: {line.strip()}. Error: {str(e)}")
                    continue
        
        print(f"[INFO] Found {len(results)} vacancies")
        return jsonify({
            'vacancies': results,
            'statistics': stats
        })

    except Exception as e:
        print(f"[ERROR] Exception occurred: {str(e)}")
        print(traceback.format_exc())
        # Try to return cached results if available
        try:
            cache_file = os.path.join(hh_dir, 'src', 'cache', '266d99164354e79f0020caa881714d63')
            if os.path.exists(cache_file):
                with open(cache_file, 'rb') as f:
                    cached_data = pickle.load(f)
                    results = []
                    for i in range(len(cached_data['Name'])):
                        vacancy = {
                            'name': cached_data['Name'][i],
                            'employer': cached_data['Employer'][i],
                            'salary': 'N/A',
                            'experience': cached_data['Experience'][i],
                            'skills': cached_data['Keys'][i]
                        }
                        results.append(vacancy)
                    return jsonify({'vacancies': results, 'note': 'Using cached data'})
        except Exception as cache_error:
            print(f"[ERROR] Failed to load cached data: {str(cache_error)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[INFO] Starting server on http://localhost:5001")
    app.run(debug=True, port=5001, host='0.0.0.0') 