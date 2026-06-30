const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Fix the active-device device-icon being white
css = css.replace(/\.active-device \.device-icon\s*\{\s*color:\s*#fff;\s*\}/g, '.active-device .device-icon { color: #111; }');

// Fix the nav-icon star being white
css = css.replace(/\.nav-icon\.star\s*\{\s*color:\s*#fff;\s*\}/g, '.nav-icon.star { color: #111; }');

fs.writeFileSync(cssPath, css);
console.log('Fixed icon colors!');
