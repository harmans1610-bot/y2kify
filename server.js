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
app.use(express.static(__dirname)); // Serve the static frontend files

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/**
 * SPOTIFY OAUTH
 */
app.get('/auth/login', (req, res) => {
    const scope = 'user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative user-library-read';
    const state = Math.random().toString(36).substring(7);
    
    res.cookie('spotify_auth_state', state);

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
        
        // Pass token to frontend via URL hash
        res.redirect(`/#access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error('Error in callback:', error.response ? error.response.data : error.message);
        res.redirect('/#error=invalid_token');
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
        // 1. Search YouTube using yt-search
        const searchResult = await ytSearch(query + ' audio');
        if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
            return res.status(404).json({ error: 'No video found' });
        }

        const videoId = searchResult.videos[0].videoId;

        // 2. Fetch stream from a public Piped API instance
        // Piped API provides raw streams without ads
        const pipedApiUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;
        const streamInfo = await axios.get(pipedApiUrl);
        
        if (!streamInfo.data || !streamInfo.data.audioStreams || streamInfo.data.audioStreams.length === 0) {
             return res.status(404).json({ error: 'No audio streams found on Piped' });
        }

        // 3. Find the best audio stream (preferably m4a or webm audio-only)
        const audioStreams = streamInfo.data.audioStreams;
        // Sort by bitrate descending
        audioStreams.sort((a, b) => b.bitrate - a.bitrate);
        
        // Prefer m4a if available for better browser compatibility in <audio> tag
        let selectedStream = audioStreams.find(s => s.format === 'M4A');
        if (!selectedStream) selectedStream = audioStreams[0];

        res.json({
            videoId: videoId,
            title: searchResult.videos[0].title,
            streamUrl: selectedStream.url,
            duration: searchResult.videos[0].seconds
        });

    } catch (error) {
        console.error('Error fetching stream:', error.message);
        res.status(500).json({ error: 'Failed to fetch audio stream' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
