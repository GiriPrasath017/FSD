import os
import json
import time
import uuid
import random
from math import exp
from datetime import datetime, timezone
from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS


APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(APP_DIR, 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
ALERTS_FILE = os.path.join(DATA_DIR, 'alerts.json')
HOTSPOTS_FILE = os.path.join(DATA_DIR, 'hotspots.json')
PROFILES_FILE = os.path.join(DATA_DIR, 'profiles.json')


def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    for f in [USERS_FILE, ALERTS_FILE, HOTSPOTS_FILE, PROFILES_FILE]:
        if not os.path.isfile(f):
            with open(f, 'w', encoding='utf-8') as out:
                json.dump([], out)


def read_json_list(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return []
    except Exception:
        return []


def write_json_list(path, items):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)


def append_json_list(path, item):
    items = read_json_list(path)
    items.append(item)
    write_json_list(path, items)


app = Flask(__name__)
api = Api(app)
CORS(app, resources={r"*": {"origins": [os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')]}})


class Health(Resource):
    def get(self):
        return {"ok": True, "service": "IgnisShield Flask-RESTful API"}


class Signup(Resource):
    def post(self):
        ensure_data_dir()
        payload = request.get_json(force=True)
        name = (payload.get('name') or '').strip()
        email = (payload.get('email') or '').strip().lower()
        password = payload.get('password') or ''
        if not name or not email or not password:
            return {"error": "Missing fields"}, 400
        users = read_json_list(USERS_FILE)
        if any(u.get('email') == email for u in users):
            return {"error": "Email already registered"}, 400
        user = {
            'id': str(uuid.uuid4()),
            'name': name,
            'email': email,
            'password': password,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        users.append(user)
        write_json_list(USERS_FILE, users)
        return {"ok": True, "user": {"id": user['id'], "name": user['name'], "email": user['email']}}


class Login(Resource):
    def post(self):
        payload = request.get_json(force=True)
        email = (payload.get('email') or '').strip().lower()
        password = payload.get('password') or ''
        users = read_json_list(USERS_FILE)
        user = next((u for u in users if u.get('email') == email and u.get('password') == password), None)
        if not user:
            return {"error": "Invalid credentials"}, 401
        ts = int(time.time())
        token = f"ignisshield::{email}::{ts}"
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 3600,
            "user": {"id": user['id'], "name": user['name'], "email": user['email']}
        }


COEFFICIENTS = {
    'temperature': 0.02,
    'humidity': -0.03,
    'wind_speed': 0.015,
    'vegetation_index': 2.0,
}


class Predict(Resource):
    def post(self):
        p = request.get_json(force=True)
        temperature = float(p.get('temperature', 0))
        humidity = float(p.get('humidity', 0))
        wind_speed = float(p.get('wind_speed', 0))
        vegetation_index = float(p.get('vegetation_index', 0))
        score = (
            COEFFICIENTS['temperature'] * temperature
            + COEFFICIENTS['humidity'] * humidity
            + COEFFICIENTS['wind_speed'] * wind_speed
            + COEFFICIENTS['vegetation_index'] * vegetation_index
        )
        probability = 1.0 / (1.0 + exp(-score))
        risk = 'HIGH' if probability >= 0.7 else 'LOW'
        abs_vals = {k: abs(v) for k, v in COEFFICIENTS.items()}
        s = sum(abs_vals.values()) or 1.0
        feature_importance = [{"feature": k, "importance": v / s} for k, v in abs_vals.items()]
        explanation = "Probability via logistic(sigmoid) over weighted features; vegetation dominates, humidity reduces risk."
        return {
            'probability': round(probability, 6),
            'risk': risk,
            'feature_importance': feature_importance,
            'explanation': explanation
        }


def simulate_send_alerts(to_emails, to_phones, subject, message, source):
    deliveries = []
    to_emails = to_emails or []
    to_phones = to_phones or []
    for e in to_emails:
        deliveries.append({"to": e, "channel": "email", "status": "SENT"})
    for p in to_phones:
        deliveries.append({"to": p, "channel": "sms", "status": "SENT"})
    entry = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'subject': subject,
        'message': message,
        'source': source,
        'delivered': deliveries,
    }
    print('[ALERT]', entry)
    append_json_list(ALERTS_FILE, entry)
    return deliveries


class Alert(Resource):
    def post(self):
        p = request.get_json(force=True)
        deliveries = simulate_send_alerts(
            p.get('to_emails'), p.get('to_phones'), p.get('subject'), p.get('message'), p.get('source')
        )
        return {"ok": True, "delivered_count": len(deliveries), "delivered": deliveries}


def generate_mock_hotspots(n=15):
    min_lat, max_lat = 32.5, 42.0
    min_lon, max_lon = -124.5, -114.0
    today = datetime.now(timezone.utc).date().isoformat()
    items = []
    for i in range(n):
        items.append({
            'id': f'hot_{i:03d}',
            'latitude': round(random.uniform(min_lat, max_lat), 5),
            'longitude': round(random.uniform(min_lon, max_lon), 5),
            'brightness': round(random.uniform(300.0, 400.0), 1),
            'acq_date': today,
            'satellite': random.choice(['A', 'T'])
        })
    return items


class Firms(Resource):
    def post(self):
        p = request.get_json(force=True)
        users = p.get('users') or []
        hotspots = generate_mock_hotspots(15)
        write_json_list(HOTSPOTS_FILE, hotspots)
        triggered = [h for h in hotspots if h['brightness'] > 330.0]
        alerts_sent = False
        if triggered:
            emails = [u.get('email') for u in users if u.get('email')]
            phones = [u.get('phone') for u in users if u.get('phone')]
            subject = f"IgnisShield Realtime Alerts – {p.get('project_name', 'Project')}"
            message = f"High fire risk at {len(triggered)} locations (brightness > 330)."
            simulate_send_alerts(emails, phones, subject, message, 'realtime')
            alerts_sent = True
        return {"ok": True, "hotspots": hotspots, "alerts_sent": alerts_sent, "triggered_hotspots": triggered}


class Profiles(Resource):
    def get(self):
        return read_json_list(PROFILES_FILE)

    def post(self):
        payload = request.get_json(force=True)
        profiles = read_json_list(PROFILES_FILE)
        profile = {
            'id': str(uuid.uuid4()),
            'project_name': payload.get('project_name'),
            'api_key': payload.get('api_key'),
            'users': payload.get('users') or []
        }
        profiles.append(profile)
        write_json_list(PROFILES_FILE, profiles)
        return profile


api.add_resource(Health, '/')
api.add_resource(Signup, '/auth/signup')
api.add_resource(Login, '/auth/login')
api.add_resource(Predict, '/predict')
api.add_resource(Alert, '/alert')
api.add_resource(Firms, '/realtime/firms')
api.add_resource(Profiles, '/realtime/profiles')


if __name__ == '__main__':
    ensure_data_dir()
    app.run(host='0.0.0.0', port=8000, debug=True)

