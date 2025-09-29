import json
import pytest
from app import app


@pytest.fixture
def client():
    app.config.update({"TESTING": True})
    with app.test_client() as c:
        yield c


def test_predict(client):
    payload = {"temperature": 35, "humidity": 20, "wind_speed": 10, "vegetation_index": 0.8}
    rv = client.post('/predict', data=json.dumps(payload), content_type='application/json')
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'probability' in data and 'risk' in data
    assert data['risk'] in ('HIGH', 'LOW')


def test_realtime_firms(client):
    payload = {
        "project_name": "Test Project",
        "api_key": "abc123",
        "users": [{"name": "Alice", "email": "alice@example.com", "phone": "+1555"}],
    }
    rv = client.post('/realtime/firms', data=json.dumps(payload), content_type='application/json')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['ok'] is True
    assert isinstance(data['hotspots'], list) and len(data['hotspots']) == 15
    assert isinstance(data['alerts_sent'], bool)

