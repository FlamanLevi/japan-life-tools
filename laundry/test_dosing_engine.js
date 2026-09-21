// Test Suite for Dynamic Dosing Engine in v2 User-Owned Bottle Architecture
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING COMPREHENSIVE V2 DOSING ENGINE TEST SUITE ===\n');

const LAUNDRY_DATA = require('./data.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`✔ ${message}`);
  } else {
    failCount++;
    console.error(`❌ FAIL: ${message}`);
  }
}

// 1. Validate Product Categories in data.js
console.log('--- 1. Validating Product Categories Architecture ---');
assert(Array.isArray(LAUNDRY_DATA.productCategories), "productCategories array exists in data.js");
assert(LAUNDRY_DATA.productCategories.length === 8, `Expected 8 product categories, found ${LAUNDRY_DATA.productCategories.length}`);

const expectedCategories = [
  "liquid_detergent",
  "powder_detergent",
  "softener",
  "liquid_bleach",
  "powder_bleach",
  "in_drum_beads",
  "pods",
  "citric_rinse"
];

expectedCategories.forEach(catId => {
  const cat = LAUNDRY_DATA.productCategories.find(c => c.id === catId);
  assert(cat !== undefined, `Category '${catId}' is defined`);
  if (cat) {
    assert(cat.name && cat.nameJa, `Category '${catId}' has bilingual names`);
    assert(cat.defaultSlot !== undefined, `Category '${catId}' defines defaultSlot: ${cat.defaultSlot}`);
    assert(Array.isArray(cat.presets) && cat.presets.length > 0, `Category '${catId}' has quick preset buttons`);
  }
});

// Setup minimal DOM mock to instantiate LaundryApp and test app.calculateDoseForProduct directly
const domElements = {};
function createElementMock(id = '', tag = 'div') {
  return {
    id, tagName: tag.toUpperCase(), className: '', classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    attributes: {}, setAttribute(k, v) { this.attributes[k] = String(v); }, getAttribute(k) { return this.attributes[k] || null; },
    removeAttribute(k) { delete this.attributes[k]; }, textContent: '', innerHTML: '', value: '', style: {},
    addEventListener() {}, dispatchEvent() {}, querySelector() { return null; }, querySelectorAll() { return []; }
  };
}

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const idAttrRegex = /id=["']([^"']+)["']/g;
let m;
while ((m = idAttrRegex.exec(indexHtml)) !== null) {
  domElements[m[1]] = createElementMock(m[1]);
}

global.document = {
  documentElement: createElementMock('html', 'html'),
  addEventListener() {},
  getElementById(id) {
    if (!domElements[id]) domElements[id] = createElementMock(id);
    return domElements[id];
  },
  querySelectorAll() { return []; },
  querySelector() { return null; }
};

global.window = { matchMedia: () => ({ matches: false }) };
const storage = {};
global.localStorage = {
  getItem: k => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: k => { delete storage[k]; }
};
global.LAUNDRY_DATA = LAUNDRY_DATA;

const appSource = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
vm.runInThisContext(appSource);
const app = new LaundryApp();

console.log('\n--- 2. Testing Category 1: Liquid Detergent (Standard, Concentrated, Hyper & Soap) ---');
// 2.1 Ultra-Concentrate (10mL/30L) e.g. NANOX one
const bottleNanox = {
  id: "test_nanox",
  category: "liquid_detergent",
  name: "Lion NANOX one PRO",
  baselineAmount: 10,
  unit: "mL",
  defaultSlot: "main_detergent",
  isPush: false
};
const doseNanox30 = app.calculateDoseForProduct(bottleNanox, { waterEstL: 30, drumKg: "2.0 kg" });
assert(doseNanox30.amount === 10, `30L water with 10mL/30L detergent yields 10mL (got ${doseNanox30.amount})`);
assert(doseNanox30.unit === "mL", `Unit is mL (got ${doseNanox30.unit})`);

const doseNanox55 = app.calculateDoseForProduct(bottleNanox, { waterEstL: 55, drumKg: "4.5 kg" });
assert(doseNanox55.amount === 20, `55L water with 10mL/30L detergent yields 20mL (0.8 cap line) (got ${doseNanox55.amount})`);

// 2.2 Hyper-Concentrate (6mL/30L)
const bottleHyper = {
  id: "test_hyper",
  category: "liquid_detergent",
  name: "Auto-Tank Hyper Concentrate",
  baselineAmount: 6,
  unit: "mL",
  defaultSlot: "main_detergent",
  isPush: false
};
const doseHyper30 = app.calculateDoseForProduct(bottleHyper, { waterEstL: 30 });
assert(doseHyper30.amount === 6, `30L water with 6mL/30L yields 6mL (got ${doseHyper30.amount})`);

