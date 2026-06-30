// Audio Context
let currentAudio = null;
let currentAccessToken = null;
let isPlaying = false;

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const userGreeting = document.getElementById('user-greeting');
const userAvatar = document.getElementById('user-avatar');
const playlistSelector = document.getElementById('playlist-selector');
const tracklistEl = document.getElementById('sidebar-tracklist');
const playPauseBtns = document.querySelectorAll('.play-pause');
const npTitle = document.getElementById('np-title');
const npArtist = document.getElementById('np-artist');
const npAlbum = document.getElementById('np-album');
const npCover = document.getElementById('np-cover');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const progressFill = document.getElementById('main-progress-fill');
const progressBar = document.getElementById('main-progress');
const statusMarquee = document.getElementById('status-marquee');
const statusLoading = document.getElementById('status-loading');

const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" class="play-icon"><path d="M8 5v14l11-7z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" class="pause-icon"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkToken();
    setupPlayPauseButtons();
    setupProgressBar();
});

// Auth
function checkToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    if (params.has('access_token')) {
        currentAccessToken = params.get('access_token');
        window.history.replaceState(null, null, ' '); // hide token from url
        loginBtn.style.display = 'none';
        initSpotifySession();
    }
}

async function fetchSpotify(endpoint) {
    if (!currentAccessToken) return null;
    try {
        const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            headers: { 'Authorization': `Bearer ${currentAccessToken}` }
        });
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
    } catch (e) {
        console.error('Spotify API error:', e);
        return null;
    }
}

async function initSpotifySession() {
    // Get Profile
    const profile = await fetchSpotify('/me');
    if (profile) {
        userGreeting.textContent = profile.display_name.toLowerCase();
        if (profile.images && profile.images.length > 0) {
            userAvatar.src = profile.images[0].url;
            userAvatar.style.display = 'block';
        }
    }

    // Get Playlists
    const playlistsData = await fetchSpotify('/me/playlists?limit=50');
    if (playlistsData && playlistsData.items) {
        playlistSelector.innerHTML = '<option value="">Select a playlist...</option>';
        playlistsData.items.forEach(pl => {
            if(!pl) return;
            const opt = document.createElement('option');
            opt.value = pl.id;
            opt.textContent = `${pl.name.toLowerCase()} (${pl.tracks.total})`;
            playlistSelector.appendChild(opt);
        });

        playlistSelector.addEventListener('change', (e) => {
            if (e.target.value) {
                loadPlaylistTracks(e.target.value);
            }
        });
    }
}

async function loadPlaylistTracks(playlistId) {
    tracklistEl.innerHTML = '<li style="color:var(--text-muted); text-align:center; padding:20px;">Loading tracks...</li>';
    const data = await fetchSpotify(`/playlists/${playlistId}/tracks?limit=50`);
    if (!data || !data.items) return;

    tracklistEl.innerHTML = '';
    data.items.forEach((item, index) => {
        if (!item.track) return;
        const track = item.track;
        const li = document.createElement('li');
        li.dataset.uri = track.uri;
        
        const num = (index + 1).toString().padStart(2, '0');
        const title = track.name.toLowerCase();
        const artist = track.artists[0].name.toLowerCase();
        const minutes = Math.floor(track.duration_ms / 60000);
        const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0');
        const time = `${minutes}:${seconds}`;

        li.innerHTML = `
            <span class="track-num">${num}</span>
            <div class="track-info">
            <span class="t-title">${title}</span>
            <span class="t-artist">${artist}</span>
            </div>
            <span class="track-time">${time}</span>
        `;
        
        li.addEventListener('click', () => {
            // Remove active from others
            document.querySelectorAll('#sidebar-tracklist li').forEach(el => el.classList.remove('active-track'));
            li.classList.add('active-track');
            
            let coverUrl = '';
            if(track.album && track.album.images && track.album.images.length > 0) {
                coverUrl = track.album.images[0].url;
            }
            playTrack(track.name, artist, track.album.name, coverUrl);
        });

        tracklistEl.appendChild(li);
    });
}

async function playTrack(title, artist, album, coverUrl) {
    // Update UI Meta
    npTitle.textContent = title;
    npArtist.textContent = artist;
    npAlbum.textContent = album || 'single';
    if(coverUrl) npCover.src = coverUrl;
    statusMarquee.textContent = `${title} - ${artist} • fetching ad-free stream... • `;
    statusLoading.style.display = 'inline';

    if (currentAudio) {
        currentAudio.pause();
    }

    try {
        // Ask backend for audio stream
        const query = encodeURIComponent(`${title} ${artist}`);
        const res = await fetch(`/api/stream?q=${query}`);
        if (!res.ok) throw new Error('Failed to fetch stream');
        
        const data = await res.json();
        
        currentAudio = new Audio(data.streamUrl);
        currentAudio.addEventListener('timeupdate', updateProgress);
        currentAudio.addEventListener('ended', () => { isPlaying = false; updatePlayPauseUI(); });
        
        await currentAudio.play();
        isPlaying = true;
        updatePlayPauseUI();
        statusLoading.style.display = 'none';
        statusMarquee.textContent = `${title} - ${artist} • playing • `;
        
    } catch (e) {
        console.error(e);
        statusLoading.style.display = 'none';
        statusMarquee.textContent = `error playing ${title} • `;
        alert('Failed to find free audio stream for this track.');
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
            btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.2)';
        } else {
            btn.innerHTML = PLAY_ICON;
            btn.style.boxShadow = '0 0 15px rgba(138, 93, 230, 0.8), inset 0 2px 5px rgba(255,255,255,0.2)';
        }
    });
}
