from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from auth import router as auth_router
from predict import router as predict_router
from alert import router as alert_router
from realtime import router as realtime_router
from db import init_db


load_dotenv()

app = FastAPI(title="IgnisShield – Forest Fire Prediction & Monitoring System")


def get_allowed_origins():
    env_origins = os.getenv("BACKEND_ALLOWED_ORIGINS")
    if env_origins:
        return [origin.strip() for origin in env_origins.split(",") if origin.strip()]
    # Default Vite dev server
    return ["http://localhost:5173"]


# Initialize in-memory DB and load persisted users
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"]) 
def root():
    return {"ok": True, "service": "IgnisShield API"}


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(predict_router, tags=["predict"])
app.include_router(alert_router, tags=["alert"])
app.include_router(realtime_router, prefix="/realtime", tags=["realtime"])