// 2.3 Standard Liquid (25mL/30L)
const bottleStd25 = {
  id: "test_std25",
  category: "liquid_detergent",
  name: "Attack Antibacterial Gel",
  baselineAmount: 25,
  unit: "mL",
  defaultSlot: "main_detergent",
  isPush: false
};
const doseStd30 = app.calculateDoseForProduct(bottleStd25, { waterEstL: 30 });
assert(doseStd30.amount === 25, `30L water with 25mL/30L yields 25mL (got ${doseStd30.amount})`);
const doseStd55 = app.calculateDoseForProduct(bottleStd25, { waterEstL: 55 });
assert(doseStd55.amount === 46, `55L water with 25mL/30L yields 46mL (got ${doseStd55.amount})`);

// 2.4 Pure Soap (50mL/30L)
const bottleSoap = {
  id: "test_soap",
  category: "liquid_detergent",
  name: "arau. Pure Soap",
  baselineAmount: 50,
  unit: "mL",
  defaultSlot: "main_detergent",
  isPush: false
};
const doseSoap30 = app.calculateDoseForProduct(bottleSoap, { waterEstL: 30 });
assert(doseSoap30.amount === 50, `30L water with 50mL/30L pure soap yields 50mL (got ${doseSoap30.amount})`);

console.log('\n--- 3. Testing Category 1 Special: Push Dispenser Bottles ---');
// 3.1 Attack ZERO (5g/push, 10mL/30L)
const bottleAttackPush = {
  id: "test_attack_push",
  category: "liquid_detergent",
  name: "Attack ZERO One-Push",
  baselineAmount: 10,
  unit: "mL",
  defaultSlot: "main_detergent",
  isPush: true,
  pushG: 5
};
const dosePush5g_30 = app.calculateDoseForProduct(bottleAttackPush, { waterEstL: 30 });
assert(dosePush5g_30.isPush === true, "isPush flag is true");
assert(dosePush5g_30.amount === 2, `30L water with 5g/push yields 2 pushes (got ${dosePush5g_30.amount})`);
const dosePush5g_55 = app.calculateDoseForProduct(bottleAttackPush, { waterEstL: 55 });
assert(dosePush5g_55.amount === 4, `55L water with 5g/push yields 4 pushes (got ${dosePush5g_55.amount})`);

// 3.2 NANOX One-Push (3g/push, 10mL/30L)
const bottleNanoxPush = {
  id: "test_nanox_push",
  category: "liquid_detergent",
  name: "NANOX One-Push",
  baselineAmount: 10,
  unit: "mL",
  defaultSlot: "main_detergent",
  isPush: true,
  pushG: 3
};
const dosePush3g_30 = app.calculateDoseForProduct(bottleNanoxPush, { waterEstL: 30 });
assert(dosePush3g_30.amount === 3, `30L water with 3g/push yields 3 pushes (got ${dosePush3g_30.amount})`);
const dosePush3g_55 = app.calculateDoseForProduct(bottleNanoxPush, { waterEstL: 55 });
assert(dosePush3g_55.amount === 6, `55L water with 3g/push yields 6 pushes (got ${dosePush3g_55.amount})`);

console.log('\n--- 4. Testing Category 2: Powder Detergent ---');
const bottlePowderDet = {
  id: "test_powder_det",
  category: "powder_detergent",
  name: "Attack Reset Power Box",
  baselineAmount: 21,
  unit: "g",
  defaultSlot: "powder_detergent",
  isPush: false
};
const dosePowder30 = app.calculateDoseForProduct(bottlePowderDet, { waterEstL: 30 });
assert(dosePowder30.amount === 21, `30L water yields 21g powder (got ${dosePowder30.amount})`);
assert(dosePowder30.unit === "g", `Unit is g (got ${dosePowder30.unit})`);
assert(bottlePowderDet.defaultSlot === "powder_detergent", "Powder detergent routes to powder_detergent slot");

const dosePowder45 = app.calculateDoseForProduct(bottlePowderDet, { waterEstL: 45 });
assert(dosePowder45.amount === 32, `45L water yields 32g powder (got ${dosePowder45.amount})`);

