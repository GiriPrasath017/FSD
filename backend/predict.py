from fastapi import APIRouter
from math import exp

from models import PredictRequest, PredictResponse, FeatureImportanceItem


router = APIRouter()


COEFFICIENTS = {
    "temperature": 0.02,
    "humidity": -0.03,
    "wind_speed": 0.015,
    "vegetation_index": 2.0,
}


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + exp(-x))


@router.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    score = (
        COEFFICIENTS["temperature"] * payload.temperature
        + COEFFICIENTS["humidity"] * payload.humidity
        + COEFFICIENTS["wind_speed"] * payload.wind_speed
        + COEFFICIENTS["vegetation_index"] * payload.vegetation_index
    )
    probability = sigmoid(score)
    risk = "HIGH" if probability >= 0.7 else "LOW"

    abs_vals = {
        k: abs(v) for k, v in COEFFICIENTS.items()
    }
    s = sum(abs_vals.values())
    feature_importance = [
        FeatureImportanceItem(feature=k, importance=(v / s if s else 0.0)) for k, v in abs_vals.items()
    ]

    explanation = (
        "Probability computed via logistic(sigmoid) over a linear combination of features. "
        "Vegetation index has the highest weight, humidity reduces risk, while temperature and wind increase it."
    )

    return PredictResponse(
        probability=round(probability, 6),
        risk=risk,
        feature_importance=feature_importance,
        explanation=explanation,
    )

