FROM python:3.11-slim

# Install yt-dlp and ffmpeg (needed for audio extraction)
RUN apt-get update && apt-get install -y ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

ENV PORT=5001
EXPOSE 5001

CMD gunicorn --bind 0.0.0.0:$PORT app:app --timeout 60 --workers 2
