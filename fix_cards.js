const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Remove border-radius and inner shadow from the wrapper
css = css.replace(/\.card-img-wrapper\s*\{([^}]*)\}/, (match, inner) => {
    let newInner = inner.replace(/border-radius:\s*[^;]+;/, 'border-radius: 0;');
    newInner = newInner.replace(/box-shadow:\s*[^;]+;/, 'box-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    newInner = newInner.replace(/border:\s*[^;]+;/, 'border: 1px solid #555;');
    newInner = newInner.replace(/background:\s*[^;]+;/, 'background: #000;');
    return `.card-img-wrapper {${newInner}}`;
});

// Remove border-radius from the image itself
css = css.replace(/\.card img\s*\{([^}]*)\}/, (match, inner) => {
    let newInner = inner.replace(/border-radius:\s*[^;]+;/, 'border-radius: 0;');
    return `.card img {${newInner}}`;
});

// Remove the purple glow on hover and replace it with a simple inset border/shadow change
css = css.replace(/\.card-img-wrapper:hover\s*\{([^}]*)\}/, (match, inner) => {
    let newInner = inner.replace(/box-shadow:\s*[^;]+;/, 'box-shadow: 1px 1px 2px rgba(0,0,0,0.8);');
    newInner = newInner.replace(/border-color:\s*[^;]+;/, 'border-color: #fff;');
    newInner = newInner.replace(/transform:\s*translateY\([^)]+\);/, 'transform: translateY(-2px);');
    return `.card-img-wrapper:hover {${newInner}}`;
});

fs.writeFileSync(cssPath, css);
console.log('Cards fixed!');