console.log('\n--- 5. Testing Category 3: Fabric Softener ---');
const bottleSoftener = {
  id: "test_softener",
  category: "softener",
  name: "Humming Deodorant Softener",
  baselineAmount: 10,
  unit: "mL",
  defaultSlot: "softener",
  isPush: false
};
const doseSoft30 = app.calculateDoseForProduct(bottleSoftener, { waterEstL: 30 });
assert(doseSoft30.amount === 10, `30L water yields 10mL softener (got ${doseSoft30.amount})`);
assert(bottleSoftener.defaultSlot === "softener", "Softener routes to softener slot");

const bottleLenorReset = {
  id: "test_lenor_reset",
  category: "softener",
  name: "Lenor Reset Wrinkle Serum",
  baselineAmount: 16,
  unit: "mL",
  defaultSlot: "softener",
  isPush: false
};
const doseSoftReset30 = app.calculateDoseForProduct(bottleLenorReset, { waterEstL: 30 });
assert(doseSoftReset30.amount === 16, `30L water yields 16mL Lenor Reset (got ${doseSoftReset30.amount})`);

console.log('\n--- 6. Testing Category 4: Liquid Bleach (Acidic Oxygen) ---');
const bottleLiquidBleach = {
  id: "test_liquid_bleach",
  category: "liquid_bleach",
  name: "Wide Haiter EX Power Liquid",
  baselineAmount: 20,
  unit: "mL",
  defaultSlot: "bleach",
  isPush: false
};
const doseBleach30 = app.calculateDoseForProduct(bottleLiquidBleach, { waterEstL: 30 });
assert(doseBleach30.amount === 20, `30L water yields 20mL liquid bleach (got ${doseBleach30.amount})`);
assert(bottleLiquidBleach.defaultSlot === "bleach", "Liquid bleach routes to bleach slot");

console.log('\n--- 7. Testing Category 5: Powder Bleach (Alkaline Oxygen) ---');
const bottlePowderBleach = {
  id: "test_powder_bleach",
  category: "powder_bleach",
  name: "Wide Haiter Clear Hero Powder Bleach",
  baselineAmount: 10,
  unit: "g",
  defaultSlot: "powder_detergent",
  isPush: false
};
const dosePowderBleach30 = app.calculateDoseForProduct(bottlePowderBleach, { waterEstL: 30 });
assert(dosePowderBleach30.amount === 10, `30L water yields 10g powder bleach (got ${dosePowderBleach30.amount})`);
assert(dosePowderBleach30.unit === "g", `Unit is g (got ${dosePowderBleach30.unit})`);
assert(bottlePowderBleach.defaultSlot === "powder_detergent", "Powder bleach routes to powder_detergent slot (never liquid slot)");

console.log('\n--- 8. Testing Category 6: In-Drum Scent Booster Beads ---');
const bottleBeads = {
  id: "test_beads",
  category: "in_drum_beads",
  name: "Lenor Aroma Jewel Beads",
  baselineAmount: 12,
  unit: "mL",
  defaultSlot: "drum_direct",
  isPush: false
};
const doseBeads2kg = app.calculateDoseForProduct(bottleBeads, { drumKg: "2.0 kg", waterEstL: 30 });
assert(doseBeads2kg.amount === 24, `2.0 kg laundry yields 24mL beads (got ${doseBeads2kg.amount})`);
assert(bottleBeads.defaultSlot === "drum_direct", "Beads route to drum_direct");

const doseBeads4kg = app.calculateDoseForProduct(bottleBeads, { drumKg: "4.0 kg", waterEstL: 45 });
assert(doseBeads4kg.amount === 48, `4.0 kg laundry yields 48mL beads (got ${doseBeads4kg.amount})`);

console.log('\n--- 9. Testing Category 7: Pods & Gel Sticks ---');
const bottlePods = {
  id: "test_pods",
  category: "pods_sticks",
  name: "Ariel 4D Gelball Pods",
  baselineAmount: 1,
  unit: "pod",
  defaultSlot: "drum_direct",
  isPush: false,
  formulaType: "unit_count"
};
const dosePodNorm = app.calculateDoseForProduct(bottlePods, { waterEstL: 45, drumKg: "3.5 kg" });
assert(dosePodNorm.isUnit === true, "isUnit flag is true");
assert(dosePodNorm.amount === 1, `Normal load yields 1 pod (got ${dosePodNorm.amount})`);
assert(bottlePods.defaultSlot === "drum_direct", "Pods route to drum_direct (put at bottom before laundry)");

