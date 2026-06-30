const fs = require('fs');
const path = require('path');

const indexPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const newBottomBar = `<footer class="bottom-bar panel">
  <div class="bottom-left">
    <div class="mini-cover-wrapper">
      <img src="C:/Users/Acer/.gemini/antigravity/brain/06997016-acad-448f-8faa-0142f8cdaf75/album_cover_main_1782850981333.png" alt="cover" class="mini-cover">
    </div>
    <div class="mini-info">
      <span class="m-title">love$ick</span>
      <span class="m-artist">blackwinterwells</span>
    </div>
    <svg class="like-btn" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  </div>

  <div class="bottom-center">
     <button class="ctrl-btn shuffle"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button>
     
     <div class="play-controls-pill">
       <button class="ctrl-btn prev"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
       <button class="ctrl-btn play-pause">
          <svg viewBox="0 0 24 24" fill="currentColor" class="pause-icon"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
       </button>
       <button class="ctrl-btn next"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
     </div>
     
     <button class="ctrl-btn repeat"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></button>
  </div>

  <div class="bottom-right">
    <div class="bottom-timeline">
      <span class="time">01:24 / 03:42</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 35%;">
          <div class="progress-knob"></div>
        </div>
      </div>
    </div>
    
    <div class="bottom-actions">
      <svg class="vol-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      <svg class="icon-btn" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21 11.01L3 11v2h18v-1.99zM3 16h12v2H3v-2zM21 6H3v2.01L21 8V6z"/></svg>
      <svg class="icon-btn" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"/></svg>
      <svg class="icon-btn" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
    </div>
  </div>
</footer>`;

// Replace bottom bar in HTML
html = html.replace(/<footer class="bottom-bar panel">[\s\S]*?<\/footer>/, newBottomBar);
fs.writeFileSync(indexPath, html);

// Now update CSS
const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace everything from bottom bar to end, or just append new bottom bar styles.
// Let's remove the old bottom bar styles and append new ones.
css = css.replace(/\/\* --- BOTTOM BAR --- \*\/[\s\S]*/, '');

css += `/* --- BOTTOM BAR --- */
.bottom-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-radius: 8px;
  background: rgba(17, 9, 30, 0.85);
  border: 1px solid var(--panel-border);
  box-shadow: var(--inner-shadow);
  backdrop-filter: var(--glass-blur);
}

.bottom-left {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 25%;
}

.mini-cover-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 2px;
  background: rgba(255,255,255,0.1);
}

.mini-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.mini-info {
  display: flex;
  flex-direction: column;
}

.m-title {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.m-artist {
  color: var(--text-muted);
  font-size: 11px;
}

.like-btn {
  width: 16px;
  height: 16px;
  color: var(--accent-purple);
  cursor: pointer;
  margin-left: 10px;
  filter: drop-shadow(0 0 5px var(--accent-purple));
}

.bottom-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-grow: 1;
}

.play-controls-pill {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.5);
  border-radius: 30px;
  padding: 6px 24px;
  gap: 24px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
  border: 1px solid rgba(255,255,255,0.05);
}

.bottom-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 32px;
  width: 35%;
}

.bottom-timeline {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-grow: 1;
  max-width: 200px;
}

.bottom-timeline .time {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-main);
  letter-spacing: 0.5px;
}

.bottom-timeline .progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.bottom-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn, .vol-icon {
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.icon-btn:hover, .vol-icon:hover {
  color: #fff;
}
`;

fs.writeFileSync(cssPath, css);
console.log('Bottom bar updated!');
