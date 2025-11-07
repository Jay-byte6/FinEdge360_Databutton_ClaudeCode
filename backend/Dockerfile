FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will inject PORT env var)
EXPOSE 8000

# Use shell form to allow $PORT env var substitution
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