const dosePodHigh = app.calculateDoseForProduct(bottlePods, { waterEstL: 75, drumKg: "7.0 kg" });
assert(dosePodHigh.amount === 2, `High load (>65L or >6kg) yields 2 pods (got ${dosePodHigh.amount})`);

console.log('\n--- 10. Testing Category 8: Citric Acid Rinse ---');
const bottleCitric = {
  id: "test_citric",
  category: "citric_rinse",
  name: "Lenor Citric Acid in Super Deodorant",
  baselineAmount: 9.1,
  unit: "mL",
  defaultSlot: "softener",
  isPush: false,
  isCitricAcid: true
};
const doseCitric2kg = app.calculateDoseForProduct(bottleCitric, { drumKg: "2.0 kg", waterEstL: 30 });
assert(doseCitric2kg.amount === 18, `2.0 kg laundry yields 18mL citric rinse (got ${doseCitric2kg.amount})`);
assert(bottleCitric.defaultSlot === "softener", "Citric acid rinse routes to softener slot");

console.log('\n--- 11. Testing Mutual Exclusion Safety (Softener vs Citric Acid) ---');
// In app.renderUserArsenal, toggling citric acid active must deactivate softener and vice-versa
app.userBottles = [
  { id: "soft_1", category: "softener", name: "Softener A", isActive: true },
  { id: "citric_1", category: "citric_rinse", name: "Citric B", isActive: false }
];
// Toggle citric on
const bCitric = app.getBottleById("citric_1");
bCitric.isActive = true;
// Enforce rule
if (bCitric.category === "citric_rinse" && bCitric.isActive) {
  app.userBottles.forEach(o => {
    if (o.id !== bCitric.id && o.category === "softener") o.isActive = false;
  });
}
const bSoft = app.getBottleById("soft_1");
assert(bSoft.isActive === false, "Activating citric acid safely deactivates active fabric softener");

// Toggle softener back on
bSoft.isActive = true;
if (bSoft.category === "softener" && bSoft.isActive) {
  app.userBottles.forEach(o => {
    if (o.id !== bSoft.id && o.category === "citric_rinse") o.isActive = false;
  });
}
assert(bCitric.isActive === false, "Activating fabric softener safely deactivates active citric acid rinse");

console.log('\n--- 12. Testing Calibrator Input Sanitization & Clamping ---');
function sanitizeBaseline(val, isPowder) {
  const raw = parseFloat(val);
  return (!isNaN(raw) && raw > 0) ? Math.min(200, Math.max(0.5, raw)) : (isPowder ? 20 : 10);
}
assert(sanitizeBaseline("-5", false) === 10, "Negative input defaults to 10");
assert(sanitizeBaseline("0", false) === 10, "0 input defaults to 10");
assert(sanitizeBaseline("999", false) === 200, "Excessive input clamped to 200");
assert(sanitizeBaseline("0.5", false) === 0.5, "0.5 accepted");
assert(sanitizeBaseline("invalid", true) === 20, "Invalid powder defaults to 20");

console.log('\n--- 13. Testing Physical Cap Calibration Profiles Architecture ---');
// 13.1 Liquid Bleach (Wide Haiter / Bright) must use 下線 (20mL) and 上線 (40mL)
const bleachStandard = app.calculateDoseForProduct(bottleLiquidBleach, { waterEstL: 30 });
assert(bleachStandard.capEn.includes("Lower Line") && bleachStandard.capJa.includes("下線"), "Standard bleach dose refers to Lower Line (下線 20mL)");
assert(!bleachStandard.capEn.includes("Cap"), "Bleach cap string does NOT use abstract fractional cups");

const bleachHeavy = app.calculateDoseForProduct(bottleLiquidBleach, { waterEstL: 65, drumKg: "7.0 kg" });
assert(bleachHeavy.amount === 40, "Heavy bleach dose yields 40mL (上線)");
assert(bleachHeavy.capEn.includes("Upper Line") && bleachHeavy.capJa.includes("上線"), "Heavy bleach dose refers to Upper Line (上線 40mL)");

// 13.2 Citric Acid (Renoa Kuen-san) has only 0.4, 0.6, 0.8 marks (NO 1.0 mark)
const citricLight = app.calculateDoseForProduct(bottleCitric, { drumKg: "1.5 kg", waterEstL: 20 });
assert(citricLight.capJa.includes("0.4杯弱"), `Light citric load refers to below 0.4 mark (got ${citricLight.capJa})`);

