const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Revert the green LCD colors back to standard white on dark sleek blue/purple
css = css.replace(/--lcd-bg: #[0-9a-fA-F]+;/, '--lcd-bg: #121526;'); // Sleek dark blue
css = css.replace(/--lcd-text: #[0-9a-fA-F]+;/, '--lcd-text: #ffffff;'); // Crisp white text
css = css.replace(/--lcd-text-muted: #[0-9a-fA-F]+;/, '--lcd-text-muted: #8899cc;');

// If they hate the blocky LED look, we can revert the progress bar and volume bar back to gradients
css = css.replace(/background: repeating-linear-gradient[^!]+!important;/g, 'background: linear-gradient(90deg, #ff7be5, #a382e8) !important;');
css = css.replace(/box-shadow: 0 0 8px var\(--lcd-text\) !important;/g, 'box-shadow: 0 0 10px rgba(255,123,229,0.5) !important;');

fs.writeFileSync(cssPath, css);

const indexPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Remove eq-visualizer from now-playing
html = html.replace(/<div class="eq-visualizer">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '</div>\n</div>');

fs.writeFileSync(indexPath, html);
console.log('Removed green LCD and animation visualizer.');
