const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Update body background
css = css.replace(/body \{\s*margin: 0;\s*padding: 0;\s*background-color: var\(--bg-color\);\s*color: var\(--text-main\);\s*font-family: var\(--font-main\);\s*height: 100vh;\s*\}/, 
`body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #2A295B 0%, #1D1C39 50%, #000000 100%);
  color: var(--text-main);
  font-family: var(--font-main);
  height: 100vh;
}`);

// Also update the app-container if it has a background
css = css.replace(/\.app-container \{\s*width: 100vw;\s*height: 100vh;\s*display: flex;\s*flex-direction: column;\s*background: var\(--bg-color\);/, 
`.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;`);

fs.writeFileSync(cssPath, css);
console.log('Gradient applied!');