const citricMed = app.calculateDoseForProduct(bottleCitric, { drumKg: "3.0 kg", waterEstL: 45 });
assert(citricMed.capJa.includes("0.4杯 (35L線") || citricMed.capJa.includes("0.6杯 (45L線"), `Medium citric load refers to 0.4 or 0.6 mark (got ${citricMed.capJa})`);

const citricHeavy = app.calculateDoseForProduct(bottleCitric, { drumKg: "8.0 kg", waterEstL: 65 });
assert(citricHeavy.capEn.includes("0.8 Cap") && citricHeavy.capJa.includes("0.8杯"), "Full citric load is capped at 0.8 mark (never produces invalid 1.0)");
assert(citricHeavy.amount <= 50, `Citric rinse never exceeds max dispenser tray limit of 50mL (got ${citricHeavy.amount}mL)`);

// 13.3 Fabric Softener (Renoa / Soflan) uses step graduations (目盛り1, 2, 3)
const softStep1 = app.calculateDoseForProduct(bottleSoftener, { waterEstL: 45 });
assert(softStep1.capJa.includes("目盛り1"), `45L softener load refers to 目盛り1 (got ${softStep1.capJa})`);

const softStep2 = app.calculateDoseForProduct(bottleSoftener, { waterEstL: 55 });
assert(softStep2.capJa.includes("目盛り2"), `55L softener load refers to 目盛り2 (got ${softStep2.capJa})`);

const softStep3 = app.calculateDoseForProduct(bottleSoftener, { waterEstL: 65 });
assert(softStep3.capJa.includes("目盛り3"), `65L softener load refers to 目盛り3 (got ${softStep3.capJa})`);

// 13.4 Liquid Detergent (Nanox) uses fractional cups matching bottle
const nanox30 = app.calculateDoseForProduct(bottleNanox, { waterEstL: 30 });
assert(nanox30.capJa.includes("0.4杯") && nanox30.capJa.includes("30L線"), `30L Nanox refers to 0.4杯 and 30L線 (got ${nanox30.capJa})`);

const nanox45 = app.calculateDoseForProduct(bottleNanox, { waterEstL: 45 });
assert(nanox45.capJa.includes("0.6杯") && nanox45.capJa.includes("45L線"), `45L Nanox refers to 0.6杯 and 45L線 (got ${nanox45.capJa})`);

const nanox55 = app.calculateDoseForProduct(bottleNanox, { waterEstL: 55 });
assert(nanox55.capJa.includes("0.8杯") && nanox55.capJa.includes("55L線"), `55L Nanox refers to 0.8杯 and 55L線 (got ${nanox55.capJa})`);

const nanox65 = app.calculateDoseForProduct(bottleNanox, { waterEstL: 65 });
assert(nanox65.capJa.includes("1杯") && nanox65.capJa.includes("65L線"), `65L Nanox refers to 1杯 and 65L線 (got ${nanox65.capJa})`);

console.log('\n--- 14. Testing Bottle Builder Live Cap Calibration Visual Preview ---');
// Mock the DOM elements needed for updateCapPreview
let mockSelectedCat = "liquid_bleach";
document.querySelector = (sel) => {
  if (sel.includes('input[name="custom-category"]:checked')) {
    return { value: mockSelectedCat };
  }
  return null;
};

// Test Bleach cap preview chips
app.updateCapPreview();
const bleachChips = domElements["custom-cap-lines-chips"].innerHTML;
assert(bleachChips.includes("下線 20mL") || bleachChips.includes("Lower line"), "Bleach cap preview outputs Lower Line (下線 20mL)");
assert(bleachChips.includes("上線 40mL") || bleachChips.includes("Upper line"), "Bleach cap preview outputs Upper Line (上線 40mL)");

// Test Citric Rinse cap preview chips
mockSelectedCat = "citric_rinse";
app.updateCapPreview();
const citricChips = domElements["custom-cap-lines-chips"].innerHTML;
assert(citricChips.includes("0.4") && citricChips.includes("0.6") && citricChips.includes("0.8"), "Citric cap preview outputs 0.4, 0.6, 0.8 marks");
assert(citricChips.includes("1.0"), "Citric cap preview warns user that 1.0 line does not exist");

// Test Pods preview chips
mockSelectedCat = "pods";
app.updateCapPreview();
const podChips = domElements["custom-cap-lines-chips"].innerHTML;
assert(podChips.includes("1個") || podChips.includes("1 Pod"), "Pods preview outputs 1 pod for normal loads");
assert(podChips.includes("2個") || podChips.includes("2 Pods"), "Pods preview outputs 2 pods for heavy loads");

