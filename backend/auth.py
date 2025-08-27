from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import time
import uuid

from models import SignupRequest, SignupResponse, LoginRequest, LoginResponse, UserBase
from db import USERS_DB, persist_user


router = APIRouter()


@router.post("/signup", response_model=SignupResponse)
def signup(payload: SignupRequest):
    email = payload.email.lower()
    if email in USERS_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_record = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": email,
        # For demo purposes only; do not store plain passwords in production
        "password": payload.password,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    persist_user(user_record)
    return SignupResponse(ok=True, user=UserBase(id=user_id, name=user_record["name"], email=email))


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    email = payload.email.lower()
    user = USERS_DB.get(email)
    if not user or user.get("password") != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    ts = int(time.time())
    token = f"ignisshield::{email}::{ts}"
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=3600,
        user=UserBase(id=user["id"], name=user["name"], email=email),
    )

