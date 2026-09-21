const fs = require('fs');
const path = require('path');

console.log('=== RUNNING IN-DEPTH INTERACTIVE PANEL SUITE TEST ===\n');

// 1. Create a minimal DOM mock for app.js
const domElements = {};

function createElementMock(id = '', tag = 'div', classes = []) {
  const el = {
    id: id,
    tagName: tag.toUpperCase(),
    className: classes.join(' '),
    classList: {
      _classes: new Set(classes),
      add(...cls) { cls.forEach(c => this._classes.add(c)); el.className = [...this._classes].join(' '); },
      remove(...cls) { cls.forEach(c => this._classes.delete(c)); el.className = [...this._classes].join(' '); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        } else if (force) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
        el.className = [...this._classes].join(' ');
        return this._classes.has(c);
      },
      contains(c) { return this._classes.has(c); }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] || null; },
    removeAttribute(k) { delete this.attributes[k]; },
    textContent: '',
    innerHTML: '',
    value: '',
    placeholder: '',
    style: {},
    scrollLeft: 0,
    children: [],
    listeners: {},
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    },
    dispatchEvent(evt, data) {
      if (this.listeners[evt]) this.listeners[evt].forEach(fn => fn(data || {}));
    },
    scrollTo(opts) {
      if (typeof opts === 'object' && opts.left !== undefined) this.scrollLeft = opts.left;
    },
    appendChild(child) {
      if (!this.children) this.children = [];
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      if (this.children) {
        this.children = this.children.filter(c => c !== child);
      }
      return child;
    },
    querySelector(selector) {
      const all = this.querySelectorAll(selector);
      return all.length > 0 ? all[0] : null;
    },
    querySelectorAll(selector) {
      const matches = [];
      function recurse(node) {
        if (!node) return;
        if (selector.startsWith('.')) {
          const cls = selector.substring(1);
          if (node.classList && node.classList.contains(cls)) {
            matches.push(node);
          }
        } else if (selector.startsWith('#')) {
          if (node.id === selector.substring(1)) matches.push(node);
        }
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(recurse);
        }
      }
      recurse(this);
      return matches;
    }
  };

  let _innerHtml = '';
  Object.defineProperty(el, 'innerHTML', {
    get() { return _innerHtml; },
    set(val) {
      _innerHtml = val;
      el.children = [];
      const btnItemRegex = /<([a-z0-9]+)\s+([^>]*class="([^"]*panel-btn-item[^"]*)"[^>]*)>/gi;
      let match;
      while ((match = btnItemRegex.exec(val)) !== null) {
        const tag = match[1];
        const rawAttrs = match[2];
        const classNames = match[3].split(/\s+/).filter(Boolean);
        const child = createElementMock('', tag, classNames);
        const dataBtnMatch = /data-btn-id="([^"]+)"/i.exec(rawAttrs);
        if (dataBtnMatch) {
          child.setAttribute('data-btn-id', dataBtnMatch[1]);
        }
        const zoneMatch = /data-zone-card="([^"]+)"/i.exec(rawAttrs);
        if (zoneMatch) {
          child.setAttribute('data-zone-card', zoneMatch[1]);
        }
        el.children.push(child);
      }
      const zoneRegex = /<div\s+([^>]*class="([^"]*zone-card[^"]*)"[^>]*)>/gi;
      while ((match = zoneRegex.exec(val)) !== null) {
        const rawAttrs = match[1];
        const classNames = match[2].split(/\s+/).filter(Boolean);
        const child = createElementMock('', 'div', classNames);
        const zoneMatch = /data-zone-card="([^"]+)"/i.exec(rawAttrs);
        if (zoneMatch) {
          child.setAttribute('data-zone-card', zoneMatch[1]);
        }
        el.children.push(child);
      }
    }
  });

  return el;
}

