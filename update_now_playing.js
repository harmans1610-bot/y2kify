const fs = require('fs');
const path = require('path');

const indexPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const newContent = `<div class="now-playing-content">
  <div class="cd-case">
    <div class="cd-spine">y2kify</div>
    <img id="np-cover" src="C:/Users/Acer/.gemini/antigravity/brain/06997016-acad-448f-8faa-0142f8cdaf75/album_cover_main_1782850981333.png" alt="Album Art">
    <div class="parental-advisory">PARENTAL<br>ADVISORY<br>EXPLICIT CONTENT</div>
  </div>
  
  <div class="track-details">
    <h1 class="track-title" id="np-title">love$ick</h1>
    <h2 class="track-artist" id="np-artist" style="color:var(--text-muted);">blackwinterwells</h2>
    
    <div class="album-info" style="margin-top:24px;">
      <span class="muted" style="color:var(--text-muted); font-size:11px;">from the album</span>
      <span class="album-name" id="np-album" style="color:var(--text-muted); font-size:16px; font-weight:600; font-style:italic;">digital tears</span>
    </div>
    
    <div class="track-meta" style="margin-top:24px; font-size:11px; color:var(--text-muted);">2002 • 11 tracks • 36:28</div>
  </div>
  
  <div class="eq-visualizer">
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
  </div>
</div>

<div class="player-timeline" style="display:flex; align-items:center; gap:16px; padding:0 24px;">
  <span class="time" id="time-current" style="font-size:11px; color:#fff;">01:24</span>
  <div class="progress-bar" id="main-progress" style="flex-grow:1; height:6px; background:rgba(0,0,0,0.5); border-radius:3px; box-shadow:inset 0 0 5px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.05); position:relative; cursor:pointer;">
    <div class="progress-fill" id="main-progress-fill" style="width: 35%; height:100%; background:linear-gradient(90deg, #ff7be5, #a382e8); border-radius:3px; box-shadow:0 0 10px rgba(255,123,229,0.5); position:relative;">
      <div class="progress-knob" style="position:absolute; right:-6px; top:-3px; width:12px; height:12px; background:#fff; border-radius:50%; box-shadow:0 0 5px #fff;"></div>
    </div>
  </div>
  <span class="time" id="time-total" style="font-size:11px; color:#fff;">03:42</span>
</div>

<div class="player-controls-large" style="display:flex; align-items:center; justify-content:center; padding:16px 24px; gap:24px; position:relative;">
   <button class="ctrl-btn shuffle"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button>
   
   <div class="play-controls-pill">
     <button class="ctrl-btn prev"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
     <button class="ctrl-btn play-pause" style="width:48px; height:24px; border-radius:12px; background:linear-gradient(180deg, #b095e0 0%, #765ba8 100%); border:1px solid #d3bfff; box-shadow:0 0 10px rgba(176,149,224,0.5); display:flex; align-items:center; justify-content:center;">
        <svg viewBox="0 0 24 24" fill="currentColor" class="pause-icon" width="14" height="14"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
     </button>
     <button class="ctrl-btn next"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
   </div>
   
   <button class="ctrl-btn repeat"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></button>
   
   <div class="volume-control-large" style="position:absolute; right:24px; display:flex; align-items:center; gap:12px;">
     <span class="vol-label" style="font-size:10px; color:var(--text-muted);">volume</span>
     <div class="vol-bar" style="width:60px; height:4px; background:rgba(0,0,0,0.5); border-radius:2px; box-shadow:inset 0 0 5px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.05);">
       <div class="vol-fill" style="width:80%; height:100%; background:linear-gradient(90deg, #ff7be5, #a382e8); border-radius:2px; position:relative; box-shadow:0 0 10px rgba(255,123,229,0.3);">
         <div class="vol-knob" style="position:absolute; right:-4px; top:-2px; width:8px; height:8px; background:#fff; border-radius:50%; box-shadow:0 0 5px #fff;"></div>
       </div>
     </div>
     <svg class="vol-icon" viewBox="0 0 24 24" fill="var(--text-muted)" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
   </div>
</div>`;

html = html.replace(/<div class="now-playing-content">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Playlists -->/, newContent + '\n        </div>\n\n        <!-- Playlists -->');

fs.writeFileSync(indexPath, html);
console.log('Now playing updated!');
