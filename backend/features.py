import cv2
import numpy as np
from sklearn.cluster import KMeans
import easyocr
import os
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# Initialize Haar cascade and EasyOCR reader globally for performance
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
reader = easyocr.Reader(['en'], gpu=False, verbose=False)

# Initialize CLIP model and processor globally for performance (lazy-loaded)
clip_model = None
clip_processor = None

def get_clip_model():
    global clip_model, clip_processor
    if clip_model is None:
        model_id = "openai/clip-vit-base-patch32"
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading CLIP model '{model_id}' on {device}...")
        clip_model = CLIPModel.from_pretrained(model_id).to(device)
        clip_processor = CLIPProcessor.from_pretrained(model_id)
        print("CLIP model loaded successfully.")
    return clip_model, clip_processor

def get_brightness(image):
    """Calculate the average brightness of the image."""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:, :, 2]
    return np.mean(v_channel)

def get_contrast(image):
    """Calculate contrast as the standard deviation of grayscale pixel intensities."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return np.std(gray)

def detect_face(image):
    """Return True if at least one face is detected."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return len(faces) > 0

def get_dominant_color_count(image, k=5):
    """Return the number of dominant colors (with > 5% prevalence)."""
    small_image = cv2.resize(image, (64, 64))
    pixels = small_image.reshape(-1, 3)
    
    kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
    kmeans.fit(pixels)
    
    counts = np.bincount(kmeans.labels_)
    total_pixels = len(pixels)
    
    significant_colors = np.sum((counts / total_pixels) > 0.05)
    return int(significant_colors)

def get_saturation(image):
    """Calculate the average saturation of the image (vibrant thumbnails do better)."""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    s_channel = hsv[:, :, 1]
    return np.mean(s_channel)

def get_edge_density(image):
    """Calculate edge density as a proxy for visual complexity/clutter."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return np.mean(edges) / 255.0

def detect_text(image):
    """Return True if any text is detected using EasyOCR."""
    try:
        results = reader.readtext(image)
        for (bbox, text, prob) in results:
            if prob > 0.3 and len(text.strip()) > 0:
                return True
        return False
    except Exception as e:
        print(f"Warning: EasyOCR failed ({e}). Returning False for text presence.")
        return False

def get_clip_scores(image_bgr, title=None):
    """
    Computes zero-shot aesthetic and title alignment scores using CLIP.
    """
    try:
        model, processor = get_clip_model()
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Convert BGR OpenCV image to RGB PIL Image
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)
        
        # 1. Aesthetic / Engagement score
        aesthetic_prompts = [
            "a professional, high-quality, engaging, viral YouTube thumbnail",
            "a blurry, low-quality, bad lighting, boring, amateurish thumbnail"
        ]
        
        inputs = processor(
            text=aesthetic_prompts,
            images=pil_image,
            return_tensors="pt",
            padding=True
        ).to(device)
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits_per_image = outputs.logits_per_image  # Shape: (1, num_prompts)
            probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
            
        aesthetic_score = float(probs[0]) * 100.0
        
        # 2. Title-Thumbnail Alignment score
        alignment_score = 0.0
        if title and len(title.strip()) > 0:
            alignment_prompts = [
                f"a photo or illustration representing: {title}",
                "random unrelated visual content"
            ]
            inputs_align = processor(
                text=alignment_prompts,
                images=pil_image,
                return_tensors="pt",
                padding=True
            ).to(device)
            
            with torch.no_grad():
                outputs_align = model(**inputs_align)
                logits_align = outputs_align.logits_per_image
                probs_align = logits_align.softmax(dim=-1).cpu().numpy()[0]
                
            alignment_score = float(probs_align[0]) * 100.0
            
        return {
            "aesthetic_score": round(aesthetic_score, 1),
            "alignment_score": round(alignment_score, 1) if title else None
        }
    except Exception as e:
        print(f"Warning: CLIP scoring failed ({e}). Returning default values.")
        return {
            "aesthetic_score": 50.0,
            "alignment_score": 50.0 if title else None
        }

def extract_features(image_path_or_bytes, is_bytes=False, title=None):
    """
    Extracts features from the image.
    Returns a dictionary of features.
    """
    if is_bytes:
        nparr = np.frombuffer(image_path_or_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        image = cv2.imread(image_path_or_bytes)

    if image is None:
        raise ValueError("Could not decode image.")

    brightness = get_brightness(image)
    contrast = get_contrast(image)
    face_detected = detect_face(image)
    colors = get_dominant_color_count(image)
    saturation = get_saturation(image)
    edge_density = get_edge_density(image)
    text_present = detect_text(image)

    # Extract CLIP semantic metrics
    clip_data = get_clip_scores(image, title)

    return {
        "brightness": float(brightness),
        "contrast": float(contrast),
        "face_detected": int(face_detected),
        "color_richness": int(colors),
        "saturation": float(saturation),
        "edge_density": float(edge_density),
        "text_present": int(text_present),
        "aesthetic_score": clip_data["aesthetic_score"],
        "alignment_score": clip_data["alignment_score"]
    }
