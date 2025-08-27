import pytest
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_predict_endpoint():
    payload = {
        "temperature": 35,
        "humidity": 20,
        "wind_speed": 10,
        "vegetation_index": 0.8,
    }
    r = client.post("/predict", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "probability" in data and "risk" in data
    assert data["risk"] in ("HIGH", "LOW")


def test_realtime_firms_endpoint_and_alerts():
    payload = {
        "project_name": "Test Project",
        "api_link": "/realtime/firms",
        "users": [
            {"name": "Alice", "email": "alice@example.com", "phone": "+15550001"},
            {"name": "Bob", "email": "bob@example.com"},
        ],
    }
    r = client.post("/realtime/firms", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert isinstance(data["hotspots"], list)
    assert len(data["hotspots"]) == 15
    assert isinstance(data["alerts_sent"], bool)
