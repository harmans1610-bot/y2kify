const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update root variables
css = css.replace(/--bg-color: #05020a;/, '--bg-color: #1a102b;');
css = css.replace(/--panel-bg: #0d071a;/, '--panel-bg: #11091e;');
css = css.replace(/--panel-border: #2a1b42;/, '--panel-border: #352354;');
css = css.replace(/--text-main: #e2d9f3;/, '--text-main: #f0e6ff;');
css = css.replace(/--text-muted: #8b7ca6;/, '--text-muted: #a491c7;');
css = css.replace(/--accent-purple: #9d5cff;/, '--accent-purple: #b27cff;');

// 2. Update Top Bar Background
css = css.replace(/background: #0d071a;/, 'background: #11091e;');

// 3. Ensure panels are slightly transparent for glassmorphism
css = css.replace(/background: var\(--panel-bg\);/, 'background: rgba(17, 9, 30, 0.85);');

fs.writeFileSync(cssPath, css);
console.log('Colors updated!');