// Extract all elements and initial classes from index.html
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const tagRegex = /<([a-z0-9]+)\s+([^>]*?)>/gi;
let tagMatch;
while ((tagMatch = tagRegex.exec(indexHtml)) !== null) {
  const tagName = tagMatch[1];
  const attrs = tagMatch[2];
  const idMatch = /id=["']([^"']+)["']/i.exec(attrs);
  if (idMatch) {
    const id = idMatch[1];
    const classMatch = /class=["']([^"']+)["']/i.exec(attrs);
    const classes = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
    domElements[id] = createElementMock(id, tagName, classes);
  }
}
const idAttrRegex = /id=["']([^"']+)["']/g;
let m;
while ((m = idAttrRegex.exec(indexHtml)) !== null) {
  if (!domElements[m[1]]) {
    domElements[m[1]] = createElementMock(m[1]);
  }
}

global.document = {
  documentElement: createElementMock('html', 'html'),
  head: createElementMock('head', 'head'),
  body: createElementMock('body', 'body'),
  addEventListener(evt, fn) {},
  createElement(tag) {
    return createElementMock('', tag);
  },
  getElementById(id) {
    if (!domElements[id]) {
      domElements[id] = createElementMock(id);
    }
    return domElements[id];
  },
  querySelector(selector) {
    if (selector && selector.includes('input[name="custom-category"]:checked')) {
      const checkedCat = global.__mockSelectedCategory || 'liquid_detergent';
      const mockRadio = createElementMock('', 'input');
      mockRadio.value = checkedCat;
      mockRadio.checked = true;
      return mockRadio;
    }
    if (selector && selector.startsWith('#')) {
      return this.getElementById(selector.substring(1));
    }
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  },
  querySelectorAll(selector) {
    const results = [];
    if (selector && selector.includes('input[name="custom-category"]')) {
      const checkedCat = global.__mockSelectedCategory || 'liquid_detergent';
      const mockRadio = createElementMock('', 'input');
      mockRadio.value = checkedCat;
      mockRadio.checked = true;
      return [mockRadio];
    }
    Object.values(domElements).forEach(el => {
      if (selector.startsWith('.')) {
        const cls = selector.substring(1);
        if (el.classList.contains(cls)) results.push(el);
      }
      if (el.children) {
        el.children.forEach(c => {
          if (selector.startsWith('.')) {
            const cls = selector.substring(1);
            if (c.classList && c.classList.contains(cls)) results.push(c);
          }
        });
      }
    });
    return results;
  }
};

global.window = {
  matchMedia: () => ({ matches: false })
};

const storage = {};
global.localStorage = {
  getItem: k => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: k => { delete storage[k]; }
};

global.LAUNDRY_DATA = require('./data.js');

const vm = require('vm');
const appSource = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
vm.runInThisContext(appSource);

const app = new LaundryApp();
console.log('✔ LaundryApp instantiated successfully.');

let testErrors = [];

// TEST 1: Collapsible Start Helper Accordion (3-Button Sequence)
console.log('\n--- Testing Collapsible Start Helper Accordion ---');
const btnToggleStart = domElements['btn-toggle-start-helper'];
const helperDrawer = domElements['start-helper-drawer'];
const helperCard = domElements['start-helper-card'];

if (!helperDrawer.classList.contains('hidden')) {
  testErrors.push('Start helper drawer should initially be hidden (collapsed)');
}
btnToggleStart.dispatchEvent('click');
if (helperDrawer.classList.contains('hidden')) {
  testErrors.push('Start helper drawer should be visible after toggle click');
}
if (!helperCard.classList.contains('expanded')) {
  testErrors.push('Start helper card should have expanded class');
}
if (btnToggleStart.getAttribute('aria-expanded') !== 'true') {
  testErrors.push('btnToggleStart aria-expanded should be true');
}
btnToggleStart.dispatchEvent('click');
if (!helperDrawer.classList.contains('hidden')) {
  testErrors.push('Start helper drawer should be hidden after second toggle');
}
if (btnToggleStart.getAttribute('aria-expanded') !== 'false') {
  testErrors.push('btnToggleStart aria-expanded should be false');
}
console.log('✔ Start helper accordion toggle verified.');

// TEST 2: Collapsible Dispenser Drawer Map & Auto-Expansion on Slot Highlight
console.log('\n--- Testing Collapsible Dispenser Drawer Map ---');
const btnToggleDrawer = domElements['btn-toggle-drawer'];
const drawerBody = domElements['drawer-collapsible-body'];

