const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Remove flex-shrink: 0 from panels and make content-center hidden
css = css.replace(/\.content-center > \.panel \{\s*flex-shrink: 0;\s*\}/, '');
css = css.replace(/overflow-y: auto;/, 'overflow: hidden;');

// 2. Shrink Now Playing content paddings
css = css.replace(/\.now-playing-content \{\s*display: flex;\s*padding: 24px;\s*gap: 30px;/, '.now-playing-content {\n  display: flex;\n  padding: 12px 24px;\n  gap: 24px;');

// 3. Shrink CD Case
css = css.replace(/\.cd-case \{\s*position: relative;\s*width: 220px;\s*height: 220px;/, '.cd-case {\n  position: relative;\n  width: 180px;\n  height: 180px;');
css = css.replace(/\.cd-case img \{\s*width: 200px;/, '.cd-case img {\n  width: 160px;');

// 4. Shrink EQ Visualizer
css = css.replace(/\.eq-visualizer \{\s*width: 140px;\s*height: 140px;[\s\S]*?padding: 15px;/, '.eq-visualizer {\n  width: 120px;\n  height: 120px;\n  background: rgba(0,0,0,0.3);\n  border: 1px solid var(--panel-border);\n  border-radius: 8px;\n  display: flex;\n  align-items: flex-end;\n  justify-content: center;\n  gap: 4px;\n  padding: 10px;');

// 5. Shrink Player Controls Padding
css = css.replace(/\.player-controls-large \{\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*padding: 20px 24px 24px;/, '.player-controls-large {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 12px 24px;');

// 6. Reduce some other margins
css = css.replace(/\.track-artist \{\s*font-size: 18px;\s*color: var\(--text-muted\);\s*font-weight: 400;\s*margin-bottom: 24px;/, '.track-artist {\n  font-size: 16px;\n  color: var(--text-muted);\n  font-weight: 400;\n  margin-bottom: 12px;');
css = css.replace(/\.track-title \{\s*font-size: 32px;/, '.track-title {\n  font-size: 26px;');

fs.writeFileSync(cssPath, css);
console.log('CSS optimized for single screen fit!');
