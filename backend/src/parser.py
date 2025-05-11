import argparse
import json
from typing import Dict, Optional, Sequence


class Settings:
    def __init__(
        self, config_path: str, input_args: Optional[Sequence[str]] = None, no_parse: bool = False,
    ):
        self.options: Optional[Dict] = None
        self.rates: Optional[Dict] = None
        self.refresh: bool = False
        self.num_workers: int = 1
        self.save_result: bool = False
        self.update: bool = False

        with open(config_path, "r") as cfg:
            config: Dict = json.load(cfg)

        if not no_parse:
            params = self.__parse_args(input_args)

            for key, value in params.items():
                if value is not None:
                    if key in config:
                        config[key] = value
                    if "options" in config and key in config["options"]:
                        config["options"][key] = value

            self.update = params.get("update", False)
            if params["update"]:
                with open(config_path, "w") as cfg:
                    json.dump(config, cfg, indent=2)

        for key, value in config.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def __repr__(self):
        txt = "\n".join([f"{k :<16}: {v}" for k, v in self.__dict__.items()])
        return f"Settings:\n{txt}"

    def update_params(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key) and value is not None:
                setattr(self, key, value)

    @staticmethod
    def __parse_args(inputs_args) -> Dict:
        parser = argparse.ArgumentParser(description="HeadHunter vacancies researcher")
        parser.add_argument(
            "-t", "--text", action="store", type=str, default=None, help='Search query text (e.g. "Machine learning")',
        )
        parser.add_argument(
            "-p", "--professional_roles", action="store", type=int, default=None,
            help='Professional role filter (Possible roles can be found here https://api.hh.ru/professional_roles)',
            nargs='*'
        )
        parser.add_argument(
            "-n", "--num_workers", action="store", type=int, default=None, help="Number of workers for multithreading.",
        )
        parser.add_argument(
            "-r", "--refresh", help="Refresh cached data from HH API", action="store_true", default=None,
        )
        parser.add_argument(
            "-s", "--save_result", help="Save parsed result as DataFrame to CSV file.", action="store_true", default=None,
        )
        parser.add_argument(
            "-u", "--update", action="store_true", default=None, help="Save command line args to file in JSON format.",
        )

        params, unknown = parser.parse_known_args(inputs_args)
        return vars(params)


if __name__ == "__main__":
    settings = Settings(
        config_path="../settings.json", input_args=("--num_workers", "5", "--refresh", "--text", "Data Scientist"),
    )

    print(settings)
