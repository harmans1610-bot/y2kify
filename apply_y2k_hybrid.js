const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Root Variables
css = css.replace(/:root\s*\{[\s\S]*?\}\s*\*/, `:root {
  --bg-color: #c0c5ce;
  --panel-bg: linear-gradient(135deg, #e8ecef 0%, #b0b6bf 100%);
  --panel-border-top: #ffffff;
  --panel-border-bottom: #7a828f;
  
  --lcd-bg: #05140d;
  --lcd-text: #4bf090;
  --lcd-text-muted: #2f8252;
  
  --gel-primary: linear-gradient(180deg, #8ad4ff 0%, #1ea6f7 49%, #007bc4 50%, #005991 100%);
  --gel-border: #003659;
  
  --text-main: #222222;
  --text-muted: #555555;
  
  --font-main: 'Tahoma', 'Verdana', sans-serif;
  --font-display: 'Courier New', Courier, monospace;
}
*`);

// 2. Body
css = css.replace(/body\s*\{[\s\S]*?display: flex;/m, `body {
  background: 
    repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 3px),
    linear-gradient(180deg, #d8dee6 0%, #9ca4b0 100%);
  color: var(--text-main);
  font-family: var(--font-main);
  font-size: 11px;
  height: 100vh;
  overflow: hidden;
  display: flex;`);

// 3. Panel
css = css.replace(/\.panel\s*\{[\s\S]*?position: relative;/m, `.panel {
  background: var(--panel-bg);
  border: 2px solid;
  border-top-color: var(--panel-border-top);
  border-left-color: var(--panel-border-top);
  border-bottom-color: var(--panel-border-bottom);
  border-right-color: var(--panel-border-bottom);
  border-radius: 2px;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
  position: relative;`);

// 4. Panel Header
css = css.replace(/\.panel-header\s*\{[\s\S]*?\}\s*\.header-star/m, `.panel-header {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: linear-gradient(180deg, #8daed1 0%, #3a72ab 49%, #154c85 50%, #0a335e 100%);
  border-bottom: 2px solid #000;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.5);
}
.header-star`);

css = css.replace(/\.panel-header h2\s*\{[\s\S]*?text-shadow:.*?;/m, `.panel-header h2 {
  font-family: var(--font-main);
  font-size: 11px;
  text-transform: uppercase;
  font-weight: bold;
  flex-grow: 1;
  color: #fff;
  text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
  margin: 0;`);

// 5. Sidebar Navigation (make them look like inset LCDs or metallic buttons)
css = css.replace(/\.nav-menu li\s*\{[\s\S]*?transition:.*?;/m, `.nav-menu li {
  padding: 8px 12px;
  margin-bottom: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 2px;
  background: linear-gradient(180deg, #e0e5e8 0%, #c4cad1 100%);
  border: 1px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-right-color: #888;
  border-bottom-color: #888;
  color: var(--text-main);
  font-weight: bold;
  font-size: 11px;`);

css = css.replace(/\.nav-menu li\.active\s*\{[\s\S]*?\}/m, `.nav-menu li.active {
  background: var(--lcd-bg);
  color: var(--lcd-text);
  border-top-color: #333;
  border-left-color: #333;
  border-bottom-color: #eee;
  border-right-color: #eee;
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.8);
}`);

css = css.replace(/\.nav-menu li:hover:not\(\.active\)\s*\{[\s\S]*?\}/m, `.nav-menu li:hover:not(.active) {
  background: linear-gradient(180deg, #ffffff 0%, #d8dee6 100%);
}`);

// 6. Top Bar
css = css.replace(/\.top-bar\s*\{[\s\S]*?box-shadow:.*?;/m, `.top-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 2px solid #555;
  flex-shrink: 0;
  background: linear-gradient(180deg, #e4e9f0 0%, #b3b9c2 100%);
  box-shadow: inset 0 1px 0 #fff;`);

// 7. Search Input (Inset LCD look)
css = css.replace(/\.search-wrapper input\s*\{[\s\S]*?transition:.*?;/m, `.search-wrapper input {
  width: 100%;
  padding: 6px 36px 6px 16px;
  background: #fff;
  border: 2px solid;
  border-top-color: #555;
  border-left-color: #555;
  border-right-color: #fff;
  border-bottom-color: #fff;
  border-radius: 0;
  color: #000;
  font-family: var(--font-main);
  font-size: 11px;
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.2);`);

// 8. Bottom Bar
css = css.replace(/\.bottom-bar\s*\{[\s\S]*?backdrop-filter:.*?;/m, `.bottom-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--panel-bg);
  border-top: 2px solid var(--panel-border-top);
  box-shadow: 0 -2px 5px rgba(0,0,0,0.2);`);

css = css.replace(/\.play-controls-pill\s*\{[\s\S]*?border:.*?;/m, `.play-controls-pill {
  display: flex;
  align-items: center;
  background: transparent;
  padding: 6px 24px;
  gap: 24px;
  box-shadow: none;
  border: none;`);

// Fix progress bar background to look like an LCD or inset groove
css = css.replace(/\.bottom-timeline \.progress-bar\s*\{[\s\S]*?cursor: pointer;/m, `.bottom-timeline .progress-bar {
  width: 100%;
  height: 8px;
  background: #111;
  border: 1px solid;
  border-top-color: #555;
  border-left-color: #555;
  border-bottom-color: #fff;
  border-right-color: #fff;
  border-radius: 0;
  position: relative;
  cursor: pointer;`);

css = css.replace(/\.m-title\s*\{[\s\S]*?\}/m, `.m-title {
  color: var(--text-main);
  font-size: 11px;
  font-weight: bold;
}`);

// Change all LCD-like areas
css += `
/* Y2K Overrides applied dynamically */
.now-playing-content {
  background: var(--lcd-bg);
  border: 2px solid;
  border-top-color: #333;
  border-left-color: #333;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 16px;
  margin: 16px;
  border-radius: 0;
  box-shadow: inset 2px 2px 5px rgba(0,0,0,0.8);
}

.track-details h1, .track-details h2, .track-details span, .track-meta {
  color: var(--lcd-text) !important;
  font-family: var(--font-display) !important;
  text-shadow: 0 0 5px var(--lcd-text);
}
.track-details h1 {
  font-size: 24px !important;
  font-weight: normal !important;
}

.bottom-timeline .time, #time-current, #time-total {
  color: #222 !important;
  font-weight: bold;
}

.ctrl-btn {
  color: #333 !important;
  background: linear-gradient(180deg, #fff 0%, #ccc 100%);
  border: 1px solid #999;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}
.ctrl-btn:active {
  background: #ccc;
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5);
}

.play-pause {
  background: var(--gel-primary) !important;
  border: 1px solid var(--gel-border) !important;
  border-radius: 20px !important;
  box-shadow: inset 0 8px 6px rgba(255,255,255,0.5), 1px 2px 3px rgba(0,0,0,0.4) !important;
  color: #fff !important;
  width: 50px !important;
  height: 28px !important;
}
.play-pause:active {
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.5) !important;
}

.vol-fill, .progress-fill, #main-progress-fill {
  background: var(--lcd-text) !important;
  box-shadow: 0 0 5px var(--lcd-text) !important;
  border-radius: 0 !important;
}

.vol-bar, #main-progress {
  background: #111 !important;
  border: 1px solid #555 !important;
  border-bottom-color: #fff !important;
  border-right-color: #fff !important;
  border-radius: 0 !important;
}

.vol-knob, .progress-knob {
  background: linear-gradient(180deg, #fff, #ccc) !important;
  border: 1px solid #555 !important;
  border-radius: 0 !important;
  width: 10px !important;
  height: 14px !important;
  top: -4px !important;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.4) !important;
}

.mini-info span {
  color: #333 !important;
}
.like-btn, .vol-icon, .icon-btn {
  color: #555 !important;
}
`;

fs.writeFileSync(cssPath, css);
console.log('Y2K Hybrid Styles applied!');
