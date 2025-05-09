import hashlib
import os
import pickle
import re
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Optional
from urllib.parse import urlencode

import requests
from tqdm import tqdm

CACHE_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), "cache")

# Configure proxy settings
PROXIES = None  # Disable proxy since Tor is not running

class DataCollector:
    __API_BASE_URL = "https://api.hh.ru/vacancies/"
    __DICT_KEYS = (
        "id",
        "name",
        "employer",
        "has_salary",
        "salary_from",
        "salary_to",
        "experience",
        "schedule",
        "key_skills",
        "description",
    )

    def __init__(self, exchange_rates: Optional[Dict]):
        self._rates = exchange_rates
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive'
        }

    @staticmethod
    def clean_tags(html_text: str) -> str:
        """Remove HTML tags from the string

        Parameters
        ----------
        html_text: str
            Input string with tags

        Returns
        -------
        result: string
            Clean text without HTML tags

        """
        pattern = re.compile("<.*?>")
        return re.sub(pattern, "", html_text)

    @staticmethod
    def __convert_gross(is_gross: bool) -> float:
        return 0.87 if is_gross else 1

    def get_vacancy(self, vacancy_id: str):
        # Get data from URL
        url = f"{self.__API_BASE_URL}{vacancy_id}"
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            vacancy = response.json()
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to get vacancy {vacancy_id}: {str(e)}")
            return None

        # Extract salary
        salary = vacancy.get("salary")

        # Calculate salary:
        # Get salary into {RUB, USD, EUR} with {Gross} parameter and
        # return a new salary in RUB.
        from_to = {"from": None, "to": None}
        if salary:
            is_gross = vacancy["salary"].get("gross")
            currency = salary.get("currency", "RUR")
            
            # Если валюта не поддерживается, используем RUR как базовую
            if currency not in self._rates:
                print(f"[WARNING] Unsupported currency {currency} for vacancy {vacancy_id}, using RUR")
                currency = "RUR"
            
            for k, v in from_to.items():
                if vacancy["salary"][k] is not None:
                    _value = self.__convert_gross(is_gross)
                    from_to[k] = int(_value * salary[k] / self._rates[currency])

        # Create formatted vacancy data
        formatted_vacancy = {
            'id': vacancy_id,
            'name': vacancy.get("name", ""),  # Название вакансии
            'employer': vacancy.get("employer", {}).get("name", ""),  # Название компании
            'salary_from': from_to["from"],
            'salary_to': from_to["to"],
            'experience': vacancy.get("experience", {}).get("name", ""),
            'key_skills': [skill.get("name") for skill in vacancy.get("key_skills", [])]
        }
        
        print(f"[DEBUG] Formatted vacancy: {formatted_vacancy}")
        return formatted_vacancy

    @staticmethod
    def __encode_query_for_url(query: Optional[Dict]) -> str:
        if 'professional_roles' in query:
            query_copy = query.copy()
            roles = '&'.join([f'professional_role={r}' for r in query_copy.pop('professional_roles')])
            return roles + (f'&{urlencode(query_copy)}' if len(query_copy) > 0 else '')
        return urlencode(query)

    def collect_vacancies(self, query: Optional[Dict], refresh: bool = False, num_workers: int = 1) -> Dict:
        """Parse vacancy JSON: get vacancy name, salary, experience etc.

        Parameters
        ----------
        query : dict
            Search query params for GET requests.
        refresh :  bool
            Refresh cached data
        num_workers :  int
            Number of workers for threading.

        Returns
        -------
        dict
            Dict of useful arguments from vacancies

        """
        if num_workers is None or num_workers < 1:
            num_workers = 1

        url_params = self.__encode_query_for_url(query)

        # Get cached data if exists...
        cache_name: str = url_params
        cache_hash = hashlib.md5(cache_name.encode()).hexdigest()
        cache_file = os.path.join(CACHE_DIR, cache_hash)
        try:
            if not refresh:
                print(f"[INFO]: Get results from cache! Enable refresh option to update results.")
                return pickle.load(open(cache_file, "rb"))
        except (FileNotFoundError, pickle.UnpicklingError):
            pass

        # Check number of pages...
        target_url = self.__API_BASE_URL + "?" + url_params
        try:
            response = requests.get(target_url, headers=self.headers, timeout=30)
            response.raise_for_status()
            pages = response.json()
            print(f"[DEBUG] API Response: {pages.keys()}")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to get pages: {str(e)}")
            return {}

        # Get vacancy IDs
        vacancy_ids = [str(vacancy["id"]) for vacancy in pages.get("items", [])]
        if not vacancy_ids:
            print("[WARNING] No vacancies found")
            return {}

        # Get vacancies data
        vacancies = {}
        with ThreadPoolExecutor(max_workers=num_workers) as executor:
            for vacancy in tqdm(executor.map(self.get_vacancy, vacancy_ids), total=len(vacancy_ids)):
                if vacancy:
                    vacancies[vacancy['id']] = vacancy

        # Save to cache
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(cache_file, "wb") as f:
            pickle.dump(vacancies, f)

        return vacancies


if __name__ == "__main__":
    dc = DataCollector(exchange_rates={"USD": 0.01264, "EUR": 0.01083, "RUR": 1.00000})

    vacancies = dc.collect_vacancies(
        query={"text": "FPGA", "area": 1, "per_page": 50},
        # refresh=True
    )
    print(vacancies["Employer"])