if (!drawerBody.classList.contains('hidden')) {
  testErrors.push('Drawer body should initially be hidden (collapsed)');
}
btnToggleDrawer.dispatchEvent('click');
if (drawerBody.classList.contains('hidden')) {
  testErrors.push('Drawer body should be visible after toggle click');
}
btnToggleDrawer.dispatchEvent('click');
if (!drawerBody.classList.contains('hidden')) {
  testErrors.push('Drawer body should be hidden after second toggle click');
}
app.highlightDrawerSlot('slot_main_liquid');
if (drawerBody.classList.contains('hidden')) {
  testErrors.push('Drawer body should auto-expand when a slot is highlighted');
}
console.log('✔ Dispenser drawer map collapsible and auto-expansion verified.');

// TEST 3: 3-Tab Switching & Route Handling
console.log('\n--- Testing 3-Tab Layout & Route Handling ---');
['dosage', 'panel', 'errors'].forEach(tab => {
  app.switchTab(tab);
  if (app.activeTab !== tab) {
    testErrors.push(`Failed to switch to activeTab: ${tab}`);
  }
  const viewDosage = domElements['tab-view-dosage'];
  const viewPanel = domElements['tab-view-panel'];
  const viewErrors = domElements['tab-view-errors'];

  if (tab === 'dosage' && viewDosage.classList.contains('hidden')) testErrors.push('dosage tab view should not be hidden');
  if (tab === 'panel' && viewPanel.classList.contains('hidden')) testErrors.push('panel tab view should not be hidden');
  if (tab === 'errors' && viewErrors.classList.contains('hidden')) testErrors.push('errors tab view should not be hidden');
});
app.switchTab('guided');
if (app.activeTab !== 'dosage') {
  testErrors.push(`Legacy 'guided' tab should redirect to 'dosage', got ${app.activeTab}`);
}
console.log('✔ 3-Tab switching and legacy route compatibility verified.');

// TEST 4: Hero Weighing Reading Quick-Buttons & Responsive Dosing
console.log('\n--- Testing Quick Weighing Reading Selection ---');
app.selectReading('0.6');
if (app.currentReading !== '0.6') {
  testErrors.push(`Expected currentReading to be 0.6, got ${app.currentReading}`);
}
app.selectReading('0.3');
if (app.currentReading !== '0.3') {
  testErrors.push(`Expected currentReading to be 0.3, got ${app.currentReading}`);
}
console.log('✔ Hero weighing reading quick-buttons verified.');

// TEST 5: Bottle Selection Modal & Routine Setup
console.log('\n--- Testing Bottle Selection Modal ---');
const modalBasket = domElements['modal-basket-setup'];
const btnOpenBasket = domElements['btn-open-basket-modal'];
const btnCloseBasket = domElements['btn-close-basket-modal'];
const btnSaveBasket = domElements['btn-save-basket-modal'];

btnOpenBasket.dispatchEvent('click');
if (modalBasket.classList.contains('hidden') || !modalBasket.classList.contains('active')) {
  testErrors.push('modal-basket-setup should be active when opened');
}
btnCloseBasket.dispatchEvent('click');
if (!modalBasket.classList.contains('hidden') || modalBasket.classList.contains('active')) {
  testErrors.push('modal-basket-setup should be hidden when closed');
}
btnOpenBasket.dispatchEvent('click');
btnSaveBasket.dispatchEvent('click');
if (!modalBasket.classList.contains('hidden')) {
  testErrors.push('modal-basket-setup should be hidden when saved');
}
console.log('✔ Bottle selection modal verified.');

// TEST 6: Test All 5 Machines and Button Inspections
console.log('\n--- Testing All 5 Machines & Button Inspections ---');
const machineIds = Object.keys(global.LAUNDRY_DATA.machines);

