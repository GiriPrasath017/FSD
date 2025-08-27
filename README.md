# IgnisShield – Forest Fire Prediction & Monitoring System

Quickstart (local):

1. Backend
   - cd backend
   - python -m venv .venv && source .venv/bin/activate
   - pip install -r requirements.txt
   - cp .env.sample .env (optional)
   - uvicorn main:app --reload

2. Frontend
   - cd frontend
   - npm install
   - npm run dev

API Endpoints:

- POST /auth/signup
- POST /auth/login
- POST /predict
- POST /alert
- POST /realtime/firms

Docker:

- docker compose up --build

# FSD