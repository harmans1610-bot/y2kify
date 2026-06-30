const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Fix featured cards title color (YOUR PLAYLISTS)
css = css.replace(/\.card h3\s*\{[\s\S]*?color:\s*#[a-fA-F0-9]+;/, match => {
  return match.replace(/color:\s*#[a-fA-F0-9]+;/, 'color: #111;');
});

// If the regex above fails because of `var(--...)` or something, let's just do a blanket replace for `.card h3` block
css = css.replace(/\.card h3\s*\{([^}]*)\}/, (match, inner) => {
    return `.card h3 {${inner.replace(/color:\s*[^;]+;/, 'color: #111;')}}`;
});

// 2. Fix device name color (CURRENTLY PLAYING ON)
css = css.replace(/\.dev-name\s*\{([^}]*)\}/, (match, inner) => {
    return `.dev-name {${inner.replace(/color:\s*[^;]+;/, 'color: #111;')}}`;
});

// Also fix the active device color if it was specifically overridden
css = css.replace(/\.active-device \.dev-name\s*\{([^}]*)\}/, (match, inner) => {
    return `.active-device .dev-name {${inner.replace(/color:\s*[^;]+;/, 'color: #000;')}}`;
});

fs.writeFileSync(cssPath, css);
console.log('Fixed text colors for devices and playlist cards!');