machineIds.forEach(mId => {
  app.selectMachine(mId);
  if (app.currentMachineId !== mId) {
    testErrors.push(`selectMachine failed for ${mId}`);
  }

  const pType = global.LAUNDRY_DATA.machines[mId].interactivePanel.panelType;
  console.log(`Testing machine: ${mId} (Chassis: ${pType})`);

  app.renderPanelMap();

  const buttonsToTest = ['btn_course', 'btn_start', 'btn_wash', 'btn_rinse', 'btn_spin', 'btn_dry'];
  if (pType === 'sharp_s7c') buttonsToTest.push('disp_screen_s7c', 'btn_adjust_arrows');
  if (pType === 'panasonic_lx') buttonsToTest.push('disp_screen_lx', 'btn_timer', 'btn_care');
  if (pType === 'panasonic_vx') buttonsToTest.push('disp_screen_vx', 'btn_mode_wash', 'btn_mode_wash_dry', 'btn_auto_care');
  if (pType === 'sharp_h10') buttonsToTest.push('disp_screen_h10', 'btn_unlock', 'btn_delicates_kiwame');

  buttonsToTest.forEach(btnId => {
    // Test in EN
    app.currentLang = 'en';
    app.inspectPanelButton(btnId);
    const inspectorCard = domElements['panel-inspector-card'];
    if (!inspectorCard.innerHTML || inspectorCard.innerHTML.length < 20) {
      testErrors.push(`Inspector card empty for machine ${mId}, button ${btnId} (EN)`);
    }
    if (!inspectorCard.innerHTML.includes('inspector-location-badge')) {
      testErrors.push(`Location badge missing in inspector for machine ${mId}, button ${btnId} (EN)`);
    }
    if (!inspectorCard.innerHTML.includes('📍')) {
      testErrors.push(`Location pin icon missing for machine ${mId}, button ${btnId} (EN)`);
    }

    // Test in JA
    app.currentLang = 'ja';
    app.inspectPanelButton(btnId);
    if (!inspectorCard.innerHTML.includes('inspector-location-badge')) {
      testErrors.push(`Location badge missing in inspector for machine ${mId}, button ${btnId} (JA)`);
    }
  });
});

console.log('✔ All 5 machines & button inspections verified.');

// TEST 7: Language Switch
console.log('\n--- Testing Language Toggle ---');
app.currentLang = 'en';
app.toggleLanguage();
if (app.currentLang !== 'ja') testErrors.push('toggleLanguage failed to toggle from en to ja');
app.toggleLanguage();
if (app.currentLang !== 'en') testErrors.push('toggleLanguage failed to toggle from ja to en');
console.log('✔ Language toggle verified.');

// TEST 8: Theme Switch
console.log('\n--- Testing Theme Toggle ---');
const prevTheme = app.currentTheme;
app.toggleTheme();
if (app.currentTheme === prevTheme) testErrors.push('toggleTheme failed to change theme');
app.toggleTheme();
if (app.currentTheme !== prevTheme) testErrors.push('toggleTheme failed to revert theme');
console.log('✔ Theme toggle verified.');

// TEST 9: Machine Selection & Floor Synchronization
console.log('\n--- Testing Machine Switching & Floor Synchronization ---');
app.selectMachine('sharp_es_h10c');
if (app.currentMachineId !== 'sharp_es_h10c') testErrors.push('selectMachine failed for sharp_es_h10c');
if (app.currentFloor !== 3) testErrors.push(`Expected floor 3 for sharp_es_h10c, got ${app.currentFloor}`);
app.selectMachine('panasonic_na_lx113b');
if (app.currentMachineId !== 'panasonic_na_lx113b') testErrors.push('selectMachine failed for panasonic_na_lx113b');
if (app.currentFloor !== 2) testErrors.push(`Expected floor 2 for panasonic_na_lx113b, got ${app.currentFloor}`);

// Test progressive floor selection
app.selectFloor(4);
if (app.currentFloor !== 4) testErrors.push(`Expected floor 4 after selectFloor(4), got ${app.currentFloor}`);
if (app.currentMachineId !== 'sharp_es_h10b') testErrors.push(`Expected machine sharp_es_h10b on floor 4, got ${app.currentMachineId}`);

// Verify HTML rendering of floor row and machine pill list
const floorRowEl = domElements['floor-selector-row'];
const machineListEl = domElements['machine-pill-list'];
if (!floorRowEl || !floorRowEl.innerHTML.includes('data-floor="4"')) {
  testErrors.push('floor-selector-row does not render floor pills');
}
if (!machineListEl || !machineListEl.innerHTML.includes('data-id="sharp_es_h10b"')) {
  testErrors.push('machine-pill-list does not render active floor machines');
}
console.log('✔ Machine switching & floor synchronization verified.');

