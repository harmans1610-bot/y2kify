require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(__dirname));

const CLIENT_ID       = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET   = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI    = process.env.REDIRECT_URI;
// URL of the separate yt-dlp audio microservice (set in Render env vars)
const AUDIO_SERVICE   = process.env.AUDIO_SERVICE_URL || 'http://localhost:5001';

// ─── SPOTIFY OAUTH ───────────────────────────────────────────────────────────
app.get('/auth/login', (req, res) => {
    const scope = [
        'user-read-private', 'user-read-email',
        'user-top-read', 'user-read-recently-played',
        'playlist-read-private', 'playlist-read-collaborative',
        'user-library-read', 'user-library-modify',
        'user-follow-read'
    ].join(' ');

    const state = Math.random().toString(36).substring(7);
    res.cookie('spotify_auth_state', state, { sameSite: 'lax' });

    res.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({ response_type: 'code', client_id: CLIENT_ID, scope, redirect_uri: REDIRECT_URI, state }).toString()
    );
});

app.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

    if (!state || state !== storedState) return res.redirect('/#error=state_mismatch');
    res.clearCookie('spotify_auth_state');

    try {
        const r = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({ code, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }).toString(),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        const { access_token, refresh_token, expires_in } = r.data;
        res.redirect(`/#access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
    } catch (e) {
        console.error('Callback error:', e.response?.data || e.message);
        res.redirect('/#error=invalid_token');
    }
});

app.post('/auth/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
    try {
        const r = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({ grant_type: 'refresh_token', refresh_token }).toString(),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        res.json(r.data);
    } catch (e) {
        console.error('Refresh error:', e.response?.data || e.message);
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// ─── AUDIO STREAM — proxied to external yt-dlp microservice ─────────────────
// This endpoint just forwards the request to the audio service, keeping the
// frontend unaware of where the audio service lives.
app.get('/api/stream', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    try {
        console.log(`[stream] Requesting audio for: ${q}`);
        const r = await axios.get(`${AUDIO_SERVICE}/stream`, {
            params: { q },
            timeout: 30000
        });
        res.json(r.data);
    } catch (e) {
        const status = e.response?.status || 502;
        const msg    = e.response?.data?.error || e.message;
        console.error('[stream] Audio service error:', msg);
        res.status(status).json({ error: msg });
    }
});

// ─── AUDIO PROXY — streams bytes from the audio service through to browser ───
// Needed so browser has no CORS issue playing the audio.
app.get('/api/proxy-stream', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('url param required');

    try {
        const upstream = await axios.get(decodeURIComponent(url), {
            responseType: 'stream',
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        res.setHeader('Content-Type', upstream.headers['content-type'] || 'audio/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        if (upstream.headers['content-length']) {
            res.setHeader('Content-Length', upstream.headers['content-length']);
        }
        upstream.data.pipe(res);
    } catch (e) {
        console.error('[proxy-stream] error:', e.message);
        res.status(502).send('Failed to proxy audio');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`y2kify on http://localhost:${PORT} | audio service: ${AUDIO_SERVICE}`));
