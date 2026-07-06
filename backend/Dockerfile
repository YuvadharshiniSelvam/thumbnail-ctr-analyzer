FROM python:3.10-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

# Install system dependencies for OpenCV and SSL certificates
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Pre-download the CLIP model weights during the build process
RUN python -c "from transformers import CLIPProcessor, CLIPModel; CLIPModel.from_pretrained('openai/clip-vit-base-patch32'); CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')"

COPY . .

# Set environment variables (Hugging Face Spaces uses 7860 by default)
ENV PORT=7860
EXPOSE 7860

CMD ["python", "main.py"]