// TEST 10: Zero-State Hero Arsenal & Bottle Builder Workflow (CRUD)
console.log('\n--- Testing Zero-State Hero Arsenal & Bottle Builder Workflow ---');
// 10.1 Zero state check when no bottles are configured
app.userBottles = [];
app.updateDosageView();
const zeroBox = domElements['zero-state-arsenal'];
const recipeList = domElements['product-cards-list'];
if (zeroBox && zeroBox.classList.contains('hidden')) {
  testErrors.push('Hero zero-state box should be visible when no detergent exists');
}

// 10.2 Open Bottle Builder Modal
const modalBuilder = domElements['modal-custom-bottle'];
app.openBottleBuilder();
if (modalBuilder && !modalBuilder.classList.contains('active')) {
  testErrors.push('modal-custom-bottle should be active when builder is opened');
}

// 10.3 Test 2-Step Physical Form Drilldown & Subcategory Rendering
app.selectPhysicalForm("liquid", "liquid_detergent");
const catChips = domElements['category-chips-container'];
if (!catChips.innerHTML.includes('品名: 洗濯用洗剤') || !catChips.innerHTML.includes('品名: 柔軟仕上げ剤')) {
  testErrors.push('Liquid subcategories should render with regulatory kanji tags');
}

app.selectPhysicalForm("powder", "powder_detergent");
if (!catChips.innerHTML.includes('品名: 洗濯用合成洗剤') || !catChips.innerHTML.includes('品名: 酸素系漂白剤')) {
  testErrors.push('Powder subcategories should render with regulatory kanji tags');
}

app.selectPhysicalForm("pods");
const stepCatSec = domElements['form-step-category'];
if (stepCatSec && !stepCatSec.classList.contains('hidden')) {
  testErrors.push('Subcategory section should be hidden for pods');
}

// 10.4 Test Zero-Typing Smart Auto-Naming
const smartNameLiquid10 = app.getSmartBottleName("liquid_detergent", 10, false, 5);
if (!smartNameLiquid10.includes("10mL")) testErrors.push(`Expected 10mL in smart name, got: ${smartNameLiquid10}`);

const smartNamePush5g = app.getSmartBottleName("liquid_detergent", 10, true, 5);
if (!smartNamePush5g.includes("5g/push") && !smartNamePush5g.includes("5g")) testErrors.push(`Expected 5g in push smart name, got: ${smartNamePush5g}`);

const smartNamePods = app.getSmartBottleName("pods", 1, false, null);
if (!smartNamePods.includes("Pods") && !smartNamePods.includes("ジェルボール")) testErrors.push(`Expected Pods in smart name, got: ${smartNamePods}`);

// 10.5 Save a new liquid detergent bottle
app.selectPhysicalForm("liquid", "liquid_detergent");
const nameInput = domElements['custom-prod-name'];
if (nameInput) nameInput.value = 'My Attack ZERO';
const mlInput = domElements['custom-prod-ml'];
if (mlInput) mlInput.value = '10';
const pushChk = domElements['custom-is-push'];
if (pushChk) pushChk.checked = true;
const pushGInput = domElements['custom-push-g'];
if (pushGInput) pushGInput.value = '5';

app.saveBottleFromBuilder();
const created = app.userBottles.find(b => b.name === 'My Attack ZERO');
if (!created) {
  testErrors.push('Failed to create and save bottle via builder');
} else {
  if (created.baselineAmount !== 10) testErrors.push(`Expected baseline 10, got ${created.baselineAmount}`);
  if (created.isPush !== true) testErrors.push('Expected isPush to be true');
  if (created.pushG !== 5) testErrors.push(`Expected pushG 5, got ${created.pushG}`);
}

// 10.4 Verify Zero-State is now hidden and recipe cards render
app.updateDosageView();
if (zeroBox && !zeroBox.classList.contains('hidden')) {
  testErrors.push('Zero-state box should be hidden once an active detergent is configured');
}
if (recipeList && !recipeList.innerHTML.includes('My Attack ZERO')) {
  testErrors.push('Recipe list should display newly added bottle card');
}

