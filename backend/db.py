import json
import os
from typing import Dict, Any


USERS_DB: Dict[str, Dict[str, Any]] = {}
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
ALERTS_LOG = os.path.join(DATA_DIR, "alerts.log")


def ensure_data_dir():
    if not os.path.isdir(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)


def init_db():
    ensure_data_dir()
    load_users()


def load_users():
    global USERS_DB
    if os.path.isfile(USERS_FILE):
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    USERS_DB = {u["email"]: u for u in data}
                elif isinstance(data, dict):
                    USERS_DB = data
        except Exception:
            USERS_DB = {}
    else:
        USERS_DB = {}


def persist_user(user: Dict[str, Any]):
    USERS_DB[user["email"]] = user
    ensure_data_dir()
    # Persist as a list for simplicity
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(list(USERS_DB.values()), f, indent=2)
    except Exception:
        pass


def append_alert_log(entry: Dict[str, Any]):
    ensure_data_dir()
    try:
        with open(ALERTS_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass

