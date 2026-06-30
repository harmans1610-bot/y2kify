// ─── STATE ──────────────────────────────────────────────────────────────────
let currentAudio    = null;
let currentToken    = null;
let isPlaying       = false;
let isShuffle       = false;
let isRepeat        = false;
let currentVolume   = 0.8;
let currentTrackList = [];   // the active set of tracks (search / playlist)
let currentTrackIdx = -1;    // which track is playing

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
        currentToken = params.get('access_token');
        localStorage.setItem('sp_token', currentToken);
        window.history.replaceState(null, null, window.location.pathname);
    } else {
        currentToken = localStorage.getItem('sp_token');
    }

    if (currentToken) {
        loginBtn.textContent = 'logout';
        loginBtn.href = '#';
        loginBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('sp_token');
            window.location.reload();
        });
        initSession();
    }
}

async function sp(endpoint) {
    if (!currentToken) return null;
    try {
        const r = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            headers: { Authorization: `Bearer ${currentToken}` }
        });
        if (r.status === 401) { localStorage.removeItem('sp_token'); window.location.reload(); }
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
    } catch(e) { console.error('Spotify:', e); return null; }
}

async function initSession() {
    // Profile
    const me = await sp('/me');
    if (me) userGreeting.textContent = me.display_name.toLowerCase();

    // Playlists
    const pData = await sp('/me/playlists?limit=50');
    if (pData && pData.items) {
        const playlists = pData.items.filter(Boolean);

        // Dropdown
        playlistSelector.innerHTML = '<option value="">select a playlist...</option>';
        playlists.forEach(pl => {
            const o = document.createElement('option');
            o.value = pl.id;
            o.textContent = `${pl.name.toLowerCase()} (${pl.tracks.total})`;
            playlistSelector.appendChild(o);
        });
        playlistSelector.addEventListener('change', e => {
            if (e.target.value) loadPlaylist(e.target.value);
        });

        // Featured cards (home)
        renderPlaylistCards(playlists.slice(0, 8), featuredCards);
        // All playlists view
        renderPlaylistCards(playlists, $('all-playlists-grid'));
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
        const li = makeLi(track, i, isAlbum);
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
    sidebarList.innerHTML = '<li style="color:#555;text-align:center;padding:20px;">loading...</li>';
    const data = await sp(`/playlists/${id}/tracks?limit=100`);
    if (!data) return;
    const tracks = data.items.map(i => i.track).filter(Boolean);
    currentTrackList = tracks;
    currentTrackIdx = -1;
    renderSidebarTracks(tracks);
}

function renderSidebarTracks(tracks) {
    sidebarList.innerHTML = '';
    tracks.forEach((track, i) => {
        const li = makeLi(track, i, false);
        li.addEventListener('click', () => {
            currentTrackIdx = i;
            const cover = track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : '';
            playTrack(track.name, track.artists[0].name, track.album ? track.album.name : '', cover, i);
        });
        sidebarList.appendChild(li);
    });
}

function makeLi(track, i, isAlbum) {
    const li = document.createElement('li');
    li.id = `track-li-${i}`;
    li.style.cssText = 'color:#111;border-bottom:1px solid rgba(0,0,0,0.1);padding:8px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;';
    const title = track.name.toLowerCase();
    const artist = track.artists ? track.artists[0].name.toLowerCase() : '';
    const ms = track.duration_ms || 0;
    const m = Math.floor(ms/60000), s = ((ms%60000)/1000|0).toString().padStart(2,'0');
    li.innerHTML = `
        <div style="display:flex;gap:10px;overflow:hidden;">
          <span style="color:#888;font-family:monospace;flex-shrink:0;">${String(i+1).padStart(2,'0')}</span>
          <div style="display:flex;flex-direction:column;overflow:hidden;">
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
        const li = makeLi(track, i, false);
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
        const r = await fetch(`/api/stream?q=${encodeURIComponent(title + ' ' + artist)}`);
        if (!r.ok) throw new Error('stream fetch failed');
        const data = await r.json();

        currentAudio = new Audio(data.streamUrl);
        currentAudio.volume = currentVolume;
        currentAudio.addEventListener('timeupdate', updateProgress);
        currentAudio.addEventListener('ended', onTrackEnd);
        await currentAudio.play();
        isPlaying = true;
        setPlayPauseIcon(true);
    } catch(e) {
        console.error(e);
        npMeta.textContent = 'stream error — try another track';
        isPlaying = false;
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
