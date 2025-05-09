import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from nltk.corpus import stopwords as nltk_stopwords
from scipy.sparse import hstack
from sklearn.feature_extraction import DictVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge


class Predictor:
    @staticmethod
    def text_replace(text) -> pd.Series:
        return text.apply(lambda x: [i.lower() for i in x]).replace("[^a-zA-Z]\bqout\b|\bamp\b", " ", regex=True)

    @staticmethod
    def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        df_num = df[df["salary_from"].notna() | df["salary_to"].notna()]
        df_avg = df_num[["salary_from", "salary_to"]].mean(axis=1)
        df_num = df_num.drop(["has_salary", "salary_from", "salary_to"], axis=1)
        df_num.insert(3, "average_salary", df_avg)
        return df_num

    @staticmethod
    def plot_results(df: pd.DataFrame):
        fp = plt.figure("Predicted salaries", figsize=(12, 8), dpi=80)
        fp.add_subplot(2, 2, 1)
        plt.title("Average Boxplot")
        sns.boxplot(data=df[["average_salary"]], width=0.4)

        fp.add_subplot(2, 2, 2)
        plt.title("Average Swarmplot")
        sns.swarmplot(data=df[["average_salary"]].dropna(), size=6)

        fp.add_subplot(2, 2, 3)
        plt.title("Average: Distribution ")
        sns.histplot(df[["average_salary"]].dropna(), bins=12, kde=True)
        plt.grid(False)
        plt.yticks([], [])
        plt.tight_layout()
        plt.show()

    def predict(self, df: pd.DataFrame, min_df_threshold: int = 5) -> pd.DataFrame:
        stopwords_ru = set(nltk_stopwords.words("russian"))
        stopwords_en = set(nltk_stopwords.words("english"))
        stopwords = stopwords_ru | stopwords_en

        new_df = self.prepare_dataframe(df)
        tf_idf = TfidfVectorizer(min_df=min_df_threshold, stop_words=stopwords)

        txt = self.text_replace(new_df["key_skills"])
        joined_text = []
        for i, x in enumerate(txt):
            print(f"{i :<4} {x}")
            joined_text.append(" ".join(x))
        x_train_text = tf_idf.fit_transform(joined_text)

        idx = np.ravel(x_train_text.sum(axis=0).argsort(axis=1))[::-1][:7]
        top_words = np.array(tf_idf.get_feature_names())[idx].tolist()
        print("Top words used in keys: {}".format(top_words))

        dct_enc = DictVectorizer()
        x_train_cat = dct_enc.fit_transform(new_df[["experience", "name"]].to_dict("Records"))

        x_train = hstack([x_train_text, x_train_cat])

        y_train = new_df["average_salary"]
        model = Ridge(alpha=1, random_state=255)
        model.fit(x_train, y_train)

        x_test = df[df["salary_from"].isna() & df["salary_to"].isna()]

        print(x_test["description"])
        x_desc = x_test["description"].apply(str.lower)
        joined_desc = []
        for i, x in enumerate(x_desc):
            joined_text.append(" ".join(x))
        x_test_text = tf_idf.transform(joined_desc)
        x_test_cat = dct_enc.transform(x_test[["experience", "name"]].to_dict("Records"))
        x_test = hstack([x_test_text, x_test_cat])

        y_test = model.predict(x_test)
        print(
            f"[INFO]: Salary for vacancies with NaN:\n"
            f"Average is {y_test.mean(dtype=int)}"
            f"Maximum is {y_test.max(dtype=int)}"
            f"Maximum is {y_test.min(dtype=int)}"
        )

        df_tst = x_test.drop(["has_salary", "salary_from", "salary_to"], axis=1)
        df_tst.insert(3, "average_salary", y_test.astype(int))
        return df_tst
