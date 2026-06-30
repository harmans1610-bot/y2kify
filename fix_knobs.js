const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

css += `\n/* Fix knob centering */
.progress-fill, #main-progress-fill, .vol-fill {
  position: relative !important;
}
.progress-knob, .vol-knob {
  position: absolute !important;
  right: -3px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  background: #fff !important;
  border: 1px solid #000 !important;
  width: 6px !important;
  height: 16px !important;
  border-radius: 0 !important;
  box-shadow: 1px 1px 0px rgba(0,0,0,0.5) !important;
}
`;

fs.writeFileSync(cssPath, css);
console.log('Knobs centered!');
