FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc g++ libc-dev linux-libc-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies with safety fallback for chromadb on low-memory servers
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psutil openai || true
RUN pip install --no-cache-dir chromadb --prefer-binary || true

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
