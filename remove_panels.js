const fs = require('fs');
const path = require('path');

const htmlPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Remove Quick Links panel
html = html.replace(/<div class="quick-links panel">[\s\S]*?<\/ul>\s*<\/div>/, '');

// Remove Friend Activity panel
html = html.replace(/<div class="friend-activity panel">[\s\S]*?<\/div>\s*<\/aside>/, '</aside>');

fs.writeFileSync(htmlPath, html);
console.log('Panels removed!');