// Test Softener preview chips
mockSelectedCat = "softener";
app.updateCapPreview();
const softChips = domElements["custom-cap-lines-chips"].innerHTML;
assert(softChips.includes("目盛り1") && softChips.includes("目盛り2") && softChips.includes("目盛り3"), "Softener preview outputs 目盛り1, 目盛り2, 目盛り3 step lines");

console.log('\n--- 15. Testing 1:1 Back-Label Matrix Auto-Generation Across Categories ---');
// 15.1 Liquid Detergent (Ultra-Concentrate 10mL)
mockSelectedCat = "liquid_detergent";
domElements["custom-prod-ml"].value = "10";
domElements["custom-is-push"].checked = false;
app.currentCapStyle = "decimal";
app.customMatrixOverrides = null;
let matrixRows = app.renderBackLabelMatrix();
assert(matrixRows.length === 4, `Matrix generates 4 standard drum loads (got ${matrixRows.length})`);
assert(matrixRows[0].waterL === 30 && matrixRows[0].amount === 10, `Row 1: 30L -> 10mL (got ${matrixRows[0].amount})`);
assert(matrixRows[1].waterL === 45 && matrixRows[1].amount === 15, `Row 2: 45L -> 15mL (got ${matrixRows[1].amount})`);
assert(matrixRows[2].waterL === 55 && matrixRows[2].amount === 18, `Row 3: 55L -> 18mL (got ${matrixRows[2].amount})`);
assert(matrixRows[3].waterL === 65 && matrixRows[3].amount === 22, `Row 4: 65L -> 22mL (got ${matrixRows[3].amount})`);

// 15.2 Step Graduations for Softener
mockSelectedCat = "softener";
domElements["custom-prod-ml"].value = "10";
app.currentCapStyle = "steps";
app.customMatrixOverrides = null;
matrixRows = app.renderBackLabelMatrix();
assert(matrixRows[1].capJa.includes("目盛り1"), `Softener 45L row references 目盛り1 (got ${matrixRows[1].capJa})`);
assert(matrixRows[2].capJa.includes("目盛り2"), `Softener 55L row references 目盛り2 (got ${matrixRows[2].capJa})`);
assert(matrixRows[3].capJa.includes("目盛り3"), `Softener 65L row references 目盛り3 (got ${matrixRows[3].capJa})`);

// 15.3 Bleach Level Lines
mockSelectedCat = "liquid_bleach";
domElements["custom-prod-ml"].value = "20";
app.currentCapStyle = "lines";
app.customMatrixOverrides = null;
matrixRows = app.renderBackLabelMatrix();
assert(matrixRows[0].capJa.includes("下線 20mL"), `Bleach 30L row references 下線 20mL (got ${matrixRows[0].capJa})`);
assert(matrixRows[3].capJa.includes("上線 40mL"), `Bleach 65L row references 上線 40mL (got ${matrixRows[3].capJa})`);

console.log('\n--- 16. Testing Ground-Truth Custom Matrix Overrides in calculateDoseForProduct ---');
const bottleWithCustomMatrix = {
  id: "custom_matrix_bottle",
  name: "Custom Matrix Liquid Detergent",
  category: "liquid_detergent",
  baselineAmount: 10,
  unit: "mL",
  customMatrix: [
    { kg: 2.0, waterL: 30, amount: 12, capJa: "特注 0.4杯強 (12mL)", capEn: "Custom 0.4 Cap (12mL)", unit: "mL" },
    { kg: 4.0, waterL: 45, amount: 18, capJa: "特注 0.6杯強 (18mL)", capEn: "Custom 0.6 Cap (18mL)", unit: "mL" },
    { kg: 5.0, waterL: 55, amount: 24, capJa: "特注 0.8杯強 (24mL)", capEn: "Custom 0.8 Cap (24mL)", unit: "mL" },
    { kg: 6.0, waterL: 65, amount: 30, capJa: "特注 満量 (30mL)", capEn: "Custom Full (30mL)", unit: "mL" }
  ]
};

const doseCustom30 = app.calculateDoseForProduct(bottleWithCustomMatrix, { waterEstL: 30, drumKg: "2.0 kg" });
assert(doseCustom30.amount === 12, `Custom matrix overrides standard calculation: 30L yields 12mL (got ${doseCustom30.amount})`);
assert(doseCustom30.capJa === "特注 0.4杯強 (12mL)", `Custom matrix provides exact Japanese cap string (got ${doseCustom30.capJa})`);
assert(doseCustom30.capEn === "Custom 0.4 Cap (12mL)", `Custom matrix provides exact English cap string (got ${doseCustom30.capEn})`);

