from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal


class UserBase(BaseModel):
    id: str
    name: str
    email: EmailStr


class SignupRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)


class SignupResponse(BaseModel):
    ok: bool
    user: UserBase


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"]
    expires_in: int
    user: UserBase


class PredictRequest(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    vegetation_index: float


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float


class PredictResponse(BaseModel):
    probability: float
    risk: Literal["HIGH", "LOW"]
    feature_importance: List[FeatureImportanceItem]
    explanation: str


class AlertRequest(BaseModel):
    to_emails: Optional[List[EmailStr]] = None
    to_phones: Optional[List[str]] = None
    subject: str
    message: str
    source: Literal["predict", "realtime"]


class AlertDelivery(BaseModel):
    to: str
    channel: Literal["email", "sms"]
    status: Literal["SENT", "QUEUED"]


class AlertResponse(BaseModel):
    ok: bool
    delivered_count: int
    delivered: List[AlertDelivery]


class RealtimeUser(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class Hotspot(BaseModel):
    id: str
    latitude: float
    longitude: float
    brightness: float
    acq_date: str
    satellite: Literal["A", "T"]


class RealtimeFirmsRequest(BaseModel):
    project_name: str
    api_link: str
    users: List[RealtimeUser]
    simulate_since: Optional[str] = None


class RealtimeFirmsResponse(BaseModel):
    ok: bool
    hotspots: List[Hotspot]
    alerts_sent: bool
    triggered_hotspots: List[Hotspot]

