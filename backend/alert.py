from fastapi import APIRouter
from datetime import datetime, timezone
from typing import List

from models import AlertRequest, AlertResponse, AlertDelivery
from db import append_alert_log


router = APIRouter()


def simulate_send_alerts(to_emails: List[str] | None, to_phones: List[str] | None, subject: str, message: str, source: str) -> List[AlertDelivery]:
    deliveries: List[AlertDelivery] = []
    timestamp = datetime.now(timezone.utc).isoformat()
    if to_emails:
        for email in to_emails:
            deliveries.append(AlertDelivery(to=email, channel="email", status="SENT"))
    if to_phones:
        for phone in to_phones:
            deliveries.append(AlertDelivery(to=phone, channel="sms", status="SENT"))

    log_entry = {
        "timestamp": timestamp,
        "subject": subject,
        "message": message,
        "source": source,
        "delivered": [d.model_dump() for d in deliveries],
    }
    print("[ALERT]", log_entry)
    append_alert_log(log_entry)
    return deliveries


@router.post("/alert", response_model=AlertResponse)
def send_alert(payload: AlertRequest):
    deliveries = simulate_send_alerts(
        to_emails=payload.to_emails or [],
        to_phones=payload.to_phones or [],
        subject=payload.subject,
        message=payload.message,
        source=payload.source,
    )

    return AlertResponse(ok=True, delivered_count=len(deliveries), delivered=deliveries)

