const fs = require('fs');
const path = require('path');

const htmlPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Remove SVG from logo container
const oldLogo = /<div class="logo-container" style=".*?">[\s\S]*?<svg.*?<\/svg>[\s\S]*?<h1 class="logo-text".*?>voidwave<\/h1>\s*<\/div>/;
const newLogo = `<div class="logo-container" style="display:flex; align-items:center;">
        <h1 class="logo-text" id="user-greeting" style="font-size:24px; font-style:italic; margin: 0;">voidwave</h1>
      </div>`;
html = html.replace(oldLogo, newLogo);
fs.writeFileSync(htmlPath, html);

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 2. Make app container fullscreen
css = css.replace(/\.app-container \{[\s\S]*?\}/, `.app-container {
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  background: var(--bg-color);
  border: none;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}`);

// also remove border-radius from top-bar so it sits flush
css = css.replace(/border-radius: 12px 12px 0 0;/, 'border-radius: 0;');

fs.writeFileSync(cssPath, css);
console.log('Final tweaks done!');
