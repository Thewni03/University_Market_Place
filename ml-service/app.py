from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class CategoryPredictionRequest(BaseModel):
    description: str

@app.post("/predict_category")
def predict_category(data: CategoryPredictionRequest):
    text = data.description.lower()
    
    scores = {
        "Tutoring": 0, "Web Design": 0, "Video Editing": 0, "Writing": 0, 
        "Photography": 0, "Development": 0, "Design": 0, "Music": 0, 
        "Marketing": 0, "Fitness": 0
    }
    
    keywords = {
        "Tutoring": ["teach", "tutor", "math", "science", "learn", "lesson", "student", "calculus", "physics", "chemistry"],
        "Web Design": ["web", "design", "ui", "ux", "frontend", "html", "css", "figma", "website", "tailwind"],
        "Video Editing": ["video", "edit", "premiere", "after effects", "cut", "vlog", "youtube", "render", "animation"],
        "Writing": ["write", "essay", "proofread", "blog", "article", "translation", "content", "copywriting", "grammar"],
        "Photography": ["photo", "shoot", "camera", "portrait", "photoshop", "lightroom", "event", "picture", "headshot"],
        "Development": ["code", "programming", "app", "backend", "react", "node", "python", "software", "api", "bug", "debug", "database"],
        "Design": ["logo", "graphic", "illustration", "poster", "banner", "branding", "flyer", "photoshop", "illustrator", "sketch"],
        "Music": ["music", "audio", "mix", "master", "dj", "beat", "vocal", "sound", "guitar", "piano"],
        "Marketing": ["market", "seo", "social media", "campaign", "ads", "promote", "instagram", "tiktok", "growth", "sales"],
        "Fitness": ["fit", "workout", "gym", "train", "health", "exercise", "diet", "nutrition", "coach", "weight"]
    }
    
    for category, words in keywords.items():
        for word in words:
            if word in text:
                scores[category] += len(word)
                
    best_category = max(scores.keys(), key=lambda k: scores[k])
    if scores[best_category] == 0:
        best_category = "Tutoring"
        
    return {"category": best_category}