// 10.5 Edit existing bottle
if (created) {
  app.openBottleBuilder(created);
  const editIdInput = domElements['custom-edit-bottle-id'];
  if (editIdInput && editIdInput.value !== created.id) {
    testErrors.push('Builder should populate custom-edit-bottle-id when editing');
  }
  nameInput.value = 'My Attack ZERO Renamed';
  app.saveBottleFromBuilder();
  const updated = app.getBottleById(created.id);
  if (!updated || updated.name !== 'My Attack ZERO Renamed') {
    testErrors.push('Bottle was not updated after edit');
  }
}

// 10.6 Delete bottle
if (created) {
  const prevCount = app.userBottles.length;
  app.deleteBottle(created.id);
  if (app.userBottles.length !== prevCount - 1) {
    testErrors.push('deleteBottle failed to remove bottle');
  }
}
console.log('✔ Zero-State Arsenal & Bottle Builder workflow verified.');

// TEST 11: Pre-Drum Box with Direct-Drum Items (Pods / Scent Beads)
console.log('\n--- Testing Pre-Drum Box with Direct-Drum User Bottles ---');
app.userBottles = [
  {
    id: 'test_pod_direct',
    category: 'pods',
    name: 'Ariel Gelball Pods',
    defaultSlot: 'drum_direct',
    formulaType: 'unit_count',
    isActive: true
  }
];
app.updatePreDrumBox();
const preBoxEl = domElements['pre-drum-box'];
if (preBoxEl && preBoxEl.style.display === 'none') {
  testErrors.push('Pre-drum box should be visible when active drum_direct items exist');
}
const preTextEl = domElements['pre-drum-text'];
const preEstEl = domElements['pre-drum-estimate'];
const hasBottleName = (preTextEl && preTextEl.innerHTML.includes('Ariel Gelball Pods')) ||
                      (preEstEl && preEstEl.textContent.includes('Ariel Gelball Pods'));
if (!hasBottleName) {
  testErrors.push('Pre-drum box should display active direct-drum bottle name');
}
console.log('✔ Pre-drum box direct-drum bottle routing verified.');

// TEST 12: Strict Storage Access / Safari Private Browsing Resilience
console.log('\n--- Testing Safari Private Browsing / Blocked Storage Resilience ---');
const brokenStorage = {
  getItem() { throw new Error('SecurityError: The operation is insecure.'); },
  setItem() { throw new Error('SecurityError: The operation is insecure.'); },
  removeItem() { throw new Error('SecurityError: The operation is insecure.'); }
};
const originalStorage = global.localStorage;
global.localStorage = brokenStorage;
try {
  const safeApp = new LaundryApp();
  safeApp.setViewDensity('detailed');
  safeApp.toggleTheme();
  safeApp.toggleLanguage();
  console.log('✔ App instantiated and operated under completely blocked localStorage without throwing.');
} catch (err) {
  testErrors.push(`App threw under blocked localStorage: ${err.message}`);
} finally {
  global.localStorage = originalStorage;
}

// TEST 13: Dynamic Dispenser Drawer SVG & Empty Slot State Verification
console.log('\n--- Testing Dynamic Dispenser Drawer SVG & Empty Slot States ---');
app.currentLang = 'en';
// 1. Setup user bottles with custom names
app.userBottles = [
  { id: 'b_det', name: 'Custom Eco Detergent', category: 'liquid_detergent', defaultSlot: 'liquid_detergent', isActive: true },
  { id: 'b_bleach', name: 'Oxygen Color Bleach', category: 'liquid_bleach', defaultSlot: 'bleach', isActive: true },
  { id: 'b_soft', name: 'Lavender Mist Softener', category: 'softener', defaultSlot: 'softener', isActive: true }
];

// Verify Panasonic LX Drawer SVG
const lxSvg = app.generatePanasonicLXDrawerSvg();
if (!lxSvg.includes('Custom Eco Detergent')) {
  testErrors.push('Panasonic LX drawer should include active liquid detergent name');
}
if (!lxSvg.includes('Oxygen Color Bleach')) {
  testErrors.push('Panasonic LX drawer should include active liquid bleach name');
}
if (!lxSvg.includes('Lavender Mist Softener')) {
  testErrors.push('Panasonic LX drawer should include active softener name');
}
if (!lxSvg.includes('slot-active')) {
  testErrors.push('Panasonic LX drawer should mark active slots with slot-active class');
}
if (!lxSvg.includes('slot-unused')) {
  testErrors.push('Panasonic LX drawer should mark powder hopper with slot-unused class when no powder is active');
}
if (!lxSvg.includes('(Not used today • Leave dry and empty)')) {
  testErrors.push('Panasonic LX drawer should indicate powder hopper is unused today in English');
}

