const fs = require('fs');
const path = require('path');

const cssPath = path.join('e:', 'New folder (2)', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Enhance LCD Contrast (Darker BG, Brighter Text)
css = css.replace(/--lcd-bg: #05140d;/, '--lcd-bg: #010804;');
css = css.replace(/--lcd-text: #4bf090;/, '--lcd-text: #00ff66;');

// 2. Enhance CD Jewel Case in the player
css += '\n/* Enhanced Jewel Case for Player */\n';
css += '.cd-case {\n';
css += '  position: relative;\n';
css += '  border: 1px solid #555;\n';
css += '  box-shadow: 2px 2px 5px rgba(0,0,0,0.5);\n';
css += '  background: #000;\n';
css += '}\n';
css += '.cd-case::after {\n';
css += '  content: "";\n';
css += '  position: absolute;\n';
css += '  top: 0; left: 0; right: 0; bottom: 0;\n';
css += '  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.0) 40%, rgba(255,255,255,0.0) 60%, rgba(255,255,255,0.1) 100%);\n';
css += '  pointer-events: none;\n';
css += '  border-left: 15px solid rgba(255,255,255,0.2);\n';
css += '  border-radius: 2px;\n';
css += '}\n';

// 3. Re-style the Visualizer to look like blocky LEDs
css += '\n/* Blocky LED Visualizer */\n';
css += '.eq-visualizer {\n';
css += '  display: flex;\n';
css += '  align-items: flex-end;\n';
css += '  gap: 2px;\n';
css += '  height: 60px;\n';
css += '  background: var(--lcd-bg);\n';
css += '  padding: 4px;\n';
css += '  border: 1px solid #333;\n';
css += '  border-bottom-color: #fff;\n';
css += '  border-right-color: #fff;\n';
css += '  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.8);\n';
css += '}\n';
css += '.eq-bar {\n';
css += '  flex-grow: 1;\n';
css += '  width: 8px;\n';
css += '  background: repeating-linear-gradient(0deg, var(--lcd-text) 0px, var(--lcd-text) 3px, transparent 3px, transparent 5px) !important;\n';
css += '  box-shadow: none !important;\n';
css += '  opacity: 0.8;\n';
css += '}\n';
css += '.eq-bar:nth-child(even) { height: 80% !important; }\n';
css += '.eq-bar:nth-child(odd) { height: 40% !important; }\n';
css += '.eq-bar:nth-child(3n) { height: 100% !important; }\n';

// 4. Enhance general UI contrast
css = css.replace(/--panel-bg: linear-gradient\\(135deg, #e8ecef 0%, #b0b6bf 100%\\);/, '--panel-bg: linear-gradient(135deg, #e0e5e8 0%, #a4abb3 100%);');
css = css.replace(/--bg-color: #c0c5ce;/, '--bg-color: #a4abb3;');

// 5. Enhance the Timeline and Volume to match LED theme
css += '\n/* Timeline & Volume blocky segments */\n';
css += '.progress-fill, #main-progress-fill, .vol-fill {\n';
css += '  background: repeating-linear-gradient(90deg, var(--lcd-text) 0px, var(--lcd-text) 4px, transparent 4px, transparent 6px) !important;\n';
css += '  box-shadow: 0 0 8px var(--lcd-text) !important;\n';
css += '}\n';
css += '.progress-knob, .vol-knob {\n';
css += '  background: #fff !important;\n';
css += '  border: 1px solid #000 !important;\n';
css += '  width: 6px !important;\n';
css += '  height: 16px !important;\n';
css += '  border-radius: 0 !important;\n';
css += '  top: -5px !important;\n';
css += '  box-shadow: 1px 1px 0px rgba(0,0,0,0.5) !important;\n';
css += '}\n';

fs.writeFileSync(cssPath, css);
console.log('Enhancements applied!');
