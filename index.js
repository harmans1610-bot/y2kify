const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ytSearch = require('yt-search');
const youtubedl = require('youtube-dl-exec');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(__dirname));

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI  = process.env.REDIRECT_URI;

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
        new URLSearchParams({ 
            response_type: 'code', 
            client_id: CLIENT_ID, 
            scope, 
            redirect_uri: REDIRECT_URI, 
            state,
            show_dialog: 'true' // Forces the permission prompt to appear
        }).toString()
    );
});

app.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

    if (!state || state !== storedState) {
        return res.redirect('/#error=state_mismatch');
    }
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

const DROPLET_IP = '143.110.245.170';

// ─── AUDIO STREAM (via Dedicated Droplet) ──────────────────────────────────
app.get('/api/stream', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    try {
        const r = await axios.get(`http://${DROPLET_IP}:3000/api/stream?q=${encodeURIComponent(q)}`);
        const data = r.data;
        // Point the browser to Render's proxy to avoid Mixed Content (HTTP on HTTPS)
        data.streamUrl = `/api/proxy-stream?v=${data.videoId}`;
        res.json(data);
    } catch (e) {
        console.error('Droplet search error:', e.message);
        res.status(500).json({ error: 'Audio server unreachable' });
    }
});

// Proxies the actual audio bytes from the Droplet through Render to the browser
app.get('/api/proxy-stream', async (req, res) => {
    const { v } = req.query;
    if (!v) return res.status(400).send('Video ID required');

    try {
        const r = await axios({
            method: 'get',
            url: `http://${DROPLET_IP}:3000/api/proxy-stream?v=${v}`,
            responseType: 'stream'
        });
        
        if (r.headers['content-type']) res.setHeader('Content-Type', r.headers['content-type']);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');

        r.data.pipe(res);
        r.data.on('error', err => {
            console.error('Droplet stream closed:', err.message);
            if (!res.headersSent) res.status(500).send(err.message);
            else res.end();
        });
    } catch (e) {
        console.error('Droplet proxy error:', e.message);
        if (!res.headersSent) res.status(500).send('Audio server stream error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`y2kify server on http://localhost:${PORT}`));
