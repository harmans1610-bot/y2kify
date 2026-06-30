const fs = require('fs');
const path = require('path');

const htmlPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Remove window controls from top-bar
html = html.replace(/<div class="window-controls">[\s\S]*?<\/div>\s*<\/header>/, '</header>');

// 2. Remove panel-controls from all headers
html = html.replace(/<div class="panel-controls".*?>[\s\S]*?<\/div>/g, '');

// 3. Remove badges section completely
const badgesRegex = /<!-- Badges -->\s*<div class="badges-section panel">[\s\S]*?<\/div>\s*<\/aside>/;
html = html.replace(badgesRegex, '</aside>');

// 4. Fix logo alignment
const oldLogo = /<div class="logo-container".*?<\/div>/s;
const newLogo = `<div class="logo-container" style="position:relative; width: 220px; height: 50px; display:flex; justify-content:center; align-items:center;">
        <svg viewBox="0 0 120 40" style="position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none;">
          <ellipse cx="60" cy="20" rx="55" ry="16" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" transform="rotate(-5 60 20)" />
          <path d="M 2 20 L 7 15 L 12 20 L 7 25 Z" fill="#fff" filter="drop-shadow(0 0 3px #fff)" />
          <path d="M 105 10 L 108 7 L 111 10 L 108 13 Z" fill="#fff" filter="drop-shadow(0 0 2px #fff)" />
        </svg>
        <h1 class="logo-text" id="user-greeting" style="position:relative; z-index:1; font-size:24px; font-style:italic; margin: 0;">voidwave</h1>
      </div>`;
html = html.replace(oldLogo, newLogo);

fs.writeFileSync(htmlPath, html);
console.log('Cleanup Done!');
