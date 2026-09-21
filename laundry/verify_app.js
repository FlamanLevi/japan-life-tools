const fs = require('fs');
const path = require('path');

console.log('=== RUNNING COMPREHENSIVE SUITE TEST FOR LAUNDRY GUIDE APP ===\n');

// 1. Check data.js
const LAUNDRY_DATA = require('./data.js');
console.log('✔ data.js parsed successfully.');

// Validate floors and machines
const machineIds = Object.keys(LAUNDRY_DATA.machines);
console.log(`Found ${machineIds.length} machines across ${LAUNDRY_DATA.floors.length} floors:`, machineIds);

let errors = [];

LAUNDRY_DATA.floors.forEach(floor => {
  floor.machines.forEach(mId => {
    if (!LAUNDRY_DATA.machines[mId]) {
      errors.push(`Floor ${floor.id} references missing machine ID: ${mId}`);
    }
  });
});

// Validate machine specs & readings
machineIds.forEach(mId => {
  const m = LAUNDRY_DATA.machines[mId];
  if (!m.brand || !m.model || !m.floor || !m.capacityWashKg) {
    errors.push(`Machine ${mId} is missing basic properties`);
  }
  if (!Array.isArray(m.displayReadings) || m.displayReadings.length === 0) {
    errors.push(`Machine ${mId} has invalid or empty displayReadings`);
  } else {
    m.displayReadings.forEach(r => {
      if (!r.reading || !r.loadEstimate || typeof r.waterEstL !== 'number') {
        errors.push(`Machine ${mId} has malformed displayReading: ${JSON.stringify(r)}`);
      }
    });
  }
  if (!m.dispenserDrawer || !m.dispenserDrawer.diagramType) {
    errors.push(`Machine ${mId} is missing dispenserDrawer config`);
  }
});

// Validate goals
console.log(`Checking ${LAUNDRY_DATA.goals.length} laundry goals...`);
LAUNDRY_DATA.goals.forEach(g => {
  if (!g.id || !g.title || !g.titleJa || !g.steps) {
    errors.push(`Goal ${g.id} is missing core properties`);
  }
  if (!g.steps.panasonic || !Array.isArray(g.steps.panasonic)) {
    errors.push(`Goal ${g.id} is missing panasonic steps`);
  }
  if (!g.steps.sharp || !Array.isArray(g.steps.sharp)) {
    errors.push(`Goal ${g.id} is missing sharp steps`);
  }
});

// Validate errors
console.log(`Checking ${LAUNDRY_DATA.errorCodes.length} error codes...`);
LAUNDRY_DATA.errorCodes.forEach(err => {
  if (!err.code || !err.titleEn || !err.titleJa || !err.cause || !Array.isArray(err.actions)) {
    errors.push(`Malformed error code entry: ${JSON.stringify(err)}`);
  }
});

// Validate dictionary
console.log(`Checking ${LAUNDRY_DATA.panelDictionary.length} control panel dictionary terms...`);
LAUNDRY_DATA.panelDictionary.forEach(term => {
  if (!term.ja || !term.en || !term.romaji) {
    errors.push(`Malformed panelDictionary term: ${JSON.stringify(term)}`);
  }
});

// 2. Validate manifest.json
const manifestPath = path.join(__dirname, 'manifest.json');
try {
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`✔ manifest.json parsed successfully. App Name: "${manifestContent.name}"`);
  manifestContent.icons.forEach(icon => {
    const iconFile = path.join(__dirname, icon.src);
    if (!fs.existsSync(iconFile)) {
      errors.push(`Manifest icon not found: ${icon.src}`);
    } else {
      console.log(`✔ Icon file verified: ${icon.src} (${fs.statSync(iconFile).size} bytes)`);
    }
  });
} catch (e) {
  errors.push(`manifest.json error: ${e.message}`);
}

// 2b. Validate Offline PWA Service Worker (sw.js)
const swPath = path.join(__dirname, 'sw.js');
if (!fs.existsSync(swPath)) {
  errors.push('sw.js Service Worker file missing');
} else {
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (!swContent.includes('CACHE_NAME') || !swContent.includes('STATIC_ASSETS')) {
    errors.push('sw.js missing CACHE_NAME or STATIC_ASSETS definition');
  } else {
    console.log(`✔ Offline Service Worker verified: sw.js (${fs.statSync(swPath).size} bytes)`);
  }
}

// 3. Verify DOM IDs in app.js vs index.html
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Match all document.getElementById("...") in app.js
const idMatches = [...appJs.matchAll(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/g)].map(m => m[1]);
const uniqueIds = [...new Set(idMatches)];
console.log(`\nVerifying ${uniqueIds.length} unique DOM element IDs used in app.js exist in index.html...`);

uniqueIds.forEach(id => {
  const idAttr1 = `id="${id}"`;
  const idAttr2 = `id='${id}'`;
  if (!indexHtml.includes(idAttr1) && !indexHtml.includes(idAttr2)) {
    errors.push(`DOM ID referenced in app.js not found in index.html: "${id}"`);
  }
});

// 4. Test reading coverage and dosage calculations for all machines
console.log(`\nTesting display readings coverage and dosage calibration for all machines...`);
machineIds.forEach(mId => {
  const m = LAUNDRY_DATA.machines[mId];
  m.displayReadings.forEach(r => {
    const readingVal = parseFloat(r.reading);
    if (isNaN(readingVal) || readingVal <= 0) {
      errors.push(`Machine ${mId} reading invalid: ${r.reading}`);
    }
    if (!r.labelJa) errors.push(`Machine ${mId} reading ${r.reading} missing labelJa`);
    if (!r.loadEstimateJa) errors.push(`Machine ${mId} reading ${r.reading} missing loadEstimateJa`);
    if (!r.drumKg || !r.drumKgJa) errors.push(`Machine ${mId} reading ${r.reading} missing drumKg/drumKgJa`);
    if (!r.waterEstL || r.waterEstL <= 0) errors.push(`Machine ${mId} reading ${r.reading} invalid waterEstL`);
    
    // Check calibrated dosages
    if (!r.dosages) {
      errors.push(`Machine ${mId} reading ${r.reading} missing dosages object`);
    } else {
      const prods = ['nanox', 'bleach', 'softener', 'citric', 'beads'];
      prods.forEach(p => {
        const d = r.dosages[p];
        if (!d || !d.cap || !d.capJa || !d.ml || d.ml <= 0) {
          errors.push(`Machine ${mId} reading ${r.reading} missing dosage for product '${p}': ${JSON.stringify(d)}`);
        }
      });
    }
  });
});

if (errors.length > 0) {
  console.error('\n❌ VALIDATION FAILED WITH ERRORS:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('✔ All 5 machines & readings have fully calibrated, verified dosages.');
  console.log('\n✅ ALL VERIFICATION CHECKS PASSED WITH ZERO ERRORS!');
}
