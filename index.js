require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');

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
        new URLSearchParams({ response_type: 'code', client_id: CLIENT_ID, scope, redirect_uri: REDIRECT_URI, state }).toString()
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

// ─── AUDIO STREAM (ytdl-core) ────────────────────────────────────────────────
app.get('/api/stream', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    try {
        const results = await ytSearch(q);
        if (!results?.videos?.length) return res.status(404).json({ error: 'No results' });

        const video = results.videos[0];
        const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

        const info = await ytdl.getInfo(videoUrl);
        const formats = ytdl.filterFormats(info.formats, 'audioonly');
        if (!formats.length) return res.status(404).json({ error: 'No audio formats' });

        formats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
        const best = formats.find(f => f.mimeType?.includes('mp4')) || formats[0];

        // Return metadata + a proxy URL so browser can play without CORS issues
        res.json({
            videoId: video.videoId,
            title: video.title,
            duration: video.seconds,
            // The browser will call /api/proxy-stream with this videoId
            streamUrl: `/api/proxy-stream?v=${video.videoId}`
        });
    } catch (e) {
        console.error('Stream error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// Proxies the actual audio bytes through our server so browser has no CORS issue
app.get('/api/proxy-stream', async (req, res) => {
    const { v } = req.query;
    if (!v) return res.status(400).send('Video ID required');

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${v}`;
        const info = await ytdl.getInfo(videoUrl);
        const formats = ytdl.filterFormats(info.formats, 'audioonly');
        if (!formats.length) return res.status(404).send('No audio');

        formats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
        const best = formats.find(f => f.mimeType?.includes('mp4')) || formats[0];
        const mimeType = best.mimeType?.split(';')[0] || 'audio/mp4';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = ytdl(videoUrl, { format: best });
        stream.on('error', err => { console.error('ytdl stream error:', err.message); res.end(); });
        stream.pipe(res);
    } catch (e) {
        console.error('Proxy stream error:', e.message);
        res.status(500).send(e.message);
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`y2kify server on http://localhost:${PORT}`));
