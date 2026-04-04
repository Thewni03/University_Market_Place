from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("model.pkl")
EXPECTED_FEATURES = list(getattr(model, "feature_names_in_", []))

class InputData(BaseModel):
    average_rating: float
    review_count: int
    view_count: int
    price_per_hour: float
    category: str
    location: str
    booking_count: int
    response_time_min: float
    completion_rate: float

category_map = {
    "Design & Media": 0,
    "Tech & Development": 1,
    "Academic Help": 2,
    "Writing & Translation": 3,
    "Tutoring": 4,
    "Beauty Services": 5,
    "Fitness & Health": 6,
    "Events & Entertainment": 7
}

location_map = {
    "Online": 0,
    "On-Campus": 1
}

def build_model_row(data: InputData):
    # Start with all-zero expected columns
    row = {name: 0.0 for name in EXPECTED_FEATURES}

    # Numeric features
    row["average_rating"] = float(data.average_rating)
    row["review_count"] = float(data.review_count)
    row["view_count"] = float(data.view_count)
    row["price_per_hour"] = float(data.price_per_hour)
    row["booking_count"] = float(data.booking_count)
    row["response_time_min"] = float(data.response_time_min)
    row["completion_rate"] = float(data.completion_rate)

    # One-hot category (if category column exists for that value)
    cat_col = f"category_{data.category}"
    if cat_col in row:
        row[cat_col] = 1.0

    # One-hot location (training kept only location_Online)
    loc_col = f"location_{data.location}"
    if loc_col in row:
        row[loc_col] = 1.0

    # Return in exact training order
    return pd.DataFrame([[row[col] for col in EXPECTED_FEATURES]], columns=EXPECTED_FEATURES)

@app.post("/predict")
def predict(data: InputData):
    if data.category not in category_map:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Allowed values: {list(category_map.keys())}"
        )

    if data.location not in location_map:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid location. Allowed values: {list(location_map.keys())}"
        )

    features = build_model_row(data)
    prediction = model.predict(features)[0]

    return {
        "prediction": float(prediction)
    }
