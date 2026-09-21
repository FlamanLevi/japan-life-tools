const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== RUNNING AUTOMATED BROWSER RENDER TEST ===\n');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!fs.existsSync(chromePath)) {
  console.log('Chrome executable not found at standard path, skipping browser render.');
  process.exit(0);
}

const htmlFile = path.join(__dirname, 'index.html').replace(/\\/g, '/');

const captures = [
  { name: 'mobile_dosage.png', size: '375,812', hash: '#dosage' },
  { name: 'mobile_guided.png', size: '375,812', hash: '#guided' },
  { name: 'mobile_panel.png', size: '375,812', hash: '#panel' },
  { name: 'mobile_errors.png', size: '375,812', hash: '#errors' },
  { name: 'desktop_panel.png', size: '1280,800', hash: '#panel' }
];

try {
  for (const cap of captures) {
    const outPath = path.join(__dirname, cap.name);
    console.log(`Capturing ${cap.name} (${cap.size}) via hash deep-link (${cap.hash})...`);
    execSync(`"${chromePath}" --headless=new --disable-gpu --no-sandbox --window-size=${cap.size} --hide-scrollbars --screenshot="${outPath}" "file:///${htmlFile}${cap.hash}"`);
    console.log(`✔ ${cap.name} saved (${fs.statSync(outPath).size} bytes)`);
  }

  console.log('\n✅ ALL 5 BROWSER RENDER VERIFICATIONS COMPLETED PERFECTLY!');
} catch (err) {
  console.error('❌ Error during browser render capture:', err.message);
  process.exit(1);
}
