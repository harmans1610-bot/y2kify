require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ytSearch = require('yt-search');
const path = require('path');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(__dirname));

// Multiple Piped API instances as fallbacks
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://piped-api.garudalinux.org',
    'https://api.piped.yt',
    'https://pipedapi.tokhmi.xyz'
];

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/**
 * SPOTIFY OAUTH
 */
app.get('/auth/login', (req, res) => {
    // Full scope list needed for all features
    const scope = [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-library-read',
        'user-library-modify',
        'user-follow-read'
    ].join(' ');

    const state = Math.random().toString(36).substring(7);
    res.cookie('spotify_auth_state', state, { sameSite: 'lax' });

    const authUrl = 'https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: state
        }).toString();

    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#error=state_mismatch');
        return;
    }

    res.clearCookie('spotify_auth_state');

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }).toString(), 
            {
                headers: {
                    'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = response.data;
        res.redirect(`/#access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
    } catch (error) {
        console.error('Error in callback:', error.response ? error.response.data : error.message);
        res.redirect('/#error=invalid_token');
    }
});

// Token refresh endpoint — called by frontend when token expires
app.post('/auth/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({ grant_type: 'refresh_token', refresh_token }).toString(),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        res.json(response.data);
    } catch (e) {
        console.error('Refresh error:', e.response ? e.response.data : e.message);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

/**
 * AUDIO PROXY (YOUTUBE / PIPED)
 * This searches YouTube for the track and gets an audio stream URL
 */
app.get('/api/stream', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
        // 1. Search YouTube
        const searchResult = await ytSearch(query);
        if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
            return res.status(404).json({ error: 'No video found' });
        }
        const videoId = searchResult.videos[0].videoId;

        // 2. Try each Piped instance until one works
        let audioStreams = null;
        for (const instance of PIPED_INSTANCES) {
            try {
                const r = await axios.get(`${instance}/streams/${videoId}`, { timeout: 6000 });
                if (r.data && r.data.audioStreams && r.data.audioStreams.length > 0) {
                    audioStreams = r.data.audioStreams;
                    break;
                }
            } catch (e) {
                console.warn(`Piped instance ${instance} failed:`, e.message);
            }
        }

        if (!audioStreams) {
            return res.status(503).json({ error: 'All Piped instances failed — try again shortly' });
        }

        // 3. Pick best stream
        audioStreams.sort((a, b) => b.bitrate - a.bitrate);
        const selected = audioStreams.find(s => s.mimeType && s.mimeType.includes('audio')) || audioStreams[0];

        res.json({
            videoId,
            title: searchResult.videos[0].title,
            streamUrl: selected.url,
            duration: searchResult.videos[0].seconds
        });
    } catch (error) {
        console.error('Stream error:', error.message);
        res.status(500).json({ error: 'Failed to fetch audio stream' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
