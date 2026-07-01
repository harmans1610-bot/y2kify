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

const scdl = require('soundcloud-downloader').default;

// ─── AUDIO STREAM (SoundCloud Smart Filter) ─────────────────────────────────
app.get('/api/stream', async (req, res) => {
    const { q, dur } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    
    try {
        const targetDuration = (parseInt(dur) || 0) / 1000;
        
        // Search soundcloud for tracks
        const results = await scdl.search({ query: q, resourceType: 'tracks', limit: 15 });
        if (!results || !results.collection || !results.collection.length) {
            return res.status(404).json({ error: 'No results on SoundCloud' });
        }
        
        let bestTrack = null;
        if (targetDuration > 0) {
            // Find a track that is >60 seconds and matches Spotify's duration within 15 seconds.
            // This explicitly filters out the fake 30-second Go+ previews!
            bestTrack = results.collection.find(t => {
                const sec = t.duration / 1000;
                return sec > 60 && Math.abs(sec - targetDuration) < 15;
            });
        }
        
        // Fallback to the first result if no perfect match, but still avoid 30s previews
        if (!bestTrack) {
            bestTrack = results.collection.find(t => (t.duration / 1000) > 40) || results.collection[0];
        }

        res.json({
            videoId: bestTrack.id,
            title: bestTrack.title,
            duration: Math.floor(bestTrack.duration / 1000),
            streamUrl: `/api/proxy-stream?url=${encodeURIComponent(bestTrack.permalink_url)}`
        });
    } catch (e) {
        console.error('SoundCloud search error:', e.message);
        res.status(500).json({ error: 'Audio server unreachable' });
    }
});

// Proxies the actual audio bytes to bypass CORS
app.get('/api/proxy-stream', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL required');

    try {
        const stream = await scdl.download(url);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        stream.pipe(res);
        stream.on('error', err => {
            console.error('SoundCloud stream error:', err.message);
            if (!res.headersSent) res.status(500).send(err.message);
            else res.end();
        });
    } catch (e) {
        console.error('SoundCloud proxy error:', e.message);
        if (!res.headersSent) res.status(500).send('Audio stream error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`y2kify server on http://localhost:${PORT}`));
