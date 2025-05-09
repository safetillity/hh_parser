import re
from typing import Dict, List

import matplotlib.pyplot as plt
import nltk
import numpy as np
import pandas as pd
import seaborn as sns
import os


class Analyzer:
    def __init__(self, save_csv: bool = False):
        self.save_csv = save_csv

    @staticmethod
    def find_top_words_from_keys(keys_list: List) -> pd.Series:
        lst_keys = []
        for keys_elem in keys_list:
            for el in keys_elem:
                if el != "":
                    lst_keys.append(re.sub("'", "", el.lower()))

        set_keys = set(lst_keys)
        dct_keys = {el: lst_keys.count(el) for el in set_keys}
        srt_keys = dict(sorted(dct_keys.items(), key=lambda x: x[1], reverse=True))
        return pd.Series(srt_keys, name="Keys")

    @staticmethod
    def find_top_words_from_description(desc_list: List) -> pd.Series:
        words_ls = " ".join([re.sub(" +", " ", re.sub(r"\d+", "", el.strip().lower())) for el in desc_list])
        words_re = re.findall("[a-zA-Z]+", words_ls)
        words_l2 = [el for el in words_re if len(el) > 2]
        words_st = set(words_l2)
        try:
            _ = nltk.corpus.stopwords.words("english")
        except LookupError:
            nltk.download("stopwords")
        finally:
            stop_words = set(nltk.corpus.stopwords.words("english"))

        words_st ^= stop_words
        words_st ^= {"amp", "quot"}
        words_cnt = {el: words_l2.count(el) for el in words_st}
        return pd.Series(dict(sorted(words_cnt.items(), key=lambda x: x[1], reverse=True)))

    def prepare_df(self, vacancies: Dict) -> pd.DataFrame:
        if not vacancies:
            print("[WARNING] No vacancies data received")
            return pd.DataFrame()

        df = pd.DataFrame.from_dict(vacancies, orient='index')
        print(f"[DEBUG] DataFrame columns: {df.columns.tolist()}")
        
        with pd.option_context("display.max_rows", None, "display.max_columns", None):
            if "has_salary" in df.columns:
                print(df[df["has_salary"]][["name", "salary_from", "salary_to", "experience"]][0:15])
            else:
                print("No salary data available")
                if all(col in df.columns for col in ["name", "experience"]):
                    print(df[["name", "experience"]][0:15])
                else:
                    print("Available columns:", df.columns.tolist())
                    print(df.head())
                
        if self.save_csv:
            print("\n\n[INFO]: Save dataframe to file...")
            csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "hh_results.csv")
            df[['id', 'name', 'employer', 'salary_from', 'salary_to', 'experience', 'key_skills']].to_csv(csv_path, index=False)
            print(f"[INFO] Saved results to: {csv_path}")
        return df

    def get_most_common_words(self, series: pd.Series, n: int = 10) -> pd.Series:
        all_words = []
        for words in series:
            if isinstance(words, list):
                all_words.extend(words)
        
        word_counts = pd.Series(all_words).value_counts()
        
        return word_counts.head(n)

    def analyze_df(self, df: pd.DataFrame) -> None:
        if df.empty:
            print("[WARNING] No data to analyze")
            return

        print("\nNumber of vacancies:", len(df))

        if "salary_to" in df.columns and "salary_from" in df.columns:
            print("\nVacancy with max salary: ")
            print(df[df["salary_to"] == df["salary_to"].max()])
            print("\nVacancy with min salary: ")
            print(df[df["salary_from"] == df["salary_from"].min()])

            print("\nDescribe salary data frame")
            df_stat = df[["salary_from", "salary_to"]].describe().applymap(lambda x: int(x) if pd.notnull(x) else x)
            print(df_stat)

            print("\nAverage statistics (filter for \"salary_from\"-\"salary_to\" parameters):")
            salary = pd.concat([df["salary_from"], df["salary_to"]]).dropna()
            print("Describe salary series:")
            print(f"Min    : {int(salary.min())}")
            print(f"Max    : {int(salary.max())}")
            print(f"Mean   : {int(salary.mean())}")
            print(f"Median : {int(salary.median())}")

        if "key_skills" in df.columns:
            print("\nMost frequently used words [Keywords]:")
            print(self.find_top_words_from_keys(df["key_skills"].tolist()))
        if "description" in df.columns:
            print("\nMost frequently used words [Description]:")
            print(self.find_top_words_from_description(df["description"].tolist()))


if __name__ == "__main__":
    analyzer = Analyzer()
