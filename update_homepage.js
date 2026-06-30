const fs = require('fs');
const path = require('path');

const htmlPath = path.join('e:', 'New folder (2)', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Remove genres section
html = html.replace(/<!-- Browse by Genre -->\s*<div class="genres-section panel">[\s\S]*?<\/div>\s*<\/main>/, '</main>');

// 2. Change featured to playlists
html = html.replace(/<h2>featured<\/h2>/, '<h2>your playlists</h2>');
html = html.replace(/<!-- Featured -->\s*<div class="featured-section panel">/, '<!-- Playlists -->\n        <div class="featured-section panel">');

fs.writeFileSync(htmlPath, html);
console.log('Homepage updated!');
