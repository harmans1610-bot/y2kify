// ─── STATE ──────────────────────────────────────────────────────────────────
let currentAudio    = null;
let currentToken    = null;
let refreshToken    = null;
let tokenExpiresAt  = 0;      // unix ms
let isPlaying       = false;
let isShuffle       = false;
let isRepeat        = false;
let currentVolume   = 0.8;
let currentTrackList = [];
let currentTrackIdx = -1;

// ─── DOM REFS ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const loginBtn        = $('login-btn');
const userGreeting    = $('user-greeting');
const searchInput     = $('search-input');
const playlistSelector= $('playlist-selector');
const sidebarList     = $('sidebar-tracklist');
const featuredCards   = $('featured-cards');

// Now-Playing panel
const npTitle  = $('np-title');
const npArtist = $('np-artist');
const npAlbum  = $('np-album');
const npMeta   = $('np-meta');
const npCover  = $('np-cover');

// Progress
const timeCurrent     = $('time-current');
const timeTotal       = $('time-total');
const progressFill    = $('main-progress-fill');
const progressBar     = $('main-progress');
const bottomProgress  = $('bottom-progress');
const bottomFill      = $('bottom-progress-fill');
const bottomTime      = $('bottom-time');

// Bottom bar meta
const miniCover  = $('mini-cover');
const miniTitle  = $('mini-title');
const miniArtist = $('mini-artist');

// SVG icons
const PLAY_SVG  = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>`;
const PAUSE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkToken();
    setupNav();
    setupSearch();
    setupControls();
    setupVolumeSliders();
    setupProgressBars();
});

// ─── AUTH ────────────────────────────────────────────────────────────────────
function checkToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    if (params.has('access_token')) {
        currentToken   = params.get('access_token');
        refreshToken   = params.get('refresh_token') || null;
        const expiresIn = parseInt(params.get('expires_in') || '3600', 10);
        tokenExpiresAt  = Date.now() + expiresIn * 1000 - 60000; // 1 min early
        localStorage.setItem('sp_token',      currentToken);
        localStorage.setItem('sp_refresh',     refreshToken || '');
        localStorage.setItem('sp_expires_at',  tokenExpiresAt);
        window.history.replaceState(null, null, window.location.pathname);
    } else {
        currentToken   = localStorage.getItem('sp_token');
        refreshToken   = localStorage.getItem('sp_refresh') || null;
        tokenExpiresAt  = parseInt(localStorage.getItem('sp_expires_at') || '0', 10);
    }

    if (currentToken) {
        loginBtn.textContent = 'logout';
        loginBtn.href = '#';
        loginBtn.addEventListener('click', e => {
            e.preventDefault();
            ['sp_token','sp_refresh','sp_expires_at'].forEach(k => localStorage.removeItem(k));
            window.location.reload();
        });
        initSession();
    }
}

async function sp(endpoint) {
    // Auto-refresh token if it's expired
    if (tokenExpiresAt && Date.now() > tokenExpiresAt && refreshToken) {
        try {
            const r = await fetch('/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
            if (r.ok) {
                const d = await r.json();
                currentToken  = d.access_token;
                tokenExpiresAt = Date.now() + (d.expires_in || 3600) * 1000 - 60000;
                localStorage.setItem('sp_token', currentToken);
                localStorage.setItem('sp_expires_at', tokenExpiresAt);
            }
        } catch(e) { console.error('Token refresh failed:', e); }
    }
    if (!currentToken) return null;
    try {
        const r = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            headers: { Authorization: `Bearer ${currentToken}` }
        });
        if (r.status === 401) {
            // Force re-login
            ['sp_token','sp_refresh','sp_expires_at'].forEach(k => localStorage.removeItem(k));
            loginBtn.textContent = 'login with spotify';
            loginBtn.href = '/auth/login';
            currentToken = null;
            return null;
        }
        if (r.status === 403) {
            console.warn('Spotify 403 on', endpoint, '— likely missing scope. Re-login to grant new permissions.');
            return null;
        }
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
    } catch(e) { console.error('Spotify API error:', endpoint, e); return null; }
}

async function initSession() {
    console.log('[y2kify] Initialising Spotify session...');

    // 1. User profile
    const me = await sp('/me');
    if (me) {
        console.log('[y2kify] Logged in as:', me.display_name);
        userGreeting.textContent = (me.display_name || 'listener').toLowerCase();
    } else {
        console.warn('[y2kify] Could not fetch profile');
    }

    // 2. Playlists
    const pData = await sp('/me/playlists?limit=50');
    console.log('[y2kify] Playlists response:', pData);
    if (pData && Array.isArray(pData.items)) {
        const playlists = pData.items.filter(Boolean);
        console.log('[y2kify] Got', playlists.length, 'playlists');

        // Populate dropdown
        playlistSelector.innerHTML = '<option value="">select a playlist...</option>';
        playlists.forEach(pl => {
            try {
                const o = document.createElement('option');
                o.value = pl.id;
                const total = pl.tracks ? pl.tracks.total : '?';
                o.textContent = `${(pl.name || 'untitled').toLowerCase()} (${total})`;
                playlistSelector.appendChild(o);
            } catch(err) { console.warn('playlist dropdown error', err); }
        });
        playlistSelector.addEventListener('change', e => {
            if (e.target.value) loadPlaylist(e.target.value);
        });

        // Featured cards (home)
        renderPlaylistCards(playlists.slice(0, 10), featuredCards);
        // All playlists view
        renderPlaylistCards(playlists, $('all-playlists-grid'));
    } else {
        console.warn('[y2kify] No playlists returned or bad format');
        if (featuredCards) featuredCards.innerHTML = '<div style="color:#555;padding:20px;font-size:12px;">no playlists found — try re-logging in</div>';
    }
}

// ─── SIDEBAR NAVIGATION ──────────────────────────────────────────────────────
const viewLoaded = {}; // track which views have already been loaded

function setupNav() {
    document.querySelectorAll('[data-view]').forEach(li => {
        li.addEventListener('click', () => {
            const view = li.dataset.view;
            // Set active
            document.querySelectorAll('[data-view]').forEach(x => x.classList.remove('active'));
            li.classList.add('active');
            // Show/hide panels
            document.querySelectorAll('.view-panel').forEach(p => p.style.display = 'none');
            $('view-' + view).style.display = '';
            // Lazy-load view data
            loadView(view);
        });
    });

    // View all playlists link
    $('view-all-playlists').addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('[data-view]').forEach(x => x.classList.remove('active'));
        document.querySelector('[data-view="playlists"]').classList.add('active');
        document.querySelectorAll('.view-panel').forEach(p => p.style.display = 'none');
        $('view-playlists').style.display = '';
    });
}

async function loadView(view) {
    if (viewLoaded[view] || !currentToken) return;
    viewLoaded[view] = true;

    if (view === 'discover') {
        const data = await sp('/browse/new-releases?limit=20');
        if (!data) return;
        const tracks = [];
        data.albums.items.forEach(album => {
            tracks.push({
                name: album.name,
                artists: album.artists,
                album: album,
                duration_ms: 0
            });
        });
        renderViewTracklist('discover-tracklist', tracks, true);
    }

    if (view === 'library') {
        const data = await sp('/me/tracks?limit=50');
        if (!data) return;
        const tracks = data.items.map(i => i.track).filter(Boolean);
        renderViewTracklist('library-tracklist', tracks, false);
    }

    if (view === 'radio') {
        // Get top tracks for radio seeds
        const top = await sp('/me/top/tracks?limit=5&time_range=short_term');
        if (!top || !top.items.length) return;
        const seeds = top.items.slice(0,3).map(t => t.id).join(',');
        const rec = await sp(`/recommendations?seed_tracks=${seeds}&limit=30`);
        if (!rec) return;
        renderViewTracklist('radio-tracklist', rec.tracks, false);
    }

    if (view === 'friends') {
        const data = await sp('/me/top/artists?limit=20&time_range=short_term');
        if (!data) return;
        const grid = $('top-artists-grid');
        grid.innerHTML = '';
        grid.style.display = 'flex';
        grid.style.flexWrap = 'wrap';
        data.items.forEach(artist => {
            const imgUrl = artist.images && artist.images[0] ? artist.images[0].url : '';
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="card-img-wrapper" style="border-radius:50%; overflow:hidden; width:90px; height:90px;">
                  <img src="${imgUrl}" alt="${artist.name}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <h3 style="margin-top:8px;">${artist.name.toLowerCase()}</h3>
                <p>${artist.genres[0] || 'artist'}</p>
            `;
            card.addEventListener('click', () => {
                // Search their top tracks
                searchInput.value = artist.name;
                triggerSearch(artist.name);
                switchView('now-playing');
            });
            grid.appendChild(card);
        });
    }
}

function switchView(view) {
    document.querySelectorAll('[data-view]').forEach(x => x.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    document.querySelectorAll('.view-panel').forEach(p => p.style.display = 'none');
    $('view-' + view).style.display = '';
}

function renderViewTracklist(listId, tracks, isAlbum) {
    const ul = $(listId);
    ul.innerHTML = '';
    tracks.forEach((track, i) => {
        if (!track) return;
        const li = makeLi(track, i, 'view');
        li.addEventListener('click', () => {
            currentTrackList = tracks;
            currentTrackIdx = i;
            if (isAlbum) {
                triggerSearch(`${track.name} ${track.artists[0].name}`);
            } else {
                const cover = track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : '';
                playTrack(track.name, track.artists[0].name, track.album ? track.album.name : '', cover, i);
            }
        });
        ul.appendChild(li);
    });
}

// ─── PLAYLISTS ───────────────────────────────────────────────────────────────
function renderPlaylistCards(playlists, container) {
    container.innerHTML = '';
    playlists.forEach(pl => {
        if (!pl) return;
        const img = pl.images && pl.images[0] ? pl.images[0].url : '';
        const owner = pl.owner ? (pl.owner.display_name || 'spotify').toLowerCase() : 'spotify';
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="card-img-wrapper">
              <img src="${img}" alt="${pl.name}" onerror="this.style.background='#333'">
            </div>
            <h3>${pl.name.toLowerCase()}</h3>
            <p>${owner}</p>
        `;
        card.addEventListener('click', () => {
            playlistSelector.value = pl.id;
            loadPlaylist(pl.id);
            switchView('now-playing');
        });
        container.appendChild(card);
    });
}

async function loadPlaylist(id) {
    console.log('[y2kify] Loading playlist:', id);
    sidebarList.innerHTML = '<li style="color:#555;text-align:center;padding:20px;font-size:12px;">loading tracks...</li>';

    const data = await sp(`/playlists/${id}/tracks?limit=100`);
    console.log('[y2kify] Playlist tracks raw response:', data);

    if (!data || !data.items) {
        sidebarList.innerHTML = '<li style="color:#555;text-align:center;padding:20px;font-size:12px;">failed to load tracks</li>';
        return;
    }

    console.log('[y2kify] Total items in playlist:', data.items.length);

    // Filter out null tracks (local files, unavailable songs, episodes)
    const tracks = data.items
        .map(item => {
            if (!item) { console.warn('[y2kify] null item'); return null; }
            if (!item.track) { console.warn('[y2kify] null track in item:', item); return null; }
            if (!item.track.artists || !item.track.artists.length) { console.warn('[y2kify] track with no artists:', item.track.name); return null; }
            return item.track;
        })
        .filter(Boolean);

    console.log('[y2kify] Renderable tracks after filter:', tracks.length);

    currentTrackList = tracks;
    currentTrackIdx = -1;
    renderSidebarTracks(tracks);
}

function renderSidebarTracks(tracks) {
    sidebarList.innerHTML = '';
    if (!tracks.length) {
        sidebarList.innerHTML = '<li style="color:#555;text-align:center;padding:20px;font-size:12px;">no tracks in this playlist</li>';
        return;
    }
    tracks.forEach((track, i) => {
        if (!track || !track.artists || !track.artists.length) return;
        const li = makeLi(track, i, 'sidebar');
        li.addEventListener('click', () => {
            currentTrackIdx = i;
            const cover = track.album?.images?.[0]?.url || '';
            playTrack(track.name, track.artists[0].name, track.album?.name || '', cover, i);
        });
        sidebarList.appendChild(li);
    });
}

function makeLi(track, i, scope) {
    const li = document.createElement('li');
    li.id = `track-li-${scope}-${i}`;
    li.style.cssText = 'color:#111;border-bottom:1px solid rgba(0,0,0,0.1);padding:8px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;';
    li.addEventListener('mouseenter', () => li.style.background = 'rgba(0,0,0,0.07)');
    li.addEventListener('mouseleave', () => { if (!li.classList.contains('active-track')) li.style.background = ''; });
    const title  = (track.name || 'unknown').toLowerCase();
    const artist = track.artists?.[0]?.name?.toLowerCase() || '—';
    const ms = track.duration_ms || 0;
    const m = Math.floor(ms / 60000);
    const s = ((ms % 60000) / 1000 | 0).toString().padStart(2, '0');
    li.innerHTML = `
        <div style="display:flex;gap:10px;overflow:hidden;flex:1;min-width:0;">
          <span style="color:#888;font-family:monospace;flex-shrink:0;font-size:11px;">${String(i + 1).padStart(2, '0')}</span>
          <div style="display:flex;flex-direction:column;overflow:hidden;flex:1;min-width:0;">
            <span style="font-weight:600;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</span>
            <span style="font-size:10px;color:#555;">${artist}</span>
          </div>
        </div>
        <span style="font-size:11px;color:#777;font-family:monospace;flex-shrink:0;margin-left:8px;">${ms ? `${m}:${s}` : '—'}</span>
    `;
    return li;
}


// ─── SEARCH ──────────────────────────────────────────────────────────────────
function setupSearch() {
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            triggerSearch(searchInput.value.trim());
            switchView('now-playing');
        }
    });
}

async function triggerSearch(query) {
    sidebarList.innerHTML = `<li style="color:#555;text-align:center;padding:12px;">searching...</li>`;
    const data = await sp(`/search?q=${encodeURIComponent(query)}&type=track&limit=30`);
    if (!data || !data.tracks) return;
    const tracks = data.tracks.items.filter(Boolean);
    currentTrackList = tracks;
    currentTrackIdx = -1;

    // Update sidebar with results
    sidebarList.innerHTML = '';
    tracks.forEach((track, i) => {
        const li = makeLi(track, i, 'search');
        li.addEventListener('click', () => {
            currentTrackIdx = i;
            const cover = track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : '';
            playTrack(track.name, track.artists[0].name, track.album ? track.album.name : '', cover, i);
        });
        sidebarList.appendChild(li);
    });
}

// ─── PLAYBACK ────────────────────────────────────────────────────────────────
async function playTrack(title, artist, album, coverUrl, idx) {
    // Highlight active track in sidebar
    document.querySelectorAll('#sidebar-tracklist li').forEach(l => l.style.background = '');
    const activeLi = $(`track-li-${idx}`);
    if (activeLi) activeLi.style.background = 'rgba(0,0,0,0.1)';

    // Update all UI meta immediately
    npTitle.textContent  = title.toLowerCase();
    npArtist.textContent = artist.toLowerCase();
    npAlbum.textContent  = (album || '—').toLowerCase();
    if (miniTitle)  miniTitle.textContent  = title.toLowerCase();
    if (miniArtist) miniArtist.textContent = artist.toLowerCase();
    if (coverUrl) {
        npCover.src = coverUrl;
        if (miniCover) miniCover.src = coverUrl;
    }
    document.title = `y2kify • ${title.toLowerCase()}`;

    if (currentAudio) { currentAudio.pause(); currentAudio = null; }

    // Show loading state
    setPlayPauseIcon(false);

    try {
        const q = encodeURIComponent(`${title} ${artist}`);
        console.log(`[y2kify] Fetching stream for: ${title} - ${artist}`);
        npTitle.textContent = `${title.toLowerCase()} ⟨loading...⟩`;

        const r = await fetch(`/api/stream?q=${q}`);
        const data = await r.json();

        if (!r.ok) {
            console.error('[y2kify] Stream error response:', data);
            npTitle.textContent = title.toLowerCase();
            npMeta.textContent = `stream error: ${data.error || r.status}`;
            return;
        }

        console.log('[y2kify] Got stream URL:', data.streamUrl);
        npTitle.textContent = title.toLowerCase();

        // data.streamUrl is already our own /api/proxy-stream?url=... path
        // so the browser fetches audio from our server with no CORS issue
        currentAudio = new Audio(data.streamUrl);
        currentAudio.volume = currentVolume;
        currentAudio.addEventListener('timeupdate', updateProgress);
        currentAudio.addEventListener('ended', onTrackEnd);
        currentAudio.addEventListener('error', (e) => {
            console.error('[y2kify] Audio element error:', e);
            npMeta.textContent = 'playback error — try another track';
            isPlaying = false;
            setPlayPauseIcon(false);
        });

        await currentAudio.play();
        isPlaying = true;
        setPlayPauseIcon(true);
        console.log('[y2kify] Playing:', title);
    } catch(e) {
        console.error('[y2kify] playTrack exception:', e);
        if (npTitle) npTitle.textContent = title.toLowerCase();
        if (npMeta) npMeta.textContent = 'stream error — try another track';
        isPlaying = false;
        setPlayPauseIcon(false);
    }
}

function onTrackEnd() {
    isPlaying = false;
    if (isRepeat && currentTrackList.length > 0 && currentTrackIdx >= 0) {
        const t = currentTrackList[currentTrackIdx];
        const cover = t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : '';
        playTrack(t.name, t.artists[0].name, t.album ? t.album.name : '', cover, currentTrackIdx);
    } else {
        playNext();
    }
}

function playNext() {
    if (!currentTrackList.length) return;
    if (isShuffle) {
        currentTrackIdx = Math.floor(Math.random() * currentTrackList.length);
    } else {
        currentTrackIdx = (currentTrackIdx + 1) % currentTrackList.length;
    }
    const t = currentTrackList[currentTrackIdx];
    const cover = t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : '';
    playTrack(t.name, t.artists[0].name, t.album ? t.album.name : '', cover, currentTrackIdx);
}

function playPrev() {
    if (!currentTrackList.length) return;
    if (currentAudio && currentAudio.currentTime > 3) {
        currentAudio.currentTime = 0; return;
    }
    currentTrackIdx = (currentTrackIdx - 1 + currentTrackList.length) % currentTrackList.length;
    const t = currentTrackList[currentTrackIdx];
    const cover = t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : '';
    playTrack(t.name, t.artists[0].name, t.album ? t.album.name : '', cover, currentTrackIdx);
}

// ─── CONTROLS ────────────────────────────────────────────────────────────────
function setupControls() {
    // Play/Pause (both bars)
    [$('btn-play-main'), $('btn-play-bottom')].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (!currentAudio) return;
            if (isPlaying) { currentAudio.pause(); isPlaying = false; }
            else { currentAudio.play(); isPlaying = true; }
            setPlayPauseIcon(isPlaying);
        });
    });

    // Prev / Next (both bars)
    [$('btn-prev'), $('btn-prev-bottom')].forEach(b => b && b.addEventListener('click', playPrev));
    [$('btn-next'), $('btn-next-bottom')].forEach(b => b && b.addEventListener('click', playNext));

    // Shuffle (both bars)
    [$('btn-shuffle'), $('btn-shuffle-bottom')].forEach(b => {
        if (!b) return;
        b.addEventListener('click', () => {
            isShuffle = !isShuffle;
            b.style.opacity = isShuffle ? '1' : '0.4';
            // sync both buttons
            [$('btn-shuffle'), $('btn-shuffle-bottom')].forEach(x => { if(x) x.style.opacity = isShuffle ? '1' : '0.4'; });
        });
        b.style.opacity = '0.4';
    });

    // Repeat (both bars)
    [$('btn-repeat'), $('btn-repeat-bottom')].forEach(b => {
        if (!b) return;
        b.addEventListener('click', () => {
            isRepeat = !isRepeat;
            [$('btn-repeat'), $('btn-repeat-bottom')].forEach(x => { if(x) x.style.opacity = isRepeat ? '1' : '0.4'; });
        });
        b.style.opacity = '0.4';
    });
}

function setPlayPauseIcon(playing) {
    const icon = playing ? PAUSE_SVG : PLAY_SVG;
    [$('btn-play-main'), $('btn-play-bottom')].forEach(b => { if(b) b.innerHTML = icon; });
}

// ─── PROGRESS BARS ───────────────────────────────────────────────────────────
function setupProgressBars() {
    [progressBar, bottomProgress].forEach(bar => {
        if (!bar) return;
        bar.addEventListener('click', e => {
            if (!currentAudio || isNaN(currentAudio.duration)) return;
            const rect = bar.getBoundingClientRect();
            currentAudio.currentTime = ((e.clientX - rect.left) / rect.width) * currentAudio.duration;
        });
    });
}

function updateProgress() {
    if (!currentAudio) return;
    const cur = currentAudio.currentTime, tot = currentAudio.duration;
    if (isNaN(tot) || tot === 0) return;
    const pct = (cur / tot * 100).toFixed(1) + '%';
    if (progressFill) progressFill.style.width = pct;
    if (bottomFill)   bottomFill.style.width   = pct;
    const cs = formatTime(cur), ts = formatTime(tot);
    if (timeCurrent) timeCurrent.textContent = cs;
    if (timeTotal)   timeTotal.textContent   = ts;
    if (bottomTime)  bottomTime.textContent  = `${cs} / ${ts}`;
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    return `${m}:${(Math.floor(s % 60)).toString().padStart(2, '0')}`;
}

// ─── VOLUME SLIDERS ──────────────────────────────────────────────────────────
function setupVolumeSliders() {
    [$('vol-bar-main'), $('vol-bar-bottom')].forEach(bar => {
        if (!bar) return;
        bar.addEventListener('click', e => {
            const rect = bar.getBoundingClientRect();
            currentVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (currentAudio) currentAudio.volume = currentVolume;
            updateVolumeUI();
        });
    });
    updateVolumeUI();
}

function updateVolumeUI() {
    const pct = (currentVolume * 100).toFixed(0) + '%';
    const vfm = $('vol-fill-main'), vfb = $('vol-fill-bottom');
    if (vfm) vfm.style.width = pct;
    if (vfb) vfb.style.width = pct;
}
