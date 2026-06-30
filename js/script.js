let currentAudio = null;
let currentAccessToken = null;
let isPlaying = false;

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const userGreeting = document.getElementById('user-greeting');
const playlistSelector = document.getElementById('playlist-selector');
const tracklistEl = document.getElementById('sidebar-tracklist');
const featuredCardsEl = document.querySelector('.featured-cards');
const searchInput = document.querySelector('.search-input');

// Player Meta Elements
const playPauseBtns = document.querySelectorAll('.play-pause');
const npTitle = document.getElementById('np-title');
const npArtist = document.getElementById('np-artist');
const npAlbum = document.getElementById('np-album');
const npCover = document.getElementById('np-cover');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const progressFill = document.getElementById('main-progress-fill');
const progressBar = document.getElementById('main-progress');
const miniCover = document.querySelector('.mini-cover');
const miniTitle = document.querySelector('.m-title');
const miniArtist = document.querySelector('.m-artist');

const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" class="play-icon" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" class="pause-icon" width="14" height="14"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

document.addEventListener('DOMContentLoaded', () => {
    checkToken();
    setupPlayPauseButtons();
    setupProgressBar();
    setupSearch();
});

// --- AUTH & SETUP --- //
function checkToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    if (params.has('access_token')) {
        currentAccessToken = params.get('access_token');
        localStorage.setItem('spotify_token', currentAccessToken);
        window.history.replaceState(null, null, window.location.pathname); // Hide token
    } else {
        currentAccessToken = localStorage.getItem('spotify_token');
    }

    if (currentAccessToken) {
        loginBtn.textContent = 'logout';
        loginBtn.href = '#';
        loginBtn.addEventListener('click', () => {
            localStorage.removeItem('spotify_token');
            window.location.reload();
        });
        initSpotifySession();
    }
}

async function fetchSpotify(endpoint) {
    if (!currentAccessToken) return null;
    try {
        const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            headers: { 'Authorization': `Bearer ${currentAccessToken}` }
        });
        if (res.status === 401) {
            // Token expired
            localStorage.removeItem('spotify_token');
            window.location.reload();
        }
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
    } catch (e) {
        console.error('Spotify API error:', e);
        return null;
    }
}