// Check Japanese translation in LX drawer
app.currentLang = 'ja';
const lxSvgJa = app.generatePanasonicLXDrawerSvg();
if (!lxSvgJa.includes('今日は未使用')) {
  testErrors.push('Panasonic LX drawer should indicate unused state in Japanese');
}
app.currentLang = 'en';

// 2. Toggle softener inactive
const softBottle = app.userBottles.find(b => b.id === 'b_soft');
softBottle.isActive = false;
const lxSvgNoSoft = app.generatePanasonicLXDrawerSvg();
if (lxSvgNoSoft.includes('Lavender Mist Softener')) {
  testErrors.push('Deactivated softener should not appear in active drawer slots');
}
if (!lxSvgNoSoft.includes('(Not used today)')) {
  testErrors.push('Deactivated softener slot should display (Not used today)');
}

// 3. Test Sharp H10 dedicated liquid bleach tray
app.currentMachineId = 'sharp_es_h10c';
const h10Svg = app.generateSharpH10DrawerSvg();
if (!h10Svg.includes('Oxygen Color Bleach')) {
  testErrors.push('Sharp H10 drawer should display bleach bottle in dedicated bleach slot');
}
if (!h10Svg.includes('Custom Eco Detergent')) {
  testErrors.push('Sharp H10 center slot should display active liquid detergent');
}

// 4. Test Powder Detergent routing
app.userBottles = [
  { id: 'b_powder', name: 'Alkaline Power Clean', category: 'powder_detergent', defaultSlot: 'powder_detergent', isActive: true }
];
const s7cSvg = app.generateSharpS7CDrawerSvg();
if (!s7cSvg.includes('Alkaline Power Clean')) {
  testErrors.push('Sharp S7C drawer should display powder detergent in rear-right slot');
}
if (!s7cSvg.includes('(Leave empty for powder)')) {
  testErrors.push('Sharp S7C liquid slot should indicate leave empty when using powder');
}

// 5. Zero-State (Empty Arsenal) - no active bottles
app.userBottles = [];
const emptyLxSvg = app.generatePanasonicLXDrawerSvg();
if (!emptyLxSvg.includes('(Not used today)')) {
  testErrors.push('Panasonic LX drawer with 0 bottles should mark slots as not used today');
}
if (emptyLxSvg.includes('Lion Super NANOX') || emptyLxSvg.includes('Wide Haiter') || emptyLxSvg.includes('Lenor Softener')) {
  testErrors.push('Residual brand names found in empty Panasonic LX drawer');
}

const emptyH10Svg = app.generateSharpH10DrawerSvg();
if (emptyH10Svg.includes('Lion NANOX') || emptyH10Svg.includes('Wide Haiter')) {
  testErrors.push('Residual brand names found in empty Sharp H10 drawer');
}

// 6. XML Special Characters Safety Test
app.userBottles = [
  { id: 'b_xml', name: 'Fresh & Clean <Ultra>', category: 'liquid_detergent', defaultSlot: 'liquid_detergent', isActive: true }
];
const xmlSvg = app.generatePanasonicLXDrawerSvg();
if (!xmlSvg.includes('Fresh &amp; Clean &lt;Ultra&gt;')) {
  testErrors.push('Bottle names with XML special characters must be properly escaped in SVG');
}
if (xmlSvg.includes('<Ultra>')) {
  testErrors.push('Unescaped angle brackets found in drawer SVG');
}

console.log('✔ Dynamic Dispenser Drawer SVG & empty slot states verified.');

if (testErrors.length > 0) {
  console.error('\n❌ IN-DEPTH INTERACTIVE PANEL TESTS FAILED:');
  testErrors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('\n✅ ALL 13 IN-DEPTH TEST SUITES PASSED FLAWLESSLY WITH ZERO REGRESSIONS!');
}