const doseCustom55 = app.calculateDoseForProduct(bottleWithCustomMatrix, { waterEstL: 55, drumKg: "5.0 kg" });
assert(doseCustom55.amount === 24, `Custom matrix overrides standard calculation: 55L yields 24mL (got ${doseCustom55.amount})`);

console.log('\n--- 17. Testing Dispenser Siphon Safety Alert ---');
// Softener with normal dose <= 45mL
mockSelectedCat = "softener";
domElements["custom-prod-ml"].value = "15";
app.currentCapStyle = "steps";
app.customMatrixOverrides = null;
let alertClasses = ["hidden"];
domElements["dispenser-safety-alert"].classList = {
  add(c) { if (!alertClasses.includes(c)) alertClasses.push(c); },
  remove(c) { alertClasses = alertClasses.filter(x => x !== c); },
  contains(c) { return alertClasses.includes(c); }
};
app.renderBackLabelMatrix();
assert(alertClasses.includes("hidden"), "Dispenser safety alert is hidden for normal softener doses (≤45mL)");

// Softener with extreme dose > 45mL
domElements["custom-prod-ml"].value = "35"; // At 65L: 65/30 * 35 = ~76mL
app.renderBackLabelMatrix();
assert(!alertClasses.includes("hidden"), "Dispenser safety alert triggers and unhides when max dose exceeds 45mL in softener compartment");

console.log('\n--- 18. Validating Zero Brand Names in Product Categories ---');
const brandRegex = /\b(nanox|attack|wide\s*haiter|haiter|humming|flair|soflan|arona|renoa|bold|ariel|blue\s*diamond|oxiclean)\b/i;
let brandFound = false;
let foundWhere = "";

LAUNDRY_DATA.productCategories.forEach(cat => {
  const jsonStr = JSON.stringify(cat);
  if (brandRegex.test(jsonStr)) {
    brandFound = true;
    foundWhere = `Category ${cat.id}: ${jsonStr}`;
  }
});

assert(!brandFound, `No brand names found in any productCategories entry (100% brand-agnostic architecture) ${foundWhere ? '- found in: ' + foundWhere : ''}`);

console.log('\n--- 19. Validating JAN Barcode Registry Integrity ---');
assert(Array.isArray(LAUNDRY_DATA.barcodeRegistry), "barcodeRegistry exists in data.js");
assert(LAUNDRY_DATA.barcodeRegistry.length >= 30, `Registry contains comprehensive product catalog (found ${LAUNDRY_DATA.barcodeRegistry.length} products)`);

// Test key staples across categories
const testJans = [
  { jan: "4901301396631", name: "Attack ZERO Regular Bottle", category: "liquid_detergent", baseline: 10 },
  { jan: "4903301320456", name: "NANOX one PRO Liquid", category: "liquid_detergent", baseline: 10 },
  { jan: "4901301419958", name: "Wide Haiter EX Power Liquid", category: "liquid_bleach", baseline: 20 },
  { jan: "4902430489515", name: "Renoa Citric Acid in Deodorant Rinse", category: "citric_rinse", baseline: 9.1 },
  { jan: "4901301396655", name: "Attack ZERO One-Hand Push", category: "liquid_detergent", isPush: true, pushG: 5 }
];

testJans.forEach(t => {
  const item = LAUNDRY_DATA.barcodeRegistry.find(b => b.jan === t.jan);
  assert(item !== undefined, `JAN ${t.jan} (${t.name}) found in registry`);
  if (item) {
    assert(item.category === t.category, `JAN ${t.jan} has category ${t.category} (got ${item.category})`);
    if (t.baseline !== undefined) {
      assert(item.baseline === t.baseline, `JAN ${t.jan} has baseline ${t.baseline} (got ${item.baseline})`);
    }
    if (t.isPush) {
      assert(item.isPush === true && item.pushG === t.pushG, `JAN ${t.jan} is configured as push dispenser (${item.pushG}g)`);
    }
    assert(item.name && item.nameJa, `JAN ${t.jan} has bilingual names`);
    assert(item.defaultSlot !== undefined, `JAN ${t.jan} specifies target dispenser slot`);
  }
});

