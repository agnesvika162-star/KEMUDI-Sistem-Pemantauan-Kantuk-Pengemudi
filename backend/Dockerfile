FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libxcb1 \
    libxcb-shm0 \
    libxcb-xfixes0 \
    libx11-6 \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7700
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7700"]