async function initSpotifySession() {
    // 1. Get User Profile
    const profile = await fetchSpotify('/me');
    if (profile) {
        userGreeting.textContent = profile.display_name.toLowerCase();
    }

    // 2. Get Playlists
    const playlistsData = await fetchSpotify('/me/playlists?limit=20');
    if (playlistsData && playlistsData.items) {
        // Render Dropdown
        playlistSelector.innerHTML = '<option value="">select a playlist...</option>';
        playlistsData.items.forEach(pl => {
            if(!pl) return;
            const opt = document.createElement('option');
            opt.value = pl.id;
            opt.textContent = `${pl.name.toLowerCase()} (${pl.tracks.total})`;
            playlistSelector.appendChild(opt);
        });

        playlistSelector.addEventListener('change', (e) => {
            if (e.target.value) loadPlaylistTracks(e.target.value);
        });

        // Render Featured Cards (first 5 playlists)
        featuredCardsEl.innerHTML = '';
        playlistsData.items.slice(0, 5).forEach(pl => {
            if(!pl) return;
            const imgUrl = pl.images && pl.images.length > 0 ? pl.images[0].url : 'https://via.placeholder.com/120x120/111/444?text=playlist';
            const owner = pl.owner ? pl.owner.display_name.toLowerCase() : 'spotify';
            
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="card-img-wrapper">
                  <img src="${imgUrl}" alt="${pl.name}">
                </div>
                <h3>${pl.name.toLowerCase()}</h3>
                <p>${owner}</p>
            `;
            card.addEventListener('click', () => {
                playlistSelector.value = pl.id;
                loadPlaylistTracks(pl.id);
            });
            featuredCardsEl.appendChild(card);
        });
    }
}

// --- DATA FETCHING --- //
async function loadPlaylistTracks(playlistId) {
    tracklistEl.innerHTML = '<li style="color:#111; text-align:center; padding:20px;">loading tracks...</li>';
    const data = await fetchSpotify(`/playlists/${playlistId}/tracks?limit=50`);
    if (!data || !data.items) return;

    renderTracklist(data.items.map(item => item.track).filter(t => t));
}

function setupSearch() {
    searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            tracklistEl.innerHTML = '<li style="color:#111; text-align:center; padding:20px;">searching...</li>';
            const query = encodeURIComponent(searchInput.value.trim());
            const data = await fetchSpotify(`/search?q=${query}&type=track&limit=20`);
            if (data && data.tracks && data.tracks.items) {
                renderTracklist(data.tracks.items);
            }
        }
    });
}

function renderTracklist(tracks) {
    tracklistEl.innerHTML = '';
    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.style.color = '#111';
        li.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
        li.style.padding = '8px 16px';
        li.style.cursor = 'pointer';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        
        const num = (index + 1).toString().padStart(2, '0');
        const title = track.name.toLowerCase();
        const artist = track.artists[0].name.toLowerCase();
        const minutes = Math.floor(track.duration_ms / 60000);
        const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0');
        const time = `${minutes}:${seconds}`;

        li.innerHTML = `
            <div style="display:flex; gap:12px;">
                <span style="color:#555; font-family:monospace;">${num}</span>
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:600; font-size:12px;">${title}</span>
                    <span style="font-size:10px; color:#555;">${artist}</span>
                </div>
            </div>
            <span style="font-size:11px; color:#555; font-family:monospace; margin-top:2px;">${time}</span>
        `;
        
        li.addEventListener('click', () => {
            let coverUrl = '';
            if(track.album && track.album.images && track.album.images.length > 0) {
                coverUrl = track.album.images[0].url;
            }
            playTrack(track.name, artist, track.album.name, coverUrl);
        });

        tracklistEl.appendChild(li);
    });
}

// --- AUDIO STREAMING & PLAYER --- //
async function playTrack(title, artist, album, coverUrl) {
    // Update UI Meta
    npTitle.textContent = title.toLowerCase();
    npArtist.textContent = artist.toLowerCase();
    npAlbum.textContent = (album || 'single').toLowerCase();
    
    if(coverUrl) {
        npCover.src = coverUrl;
        if(miniCover) miniCover.src = coverUrl;
    }
    if(miniTitle) miniTitle.textContent = title.toLowerCase();
    if(miniArtist) miniArtist.textContent = artist.toLowerCase();

    if (currentAudio) {
        currentAudio.pause();
    }

    // Default title to loading state
    document.title = `y2kify • loading ${title.toLowerCase()}...`;

    try {
        // Ask backend for audio stream
        const query = encodeURIComponent(`${title} ${artist}`);
        // We use the live render URL implicitly if hosted, or localhost
        const res = await fetch(`/api/stream?q=${query}`);
        if (!res.ok) throw new Error('Failed to fetch stream');
        
        const data = await res.json();
        
        currentAudio = new Audio(data.streamUrl);
        currentAudio.addEventListener('timeupdate', updateProgress);
        currentAudio.addEventListener('ended', () => { isPlaying = false; updatePlayPauseUI(); });
        
        await currentAudio.play();
        isPlaying = true;
        updatePlayPauseUI();
        document.title = `y2kify • ${title.toLowerCase()}`;
        
    } catch (e) {
        console.error(e);
        document.title = `y2kify • error`;
        alert('Failed to find free audio stream for this track on YouTube/Piped.');
    }
}

function updateProgress() {
    if (!currentAudio) return;
    const cur = currentAudio.currentTime;
    const tot = currentAudio.duration;
    
    if (isNaN(tot)) return;

    progressFill.style.width = `${(cur / tot) * 100}%`;
    timeCurrent.textContent = formatTime(cur);
    timeTotal.textContent = formatTime(tot);
}

function setupProgressBar() {
    if(!progressBar) return;
    progressBar.addEventListener('click', (e) => {
        if (!currentAudio) return;
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        currentAudio.currentTime = pos * currentAudio.duration;
    });
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function setupPlayPauseButtons() {
    playPauseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentAudio) return;
            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
            } else {
                currentAudio.play();
                isPlaying = true;
            }
            updatePlayPauseUI();
        });
    });
}

function updatePlayPauseUI() {
    playPauseBtns.forEach(btn => {
        if (isPlaying) {
            btn.innerHTML = PAUSE_ICON;
        } else {
            btn.innerHTML = PLAY_ICON;
        }
    });
}