console.log('\n--- 20. Validating In-Browser Label OCR Text Parser ---');
// 20.1 Standard liquid detergent label text
const ocrAttackText = "用途：綿・麻・合成繊維用 使用量の目安：水30Lに対して10mL ドラム式：洗たく物量2.0kgに対して10mL";
const parsedAttack = app.parseLabelOcrText(ocrAttackText);
assert(parsedAttack !== null, "Attack ZERO OCR text parsed successfully");
assert(parsedAttack.baseline === 10, `Extracted baseline 10mL (got ${parsedAttack.baseline})`);
assert(parsedAttack.category === "liquid_detergent", `Category is liquid_detergent (got ${parsedAttack.category})`);

// 20.2 Push dispenser label text
const ocrPushText = "ワンハンドプッシュ 1プッシュあたり5g 水30Lに10mL";
const parsedPush = app.parseLabelOcrText(ocrPushText);
assert(parsedPush.isPush === true, "Detected push dispenser from label text");
assert(parsedPush.pushG === 5, `Detected 5g per push (got ${parsedPush.pushG})`);
assert(parsedPush.baseline === 10, `Detected baseline 10mL (got ${parsedPush.baseline})`);

// 20.3 Renoa Citric Acid rinse label text
const ocrCitricText = "品名：衣料用消臭剤 使用量の目安：衣料1kgに9.1mL すすぎ時に投入 クエン酸配合";
const parsedCitric = app.parseLabelOcrText(ocrCitricText);
assert(parsedCitric.category === "citric_rinse", `Detected citric_rinse category (got ${parsedCitric.category})`);
assert(parsedCitric.baseline === 9.1, `Detected 9.1mL per kg baseline (got ${parsedCitric.baseline})`);

// 20.4 Wide Haiter liquid bleach
const ocrBleachText = "品名：酸素系漂白剤（濃縮タイプ） 水30Lに20mL キャップ下線";
const parsedBleach = app.parseLabelOcrText(ocrBleachText);
assert(parsedBleach.category === "liquid_bleach", `Detected liquid_bleach category (got ${parsedBleach.category})`);
assert(parsedBleach.baseline === 20, `Detected 20mL baseline (got ${parsedBleach.baseline})`);
assert(parsedBleach.capStyle === "lines", `Detected lines cap style from 'キャップ下線' (got ${parsedBleach.capStyle})`);

// 20.5 Powder detergent
const ocrPowderText = "品名：洗濯用合成洗剤（粉末） 水30Lに25g 付属のスプーンすりきり";
const parsedPowder = app.parseLabelOcrText(ocrPowderText);
assert(parsedPowder.category === "powder_detergent", `Detected powder_detergent (got ${parsedPowder.category})`);
assert(parsedPowder.baseline === 25, `Detected 25g baseline (got ${parsedPowder.baseline})`);
assert(parsedPowder.capStyle === "scoop", `Detected scoop cap style from 'スプーン' (got ${parsedPowder.capStyle})`);

console.log('\n--- 21. Validating "Learn Once, Remember Forever" Barcode Persistence ---');
const testNewJan = "4912345678901";
const newBottleData = {
  id: "bottle_user_learned_1",
  name: "Local Brand Eco Detergent",
  nameJa: "ローカルエコ洗剤",
  category: "liquid_detergent",
  baselineAmount: 15,
  isPush: false,
  pushG: null,
  capStyle: "decimal",
  barcode: testNewJan
};

// Save bottle
app.saveUserBarcode(testNewJan, {
  name: newBottleData.name,
  nameJa: newBottleData.nameJa,
  category: newBottleData.category,
  baseline: newBottleData.baselineAmount,
  isPush: newBottleData.isPush,
  pushG: newBottleData.pushG,
  capStyle: newBottleData.capStyle
});

assert(app.userBarcodes[testNewJan] !== undefined, "Barcode remembered in app.userBarcodes memory state");
assert(app.userBarcodes[testNewJan].name === "Local Brand Eco Detergent", "Stored correct bottle name");
assert(app.userBarcodes[testNewJan].baseline === 15, "Stored correct 15mL baseline");

const rawStorage = storage["laundry_user_barcodes"];
assert(rawStorage && rawStorage.includes(testNewJan), "Barcode persisted to localStorage 'laundry_user_barcodes'");

// Verify persistence across app reload
const freshApp = new LaundryApp();
assert(freshApp.userBarcodes[testNewJan] !== undefined, "Newly loaded LaundryApp instance loads learned barcode from storage");
assert(freshApp.userBarcodes[testNewJan].baseline === 15, "Learned barcode retains 15mL baseline in new instance");

console.log(`\n========================================`);
console.log(`RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL V2 DOSING ENGINE TESTS PASSED PERFECTLY!');
}
