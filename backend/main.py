from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import numpy as np
import requests
import re
import certifi

# Import the feature extraction function
from features import extract_features, get_clip_model

app = FastAPI(title="Thumbnail CTR Analyzer API")

# Enable CORS for localhost:5173 (Vite default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def load_models_on_startup():
    # Warm up / pre-download the CLIP model on startup
    try:
        print("Initializing models on startup...")
        get_clip_model()
        print("Startup models initialized successfully.")
    except Exception as e:
        print(f"Error initializing models on startup: {e}")

def extract_youtube_id(url):
    """Extract the video ID from a YouTube URL."""
    regex = r"(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})"
    match = re.search(regex, url)
    if match:
        return match.group(1)
    return None

def compute_ctr_prediction(features, title=None):
    """
    Computes a realistic CTR grade and score based on CLIP semantics
    and OpenCV physical features.
    """
    # 1. Physical features score (0 - 100)
    contrast_sub = min(100.0, features['contrast'] * 1.5)
    saturation_sub = min(100.0, features['saturation'] * 0.8)
    physical_base = (contrast_sub + saturation_sub) / 2.0
    
    bonus = 0.0
    if features['face_detected'] == 1:
        bonus += 15.0
    if features['text_present'] == 1:
        bonus += 15.0
    if 0.03 <= features['edge_density'] <= 0.12:
        bonus += 10.0
        
    physical_score = min(100.0, physical_base + bonus)
    
    # 2. Blend scores based on whether title context is provided
    aesthetic_score = features['aesthetic_score']
    alignment_score = features['alignment_score']
    
    if alignment_score is not None:
        # Title is provided: 45% Aesthetics, 30% Semantic Alignment, 25% Physical structure
        overall_score = (aesthetic_score * 0.45) + (alignment_score * 0.30) + (physical_score * 0.25)
    else:
        # No title: 60% Aesthetics, 40% Physical structure
        overall_score = (aesthetic_score * 0.60) + (physical_score * 0.40)
        
    # Grade prediction
    if overall_score >= 70.0:
        prediction = "High"
    elif overall_score >= 40.0:
        prediction = "Medium"
    else:
        prediction = "Low"
        
    return {
        "prediction": prediction,
        "confidence": round(overall_score, 1),
        "features": features
    }

@app.post("/predict")
async def predict(image: UploadFile = File(...), title: str = Form(None)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not an image.")

    try:
        contents = await image.read()
        features = extract_features(contents, is_bytes=True, title=title)
        return compute_ctr_prediction(features, title=title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-url")
async def predict_url(url: str = Form(...), title: str = Form(None)):
    video_id = extract_youtube_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")
        
    # High-res thumbnail URL
    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    
    try:
        response = requests.get(thumbnail_url, verify=certifi.where())
        if response.status_code != 200:
            # Fallback to standard quality
            thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
            response = requests.get(thumbnail_url, verify=certifi.where())
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Could not fetch thumbnail for this video.")
        
        contents = response.content
        features = extract_features(contents, is_bytes=True, title=title)
        result = compute_ctr_prediction(features, title=title)
        result['thumbnail_url'] = thumbnail_url
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
