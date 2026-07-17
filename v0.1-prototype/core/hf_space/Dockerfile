FROM python:3.12-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App
COPY app.py .
COPY core/ ./core/

# HF Space 端口
EXPOSE 7860

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import httpx; r = httpx.get('http://localhost:7860/'); exit(0 if r.status_code == 200 else 1)"

CMD ["python", "app.py"]
