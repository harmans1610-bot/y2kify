import subprocess
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/stream')
def stream():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'Query parameter q is required'}), 400

    print(f'[audio-service] Searching: {q}')

    try:
        # Use yt-dlp to search YouTube and extract the best audio-only URL
        # --no-playlist: don't expand playlists
        # -f bestaudio: pick best audio format
        # --get-url: print the direct stream URL (no download)
        # -x: extract audio (combined with get-url gives direct audio URL)
        result = subprocess.run(
            [
                'yt-dlp',
                '--no-playlist',
                '-f', 'bestaudio[ext=m4a]/bestaudio',
                '--get-url',
                f'ytsearch1:{q}'
            ],
            capture_output=True,
            text=True,
            timeout=30
        )

        stream_url = result.stdout.strip()

        if not stream_url:
            print(f'[audio-service] yt-dlp stderr: {result.stderr}')
            return jsonify({'error': 'No audio stream found', 'detail': result.stderr}), 404

        # Also get title for display
        title_result = subprocess.run(
            [
                'yt-dlp',
                '--no-playlist',
                '--get-title',
                f'ytsearch1:{q}'
            ],
            capture_output=True,
            text=True,
            timeout=15
        )
        title = title_result.stdout.strip() or q

        print(f'[audio-service] Found: {title}')
        return jsonify({
            'streamUrl': stream_url,
            'title': title
        })

    except subprocess.TimeoutExpired:
        print('[audio-service] yt-dlp timed out')
        return jsonify({'error': 'Search timed out, try again'}), 504
    except FileNotFoundError:
        return jsonify({'error': 'yt-dlp not installed on server'}), 500
    except Exception as e:
        print(f'[audio-service] Unexpected error: {e}')
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
