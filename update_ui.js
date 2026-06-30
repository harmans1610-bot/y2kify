const fs = require('fs');
const path = require('path');

const htmlPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add top bar window controls
const topBarControls = `      <div class="window-controls">
        <button class="win-btn">─</button>
        <button class="win-btn">□</button>
        <button class="win-btn">✕</button>
      </div>`;
if (!html.includes('<div class="window-controls">')) {
  html = html.replace('</header>', topBarControls + '\n    </header>');
}

// 2. Add panel header controls
const panelControls = `
             <div class="panel-controls" style="display:flex; gap:2px; margin-left:auto;">
               <button class="win-btn">─</button>
               <button class="win-btn">□</button>
               <button class="win-btn">✕</button>
             </div>`;
html = html.replace(/(<h2>.*?<\/h2>)/g, '$1' + panelControls);
// clean up if they were already there (just in case)
html = html.replace(/<div class="panel-controls".*?>.*?<\/div>\s*<div class="panel-controls"/gs, '<div class="panel-controls"');

// 3. Update logo with orbit ring
const logoReplacement = `<div class="logo-container" style="position:relative; width: 200px; height: 50px;">
        <svg viewBox="0 0 100 30" style="position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none;">
          <ellipse cx="50" cy="15" rx="45" ry="12" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" transform="rotate(-5 50 15)" />
          <path d="M 5 15 L 10 10 L 15 15 L 10 20 Z" fill="#fff" filter="drop-shadow(0 0 3px #fff)" />
          <path d="M 85 5 L 88 2 L 91 5 L 88 8 Z" fill="#fff" filter="drop-shadow(0 0 2px #fff)" />
        </svg>
        <h1 class="logo-text" id="user-greeting" style="position:relative; z-index:1; margin-left: 25px; font-size:22px; font-style:italic;">voidwave</h1>
      </div>`;
html = html.replace(/<div class="logo-container">.*?<\/div>/s, logoReplacement);

fs.writeFileSync(htmlPath, html);

// CSS Updates
const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/--bg-color:.*?;/, '--bg-color: #05020a;');
css = css.replace(/--panel-bg:.*?;/, '--panel-bg: #0d071a;');
css = css.replace(/--panel-border:.*?;/, '--panel-border: #2a1b42;');
css = css.replace(/--accent-pink:.*?;/, '--accent-pink: #e882b5;');

// Update body background
css = css.replace(/body \{[\s\S]*?\}/, `body {
  background: var(--bg-color);
  background-image: 
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="none"/><rect width="1" height="1" fill="rgba(255,255,255,0.02)"/></svg>');
  color: var(--text-main);
  font-family: var(--font-main);
  font-size: 13px;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}`);

// Update top-bar
css = css.replace(/\.top-bar \{[\s\S]*?\}/, `.top-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid var(--panel-border);
  flex-shrink: 0;
  background: #0d071a;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
}`);

// Update play pause button
css = css.replace(/\.ctrl-btn\.play-pause \{[\s\S]*?\}/, `.ctrl-btn.play-pause {
  width: 60px;
  height: 30px;
  border-radius: 15px;
  background: linear-gradient(180deg, #b095e0 0%, #765ba8 100%);
  border: 1px solid #d3bfff;
  box-shadow: 0 0 10px rgba(176, 149, 224, 0.5), inset 0 2px 5px rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}`);

// Update win-btn
css = css.replace(/\.win-btn \{[\s\S]*?\}/, `.win-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-muted);
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}`);

fs.writeFileSync(cssPath, css);
console.log('Done!');
