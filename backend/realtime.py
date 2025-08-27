import random
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter

from models import RealtimeFirmsRequest, RealtimeFirmsResponse, Hotspot
from alert import simulate_send_alerts


router = APIRouter()


def generate_mock_hotspots(n: int = 15) -> List[Hotspot]:
    # California bounding box (rough): lat 32.5 to 42.0, lon -124.5 to -114.0
    min_lat, max_lat = 32.5, 42.0
    min_lon, max_lon = -124.5, -114.0
    today = datetime.now(timezone.utc).date().isoformat()
    hotspots: List[Hotspot] = []
    for i in range(n):
        lat = random.uniform(min_lat, max_lat)
        lon = random.uniform(min_lon, max_lon)
        brightness = round(random.uniform(300.0, 400.0), 1)
        sat = random.choice(["A", "T"])
        hotspots.append(
            Hotspot(
                id=f"hot_{i:03d}",
                latitude=lat,
                longitude=lon,
                brightness=brightness,
                acq_date=today,
                satellite=sat,
            )
        )
    return hotspots


@router.post("/firms", response_model=RealtimeFirmsResponse)
def firms(payload: RealtimeFirmsRequest):
    hotspots = generate_mock_hotspots(15)
    triggered = [h for h in hotspots if h.brightness > 330.0]
    alerts_sent = False
    if triggered:
        emails = [u.email for u in payload.users if u.email]
        phones = [u.phone for u in payload.users if u.phone]
        subject = f"IgnisShield Realtime Alerts – {payload.project_name}"
        message = f"High fire risk detected at {len(triggered)} locations (brightness > 330)."
        simulate_send_alerts(to_emails=emails, to_phones=phones, subject=subject, message=message, source="realtime")
        alerts_sent = True

    return RealtimeFirmsResponse(
        ok=True,
        hotspots=hotspots,
        alerts_sent=alerts_sent,
        triggered_hotspots=triggered,
    )

