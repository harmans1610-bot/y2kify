const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Sidebar Selected Tab
css = css.replace(/\.nav-menu li\.active\s*\{[\s\S]*?\}/, `.nav-menu li.active {
  background: #c0c5cc;
  color: #000;
  border-top-color: #888;
  border-left-color: #888;
  border-bottom-color: #fff;
  border-right-color: #fff;
  box-shadow: inset 1px 1px 4px rgba(0,0,0,0.4);
}`);

// 2. Search Bar
css = css.replace(/\.search-input\s*\{[\s\S]*?box-shadow:.*?;/m, `.search-input {
  width: 100%;
  background: #ffffff;
  border: 2px solid;
  border-top-color: #555;
  border-left-color: #555;
  border-right-color: #eee;
  border-bottom-color: #eee;
  border-radius: 0;
  padding: 6px 30px 6px 8px;
  color: #000;
  font-family: var(--font-main);
  font-size: 11px;
  outline: none;
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3);`);

css = css.replace(/\.search-input:focus\s*\{[\s\S]*?\}/m, `.search-input:focus {
  border-color: #000;
}`);

// Change search icon color
css = css.replace(/\.search-icon\s*\{[\s\S]*?color:.*?;/m, `.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #555;`);

// 3. Fix other white texts (top links)
css = css.replace(/\.top-links a\s*\{[\s\S]*?\}/m, `.top-links a {
  color: #333;
  text-decoration: none;
  font-size: 11px;
  font-weight: bold;
  font-family: var(--font-main);
}`);
css = css.replace(/\.top-links a:hover\s*\{[\s\S]*?\}/m, `.top-links a:hover {
  color: #000;
}`);

// Logo text color
css = css.replace(/\.logo-text\s*\{[\s\S]*?color:.*?;/m, `.logo-text {
  font-family: var(--font-main);
  font-size: 20px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -1px;
  color: #222;
  text-shadow: 1px 1px 0px rgba(255,255,255,0.8);`);

fs.writeFileSync(cssPath, css);

const indexPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Fix Logo (remove oval/stars)
html = html.replace(/<div class="logo-container" style="[^"]*">[\s\S]*?<h1 class="logo-text" id="user-greeting" style="[^"]*">y2kify<\/h1>\s*<\/div>/, 
`<div class="logo-container" style="width: 220px; padding-left: 10px;">
  <h1 class="logo-text" id="user-greeting" style="margin: 0; font-size: 22px;">y2kify</h1>
</div>`);

// Fix inline white text on dropdown
html = html.replace(/<select id="playlist-selector" style="([^"]*)color:#fff;([^"]*)">/, '<select id="playlist-selector" style="$1color:#000;$2">');

// Fix "No playlist loaded" text
html = html.replace(/<li style="color:var\(--text-muted\); text-align:center; padding:20px;">No playlist loaded<\/li>/, '<li style="color:#000; text-align:center; padding:20px; font-weight:bold;">No playlist loaded</li>');

// Change search icon (it was a star? No, it was a star path but looking like a search? No, it was a star path: "M12 2L...")
// The search icon has a star path. We should probably give it a real magnifying glass path or just leave it. The user said "remove the oval and the star". They might mean the logo star. I removed the logo star above.
// Let's replace the search icon star path with a magnifying glass just in case.
html = html.replace(/<svg class="search-icon".*?><path d="M12 2L.*?<\/svg>/, '<svg class="search-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>');

fs.writeFileSync(indexPath, html);
console.log('UI Polished!');
