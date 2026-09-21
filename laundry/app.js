// Laundry Care Japan - Core Application Logic

function safeStorageGet(key, defaultVal) {
  try {
    if (typeof localStorage !== "undefined") {
      const val = localStorage.getItem(key);
      return val !== null ? val : defaultVal;
    }
  } catch (e) {}
  return defaultVal;
}

function safeStorageSet(key, val) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, String(val));
    }
  } catch (e) {}
}

class LaundryApp {
  constructor() {
    this.data = LAUNDRY_DATA;
    this.currentFloor = 2;
    this.currentMachineId = "panasonic_na_lx113b";
    this.currentGoalId = "balcony_dry";
    this.currentReading = "0.6";
    this.activeTab = "dosage";
    this.activeDrawerSlot = null;
    this.searchQuery = "";
    this.dictSearchQuery = "";
    this.currentPanelLayoutMode = "smart"; // "smart" | "realistic" | "zones" | "finder"
    this.panelScaleFit = true; // true = auto-fit screen width, false = 100% actual scale
    this.activeZoneFilter = "all"; // "all" | "left" | "center" | "right"
    this.finderSearchQuery = "";
    this.selectedPanelButtonId = "btn_course";

    // Theme, Language & Density Settings with safe storage fallback
    this.currentLang = safeStorageGet("laundry_lang", "en");
    const systemPrefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.currentTheme = safeStorageGet("laundry_theme", systemPrefersDark ? "dark" : "light");
    this.viewDensity = safeStorageGet("laundry_density", "concise");

    // User bottle arsenal & builder state
    this.userBottles = [];
    this.userBarcodes = {};
    this.currentCapStyle = null;
    this.customMatrixOverrides = null;
    this.loadUserBottles();
    this.loadUserBarcodes();

    // Scanner state
    this.scannerStream = null;
    this.scannerTrack = null;
    this.scannerMode = "barcode"; // "barcode" | "ocr"
    this.scannerFacingMode = "environment";
    this.isTorchOn = false;
    this.barcodeDetector = null;
    this.isScanning = false;
    this.detectedBottleData = null;
    this.wasBasketModalOpen = false;
    this.pendingBarcode = null;
    this.isBarcodeDetectingPaused = false;

    this.init();
  }

  loadUserBarcodes() {
    try {
      const saved = safeStorageGet("laundry_user_barcodes", null);
      if (saved) {
        this.userBarcodes = JSON.parse(saved);
        if (typeof this.userBarcodes !== "object" || this.userBarcodes === null) this.userBarcodes = {};
      } else {
        this.userBarcodes = {};
      }
    } catch (e) {
      this.userBarcodes = {};
    }
  }

  saveUserBarcode(jan, bottleData) {
    if (!jan) return;
    this.userBarcodes[jan] = bottleData;
    safeStorageSet("laundry_user_barcodes", JSON.stringify(this.userBarcodes));
  }

  loadUserBottles() {
    try {
      const saved = safeStorageGet("laundry_user_bottles", null);
      if (saved) {
        this.userBottles = JSON.parse(saved);
        if (!Array.isArray(this.userBottles)) this.userBottles = [];
        return;
      }
      // Migration from legacy custom products if any existed
      const legacyCustom = safeStorageGet("laundry_custom_products", null);
      if (legacyCustom) {
        const parsed = JSON.parse(legacyCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.userBottles = parsed.map(p => ({
            id: p.id,
            name: p.name,
            nameJa: p.nameJa || p.name,
            category: p.category === "detergent" ? (p.isPowder ? "powder_detergent" : "liquid_detergent") : (p.category === "bleach" ? (p.isPowder ? "powder_bleach" : "liquid_bleach") : (p.category || "liquid_detergent")),
            formulaType: p.formulaType || (p.isPowder ? "powder_per_30l" : (p.isPush ? "liquid_push" : "liquid_per_30l")),
            unit: p.isPowder ? "g" : "mL",
            unitJa: p.isPowder ? "g" : "mL",
            baselineAmount: p.mlPer30L || p.gPer30L || 10,
            standardDoseText: p.standardDoseText || "10 mL / 30L",
            standardDoseTextJa: p.standardDoseTextJa || p.standardDoseText || "水30Lに対し10mL",
            defaultSlot: p.defaultSlot || (p.isPowder ? "powder_detergent" : "liquid_detergent"),
            slotNameEn: p.isPowder ? "Powder Hopper / Drum Direct" : "Main Liquid Detergent Tray",
            slotNameJa: p.isPowder ? "粉末洗剤入れ / 洗濯槽" : "液体洗剤投入口",
            icon: p.icon || "🧴",
            isPush: Boolean(p.isPush),
            pushG: p.pushG || (p.isPush ? 5 : null),
            isActive: true,
            instructionsEn: p.instructionsEn || "",
            instructionsJa: p.instructionsJa || ""
          }));
          this.saveUserBottles();
          return;
        }
      }
      this.userBottles = [];
    } catch (e) {
      this.userBottles = [];
    }
  }

  saveUserBottles() {
    try {
      safeStorageSet("laundry_user_bottles", JSON.stringify(this.userBottles));
    } catch (e) {
      console.warn("Could not save user bottles", e);
    }
  }

  getBottleById(id) {
    return this.userBottles.find(b => b.id === id) || null;
  }

  getProductById(id) {
    return this.getBottleById(id);
  }

  init() {
    this.applyTheme();
    this.applyViewDensity();
    this.applyLanguage();
    this.renderMachinePills();
    this.renderUserArsenal();
    this.bindEvents();
    this.updateMachineView();
    this.updateGoalView();
    this.updatePreDrumBox();
    this.updateDosageView();
    this.renderDrawerSvg();
    this.renderPanelMap();
    this.renderPanelDictionary();
    this.renderErrorList();

    // Register Service Worker for offline PWA capability
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(err => {
          console.warn("ServiceWorker registration failed:", err);
        });
      });
    }

    const initialTab = (typeof window !== "undefined" && window.location && window.location.hash)
      ? window.location.hash.replace("#", "")
      : "";
    if (["dosage", "guided", "panel", "errors"].includes(initialTab)) {
      this.switchTab(initialTab);
    }
  }

  setViewDensity(density) {
    this.viewDensity = density;
    safeStorageSet("laundry_density", density);
    this.applyViewDensity();
  }

  applyViewDensity() {
    const isConcise = this.viewDensity === "concise";
    if (typeof document !== "undefined" && document.body && document.body.classList) {
      document.body.classList.toggle("density-concise", isConcise);
      document.body.classList.toggle("density-detailed", !isConcise);
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    safeStorageSet("laundry_theme", this.currentTheme);
    this.applyTheme(true);
  }

  applyTheme(isInteractive = false) {
    const docEl = (typeof document !== "undefined") ? document.documentElement : null;
    if (isInteractive && docEl && docEl.classList) {
      docEl.classList.add("no-transitions");

      docEl.setAttribute("data-theme", this.currentTheme);
      const icon = document.getElementById("theme-toggle-icon");
      if (icon) {
        icon.textContent = this.currentTheme === "dark" ? "☀️" : "🌙";
      }

      if (typeof window !== "undefined" && typeof window.getComputedStyle === "function" && document.body) {
        window.getComputedStyle(document.body).opacity;
      }

      const removeClass = () => {
        if (docEl && docEl.classList) {
          docEl.classList.remove("no-transitions");
        }
      };

      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => requestAnimationFrame(removeClass));
      } else {
        setTimeout(removeClass, 50);
      }
      return;
    }

    if (docEl) {
      docEl.setAttribute("data-theme", this.currentTheme);
    }
    const icon = typeof document !== "undefined" ? document.getElementById("theme-toggle-icon") : null;
    if (icon) {
      icon.textContent = this.currentTheme === "dark" ? "☀️" : "🌙";
    }
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === "ja" ? "en" : "ja";
    safeStorageSet("laundry_lang", this.currentLang);
    this.applyLanguage();
    this.renderMachinePills();
    this.renderUserArsenal();
    this.updateMachineView();
    this.updateGoalView();
    this.updatePreDrumBox();
    this.updateDosageView();
    this.renderDrawerSvg();
    this.renderPanelMap();
    this.renderPanelDictionary();
    this.renderErrorList();
  }

  applyLanguage() {
    const isJa = this.currentLang === "ja";
    document.documentElement.lang = this.currentLang;

    // Header Title & Buttons
    const appTitle = document.getElementById("header-app-title");
    if (appTitle) appTitle.textContent = isJa ? "洗濯ガイド 日本" : "Laundry Care Japan";

    const langText = document.getElementById("lang-toggle-text");
    if (langText) langText.textContent = isJa ? "🌐 English" : "🌐 日本語";

    // Machine selector labels (2-Step Progressive)
    const selFloor = document.getElementById("lbl-select-floor");
    if (selFloor) selFloor.textContent = isJa ? "1. フロアを選択" : "1. Select Floor";

    const selMach = document.getElementById("lbl-select-machine");
    if (selMach) selMach.textContent = isJa ? "2. 洗濯機を選択" : "2. Select Washer";

    // Tab 1 Header
    const tabDosageTitle = document.getElementById("tab-dosage-title");
    if (tabDosageTitle) tabDosageTitle.textContent = isJa ? "洗剤の計量・投入ガイド" : "Detergent Dosing & Pouring Guide";

    const tabDosageDesc = document.getElementById("tab-dosage-desc");
    if (tabDosageDesc) tabDosageDesc.textContent = isJa ? "洗濯機画面の表示数字をタップして、キャップ計量を確認してください。" : "Tap your machine display number below for instant cap measurements.";

    // Collapsible Start Helper (Progressive Disclosure)
    const lblStartTitle = document.getElementById("lbl-start-helper-title");
    if (lblStartTitle) lblStartTitle.textContent = isJa ? "洗濯の始め方・3ステップ手順（必要な方のみ）" : "Need help starting? (3 Button Sequence)";

    const lblStartBadge = document.getElementById("lbl-start-helper-badge");
    if (lblStartBadge) {
      const helperDrawer = document.getElementById("start-helper-drawer");
      const isExpanded = helperDrawer && !helperDrawer.classList.contains("hidden");
      lblStartBadge.textContent = isExpanded ? (isJa ? "閉じる ▴" : "Hide Steps ▴") : (isJa ? "手順を表示 ▾" : "Show Steps ▾");
    }

    const goalsTitle = document.getElementById("goals-title");
    if (goalsTitle) goalsTitle.textContent = isJa ? "何を洗いますか？" : "What are you washing?";

    const stepsTitle = document.getElementById("steps-box-title");
    if (stepsTitle) stepsTitle.textContent = isJa ? "この順にボタンを押してください：" : "Press these buttons in order:";

    const preDrumEst = document.getElementById("pre-drum-estimate");
    if (preDrumEst) {
      preDrumEst.textContent = isJa
        ? "💡 香り付けビーズやジェルボール洗剤を使用する場合は、衣類を入れる前に洗濯槽の底へ直接投入してください。"
        : "💡 If using scent beads or gel ball pods, toss them directly into the bottom of the drum BEFORE adding clothes.";
    }

    // Step 1 Hero: Display Reading
    const weighTitle = document.getElementById("weighing-box-title");
    if (weighTitle) weighTitle.textContent = isJa ? "画面の表示数字は何ですか？" : "What number is on the screen?";

    const weighDesc = document.getElementById("weighing-box-desc");
    if (weighDesc) weighDesc.textContent = isJa ? "スタートを押すと洗濯槽が空回りして重さを量ります。画面に表示された数字を選択してください：" : "After pressing Start, the drum rotates dry to weigh clothes, then displays a cup fraction. Tap your number:";

    const capLabel = document.getElementById("instant-cap-label");
    if (capLabel) capLabel.textContent = isJa ? "⚡ キャップ目安自動計算" : "⚡ Instant Cap Calc";

    const pourTip = document.getElementById("pour-tip-text");
    if (pourTip) {
      pourTip.textContent = isJa ? "⚡ 給水開始前に速やかに投入してください" : "⚡ Pour before water starts filling";
    }

    // Step 2: Exact Pouring Amounts
    const doseTitle = document.getElementById("dosage-results-title");
    if (doseTitle) doseTitle.textContent = isJa ? "洗剤の投入量" : "Pour This";

    const lblOpenBasket = document.getElementById("lbl-btn-open-basket");
    if (lblOpenBasket) lblOpenBasket.textContent = isJa ? "持ってきた洗剤・ボトル管理" : "My Bottles / Manage Arsenal";

    // Zero State Card
    const zTitle = document.getElementById("lbl-zero-title");
    if (zTitle) zTitle.textContent = isJa ? "ようこそ！お使いの洗剤を登録しましょう" : "Welcome! Add your laundry bottle to get started";

    const zDesc = document.getElementById("lbl-zero-desc");
    if (zDesc) zDesc.textContent = isJa ? "日本の洗剤ボトルの裏面には「水30Lに対して○○mL」という基準が書かれています。15秒で一度登録すれば、毎回の洗濯で杯数やmLが瞬時に分かります！" : "Every Japanese detergent bottle has a simple standard ratio on the back (e.g. 10 mL or 25 mL per 30L). Add your bottle once in 15 seconds, and get instant exact measurements for every wash!";

    const zBtn = document.getElementById("lbl-zero-btn");
    if (zBtn) zBtn.textContent = isJa ? "洗剤を登録する (15秒)" : "Add Your Detergent (15s)";

    // Step 3: Collapsible Drawer Map
    const drawerTitle = document.getElementById("drawer-box-title");
    if (drawerTitle) drawerTitle.textContent = isJa ? "洗剤ケース投入口マップ" : "Dispenser Drawer Map";

    const lblToggleDrawer = document.getElementById("lbl-toggle-drawer");
    if (lblToggleDrawer) {
      const drawerBody = document.getElementById("drawer-collapsible-body");
      const isExpanded = drawerBody && !drawerBody.classList.contains("hidden");
      lblToggleDrawer.textContent = isExpanded ? (isJa ? "閉じる ▴" : "Hide Map ▴") : (isJa ? "投入口マップを表示 ▾" : "Tap to View Compartments ▾");
    }

    const legDet = document.getElementById("leg-detergent");
    if (legDet) legDet.textContent = isJa ? "液体洗剤" : "Liquid Detergent";

    const legSoft = document.getElementById("leg-softener");
    if (legSoft) legSoft.textContent = isJa ? "柔軟剤 / クエン酸" : "Softener / Citric Acid";

    const legBleach = document.getElementById("leg-bleach");
    if (legBleach) legBleach.textContent = isJa ? "液体漂白剤" : "Liquid Bleach";

    const legPowder = document.getElementById("leg-powder");
    if (legPowder) legPowder.textContent = isJa ? "粉末洗剤" : "Powder Detergent";

    // Tab 2: Interactive Panel Map & Glossary
    const tabPanelTitle = document.getElementById("tab-panel-title");
    if (tabPanelTitle) tabPanelTitle.textContent = isJa ? "操作パネル インタラクティブマップ" : "Interactive Control Panel Map";

    const tabPanelDesc = document.getElementById("tab-panel-desc");
    if (tabPanelDesc) tabPanelDesc.textContent = isJa ? "仮想パネルのボタンやランプをタップすると、日本語の意味と使い方が表示されます。" : "Tap any button or indicator on the virtual panel below to inspect its Japanese meaning and function.";

    const panelTouchHint = document.getElementById("panel-touch-hint");
    if (panelTouchHint) panelTouchHint.textContent = isJa ? "👉 ボタンをタップして解説を表示" : "👉 Tap buttons below to inspect";

    const dictSubheading = document.getElementById("tab-dict-subheading");
    if (dictSubheading) dictSubheading.textContent = isJa ? "洗濯室の一般日本語用語集" : "General Laundry Room Vocabulary";

    const dictDesc = document.getElementById("tab-dict-desc");
    if (dictDesc) dictDesc.textContent = isJa ? "洗濯機や操作パネルでよく見かける日本語用語のクイックリファレンス。" : "Quick reference glossary for Japanese terms across laundry machines.";

    const dictSearchInput = document.getElementById("dict-search-input");
    if (dictSearchInput) dictSearchInput.placeholder = isJa ? "単語や意味で検索（例: 洗い, すすぎ, 脱水, rinse）..." : "Search Japanese word or English meaning (e.g. 洗い, rinse, spin)...";

    // Tab 3: Error Codes
    const tabErrorsTitle = document.getElementById("tab-errors-title");
    if (tabErrorsTitle) tabErrorsTitle.textContent = isJa ? "エラー表示・トラブル解決" : "Error Code & Problem Solver";

    const tabErrorsDesc = document.getElementById("tab-errors-desc");
    if (tabErrorsDesc) tabErrorsDesc.textContent = isJa ? "表示されたエラー番号（U11、C04、E01など）や症状を入力して検索できます：" : "Type the error code on the screen (e.g. U11, C04, E01) or a symptom (drain, water, door):";

    const errorInputEl = document.getElementById("error-search-input");
    if (errorInputEl) {
      errorInputEl.placeholder = isJa ? "エラー番号や症状を入力（例: U11, C02, 排水, 給水, ドア）..." : "Search error code or symptom (e.g. U11, C02, drain, door)...";
    }

    // Modal: Laundry Arsenal
    const bTitle = document.getElementById("basket-card-title");
    if (bTitle) bTitle.textContent = isJa ? "持ってきた洗剤（マイ洗剤）" : "My Laundry Arsenal";

    const bSub = document.getElementById("basket-card-sub");
    if (bSub) bSub.textContent = isJa ? "今日の洗濯で使用する洗剤にチェックを入れてください：" : "Check the bottles you brought for today's wash:";

    const bCal = document.getElementById("lbl-btn-calibrate");
    if (bCal) bCal.textContent = isJa ? "新しいボトルを追加 (15秒)" : "Add New Bottle (15s)";

    const bSave = document.getElementById("btn-save-basket-modal");
    if (bSave) bSave.textContent = isJa ? "✓ 完了・保存" : "✓ Done & Save";

    // 15-Second Bottle Builder Modal
    const mCustTitle = document.getElementById("modal-custom-title");
    if (mCustTitle) mCustTitle.textContent = isJa ? "15秒ボトル登録" : "15-Second Bottle Setup";

    const mCustSub = document.getElementById("modal-custom-sub");
    if (mCustSub) mCustSub.textContent = isJa ? "裏面の数字を選ぶだけで瞬時に設定完了" : "Add any bottle or box using the numbers on the back";

    const gCardTitle = document.getElementById("guide-card-title");
    if (gCardTitle) gCardTitle.textContent = isJa ? "ボトルの裏ラベルの見方：" : "Where to look on the packaging:";

    const gCardHigh = document.getElementById("guide-card-highlight");
    if (gCardHigh) gCardHigh.innerHTML = isJa
      ? "「<strong>水30Lに対して ○○ mL</strong>」（または粉末「<strong>水30Lに対して ○○ g</strong>」）を確認"
      : "Find <strong>「水30Lに対して ○○ mL」</strong> or <strong>「水30Lに対して ○○ g」</strong>";

    const gCardSub = document.getElementById("guide-card-sub");
    if (gCardSub) gCardSub.textContent = isJa
      ? "ボトルの数字を直接入力または下のボタンから選択："
      : "Enter the exact amount from your bottle or box below:";

    const lblCustForm = document.getElementById("lbl-custom-form");
    if (lblCustForm) lblCustForm.textContent = isJa ? "1. 形状・タイプ（手に持っているもの）" : "1. Physical Form (What's in your hand?)";

    const lblFormLiq = document.getElementById("lbl-form-liquid");
    if (lblFormLiq) lblFormLiq.textContent = isJa ? "液体" : "Liquid";

    const lblFormPow = document.getElementById("lbl-form-powder");
    if (lblFormPow) lblFormPow.textContent = isJa ? "粉末" : "Powder";

    const lblFormPods = document.getElementById("lbl-form-pods");
    if (lblFormPods) lblFormPods.textContent = isJa ? "ジェルボール・スティック" : "Pod / Stick";

    const lblFormBeads = document.getElementById("lbl-form-beads");
    if (lblFormBeads) lblFormBeads.textContent = isJa ? "香り付けビーズ" : "Scent Beads";

    const lblCustCat = document.getElementById("lbl-custom-category");
    if (lblCustCat) lblCustCat.textContent = isJa ? "2. 製品の種類（ボトルの品名と照合）" : "2. Product Type (Match the Japanese bottle)";

    const lblCustName = document.getElementById("lbl-custom-name");
    if (lblCustName) lblCustName.textContent = isJa ? "3. ボトルの名前・ニックネーム" : "3. Product Name / Nickname";

    const lblNameOpt = document.getElementById("lbl-name-optional");
    if (lblNameOpt) lblNameOpt.textContent = isJa ? "任意（空欄なら自動設定）" : "Optional — auto-fills if empty";

    const lblCustBase = document.getElementById("lbl-custom-baseline");
    if (lblCustBase) lblCustBase.innerHTML = isJa ? "4. 基準使用量: <strong>水30Lに対する使用量</strong>" : "4. Standard Baseline: <strong>水30Lに対する使用量</strong>";

    const lblQuickHint = document.getElementById("lbl-quick-pills-hint");
    if (lblQuickHint) lblQuickHint.textContent = isJa ? "1タップ簡単入力:" : "1-Tap Quick Fill:";

    const lblCustTip = document.getElementById("lbl-custom-guide-tip");
    if (lblCustTip) {
      lblCustTip.textContent = isJa
        ? "💡 パッケージ裏面の「水30Lに対して...」をご確認ください。液体は通常10〜40mL、粉末は通常15〜25gです。"
        : "💡 Look for \"水30Lに対して...\" on back label. Liquid is typically 10–40 mL; Powder is typically 15–25 g.";
    }

    const lblCustUnit = document.getElementById("lbl-custom-unit");
    if (lblCustUnit) {
      lblCustUnit.textContent = isJa ? "mL / 水30Lあたり" : "mL per 30L Water (水30Lに対して)";
    }

    const lblPushTitle = document.getElementById("lbl-custom-push-title");
    if (lblPushTitle) lblPushTitle.textContent = isJa ? "🎯 プッシュボトル / ワンハンド（液体のみ）" : "🎯 Push Bottle / Pump Dispenser (ワンハンドプッシュ)";

    const lblPushDesc = document.getElementById("lbl-custom-push-desc");
    if (lblPushDesc) lblPushDesc.textContent = isJa
      ? "キャップ目盛りではなく正確なプッシュ回数で表示"
      : "Calculates exact push count instead of cap marks";

    const lblPushG = document.getElementById("lbl-custom-push-g");
    if (lblPushG) lblPushG.textContent = isJa ? "1プッシュあたりの量 (1プッシュの量):" : "Grams per single push (1プッシュの量):";

    const lblPreviewSlot = document.getElementById("lbl-preview-slot-label");
    if (lblPreviewSlot) lblPreviewSlot.textContent = isJa ? "投入場所:" : "Where to pour:";

    const btnCancelCust = document.getElementById("btn-cancel-custom-modal");
    if (btnCancelCust) btnCancelCust.textContent = isJa ? "キャンセル" : "Cancel";

    const btnSaveCust = document.getElementById("btn-save-custom-bottle");
    if (btnSaveCust) btnSaveCust.textContent = isJa ? "💾 ボトルを保存" : "💾 Save Bottle";

    const lblCapPreviewTitle = document.getElementById("lbl-cap-preview-title");
    if (lblCapPreviewTitle) {
      lblCapPreviewTitle.textContent = isJa ? "実物キャップ目盛り・計量ライン:" : "Physical Cap Calibration:";
    }

    const lblKanjiTitle = document.getElementById("lbl-kanji-hunter-title");
    if (lblKanjiTitle) lblKanjiTitle.textContent = isJa ? "裏面で探す日本語表記:" : "Back-Label Kanji to Look For:";

    const lblCapStyleTitle = document.getElementById("lbl-cap-style-title");
    if (lblCapStyleTitle) lblCapStyleTitle.textContent = isJa ? "キャップの目盛り形状:" : "Cap Physical Marking Style:";

    const lblMatrixTitle = document.getElementById("lbl-matrix-title");
    if (lblMatrixTitle) lblMatrixTitle.textContent = isJa ? "使用量の目安（裏面の表と一致）:" : "1:1 Back-Label Table Mirror (使用量の目安):";

    const lblMatrixTuneToggle = document.getElementById("lbl-matrix-tune-toggle");
    if (lblMatrixTuneToggle) {
      const tuneBody = document.getElementById("matrix-tune-body");
      const isExpanded = tuneBody && !tuneBody.classList.contains("hidden");
      lblMatrixTuneToggle.textContent = isExpanded ? (isJa ? "閉じる ▴" : "Close Table ▴") : (isJa ? "個別調整 ▾" : "Adjust Table ▾");
    }

    const lblMatrixTuneHint = document.getElementById("lbl-matrix-tune-hint");
    if (lblMatrixTuneHint) {
      lblMatrixTuneHint.textContent = isJa
        ? "💡 ボトルの裏面表と数値が異なる場合、各行を直接書き換えることができます。"
        : "💡 Tweak individual load rows if your bottle's printed table differs from standard ratios.";
    }

    const thLoad = document.getElementById("th-matrix-load");
    if (thLoad) thLoad.textContent = isJa ? "ドラム式 (衣類)" : "Drum Load";

    const thWater = document.getElementById("th-matrix-water");
    if (thWater) thWater.textContent = isJa ? "一般 (水量)" : "Water Level";

    const thCap = document.getElementById("th-matrix-cap");
    if (thCap) thCap.textContent = isJa ? "キャップ目安" : "Cap Mark";

    const thAmount = document.getElementById("th-matrix-amount");
    if (thAmount) thAmount.textContent = isJa ? "実量" : "Dose";

    const btnResetMatrix = document.getElementById("btn-reset-matrix");
    if (btnResetMatrix) btnResetMatrix.textContent = isJa ? "↺ 自動計算値にリセット" : "↺ Reset to Standard";

    const lblSafetyText = document.getElementById("lbl-dispenser-safety-text");
    if (lblSafetyText) {
      lblSafetyText.textContent = isJa
        ? "【注意】柔軟剤投入口で45mLを超える投入量は、すすぎ開始前に早期サイフォン流出する恐れがあります。"
        : "Warning: Doses exceeding 45 mL in the fabric softener tray will siphon prematurely before the rinse cycle!";
    }

    // Scanner Elements Translation
    const lblZeroScanBtn = document.getElementById("lbl-zero-scan-btn");
    if (lblZeroScanBtn) lblZeroScanBtn.textContent = isJa ? "📸 バーコード / ラベル読取" : "📸 Scan Barcode / Label";

    const lblZeroBtn = document.getElementById("lbl-zero-btn");
    if (lblZeroBtn) lblZeroBtn.textContent = isJa ? "手動で登録 (15秒)" : "Manual Entry (15s)";

    const lblFastTrackTitle = document.getElementById("lbl-fast-track-title");
    if (lblFastTrackTitle) lblFastTrackTitle.textContent = isJa ? "カメラで簡単自動入力" : "Instant Setup with Camera";

    const lblFastTrackSub = document.getElementById("lbl-fast-track-sub");
    if (lblFastTrackSub) lblFastTrackSub.textContent = isJa ? "バーコードや使用量表示をカメラでかざすだけ" : "Scan your bottle's barcode or label table";

    const lblBtnOpenScanner = document.getElementById("lbl-btn-open-scanner");
    if (lblBtnOpenScanner) lblBtnOpenScanner.textContent = isJa ? "読取開始" : "Scan Now";

    const lblScannerTitle = document.getElementById("lbl-scanner-title");
    if (lblScannerTitle) lblScannerTitle.textContent = isJa ? "洗剤スキャナー" : "Scan Bottle / Barcode";

    const lblScannerSub = document.getElementById("lbl-scanner-sub");
    if (lblScannerSub) lblScannerSub.textContent = isJa ? "枠内にバーコードまたは使用量表示を合わせてください" : "Align barcode or dosing table in the frame";

    const lblModeBarcode = document.getElementById("lbl-mode-barcode");
    if (lblModeBarcode) lblModeBarcode.textContent = isJa ? "バーコード（自動読取）" : "Barcode (Auto-Scan)";

    const lblModeOcr = document.getElementById("lbl-mode-ocr");
    if (lblModeOcr) lblModeOcr.textContent = isJa ? "使用量表（撮影解析）" : "Dosing Table OCR";

    const lblOcrGuide = document.getElementById("lbl-scanner-ocr-guide");
    if (lblOcrGuide) {
      lblOcrGuide.textContent = isJa
        ? "📸 表を枠に合わせて下の「表を撮影して解析」をタップ"
        : "📸 Fit table in frame ➔ Tap 'Snap & Read Table' below";
    }

    const lblBtnSnapOcr = document.getElementById("lbl-btn-snap-ocr");
    if (lblBtnSnapOcr) lblBtnSnapOcr.textContent = isJa ? "📸 表を撮影して解析" : "📸 Snap & Read Table";

    const lblScannerUpload = document.getElementById("lbl-scanner-upload-text");
    if (lblScannerUpload) lblScannerUpload.textContent = isJa ? "画像を選択" : "Upload Photo";

    const lblReticleText = document.getElementById("lbl-reticle-text");
    if (lblReticleText) {
      lblReticleText.textContent = this.scannerMode === "ocr"
        ? (isJa ? "📸 枠を合わせて下のボタンをタップ" : "📸 Align Table & Tap Button Below")
        : (isJa ? "バーコードを枠に合わせてください" : "Align Barcode Inside Box");
    }

    const lblScannerFallback = document.getElementById("lbl-scanner-fallback-text");
    if (lblScannerFallback) {
      lblScannerFallback.textContent = isJa
        ? "カメラを利用できません。下のボタンから画像をアップロードしてください。"
        : "Camera stream is not available on this device. Please upload a photo of your label or barcode below.";
    }

    const lblUnknownPromptTitle = document.getElementById("lbl-unknown-prompt-title");
    if (lblUnknownPromptTitle) lblUnknownPromptTitle.textContent = isJa ? "新しいバーコード検出" : "New Barcode Detected";

    const lblUnknownPromptDesc = document.getElementById("lbl-unknown-prompt-desc");
    if (lblUnknownPromptDesc) {
      lblUnknownPromptDesc.textContent = isJa
        ? "カタログに未登録です。ボトルの裏面の「使用量の目安」表を撮影して濃度を自動読込しますか？"
        : "Not in our catalog yet. Flip bottle to the back dosing table (使用量の目安) to auto-read the concentration!";
    }

    const lblBtnPromptOcr = document.getElementById("lbl-btn-prompt-ocr");
    if (lblBtnPromptOcr) lblBtnPromptOcr.textContent = isJa ? "使用量表をカメラ読込" : "Scan Dosing Table";

    const lblBtnPromptManual = document.getElementById("lbl-btn-prompt-manual");
    if (lblBtnPromptManual) lblBtnPromptManual.textContent = isJa ? "手動で設定 (15秒) ➔" : "Manual Setup (15s) ➔";

    const lblBuilderScanLabel = document.getElementById("lbl-builder-scan-label");
    if (lblBuilderScanLabel) lblBuilderScanLabel.textContent = isJa ? "表をカメラ読取" : "Auto-Read Table";

    const lblBtnOpenOcr = document.getElementById("lbl-btn-open-ocr");
    if (lblBtnOpenOcr) lblBtnOpenOcr.textContent = isJa ? "使用量表" : "Dosing Table";

    this.updateCapPreview();
    this.renderBackLabelMatrix();

    // Bottom Navigation (3 Tabs: Dosage Guide [Default], Panel Map, Error Codes)
    const navDosage = document.getElementById("nav-label-dosage");
    if (navDosage) navDosage.textContent = isJa ? "計量・投入" : "Dosage Guide";

    const navPanel = document.getElementById("nav-label-panel");
    if (navPanel) navPanel.textContent = isJa ? "操作パネル" : "Panel Map";

    const navErrors = document.getElementById("nav-label-errors");
    if (navErrors) navErrors.textContent = isJa ? "エラー表示" : "Error Codes";
  }

  bindEvents() {
    // Collapsible Start Helper (3-Button Sequence)
    const btnToggleStart = document.getElementById("btn-toggle-start-helper");
    const helperCard = document.getElementById("start-helper-card");
    const helperDrawer = document.getElementById("start-helper-drawer");
    const helperBadge = document.getElementById("lbl-start-helper-badge");
    const helperIcon = document.getElementById("start-helper-icon");
    if (btnToggleStart && helperDrawer) {
      btnToggleStart.addEventListener("click", () => {
        const isHidden = helperDrawer.classList.contains("hidden");
        helperDrawer.classList.toggle("hidden", !isHidden);
        if (helperCard) helperCard.classList.toggle("expanded", isHidden);
        btnToggleStart.setAttribute("aria-expanded", isHidden ? "true" : "false");
        const isJa = this.currentLang === "ja";
        if (helperBadge) {
          helperBadge.textContent = isHidden ? (isJa ? "閉じる ▴" : "Hide Steps ▴") : (isJa ? "手順を表示 ▾" : "Show Steps ▾");
        }
        if (helperIcon) {
          helperIcon.textContent = isHidden ? "▼" : "▶";
        }
      });
    }

    // Collapsible Dispenser Drawer Map
    const btnToggleDrawer = document.getElementById("btn-toggle-drawer");
    const drawerBody = document.getElementById("drawer-collapsible-body");
    const drawerPill = document.getElementById("lbl-toggle-drawer");
    if (btnToggleDrawer && drawerBody) {
      btnToggleDrawer.addEventListener("click", () => {
        const isHidden = drawerBody.classList.contains("hidden");
        drawerBody.classList.toggle("hidden", !isHidden);
        const isJa = this.currentLang === "ja";
        if (drawerPill) {
          drawerPill.textContent = isHidden ? (isJa ? "閉じる ▴" : "Hide Map ▴") : (isJa ? "投入口マップを表示 ▾" : "Tap to View Compartments ▾");
        }
      });
    }

    // Zero State Add Button
    const btnZeroAdd = document.getElementById("btn-zero-add-bottle");
    if (btnZeroAdd) {
      btnZeroAdd.addEventListener("click", () => {
        this.openBottleBuilder();
      });
    }

    // Laundry Basket Setup Modal
    const modalBasket = document.getElementById("modal-basket-setup");
    const btnOpenBasket = document.getElementById("btn-open-basket-modal");
    const btnCloseBasket = document.getElementById("btn-close-basket-modal");
    const btnSaveBasket = document.getElementById("btn-save-basket-modal");
    if (btnOpenBasket && modalBasket) {
      btnOpenBasket.addEventListener("click", () => {
        modalBasket.classList.remove("hidden");
        modalBasket.classList.add("active");
        this.renderUserArsenal();
      });
    }
    const closeBasketModal = () => {
      if (modalBasket) {
        modalBasket.classList.add("hidden");
        modalBasket.classList.remove("active");
      }
    };
    if (btnCloseBasket) btnCloseBasket.addEventListener("click", closeBasketModal);
    if (btnSaveBasket) btnSaveBasket.addEventListener("click", () => {
      closeBasketModal();
      this.updatePreDrumBox();
      this.updateDosageView();
      this.renderDrawerSvg();
    });

    // Bottom Tab navigation
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    // URL Hash change support (back/forward browser navigation & deep linking)
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("hashchange", () => {
        const h = window.location.hash ? window.location.hash.replace("#", "") : "";
        if (["dosage", "guided", "panel", "errors"].includes(h) && this.activeTab !== h) {
          this.switchTab(h);
        }
      });
    }

    // Theme Toggle
    const themeBtn = document.getElementById("btn-toggle-theme");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // Language Switcher
    const langBtn = document.getElementById("btn-toggle-lang");
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        this.toggleLanguage();
      });
    }

    // Error search input
    const errorInput = document.getElementById("error-search-input");
    if (errorInput) {
      errorInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderErrorList();
      });
    }

    // Dictionary search input in Tab 2
    const dictInput = document.getElementById("dict-search-input");
    if (dictInput) {
      dictInput.addEventListener("input", (e) => {
        this.dictSearchQuery = e.target.value.trim().toLowerCase();
        this.renderPanelDictionary();
      });
    }

    // 15-Second Bottle Builder Modal Handlers
    const btnCal1 = document.getElementById("btn-open-calibrator");
    const modalCal = document.getElementById("modal-custom-bottle");
    const btnCloseCal = document.getElementById("btn-close-custom-modal");
    const btnCancelCal = document.getElementById("btn-cancel-custom-modal");
    const btnSaveCal = document.getElementById("btn-save-custom-bottle");

    const closeCalModal = () => {
      if (modalCal) {
        modalCal.classList.add("hidden");
        modalCal.classList.remove("active");
      }
      this.clearDetectedBanner();
      if (this.wasBasketModalOpen) {
        const basketModal = document.getElementById("modal-basket-setup");
        if (basketModal) {
          basketModal.classList.remove("hidden");
          basketModal.classList.add("active");
          this.renderUserArsenal();
        }
        this.wasBasketModalOpen = false;
      }
    };

    if (btnCal1) btnCal1.addEventListener("click", () => this.openBottleBuilder());
    if (btnCloseCal) btnCloseCal.addEventListener("click", closeCalModal);
    if (btnCancelCal) btnCancelCal.addEventListener("click", closeCalModal);

    // Step 1: Physical Form Radio Changes
    document.querySelectorAll('input[name="bottle-form"]').forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.selectPhysicalForm(e.target.value);
      });
    });

    // Name Input Tracking (prevent auto-overwrite if user typed)
    const nameInput = document.getElementById("custom-prod-name");
    if (nameInput) {
      nameInput.addEventListener("input", () => {
        this.userHasTypedName = nameInput.value.trim().length > 0;
      });
    }

    // Push Dispenser Checkbox Toggle
    const chkPush = document.getElementById("custom-is-push");
    const pushSubrow = document.getElementById("custom-push-subrow");
    if (chkPush && pushSubrow) {
      chkPush.addEventListener("change", (e) => {
        pushSubrow.classList.toggle("hidden", !e.target.checked);
        this.updateSmartName();
        this.updateCapPreview();
        this.renderBackLabelMatrix();
      });
    }

    // Push Preset Buttons (5g, 3g)
    document.querySelectorAll("#push-quick-pills .btn-preset-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-push");
        const pushGInput = document.getElementById("custom-push-g");
        if (pushGInput && val) {
          pushGInput.value = val;
          document.querySelectorAll("#push-quick-pills .btn-preset-pill").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.updateSmartName();
          this.updateCapPreview();
          this.renderBackLabelMatrix();
        }
      });
    });

    // Baseline Number Input change
    const mlInput = document.getElementById("custom-prod-ml");
    if (mlInput) {
      mlInput.addEventListener("input", () => {
        this.updateSmartName();
        this.updateCapPreview();
        this.renderBackLabelMatrix();
      });
    }

    // Push Gram Input change
    const pushGInput = document.getElementById("custom-push-g");
    if (pushGInput) {
      pushGInput.addEventListener("input", () => {
        this.updateSmartName();
        this.updateCapPreview();
        this.renderBackLabelMatrix();
      });
    }

    // Cap Marking Style Selector Pills
    document.querySelectorAll("#custom-cap-style-pills .btn-cap-style-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#custom-cap-style-pills .btn-cap-style-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentCapStyle = btn.getAttribute("data-style");
        this.customMatrixOverrides = null;
        this.updateCapPreview();
        this.renderBackLabelMatrix();
      });
    });

    // Back-Label Matrix Tune Accordion Toggle
    const btnTuneToggle = document.getElementById("btn-toggle-matrix-tune");
    const tuneBody = document.getElementById("matrix-tune-body");
    const lblTuneToggle = document.getElementById("lbl-matrix-tune-toggle");
    if (btnTuneToggle && tuneBody) {
      btnTuneToggle.addEventListener("click", () => {
        const isHidden = tuneBody.classList.contains("hidden");
        tuneBody.classList.toggle("hidden", !isHidden);
        if (lblTuneToggle) {
          const isJa = this.currentLang === "ja";
          lblTuneToggle.textContent = isHidden
            ? (isJa ? "閉じる ▴" : "Close Table ▴")
            : (isJa ? "個別調整 ▾" : "Adjust Table ▾");
        }
      });
    }

    // Matrix Reset Button
    const btnResetMatrix = document.getElementById("btn-reset-matrix");
    if (btnResetMatrix) {
      btnResetMatrix.addEventListener("click", () => {
        this.customMatrixOverrides = null;
        this.renderBackLabelMatrix();
      });
    }

    // Save Bottle
    if (btnSaveCal) {
      btnSaveCal.addEventListener("click", () => {
        this.saveBottleFromBuilder();
      });
    }

    // Scanner Modal Handlers & Controls
    const btnZeroScan = document.getElementById("btn-zero-scan-bottle");
    if (btnZeroScan) btnZeroScan.addEventListener("click", () => this.openScanner("barcode"));

    const btnOpenScanner = document.getElementById("btn-open-scanner-modal");
    if (btnOpenScanner) btnOpenScanner.addEventListener("click", () => this.openScanner("barcode"));

    const btnCloseScanner = document.getElementById("btn-close-scanner");
    if (btnCloseScanner) btnCloseScanner.addEventListener("click", () => this.closeScanner());

    const btnScannerTorch = document.getElementById("btn-scanner-torch");
    if (btnScannerTorch) btnScannerTorch.addEventListener("click", () => this.toggleScannerTorch());

    const btnScannerFlip = document.getElementById("btn-scanner-flip");
    if (btnScannerFlip) btnScannerFlip.addEventListener("click", () => this.flipScannerCamera());

    const btnModeBarcode = document.getElementById("btn-mode-barcode");
    if (btnModeBarcode) btnModeBarcode.addEventListener("click", () => this.setScannerMode("barcode"));

    const btnModeOcr = document.getElementById("btn-mode-ocr");
    if (btnModeOcr) btnModeOcr.addEventListener("click", () => this.setScannerMode("ocr"));

    const btnSnapOcr = document.getElementById("btn-scanner-snap-ocr");
    if (btnSnapOcr) btnSnapOcr.addEventListener("click", () => this.captureAndRunOcr());

    const fileInputScanner = document.getElementById("scanner-file-input");
    if (fileInputScanner) fileInputScanner.addEventListener("change", (e) => this.handleScannerFileUpload(e));

    const btnClearDetected = document.getElementById("btn-clear-detected");
    if (btnClearDetected) btnClearDetected.addEventListener("click", () => this.clearDetectedBanner());

    const btnOpenScannerOcr = document.getElementById("btn-open-scanner-ocr");
    if (btnOpenScannerOcr) btnOpenScannerOcr.addEventListener("click", () => this.openScanner("ocr"));

    const btnBuilderScanLabel = document.getElementById("btn-builder-scan-label");
    if (btnBuilderScanLabel) btnBuilderScanLabel.addEventListener("click", () => this.openScanner("ocr"));

    const btnPromptOcr = document.getElementById("btn-scanner-switch-to-ocr");
    if (btnPromptOcr) {
      btnPromptOcr.addEventListener("click", () => {
        this.hideUnknownBarcodePrompt();
        this.setScannerMode("ocr");
      });
    }

    const btnPromptManual = document.getElementById("btn-scanner-skip-to-manual");
    if (btnPromptManual) {
      btnPromptManual.addEventListener("click", () => {
        const barcodeToKeep = this.pendingBarcode;
        this.hideUnknownBarcodePrompt();
        this.closeScanner();
        this.detectedBottleData = {
          barcode: barcodeToKeep,
          source: "new_barcode"
        };
        this.openBottleBuilder();
        const isJa = this.currentLang === "ja";
        this.showDetectedBanner(
          isJa ? `新しいバーコード (${barcodeToKeep}) を検出しました。初回登録すると次回から自動認識されます！`
               : `New Barcode (${barcodeToKeep}) detected! Save once below and it will be remembered!`
        );
      });
    }
  }

  switchTab(tabName) {
    if (tabName === "guided") tabName = "dosage";
    if (!["dosage", "panel", "errors"].includes(tabName)) tabName = "dosage";
    this.activeTab = tabName;
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    const dosageView = document.getElementById("tab-view-dosage");
    if (dosageView) dosageView.classList.toggle("hidden", tabName !== "dosage");

    const panelView = document.getElementById("tab-view-panel");
    if (panelView) panelView.classList.toggle("hidden", tabName !== "panel");

    const errorsView = document.getElementById("tab-view-errors");
    if (errorsView) errorsView.classList.toggle("hidden", tabName !== "errors");

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (typeof window !== "undefined" && window.location && window.location.hash !== "#" + tabName) {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, "", "#" + tabName);
      } else {
        window.location.hash = tabName;
      }
    }

    if (tabName === "dosage") {
      this.updateGoalView();
      this.updatePreDrumBox();
      this.updateDosageView();
      this.renderDrawerSvg();
    } else if (tabName === "panel") {
      this.renderPanelMap();
    } else if (tabName === "errors") {
      this.renderErrorList();
    }
  }

  renderMachinePills() {
    const floorRow = document.getElementById("floor-selector-row");
    const machineList = document.getElementById("machine-pill-list");
    if (!floorRow && !machineList) return;

    const isJa = this.currentLang === "ja";

    // 1. Render Floor Pills if floorRow exists
    if (floorRow) {
      let floorHtml = "";
      for (const floor of this.data.floors) {
        const isFloorActive = floor.id === this.currentFloor;
        const isWomenFloor = floor.id === 3;
        const floorName = isJa ? (floor.nameJa || floor.name) : floor.name;
        const floorSub = floor.id === 3 ? (isJa ? "女性専用" : "Women Only") : (isJa ? "共用フロア" : "Mixed Floor");
        floorHtml += `
          <button class="floor-pill ${isFloorActive ? 'active' : ''} ${isWomenFloor ? 'floor-women' : ''}" data-floor="${floor.id}">
            <span class="floor-main">${floorName} ${isWomenFloor ? '🌸' : ''}</span>
            <span class="floor-sub">${floorSub}</span>
          </button>
        `;
      }
      floorRow.innerHTML = floorHtml;

      floorRow.querySelectorAll(".floor-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const fId = parseInt(pill.getAttribute("data-floor"), 10);
          this.selectFloor(fId);
        });
      });
    }

    // 2. Render Machine Pills for the currently selected floor
    if (machineList) {
      const activeFloorObj = this.data.floors.find(f => f.id === this.currentFloor) || this.data.floors[0];
      const machinesOnFloor = activeFloorObj ? activeFloorObj.machines : [];
      const isSingleMachine = machinesOnFloor.length === 1;

      let machineHtml = "";
      for (const mId of machinesOnFloor) {
        const m = this.data.machines[mId];
        if (!m) continue;
        const isActive = mId === this.currentMachineId;
        const brandName = isJa ? (m.brandJa || m.brand) : m.brand;
        machineHtml += `
          <button class="machine-pill ${isActive ? 'active' : ''}" data-id="${m.id}" data-floor="${m.floor}">
            <span class="model-brand">${brandName}</span>
            <span class="model-name">${m.model}</span>
          </button>
        `;
      }
      machineList.innerHTML = machineHtml;
      if (machineList.classList && machineList.classList.toggle) {
        machineList.classList.toggle("single-col", isSingleMachine);
      }

      machineList.querySelectorAll(".machine-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const mId = pill.getAttribute("data-id");
          this.selectMachine(mId);
        });
      });
    }
  }

  selectFloor(floorId) {
    if (this.currentFloor === floorId) return;
    this.currentFloor = floorId;
    const floorObj = this.data.floors.find(f => f.id === floorId);
    if (floorObj && floorObj.machines && floorObj.machines.length > 0) {
      this.selectMachine(floorObj.machines[0]);
    } else {
      this.renderMachinePills();
    }
  }

  selectMachine(machineId) {
    this.currentMachineId = machineId;
    const m = this.data.machines[machineId];
    if (m) {
      this.currentFloor = m.floor;
    }

    // Reset reading to machine's default reading (e.g. 0.6)
    if (m && m.displayReadings && m.displayReadings.length > 0) {
      const defaultMatch = m.displayReadings.find(r => r.reading === "0.6" || r.reading === "0.5");
      this.currentReading = defaultMatch ? defaultMatch.reading : m.displayReadings[0].reading;
    }

    // Re-render pills
    this.renderMachinePills();

    this.updateMachineView();
    this.updateGoalView();
    this.updatePreDrumBox();
    this.updateDosageView();
    this.renderDrawerSvg();
    this.renderPanelMap();
    this.renderErrorList();
  }

  updateMachineView() {
    const isJa = this.currentLang === "ja";
    const m = this.data.machines[this.currentMachineId];
    const floor = this.data.floors.find(f => f.id === m.floor);

    // Update Active Machine Banner
    const banner = document.getElementById("machine-banner-info");
    if (banner) {
      const isWomenOnly = m.floor === 3;
      const brand = isJa ? (m.brandJa || m.brand) : m.brand;
      const type = isJa ? (m.typeJa || m.type) : m.type;
      const badgeText = isWomenOnly
        ? (isJa ? "🌸 3F 女性専用フロア" : "🌸 3F Women Only")
        : (isJa ? `${m.floor}階` : `${m.floor}F`);

      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <h2>${brand} ${m.model}</h2>
          <span class="tag-badge ${isWomenOnly ? 'women-only' : ''}">
            ${badgeText}
          </span>
        </div>
        <p>${type} • ${isJa ? '洗濯' : 'Wash'} ${m.capacityWashKg}kg / ${isJa ? '乾燥' : 'Dry'} ${m.capacityDryKg}kg</p>
      `;
    }

    // Render Goals Grid
    const goalsGrid = document.getElementById("goals-grid");
    if (goalsGrid) {
      goalsGrid.innerHTML = this.data.goals.map(g => {
        const primaryTitle = isJa ? g.titleJa : g.title;
        const subTitle = isJa ? g.title : g.titleJa;
        return `
          <div class="goal-card ${g.id === this.currentGoalId ? 'active' : ''}" data-goal="${g.id}">
            <div class="goal-icon">${g.icon}</div>
            <div class="goal-title">${primaryTitle}</div>
            <div class="goal-ja">${subTitle}</div>
          </div>
        `;
      }).join("");

      goalsGrid.querySelectorAll(".goal-card").forEach(card => {
        card.addEventListener("click", () => {
          this.currentGoalId = card.getAttribute("data-goal");
          goalsGrid.querySelectorAll(".goal-card").forEach(c => c.classList.remove("active"));
          card.classList.add("active");
          this.updateGoalView();
        });
      });
    }

    // Render Machine Load Number Buttons
    this.renderLoadNumberButtons();
  }

  updatePreDrumBox() {
    const isJa = this.currentLang === "ja";
    const preBox = document.getElementById("pre-drum-box");
    if (!preBox) return;

    const directBottles = this.userBottles.filter(b => b.isActive !== false && b.defaultSlot === "drum_direct");

    if (directBottles.length === 0) {
      preBox.style.display = "none";
      return;
    }
    preBox.style.display = "flex";

    const preText = document.getElementById("pre-drum-text");
    if (preText) {
      const names = directBottles.map(b => b.name).join(isJa ? "・" : " and ");
      preText.innerHTML = isJa
        ? `<strong>${names}</strong>は、洗剤投入ケースではなく<strong>洗濯槽の底（衣類の下）へ直接投入</strong>してください！ スタートするとドアは自動ロックされます。`
        : `Toss your <strong>${names}</strong> directly into the <strong>bottom of the drum (under clothes)</strong> <em>NOW</em> before closing the door! Front-loader doors lock automatically once you press Start.`;
    }

    const preEst = document.getElementById("pre-drum-estimate");
    if (preEst) {
      const m = this.data.machines[this.currentMachineId];
      const readingObj = m.displayReadings.find(r => r.reading === this.currentReading) || m.displayReadings[0];
      const dose = this.calculateDoseForProduct(directBottles[0], readingObj);
      const cap = isJa ? dose.capJa : dose.capEn;
      preEst.textContent = isJa
        ? `💡 目安量: ${directBottles[0].name} ${cap}（${dose.displayAmount}、洗濯槽の底へ直接）`
        : `💡 Estimated dose: ${directBottles[0].name} ${cap} (${dose.displayAmount}, toss into bottom of drum)`;
    }
  }

  selectReading(reading) {
    this.currentReading = reading;
    const container = document.getElementById("load-buttons-row");
    if (container) {
      container.querySelectorAll(".load-num-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-reading") === this.currentReading);
      });
    }
    this.updateDosageView();
  }

  renderLoadNumberButtons() {
    const isJa = this.currentLang === "ja";
    const m = this.data.machines[this.currentMachineId];
    const container = document.getElementById("load-buttons-row");
    if (!container) return;

    const html = m.displayReadings.map(r => `
      <button class="load-num-btn ${r.reading === this.currentReading ? 'active' : ''}" data-reading="${r.reading}">
        <div class="num-val">${r.reading}</div>
        <div class="num-sub">${isJa ? (r.labelJa || r.label) : r.label}</div>
      </button>
    `).join("");

    container.innerHTML = html;

    container.querySelectorAll(".load-num-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectReading(btn.getAttribute("data-reading"));
      });
    });
  }

  updateGoalView() {
    const isJa = this.currentLang === "ja";
    const m = this.data.machines[this.currentMachineId];
    const goal = this.data.goals.find(g => g.id === this.currentGoalId);
    const stepsList = document.getElementById("step-items-list");
    if (!stepsList || !goal) return;

    const brandKey = m.brand.toLowerCase() === "panasonic" ? "panasonic" : "sharp";
    const steps = goal.steps[brandKey] || goal.steps.panasonic;

    stepsList.innerHTML = steps.map(s => {
      const actionText = isJa ? (s.actionJa || s.action) : s.action;
      const noteText = isJa ? (s.noteJa || s.note) : s.note;
      const buttonHtml = isJa
        ? `<span class="button-tag"><span class="ja-kanji">${s.buttonJa}</span></span>`
        : `<span class="button-tag"><span class="ja-kanji">${s.buttonJa}</span><span>${s.buttonEn}</span></span>`;

      return `
        <div class="step-item">
          <div class="step-badge">${s.step}</div>
          <div class="step-content">
            <div class="step-action-title">
              <span>${actionText}</span>
              ${buttonHtml}
            </div>
            ${noteText ? `<div class="step-note">${noteText}</div>` : ''}
          </div>
        </div>
      `;
    }).join("");
  }

  updateDosageView() {
    const isJa = this.currentLang === "ja";
    const m = this.data.machines[this.currentMachineId];
    const readingObj = m.displayReadings.find(r => r.reading === this.currentReading) || m.displayReadings[0];

    // Update Load summary line in Step 3
    const summaryElems = document.querySelectorAll(".load-summary-info");
    summaryElems.forEach(el => {
      const loadDesc = isJa ? (readingObj.loadEstimateJa || readingObj.loadEstimate) : readingObj.loadEstimate;
      const waterLabel = isJa ? `推定水量: 約${readingObj.waterEstL}L` : `Estimated Water: ~${readingObj.waterEstL}L`;
      el.innerHTML = `<strong>${loadDesc}</strong> (${waterLabel})`;
    });

    const zeroStateEl = document.getElementById("zero-state-arsenal");
    const cardsListEl = document.getElementById("product-cards-list");

    // Check if user has at least one detergent registered
    const hasDetergent = this.userBottles.some(b => b.category === "liquid_detergent" || b.category === "powder_detergent" || b.category === "pods");

    if (!hasDetergent) {
      if (zeroStateEl) zeroStateEl.classList.remove("hidden");
      if (cardsListEl) cardsListEl.innerHTML = "";
      return;
    }

    if (zeroStateEl) zeroStateEl.classList.add("hidden");

    // Generate recipe cards for active bottles
    if (cardsListEl) {
      cardsListEl.innerHTML = this.generateUserBottleCards(readingObj);

      // Attach slot click listener from dosage cards to highlight drawer
      cardsListEl.querySelectorAll(".slot-indicator-badge").forEach(badge => {
        badge.addEventListener("click", (e) => {
          e.stopPropagation();
          const slotId = badge.getAttribute("data-slot");
          const card = badge.closest(".product-card");
          this.highlightDrawerSlot(slotId, card);
        });
      });
    }
  }

  renderUserArsenal() {
    const isJa = this.currentLang === "ja";
    const container = document.getElementById("user-arsenal-list");
    if (!container) return;

    if (this.userBottles.length === 0) {
      container.innerHTML = `
        <div class="arsenal-empty-card" style="text-align:center; padding:24px 16px; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border);">
          <div style="font-size:2rem; margin-bottom:8px;">🧺</div>
          <div style="font-weight:700; font-size:1rem; margin-bottom:4px;">
            ${isJa ? '登録された洗剤ボトルはありません' : 'No bottles registered yet'}
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); line-height:1.4;">
            ${isJa ? '上の「新しいボトルを追加 (15秒)」をタップして、お使いの洗剤・柔軟剤を登録してください。' : 'Tap "Add New Bottle (15s)" above to register your detergent or softener in 15 seconds.'}
          </div>
        </div>
      `;
      return;
    }

    let html = "";
    this.userBottles.forEach(b => {
      const isChecked = b.isActive !== false;
      const slotName = isJa ? (b.slotNameJa || b.slotNameEn || b.defaultSlot) : (b.slotNameEn || b.defaultSlot);
      html += `
        <div class="arsenal-bottle-card ${isChecked ? 'active' : 'inactive'}" data-id="${b.id}" style="display:flex; flex-direction:column; gap:8px; padding:12px 14px; background:var(--bg-card); border-radius:10px; border:1px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}; margin-bottom:10px;">
          <div class="arsenal-card-top" style="display:flex; justify-content:space-between; align-items:center;">
            <label class="arsenal-toggle-wrap" style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.85rem; font-weight:600;">
              <input type="checkbox" class="arsenal-toggle-checkbox" data-id="${b.id}" ${isChecked ? 'checked' : ''}>
              <span class="arsenal-toggle-label" style="color:${isChecked ? 'var(--text-main)' : 'var(--text-muted)'};">${isJa ? (isChecked ? '使用する' : '使わない') : (isChecked ? 'Active Today' : 'Skip Today')}</span>
            </label>
            <div class="arsenal-actions" style="display:flex; gap:6px;">
              <button type="button" class="btn-arsenal-edit" data-id="${b.id}" title="${isJa ? '編集' : 'Edit'}" style="padding:4px 8px; border-radius:6px; border:1px solid var(--border); background:var(--bg); cursor:pointer;">✏️</button>
              <button type="button" class="btn-arsenal-del" data-id="${b.id}" title="${isJa ? '削除' : 'Delete'}" style="padding:4px 8px; border-radius:6px; border:1px solid var(--border); background:var(--bg); cursor:pointer;">🗑️</button>
            </div>
          </div>
          <div class="arsenal-card-body" style="display:flex; align-items:center; gap:10px;">
            <span class="arsenal-bottle-icon" style="font-size:1.6rem;">${b.icon || '🧴'}</span>
            <div class="arsenal-bottle-meta" style="flex:1;">
              <div class="arsenal-bottle-name" style="font-weight:700; font-size:0.95rem; color:var(--text-main);">${b.name}</div>
              <div class="arsenal-bottle-sub" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
                <span class="badge" style="font-size:0.75rem; background:var(--bg); border:1px solid var(--border);">${isJa ? (b.standardDoseTextJa || b.standardDoseText) : b.standardDoseText}</span>
                <span class="badge" style="font-size:0.75rem; background:var(--bg-accent-subtle); color:var(--primary); font-weight:600;">📥 ${slotName}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

    // Attach listeners
    container.querySelectorAll(".arsenal-toggle-checkbox").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const id = chk.getAttribute("data-id");
        const bottle = this.getBottleById(id);
        if (bottle) {
          bottle.isActive = e.target.checked;
          // Mutual exclusion: softener vs citric rinse
          if (bottle.isActive && bottle.category === "citric_rinse") {
            this.userBottles.forEach(other => {
              if (other.id !== bottle.id && other.category === "softener") other.isActive = false;
            });
          } else if (bottle.isActive && bottle.category === "softener") {
            this.userBottles.forEach(other => {
              if (other.id !== bottle.id && other.category === "citric_rinse") other.isActive = false;
            });
          }
          this.saveUserBottles();
          this.renderUserArsenal();
          this.updatePreDrumBox();
          this.updateDosageView();
          this.renderDrawerSvg();
        }
      });
    });

    container.querySelectorAll(".btn-arsenal-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const bottle = this.getBottleById(id);
        if (bottle) this.openBottleBuilder(bottle);
      });
    });

    container.querySelectorAll(".btn-arsenal-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        this.deleteBottle(id);
      });
    });
  }

  // =========================================================================
  // HYBRID CAMERA SCANNER: BARCODE (JAN) DETECTOR + IN-BROWSER LABEL OCR
  // =========================================================================

  openScanner(mode = "barcode") {
    const modal = document.getElementById("modal-scanner");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("active");

    this.setScannerMode(mode);

    // Setup BarcodeDetector if natively available
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        this.barcodeDetector = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"]
        });
      } catch (err) {
        this.barcodeDetector = null;
      }
    }

    this.hideUnknownBarcodePrompt();
    this.startCameraStream();
  }

  closeScanner() {
    this.isScanning = false;
    this.hideUnknownBarcodePrompt();
    this.stopCameraStream();

    const modal = document.getElementById("modal-scanner");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("active");
    }

    const reticle = document.getElementById("scanner-reticle-box");
    if (reticle) reticle.classList.remove("scan-success");
  }

  showUnknownBarcodePrompt(janCode) {
    const prompt = document.getElementById("scanner-unknown-prompt");
    const codeEl = document.getElementById("lbl-unknown-prompt-code");
    if (codeEl) codeEl.textContent = janCode;
    if (prompt) prompt.classList.remove("hidden");
    const laser = document.getElementById("scanner-laser");
    if (laser) laser.style.display = "none";
  }

  hideUnknownBarcodePrompt() {
    const prompt = document.getElementById("scanner-unknown-prompt");
    if (prompt) prompt.classList.add("hidden");
    this.isBarcodeDetectingPaused = false;
    const laser = document.getElementById("scanner-laser");
    if (laser) laser.style.display = "";
    const reticle = document.getElementById("scanner-reticle-box");
    if (reticle) reticle.classList.remove("scan-success");
  }

  async startCameraStream() {
    const video = document.getElementById("scanner-video");
    const fallbackMsg = document.getElementById("scanner-fallback-message");
    const statusText = document.getElementById("lbl-scanner-status-text");
    const isJa = this.currentLang === "ja";

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (fallbackMsg) fallbackMsg.classList.remove("hidden");
      if (statusText) statusText.textContent = isJa ? "カメラ非対応（画像をアップロードしてください）" : "Camera unsupported (Upload image below)";
      return;
    }

    try {
      if (fallbackMsg) fallbackMsg.classList.add("hidden");
      if (statusText) statusText.textContent = isJa ? "カメラ起動中..." : "Starting camera...";

      const constraints = {
        video: {
          facingMode: { ideal: this.scannerFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.scannerStream = stream;
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) this.scannerTrack = tracks[0];

      if (video) {
        video.srcObject = stream;
        try { await video.play(); } catch (e) {}
      }

      if (statusText) {
        statusText.textContent = this.scannerMode === "barcode"
          ? (isJa ? "バーコードをスキャン中..." : "Scanning for Barcode...")
          : (isJa ? "使用量表示を枠に合わせてください" : "Align table & tap 'Snap & Read'");
      }

      this.startScanningLoop();
    } catch (err) {
      if (fallbackMsg) fallbackMsg.classList.remove("hidden");
      if (statusText) {
        statusText.textContent = isJa
          ? "カメラの起動に失敗しました（画像をアップロードしてください）"
          : "Camera unavailable. Upload a photo below.";
      }
    }
  }

  stopCameraStream() {
    if (this.scannerStream) {
      try {
        this.scannerStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.scannerStream = null;
    }
    this.scannerTrack = null;
    this.isTorchOn = false;

    const btnTorch = document.getElementById("btn-scanner-torch");
    if (btnTorch) btnTorch.classList.remove("active");

    const video = document.getElementById("scanner-video");
    if (video) video.srcObject = null;
  }

  toggleScannerTorch() {
    if (!this.scannerTrack) return;
    this.isTorchOn = !this.isTorchOn;

    const btnTorch = document.getElementById("btn-scanner-torch");
    if (btnTorch) btnTorch.classList.toggle("active", this.isTorchOn);

    try {
      if (this.scannerTrack.applyConstraints) {
        this.scannerTrack.applyConstraints({
          advanced: [{ torch: this.isTorchOn }]
        }).catch(() => {});
      }
    } catch (e) {}
  }

  flipScannerCamera() {
    this.scannerFacingMode = this.scannerFacingMode === "environment" ? "user" : "environment";
    this.stopCameraStream();
    this.startCameraStream();
  }

  setScannerMode(mode) {
    this.hideUnknownBarcodePrompt();
    this.scannerMode = mode;
    const isJa = this.currentLang === "ja";

    const btnBarcode = document.getElementById("btn-mode-barcode");
    const btnOcr = document.getElementById("btn-mode-ocr");
    const modalCard = document.querySelector(".scanner-modal-card");
    const btnSnapOcr = document.getElementById("btn-scanner-snap-ocr");
    const ocrHelper = document.getElementById("scanner-ocr-helper-badge");
    const statusText = document.getElementById("lbl-scanner-status-text");
    const reticleGuide = document.getElementById("lbl-reticle-text");

    if (btnBarcode) btnBarcode.classList.toggle("active", mode === "barcode");
    if (btnOcr) btnOcr.classList.toggle("active", mode === "ocr");
    if (modalCard) modalCard.classList.toggle("mode-ocr", mode === "ocr");

    if (btnSnapOcr) {
      btnSnapOcr.classList.toggle("hidden", mode !== "ocr");
    }
    if (ocrHelper) {
      ocrHelper.classList.toggle("hidden", mode !== "ocr");
    }

    if (mode === "barcode") {
      if (reticleGuide) reticleGuide.textContent = isJa ? "バーコードを枠に合わせてください" : "Align Barcode Inside Box";
      if (statusText) statusText.textContent = isJa ? "バーコードをスキャン中..." : "Scanning for Barcode...";
    } else {
      if (reticleGuide) reticleGuide.textContent = isJa ? "📸 枠を合わせて下のボタンをタップ" : "📸 Align Table & Tap Button Below";
      if (statusText) {
        statusText.textContent = this.pendingBarcode
          ? (isJa ? `バーコード (${this.pendingBarcode}) 保持中: 使用量表を撮影` : `Barcode (${this.pendingBarcode}) saved: Snap dosing table`)
          : (isJa ? "「表を撮影して解析」をタップ" : "Tap 'Snap & Read Table' below");
      }
    }
  }

  startScanningLoop() {
    this.isScanning = true;
    let lastCheckTime = 0;

    const scanFrame = async (timestamp) => {
      if (!this.isScanning) return;

      if (timestamp - lastCheckTime > 180) {
        lastCheckTime = timestamp;

        if (!this.isBarcodeDetectingPaused && this.scannerMode === "barcode" && this.barcodeDetector) {
          const video = document.getElementById("scanner-video");
          if (video && video.readyState >= 2) {
            try {
              const barcodes = await this.barcodeDetector.detect(video);
              if (barcodes && barcodes.length > 0) {
                const rawValue = String(barcodes[0].rawValue || "").trim();
                if (rawValue) {
                  this.handleBarcodeDetected(rawValue);
                  return; // Detection handled, stop loop
                }
              }
            } catch (err) {
              // Frame dropped or busy
            }
          }
        }
      }

      if (this.isScanning && typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(scanFrame);
      }
    };

    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(scanFrame);
    }
  }

  handleBarcodeDetected(janCode) {
    if (this.isBarcodeDetectingPaused) return;

    const isJa = this.currentLang === "ja";
    const reticle = document.getElementById("scanner-reticle-box");
    const statusText = document.getElementById("lbl-scanner-status-text");

    if (reticle) reticle.classList.add("scan-success");
    if (statusText) statusText.textContent = `✔ ${isJa ? "バーコード認識" : "Barcode Detected"}: ${janCode}`;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate([80]); } catch (e) {}
    }

    const registry = (this.data && this.data.barcodeRegistry) || [];
    const match = registry.find(b => b.jan === janCode) || (this.userBarcodes && this.userBarcodes[janCode]);

    setTimeout(() => {
      if (match) {
        this.closeScanner();
        this.detectedBottleData = {
          name: isJa ? (match.nameJa || match.name) : match.name,
          category: match.category,
          baseline: match.baseline,
          isPush: Boolean(match.isPush),
          pushG: match.pushG || 5,
          capStyle: match.capStyle || "decimal",
          barcode: janCode,
          source: "barcode"
        };
        this.applyDetectedBottleToBuilder(this.detectedBottleData);
      } else {
        // Unknown barcode: keep scanner open and show prompt
        this.pendingBarcode = janCode;
        this.isBarcodeDetectingPaused = true;
        this.showUnknownBarcodePrompt(janCode);
      }
    }, 400);
  }

  applyDetectedBottleToBuilder(data) {
    if (!data) return;
    this.detectedBottleData = data;
    const isJa = this.currentLang === "ja";

    // Open clean builder
    this.openBottleBuilder();

    // Populate Name
    const nameInput = document.getElementById("custom-prod-name");
    if (nameInput && data.name) {
      nameInput.value = data.name;
      this.userHasTypedName = true;
    }

    // Determine form type from category
    let formType = "liquid";
    if (data.category === "pods") formType = "pods";
    else if (data.category === "in_drum_beads") formType = "beads";
    else if (data.category === "powder_detergent" || data.category === "powder_bleach") formType = "powder";

    this.selectPhysicalForm(formType, data.category, false);

    // Populate baseline
    const mlInput = document.getElementById("custom-prod-ml");
    if (mlInput && data.baseline !== undefined) {
      mlInput.value = data.baseline;
    }

    // Populate push
    const pushChk = document.getElementById("custom-is-push");
    const pushSubrow = document.getElementById("custom-push-subrow");
    const pushGInput = document.getElementById("custom-push-g");
    if (pushChk) {
      pushChk.checked = Boolean(data.isPush);
      if (pushSubrow) pushSubrow.classList.toggle("hidden", !data.isPush);
    }
    if (pushGInput && data.pushG) {
      pushGInput.value = data.pushG;
    }

    // Populate cap style
    if (data.capStyle) {
      this.currentCapStyle = data.capStyle;
      document.querySelectorAll("#custom-cap-style-pills .btn-cap-style-pill").forEach(pill => {
        pill.classList.toggle("active", pill.getAttribute("data-style") === data.capStyle);
      });
    }

    // Show banner
    let bannerText = "";
    if (data.source === "barcode_plus_ocr") {
      bannerText = isJa
        ? `バーコード (${data.barcode}) ＋ ラベル解析 (${data.baseline || ''}mL/g) 完了！`
        : `Auto-detected ${data.baseline || ''}mL/g from Label & attached Barcode (${data.barcode})!`;
    } else if (data.source === "barcode") {
      bannerText = isJa ? `バーコード認識: ${data.name || data.barcode}` : `Auto-detected from Barcode: ${data.name || data.barcode}`;
    } else {
      bannerText = isJa ? `ラベル解析: ${data.category || ''} (${data.baseline || ''}mL/g)` : `Auto-detected from Label: ${data.category || ''} (${data.baseline || ''}mL/g)`;
    }
    this.showDetectedBanner(bannerText);

    this.updateCapPreview();
    this.renderBackLabelMatrix();
  }

  showDetectedBanner(text) {
    const banner = document.getElementById("scanner-detected-pill");
    const bannerText = document.getElementById("lbl-detected-pill-text");
    if (banner && bannerText) {
      bannerText.textContent = text;
      banner.classList.remove("hidden");
    }
  }

  clearDetectedBanner() {
    const banner = document.getElementById("scanner-detected-pill");
    if (banner) banner.classList.add("hidden");
    this.detectedBottleData = null;
  }

  async captureAndRunOcr() {
    const video = document.getElementById("scanner-video");
    const canvas = document.getElementById("scanner-canvas");
    const statusText = document.getElementById("lbl-scanner-status-text");
    const isJa = this.currentLang === "ja";

    if (!video || !canvas) return;

    if (statusText) statusText.textContent = isJa ? "画像を取得中..." : "Capturing frame...";

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    // Generous crop (85% width, 80% height) to prevent clipping off-center dosing tables
    const cropW = Math.round(width * 0.85);
    const cropH = Math.round(height * 0.80);
    const cropX = Math.round((width - cropW) / 2);
    const cropY = Math.round((height - cropH) / 2);

    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      this.preprocessCanvasForOcr(canvas);
    }

    await this.runOcrOnCanvas(canvas);
  }

  preprocessCanvasForOcr(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const contrast = 1.3;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const enhanced = factor * (gray - 128) + 128;
        const finalVal = Math.min(255, Math.max(0, enhanced));
        d[i] = finalVal;
        d[i + 1] = finalVal;
        d[i + 2] = finalVal;
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      // Ignore cross-origin canvas read errors
    }
  }

  async runOcrOnCanvas(canvas) {
    const statusText = document.getElementById("lbl-scanner-status-text");
    const isJa = this.currentLang === "ja";

    if (statusText) statusText.textContent = isJa ? "日本語ラベル解析中 (OCR)..." : "Reading label text (OCR)...";

    try {
      if (typeof window !== "undefined" && !window.Tesseract) {
        if (statusText) statusText.textContent = isJa ? "OCRライブラリ読込中..." : "Loading OCR library...";
        await this.loadTesseractScript();
      }

      if (typeof window !== "undefined" && window.Tesseract) {
        if (statusText) statusText.textContent = isJa ? "AI認識モデル準備中..." : "Initializing OCR model...";

        // Use 'eng' for blazing fast Roman numeral and unit recognition (~2MB download vs 45MB jpn)
        const res = await window.Tesseract.recognize(canvas, "eng", {
          logger: (m) => {
            if (!statusText) return;
            const pct = Math.round((m.progress || 0) * 100);
            if (m.status === "recognizing text") {
              statusText.textContent = `${isJa ? "文字認識中" : "Reading table"}: ${pct}%`;
            } else if (m.status === "loading language traineddata") {
              statusText.textContent = `${isJa ? "モデル読込中" : "Loading model"}: ${pct}%`;
            } else if (m.status === "loading tesseract core") {
              statusText.textContent = isJa ? "エンジン準備中..." : "Loading OCR engine...";
            } else {
              statusText.textContent = `${isJa ? "解析処理中" : "Processing"}: ${pct}%`;
            }
          }
        });

        const rawText = res && res.data ? res.data.text : "";
        const parsed = this.parseLabelOcrText(rawText);

        if (parsed && parsed.baseline) {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            try { navigator.vibrate([100]); } catch (e) {}
          }
          if (statusText) statusText.textContent = isJa ? `✔ 認識成功: ${parsed.baseline}mL/g` : `✔ Detected: ${parsed.baseline}mL/g`;
          const pendingJan = this.pendingBarcode;
          this.pendingBarcode = null;
          setTimeout(() => {
            this.closeScanner();
            this.applyDetectedBottleToBuilder({
              ...parsed,
              barcode: pendingJan || undefined,
              source: pendingJan ? "barcode_plus_ocr" : "ocr"
            });
          }, 350);
          return;
        }
      }
    } catch (err) {
      console.warn("OCR parsing error or offline fallback:", err);
    }

    if (statusText) {
      statusText.textContent = isJa
        ? "数値を特定できませんでした。明るい場所で近づけて再撮影するか、画像選択をお試しください"
        : "Could not read numbers clearly. Move closer with good lighting or upload a photo.";
    }
  }

  parseLabelOcrText(rawText) {
    if (!rawText || typeof rawText !== "string") return null;

    const text = rawText.replace(/[\r\n]+/g, " ");

    let baseline = null;

    // 1. Water 30L baseline (e.g. 水30Lに対して10mL, 30L: 20mL, 30L 25g)
    const match30L = text.match(/(?:水\s*30\s*L|30\s*L|30\s*リットル|30L)[\s\S]{0,25}?(\d+(?:\.\d+)?)\s*(?:mL|ml|g|ミリ|グラム)?/i);
    if (match30L) {
      const val = parseFloat(match30L[1]);
      if (val >= 4 && val <= 150) baseline = val;
    }

    // 1b. Drum 2.0kg baseline (e.g. ドラム式 2.0kgに対して10mL, 2kg 10mL)
    if (!baseline) {
      const match2Kg = text.match(/(?:2(?:\.0)?\s*kg|2kg|洗たく物量\s*2)[\s\S]{0,20}?(\d+(?:\.\d+)?)\s*(?:mL|ml|g)?/i);
      if (match2Kg) {
        const val = parseFloat(match2Kg[1]);
        if (val >= 4 && val <= 150) baseline = val;
      }
    }

    // 2. Weight baseline (e.g. 衣料1kgに対して12mL, 1kg: 9.1mL, 1kg 12g)
    let weightBaseline = null;
    const matchKg = text.match(/(?:1|１)(?:\.0)?\s*kg(?:に対して|につき|に|：|:|\s)*[\s\S]{0,15}?(\d+(?:\.\d+)?)\s*(?:mL|ml|g)?/i);
    if (matchKg) {
      weightBaseline = parseFloat(matchKg[1]);
    } else {
      const matchKgGeneral = text.match(/(?:衣料|衣類|洗濯物量)[\s\S]{0,15}?(\d+(?:\.\d+)?)\s*(?:mL|ml)/i);
      if (matchKgGeneral) {
        weightBaseline = parseFloat(matchKgGeneral[1]);
      }
    }

    // 3. Push grams
    let isPush = false;
    let pushG = 5;
    const matchPush = text.match(/(?:1\s*プッシュ|プッシュ|回|push)[\s\S]{0,15}?(\d+(?:\.\d+)?)\s*(?:g|グラム)/i);
    if (matchPush) {
      isPush = true;
      pushG = parseFloat(matchPush[1]) || 5;
    } else if (text.includes("ワンハンド") || text.includes("プッシュ")) {
      isPush = true;
    }

    // 4. Category keywords
    let category = "liquid_detergent";
    if (text.includes("クエン酸")) {
      category = "citric_rinse";
      if (weightBaseline) baseline = weightBaseline;
      else if (!baseline) baseline = 9.1;
    } else if (text.includes("ビーズ") || text.includes("香り付け") || text.includes("消臭ビーズ")) {
      category = "in_drum_beads";
      if (weightBaseline) baseline = weightBaseline;
      else if (!baseline) baseline = 12;
    } else if (text.includes("ジェルボール") || text.includes("スティック")) {
      category = "pods";
      baseline = 1;
    } else if (text.includes("柔軟")) {
      category = "softener";
      if (!baseline) baseline = 10;
    } else if (text.includes("漂白") || text.includes("ハイター") || text.includes("ブライト")) {
      if (text.includes("粉末") || text.includes("パウダー") || text.includes("過炭酸")) {
        category = "powder_bleach";
        if (!baseline) baseline = 10;
      } else {
        category = "liquid_bleach";
        if (!baseline) baseline = 20;
      }
    } else if (text.includes("粉末") || text.includes("スプーン")) {
      category = "powder_detergent";
      if (!baseline) baseline = 20;
    }

    // 4b. General prominent unit fallback if neither 30L nor 2kg was matched
    if (!baseline && weightBaseline) {
      baseline = weightBaseline;
    } else if (!baseline) {
      const matchGeneral = text.match(/\b(10|12|13|15|16|20|24|25|30|35|40|50)\s*(?:mL|ml|g)\b/i);
      if (matchGeneral) {
        baseline = parseFloat(matchGeneral[1]);
      }
    }

    if (!baseline) baseline = 10;

    // 5. Cap style
    let capStyle = "decimal";
    if (category === "softener" || text.includes("目盛り") || text.includes("段差")) {
      capStyle = "steps";
    } else if (category === "liquid_bleach" || category === "in_drum_beads" || text.includes("下線") || text.includes("上線")) {
      capStyle = "lines";
    } else if (category === "powder_detergent" || category === "powder_bleach" || text.includes("スプーン")) {
      capStyle = "scoop";
    }

    return {
      baseline,
      category,
      capStyle,
      isPush,
      pushG,
      name: isPush ? "Push Detergent" : "",
      rawOcrText: text
    };
  }

  async handleScannerFileUpload(e) {
    const file = e.target && e.target.files && e.target.files[0];
    if (!file) return;

    const statusText = document.getElementById("lbl-scanner-status-text");
    const isJa = this.currentLang === "ja";
    if (statusText) statusText.textContent = isJa ? "画像を読み込み中..." : "Loading image...";

    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.getElementById("scanner-canvas");
          if (!canvas) return;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }

          // 1. Try barcode detection on image first
          if (this.barcodeDetector) {
            try {
              const barcodes = await this.barcodeDetector.detect(canvas);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                this.handleBarcodeDetected(barcodes[0].rawValue);
                return;
              }
            } catch (err) {}
          }

          // 2. Fallback to OCR
          this.preprocessCanvasForOcr(canvas);
          await this.runOcrOnCanvas(canvas);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  loadTesseractScript() {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      if (typeof document === "undefined") {
        reject(new Error("Document not available"));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.async = true;
      script.onload = () => {
        if (typeof window !== "undefined") resolve(window.Tesseract);
        else resolve(null);
      };
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  openBottleBuilder(bottleToEdit = null) {
    const isJa = this.currentLang === "ja";
    const modal = document.getElementById("modal-custom-bottle");
    if (!modal) return;

    // If opened from Arsenal modal, temporarily hide Arsenal modal so user has a clean, focused view
    const basketModal = document.getElementById("modal-basket-setup");
    if (basketModal && !basketModal.classList.contains("hidden")) {
      this.wasBasketModalOpen = true;
      basketModal.classList.add("hidden");
      basketModal.classList.remove("active");
    }

    const idInput = document.getElementById("custom-edit-bottle-id");
    const nameInput = document.getElementById("custom-prod-name");
    const mlInput = document.getElementById("custom-prod-ml");
    const pushChk = document.getElementById("custom-is-push");
    const pushSubrow = document.getElementById("custom-push-subrow");
    const pushGInput = document.getElementById("custom-push-g");
    const titleEl = document.getElementById("modal-custom-title");

    if (bottleToEdit) {
      if (bottleToEdit.barcode) {
        this.showDetectedBanner(
          isJa ? `登録済みバーコード: ${bottleToEdit.barcode}` : `Saved Barcode: ${bottleToEdit.barcode}`
        );
      } else {
        this.clearDetectedBanner();
      }
      this.userHasTypedName = true;
      this.currentCapStyle = bottleToEdit.capStyle || null;
      this.customMatrixOverrides = (bottleToEdit.customMatrix && Array.isArray(bottleToEdit.customMatrix))
        ? JSON.parse(JSON.stringify(bottleToEdit.customMatrix))
        : null;
      if (idInput) idInput.value = bottleToEdit.id;
      if (titleEl) titleEl.textContent = isJa ? "洗剤ボトルの編集" : "Edit Bottle";
      if (nameInput) nameInput.value = bottleToEdit.name || "";
      if (mlInput) mlInput.value = bottleToEdit.baselineAmount || 10;

      let formType = "liquid";
      if (bottleToEdit.category === "pods" || bottleToEdit.formulaType === "unit_count") {
        formType = "pods";
      } else if (bottleToEdit.category === "in_drum_beads" || bottleToEdit.formulaType === "in_drum_beads") {
        formType = "beads";
      } else if (bottleToEdit.category === "powder_detergent" || bottleToEdit.category === "powder_bleach" || bottleToEdit.unit === "g") {
        formType = "powder";
      }

      this.selectPhysicalForm(formType, bottleToEdit.category, true);

      if (bottleToEdit.isPush) {
        if (pushChk) pushChk.checked = true;
        if (pushSubrow) pushSubrow.classList.remove("hidden");
        if (pushGInput) pushGInput.value = bottleToEdit.pushG || 5;
      } else {
        if (pushChk) pushChk.checked = false;
        if (pushSubrow) pushSubrow.classList.add("hidden");
      }
    } else {
      if (!this.detectedBottleData) {
        this.clearDetectedBanner();
      }
      this.userHasTypedName = false;
      this.currentCapStyle = null;
      this.customMatrixOverrides = null;
      if (idInput) idInput.value = "";
      if (titleEl) titleEl.textContent = isJa ? "15秒ボトル登録" : "15-Second Bottle Setup";
      if (nameInput) nameInput.value = "";

      if (pushChk) pushChk.checked = false;
      if (pushSubrow) pushSubrow.classList.add("hidden");
      if (pushGInput) pushGInput.value = 5;

      this.selectPhysicalForm("liquid", "liquid_detergent", false);
    }

    modal.classList.remove("hidden");
    modal.classList.add("active");
  }

  selectPhysicalForm(formType, targetCatId = null, isEditing = false) {
    this.builderFormType = formType;

    // Update active state on Step 1 cards & radio
    document.querySelectorAll(".form-card").forEach(c => c.classList.remove("selected"));
    const activeCard = document.getElementById("card-form-" + formType);
    if (activeCard) activeCard.classList.add("selected");
    const activeRadio = document.getElementById("form-radio-" + formType);
    if (activeRadio) activeRadio.checked = true;

    const stepCatSection = document.getElementById("form-step-category");
    const container = document.getElementById("category-chips-container");

    if (formType === "liquid") {
      if (stepCatSection) stepCatSection.classList.remove("hidden");
      const defCat = targetCatId || "liquid_detergent";
      this.renderSubcategories("liquid", defCat, isEditing);
    } else if (formType === "powder") {
      if (stepCatSection) stepCatSection.classList.remove("hidden");
      const defCat = targetCatId || "powder_detergent";
      this.renderSubcategories("powder", defCat, isEditing);
    } else if (formType === "pods") {
      if (stepCatSection) stepCatSection.classList.add("hidden");
      if (container) {
        container.innerHTML = `<input type="radio" name="custom-category" value="pods" checked class="hidden-radio">`;
      }
      this.updateCategoryBuilderUI(isEditing);
    } else if (formType === "beads") {
      if (stepCatSection) stepCatSection.classList.add("hidden");
      if (container) {
        container.innerHTML = `<input type="radio" name="custom-category" value="in_drum_beads" checked class="hidden-radio">`;
      }
      this.updateCategoryBuilderUI(isEditing);
    }
  }

  renderSubcategories(formType, activeCatId, isEditing = false) {
    const isJa = this.currentLang === "ja";
    const container = document.getElementById("category-chips-container");
    if (!container) return;

    let subcats = [];
    if (formType === "liquid") {
      subcats = [
        {
          id: "liquid_detergent",
          icon: "🧼",
          title: isJa ? "液体洗剤" : "Liquid Detergent",
          kanjiTag: "品名: 洗濯用洗剤",
          subtext: isJa ? "標準・超濃縮・プッシュ" : "Standard, Concentrated, Push"
        },
        {
          id: "softener",
          icon: "🌸",
          title: isJa ? "柔軟仕上げ剤" : "Fabric Softener",
          kanjiTag: "品名: 柔軟仕上げ剤",
          subtext: isJa ? "標準・高濃縮・消臭" : "Standard, High Scent, Deodorant"
        },
        {
          id: "liquid_bleach",
          icon: "✨",
          title: isJa ? "液体酸素系漂白剤" : "Liquid Oxygen Bleach",
          kanjiTag: "品名: 酸素系漂白剤",
          subtext: isJa ? "色柄物OK・普段の漂白" : "Color-Safe Daily Bleach"
        },
        {
          id: "citric_rinse",
          icon: "🍋",
          title: isJa ? "クエン酸消臭すすぎ剤" : "Citric Acid Rinse",
          kanjiTag: "品名: クエン酸",
          subtext: isJa ? "部屋干し臭・汗臭中和" : "Anti-Odor Rinse"
        }
      ];
    } else if (formType === "powder") {
      subcats = [
        {
          id: "powder_detergent",
          icon: "🧼",
          title: isJa ? "粉末洗剤" : "Powder Detergent",
          kanjiTag: "品名: 洗濯用合成洗剤",
          subtext: isJa ? "標準合成粉末・酵素配合" : "Standard Synthetic, Enzyme Active"
        },
        {
          id: "powder_bleach",
          icon: "✨",
          title: isJa ? "粉末酸素系漂白剤" : "Powder Oxygen Bleach",
          kanjiTag: "品名: 酸素系漂白剤",
          subtext: isJa ? "過炭酸ナトリウム・頑固な黄ばみ" : "Sodium Percarbonate, Deep Booster"
        }
      ];
    }

    container.innerHTML = subcats.map(c => {
      const isChecked = c.id === activeCatId;
      return `
        <label class="category-pill-label">
          <input type="radio" name="custom-category" value="${c.id}" ${isChecked ? "checked" : ""} class="hidden-radio">
          <div class="category-subcard ${isChecked ? "selected" : ""}" data-subcat-id="${c.id}">
            <div class="category-subcard-header">
              <span class="category-subcard-icon">${c.icon}</span>
              <span class="category-subcard-title">${c.title}</span>
            </div>
            <div class="category-subcard-footer">
              <span class="kanji-matcher-tag">${c.kanjiTag}</span>
              <span class="subcard-note-badge">${c.subtext}</span>
            </div>
          </div>
        </label>
      `;
    }).join("");

    container.querySelectorAll('input[name="custom-category"]').forEach(radio => {
      radio.addEventListener("change", () => {
        container.querySelectorAll(".category-subcard").forEach(sc => sc.classList.remove("selected"));
        const parentCard = radio.closest(".category-pill-label")?.querySelector(".category-subcard");
        if (parentCard) parentCard.classList.add("selected");
        this.updateCategoryBuilderUI(false);
      });
    });

    this.updateCategoryBuilderUI(isEditing);
  }

  updateCategoryBuilderUI(isEditing = false) {
    const isJa = this.currentLang === "ja";
    const checkedRadio = document.querySelector ? document.querySelector('input[name="custom-category"]:checked') : null;
    const catId = checkedRadio ? checkedRadio.value : "liquid_detergent";

    const catMeta = (this.data.productCategories && this.data.productCategories.find(c => c.id === catId)) || {
      id: catId,
      name: "Liquid Detergent",
      nameJa: "液体洗剤",
      icon: "🧴",
      defaultSlot: "liquid_detergent",
      slotNameEn: "Main Liquid Detergent Tray",
      slotNameJa: "液体洗剤投入口",
      unit: "mL",
      unitJa: "mL",
      defaultBaseline: 25,
      guideEn: "Look for '水30Lに対して...' on packaging back.",
      guideJa: "裏面の「水30Lに対して」を確認してください。",
      presets: [
        { labelEn: "10 mL (Ultra-Concentrated)", labelJa: "10mL（超濃縮）", value: 10 },
        { labelEn: "20 mL (Concentrated)", labelJa: "20mL（濃縮）", value: 20 },
        { labelEn: "25 mL (Standard)", labelJa: "25mL（一般）", value: 25 }
      ],
      supportsPush: catId === "liquid_detergent"
    };

    // Update Name placeholder
    const nameInput = document.getElementById("custom-prod-name");
    if (nameInput) {
      nameInput.placeholder = isJa ? (catMeta.placeholderJa || catMeta.placeholder || "") : (catMeta.placeholder || "");
    }

    // Update Baseline Label
    const baseLabel = document.getElementById("lbl-custom-baseline");
    if (baseLabel) {
      const labelText = isJa
        ? (catMeta.baselineLabelJa || `水30Lに対する使用量 (${catMeta.unitJa})`)
        : (catMeta.baselineLabelEn || `Standard Dose (${catMeta.unit})`);
      baseLabel.innerHTML = isJa
        ? `4. キャップ目盛り・基準量: <strong>${labelText}</strong>`
        : `4. Cap Calibration & Baseline: <strong>${labelText}</strong>`;
    }

    // Update Baseline Unit Label
    const unitLabel = document.getElementById("lbl-custom-unit");
    if (unitLabel) {
      if (catId === "pods") {
        unitLabel.textContent = isJa ? "個 / 1回あたり" : "count / load";
      } else if (catId === "in_drum_beads" || catId === "citric_rinse") {
        unitLabel.textContent = isJa ? `${catMeta.unitJa} / 衣料1kgあたり` : `${catMeta.unit} per 1kg laundry`;
      } else if (catId === "liquid_bleach") {
        unitLabel.textContent = isJa ? "mL（下線20mL / 上線40mL）" : "mL (Lower 20mL / Upper 40mL lines)";
      } else if (catMeta.unit === "g") {
        unitLabel.textContent = isJa ? "g / 水30Lあたり (付属スプーン)" : "g per 30L water (Measuring scoop)";
      } else {
        unitLabel.textContent = isJa ? `${catMeta.unitJa} / 水30Lあたり` : `${catMeta.unit} per 30L water (水30Lに対して)`;
      }
    }

    // Update Guide Tip
    const tipEl = document.getElementById("lbl-custom-guide-tip");
    if (tipEl) {
      tipEl.textContent = isJa ? (catMeta.guideJa || catMeta.guideEn) : (catMeta.guideEn || "");
    }

    // Update Kanji Hunter Guide
    const kanjiTargetEl = document.getElementById("lbl-kanji-target-badge");
    const kanjiTipEl = document.getElementById("lbl-kanji-hunter-tip");
    if (catMeta.kanjiHunter) {
      if (kanjiTargetEl) kanjiTargetEl.textContent = isJa ? catMeta.kanjiHunter.searchTargetJa : catMeta.kanjiHunter.searchTargetEn;
      if (kanjiTipEl) kanjiTipEl.textContent = isJa ? catMeta.kanjiHunter.locationTipJa : catMeta.kanjiHunter.locationTipEn;
    }

    // Update Cap Marking Style Selector
    const capStyleGroup = document.getElementById("custom-cap-style-group");
    const pushChk = document.getElementById("custom-is-push");
    const isPushChecked = Boolean(pushChk && pushChk.checked);
    if (capStyleGroup) {
      if (catId === "pods" || isPushChecked) {
        capStyleGroup.classList.add("hidden");
      } else {
        capStyleGroup.classList.remove("hidden");
        if (!this.currentCapStyle) {
          if (catId === "softener") this.currentCapStyle = "steps";
          else if (catId === "liquid_bleach" || catId === "in_drum_beads") this.currentCapStyle = "lines";
          else if (catId === "powder_detergent" || catId === "powder_bleach") this.currentCapStyle = "scoop";
          else this.currentCapStyle = "decimal";
        }
        document.querySelectorAll("#custom-cap-style-pills .btn-cap-style-pill").forEach(pill => {
          pill.classList.toggle("active", pill.getAttribute("data-style") === this.currentCapStyle);
        });
      }
    }

    // Update baseline value if NOT editing
    const mlInput = document.getElementById("custom-prod-ml");
    if (mlInput) {
      if (catId === "pods") {
        mlInput.value = 1;
        mlInput.disabled = true;
      } else {
        mlInput.disabled = false;
        if (!isEditing) {
          mlInput.value = catMeta.defaultBaseline || 10;
        }
      }
    }

    // Render 1-Tap Quick Fill Pills
    const pillsRow = document.getElementById("baseline-quick-pills");
    if (pillsRow) {
      pillsRow.innerHTML = "";
      if (catMeta.presets && catMeta.presets.length > 0) {
        catMeta.presets.forEach(p => {
          const pill = document.createElement("button");
          pill.type = "button";
          pill.className = "btn-preset-pill";
          pill.setAttribute("data-val", String(p.value));
          pill.textContent = isJa ? (p.labelJa || p.labelEn) : (p.labelEn || p.labelJa);
          pill.addEventListener("click", () => {
            if (mlInput) {
              mlInput.value = p.value;
              pillsRow.querySelectorAll(".btn-preset-pill").forEach(b => b.classList.remove("active"));
              pill.classList.add("active");
              this.updateSmartName();
              this.updateCapPreview();
              this.renderBackLabelMatrix();
            }
          });
          pillsRow.appendChild(pill);
        });
      }
    }

    // Push dispenser container
    const pushContainer = document.getElementById("custom-push-container");
    const pushSubrow = document.getElementById("custom-push-subrow");
    if (pushContainer) {
      if (catMeta.supportsPush) {
        pushContainer.classList.remove("hidden");
      } else {
        pushContainer.classList.add("hidden");
        if (pushChk) pushChk.checked = false;
        if (pushSubrow) pushSubrow.classList.add("hidden");
      }
    }

    // Target Slot Preview
    const slotPreview = document.getElementById("lbl-preview-slot-name");
    if (slotPreview) {
      slotPreview.textContent = isJa ? (catMeta.slotNameJa || catMeta.slotNameEn) : (catMeta.slotNameEn || catMeta.slotNameJa);
    }
    const slotIcon = document.querySelector("#custom-slot-preview .preview-slot-icon");
    if (slotIcon) {
      slotIcon.textContent = catMeta.icon || "📍";
    }

    // Auto-update smart bottle name if user hasn't typed a custom one
    if (!isEditing && !this.userHasTypedName) {
      this.updateSmartName();
    }

    // Physical Cap Calibration Preview
    this.updateCapPreview();

    // 1:1 Back-Label Matrix Mirror
    this.renderBackLabelMatrix();
  }

  updateCapPreview() {
    const isJa = this.currentLang === "ja";
    const checkedRadio = document.querySelector ? document.querySelector('input[name="custom-category"]:checked') : null;
    const catId = checkedRadio ? checkedRadio.value : "liquid_detergent";

    const mlInput = document.getElementById("custom-prod-ml");
    const baselineVal = mlInput ? parseFloat(mlInput.value) || 10 : 10;

    const pushChk = document.getElementById("custom-is-push");
    const isPush = Boolean(pushChk && pushChk.checked);
    const pushGInput = document.getElementById("custom-push-g");
    const pushG = pushGInput ? parseFloat(pushGInput.value) || 5 : 5;

    const previewCard = document.getElementById("custom-cap-preview");
    const titleEl = document.getElementById("lbl-cap-preview-title");
    const iconEl = document.getElementById("lbl-cap-preview-icon");
    const chipsContainer = document.getElementById("custom-cap-lines-chips");

    if (!previewCard || !chipsContainer) return;

    if (titleEl) {
      if (catId === "pods") {
        titleEl.textContent = isJa ? "投入個数（計量不要）:" : "Unit Count (No Measuring):";
      } else if (isPush) {
        titleEl.textContent = isJa ? "プッシュ回数目安:" : "Push Count Calibration:";
      } else if (catId === "powder_detergent" || catId === "powder_bleach") {
        titleEl.textContent = isJa ? "付属スプーン目盛り:" : "Scoop Level Calibration:";
      } else {
        titleEl.textContent = isJa ? "実物キャップ目盛り・計量ライン:" : "Physical Cap Fill Lines:";
      }
    }

    if (iconEl) {
      if (catId === "pods") iconEl.textContent = "🍬";
      else if (isPush) iconEl.textContent = "🧴";
      else if (catId === "powder_detergent" || catId === "powder_bleach") iconEl.textContent = "🥄";
      else if (catId === "in_drum_beads") iconEl.textContent = "💎";
      else iconEl.textContent = "🥛";
    }

    let chipsHtml = "";

    if (catId === "pods") {
      chipsHtml = `
        <span class="cap-line-chip highlight">${isJa ? "1個（衣料6kg以下 / 水65L以下）" : "1 Pod (≤6kg / ≤65L)"}</span>
        <span class="cap-line-chip">${isJa ? "2個（衣料6kg超 / 水65L超）" : "2 Pods (>6kg / >65L)"}</span>
        <span class="cap-line-chip danger">${isJa ? "⚠️ 洗濯槽の底（衣類の下）へ直接投入" : "⚠️ Direct in drum bottom (under clothes)"}</span>
      `;
    } else if (catId === "liquid_bleach") {
      chipsHtml = `
        <span class="cap-line-chip highlight">${isJa ? "下線 20mL（水30L・普段の漂白）" : "下線 (Lower line 20mL)"}</span>
        <span class="cap-line-chip">${isJa ? "上線 40mL（水60L・ガンコな黄ばみ）" : "上線 (Upper line 40mL)"}</span>
        <span class="cap-line-chip warning">${isJa ? "※ 分数キャップ（0.4杯等）はありません" : "※ No fractional cup markings"}</span>
      `;
    } else if (catId === "citric_rinse") {
      chipsHtml = `
        <span class="cap-line-chip">${isJa ? "0.4杯（水35L / 衣料2-3kg）" : "0.4 mark (35L / 2-3kg)"}</span>
        <span class="cap-line-chip highlight">${isJa ? "0.6杯（水45L / 衣料3-4kg）" : "0.6 mark (45L / 3-4kg)"}</span>
        <span class="cap-line-chip">${isJa ? "0.8杯（水55L / 衣料4-6kg）" : "0.8 mark (55L / 4-6kg)"}</span>
        <span class="cap-line-chip warning">${isJa ? "⚠️ 1.0の目盛り線はありません（上限0.8杯）" : "⚠️ No 1.0 line on bottle (max 0.8)"}</span>
      `;
    } else if (catId === "softener") {
      chipsHtml = `
        <span class="cap-line-chip highlight">${isJa ? "目盛り1（45L線 / 約15〜20mL）" : "目盛り1 (45L / ~15-20mL)"}</span>
        <span class="cap-line-chip">${isJa ? "目盛り2（55L線 / 約20〜25mL）" : "目盛り2 (55L / ~20-25mL)"}</span>
        <span class="cap-line-chip">${isJa ? "目盛り3（65L線 / 約25〜30mL）" : "目盛り3 (65L / ~25-30mL)"}</span>
      `;
    } else if (catId === "in_drum_beads") {
      chipsHtml = `
        <span class="cap-line-chip highlight">${isJa ? "下線 約35mL（衣料2〜4kg）" : "下線 (~35mL / 2-4kg)"}</span>
        <span class="cap-line-chip">${isJa ? "上線 約55mL（衣料5〜7kg）" : "上線 (~55mL / 5-7kg)"}</span>
        <span class="cap-line-chip danger">${isJa ? "⚠️ 洗濯槽の底（衣類の下）へ直接投入" : "⚠️ Direct in drum bottom (under clothes)"}</span>
      `;
    } else if (catId === "powder_detergent" || catId === "powder_bleach") {
      chipsHtml = `
        <span class="cap-line-chip">${isJa ? "0.3杯 (約10〜15g)" : "0.3 scoop (~10-15g)"}</span>
        <span class="cap-line-chip">${isJa ? "0.6杯 (約20〜25g)" : "0.6 scoop (~20-25g)"}</span>
        <span class="cap-line-chip highlight">${isJa ? "0.8杯 (約30g)" : "0.8 scoop (~30g)"}</span>
        <span class="cap-line-chip">${isJa ? "すりきり1杯 (満量)" : "すりきり1杯 (Level Full Scoop)"}</span>
      `;
    } else {
      // liquid_detergent
      if (isPush) {
        chipsHtml = `
          <span class="cap-line-chip highlight">${isJa ? `1回 = ${pushG}g` : `1 push = ${pushG}g`}</span>
          <span class="cap-line-chip">${isJa ? "2プッシュ (約30L)" : "2 pushes (~30L)"}</span>
          <span class="cap-line-chip">${isJa ? "3プッシュ (約45L)" : "3 pushes (~45L)"}</span>
          <span class="cap-line-chip">${isJa ? "4プッシュ (約55L+)" : "4 pushes (~55L+)"}</span>
        `;
      } else if (baselineVal <= 12) {
        // Ultra concentrated (10mL baseline)
        chipsHtml = `
          <span class="cap-line-chip highlight">${isJa ? "0.4杯 (10mL / 30L線)" : "0.4 mark (10mL / 30L)"}</span>
          <span class="cap-line-chip">${isJa ? "0.6杯 (15mL / 45L線)" : "0.6 mark (15mL / 45L)"}</span>
          <span class="cap-line-chip">${isJa ? "0.8杯 (20mL / 55L線)" : "0.8 mark (20mL / 55L)"}</span>
          <span class="cap-line-chip">${isJa ? "1杯 (25mL / 65L線・満量)" : "1.0 mark (25mL / 65L)"}</span>
        `;
      } else if (baselineVal <= 22) {
        // Concentrated (20mL baseline)
        chipsHtml = `
          <span class="cap-line-chip highlight">${isJa ? "0.4杯 (約16mL / 30L)" : "0.4 mark (~16mL / 30L)"}</span>
          <span class="cap-line-chip">${isJa ? "0.6〜0.7杯 (約25mL / 45L)" : "0.6-0.7 mark (~25mL / 45L)"}</span>
          <span class="cap-line-chip">${isJa ? "0.8杯 (約33mL / 55L)" : "0.8 mark (~33mL / 55L)"}</span>
          <span class="cap-line-chip">${isJa ? "1杯 (約40mL / 65L)" : "1.0 mark (~40mL / 65L)"}</span>
        `;
      } else {
        // Standard (25mL baseline)
        chipsHtml = `
          <span class="cap-line-chip highlight">${isJa ? "0.4杯 (約20mL / 30L)" : "0.4 mark (~20mL / 30L)"}</span>
          <span class="cap-line-chip">${isJa ? "0.6杯 (約30mL / 45L)" : "0.6 mark (~30mL / 45L)"}</span>
          <span class="cap-line-chip">${isJa ? "0.8杯 (約40mL / 55L)" : "0.8 mark (~40mL / 55L)"}</span>
          <span class="cap-line-chip">${isJa ? "1杯 (約50mL / 65L)" : "1.0 mark (~50mL / 65L)"}</span>
        `;
      }
    }

    chipsContainer.innerHTML = chipsHtml;
  }

  renderBackLabelMatrix() {
    const isJa = this.currentLang === "ja";
    const tbody = document.getElementById("label-matrix-tbody");
    if (!tbody) return [];

    const checkedRadio = document.querySelector ? document.querySelector('input[name="custom-category"]:checked') : null;
    const catId = checkedRadio ? checkedRadio.value : "liquid_detergent";

    const mlInput = document.getElementById("custom-prod-ml");
    const baselineVal = mlInput ? parseFloat(mlInput.value) || 10 : 10;

    const pushChk = document.getElementById("custom-is-push");
    const isPush = Boolean(pushChk && pushChk.checked);
    const pushGInput = document.getElementById("custom-push-g");
    const pushG = pushGInput ? parseFloat(pushGInput.value) || 5 : 5;

    let capStyle = this.currentCapStyle;
    if (!capStyle) {
      if (catId === "softener") capStyle = "steps";
      else if (catId === "liquid_bleach" || catId === "in_drum_beads") capStyle = "lines";
      else if (catId === "powder_detergent" || catId === "powder_bleach") capStyle = "scoop";
      else capStyle = "decimal";
    }

    const standardLoads = [
      { kg: 2.0, waterL: 30, tagJa: "少量", tagEn: "Light" },
      { kg: 4.0, waterL: 45, tagJa: "中量", tagEn: "Med" },
      { kg: 5.0, waterL: 55, tagJa: "普段", tagEn: "Daily" },
      { kg: 6.0, waterL: 65, tagJa: "満量", tagEn: "Full" }
    ];

    let rows = [];

    if (this.customMatrixOverrides && Array.isArray(this.customMatrixOverrides) && this.customMatrixOverrides.length === 4) {
      rows = this.customMatrixOverrides.map((r, idx) => ({
        kg: r.kg !== undefined ? r.kg : standardLoads[idx].kg,
        waterL: r.waterL !== undefined ? r.waterL : standardLoads[idx].waterL,
        tagJa: r.tagJa || standardLoads[idx].tagJa,
        tagEn: r.tagEn || standardLoads[idx].tagEn,
        amount: r.amount !== undefined ? r.amount : 0,
        unit: r.unit || (catId === "pods" ? (isJa ? "個" : "Pod") : (catId.startsWith("powder") ? "g" : (isPush ? (isJa ? "プッシュ" : "pushes") : "mL"))),
        capJa: r.capJa || r.cap || "",
        capEn: r.capEn || r.cap || ""
      }));
    } else {
      rows = standardLoads.map(load => {
        let amount = 0;
        let unit = "mL";
        let capJa = "";
        let capEn = "";

        if (catId === "pods") {
          amount = 1;
          unit = isJa ? "個" : "Pod";
          capJa = "1個（水65L以下）";
          capEn = "1 Pod (≤65L)";
        } else if (isPush) {
          const targetAmount = (load.waterL / 30) * baselineVal;
          const pushCount = Math.max(1, Math.round(targetAmount / pushG));
          amount = pushCount;
          unit = isJa ? "プッシュ" : (pushCount > 1 ? "pushes" : "push");
          const estG = Math.round(pushCount * pushG);
          capJa = `${pushCount}プッシュ (約${estG}g)`;
          capEn = `${pushCount} pushes (~${estG}g)`;
        } else if (catId === "powder_detergent" || catId === "powder_bleach") {
          const exactG = Math.round((load.waterL / 30) * baselineVal);
          amount = exactG;
          unit = "g";
          if (capStyle === "scoop") {
            if (load.waterL <= 30) {
              capJa = "0.4スプーン"; capEn = "0.4 Scoop";
            } else if (load.waterL <= 45) {
              capJa = "0.6スプーン"; capEn = "0.6 Scoop";
            } else if (load.waterL <= 55) {
              capJa = "0.8スプーン"; capEn = "0.8 Scoop";
            } else {
              capJa = "すりきり1杯"; capEn = "1.0 Level Scoop";
            }
          } else if (capStyle === "lines") {
            if (load.waterL <= 30) { capJa = "下線"; capEn = "Lower line"; }
            else if (load.waterL <= 45) { capJa = "下線強"; capEn = "Above lower"; }
            else if (load.waterL <= 55) { capJa = "中間線"; capEn = "Between lines"; }
            else { capJa = "上線"; capEn = "Upper line"; }
          } else if (capStyle === "steps") {
            if (load.waterL <= 30) { capJa = "目盛り1未満"; capEn = "Below step 1"; }
            else if (load.waterL <= 45) { capJa = "目盛り1"; capEn = "Step 1"; }
            else if (load.waterL <= 55) { capJa = "目盛り2"; capEn = "Step 2"; }
            else { capJa = "目盛り3"; capEn = "Step 3"; }
          } else {
            if (load.waterL <= 30) { capJa = "0.4杯"; capEn = "0.4 mark"; }
            else if (load.waterL <= 45) { capJa = "0.6杯"; capEn = "0.6 mark"; }
            else if (load.waterL <= 55) { capJa = "0.8杯"; capEn = "0.8 mark"; }
            else { capJa = "1.0杯"; capEn = "1.0 mark"; }
          }
        } else if (catId === "in_drum_beads") {
          const exactMl = Math.max(15, Math.round(load.kg * baselineVal));
          amount = exactMl;
          unit = "mL";
          if (load.kg <= 2.0) {
            capJa = "下線弱 (~24mL)"; capEn = "Below Lower Line (~24mL)";
          } else if (load.kg <= 4.0) {
            capJa = "下線 (~48mL)"; capEn = "Lower Line (~48mL)";
          } else if (load.kg <= 5.0) {
            capJa = "下線〜上線中間 (~60mL)"; capEn = "Between Lines (~60mL)";
          } else {
            capJa = "上線満量 (~72mL)"; capEn = "Upper Line (~72mL)";
          }
        } else if (catId === "citric_rinse") {
          const rawMl = Math.max(10, Math.round(load.kg * baselineVal));
          amount = Math.min(45, rawMl);
          unit = "mL";
          if (load.kg <= 2.0) {
            capJa = "0.4杯弱 (約18mL)"; capEn = "0.4 Cap weak (~18mL)";
          } else if (load.kg <= 4.0) {
            capJa = "0.6杯 (約36mL)"; capEn = "0.6 Cap (~36mL)";
          } else if (load.kg <= 5.0) {
            capJa = "0.8杯 (約45mL・上限)"; capEn = "0.8 Cap (~45mL / Max Mark)";
          } else {
            capJa = "0.8杯 (約45mL・上限)"; capEn = "0.8 Cap (~45mL / Max Mark)";
          }
        } else if (catId === "liquid_bleach") {
          unit = "mL";
          if (load.waterL <= 30) {
            amount = Math.round(baselineVal);
            capJa = "下線 20mL"; capEn = "Lower Line 20mL";
          } else if (load.waterL <= 45) {
            amount = Math.round(baselineVal * 1.5);
            capJa = "下線強 (~30mL)"; capEn = "Above Lower Line (~30mL)";
          } else if (load.waterL <= 55) {
            amount = Math.round(baselineVal * (55 / 30));
            capJa = "下線と上線の間 (~35mL)"; capEn = "Between Lines (~35mL)";
          } else {
            amount = Math.round(baselineVal * 2);
            capJa = "上線 40mL"; capEn = "Upper Line 40mL";
          }
        } else if (catId === "softener") {
          const exactMl = Math.round((load.waterL / 30) * baselineVal);
          amount = exactMl;
          unit = "mL";
          if (capStyle === "steps") {
            if (load.waterL <= 30) { capJa = "目盛り1未満"; capEn = "Below Step 1"; }
            else if (load.waterL <= 45) { capJa = "目盛り1 (45L線)"; capEn = "Step 1 (45L)"; }
            else if (load.waterL <= 55) { capJa = "目盛り2 (55L線)"; capEn = "Step 2 (55L)"; }
            else { capJa = "目盛り3 (65L線)"; capEn = "Step 3 (65L)"; }
          } else if (capStyle === "lines") {
            if (load.waterL <= 30) { capJa = "下線"; capEn = "Lower line"; }
            else if (load.waterL <= 45) { capJa = "下線強"; capEn = "Mid line"; }
            else if (load.waterL <= 55) { capJa = "中間線"; capEn = "Between lines"; }
            else { capJa = "上線"; capEn = "Upper line"; }
          } else {
            if (load.waterL <= 30) { capJa = "0.4杯"; capEn = "0.4 Cap"; }
            else if (load.waterL <= 45) { capJa = "0.6杯"; capEn = "0.6 Cap"; }
            else if (load.waterL <= 55) { capJa = "0.8杯"; capEn = "0.8 Cap"; }
            else { capJa = "1.0杯"; capEn = "1.0 Cap"; }
          }
        } else {
          // Default liquid detergent
          const exactMl = Math.round((load.waterL / 30) * baselineVal);
          amount = exactMl;
          unit = "mL";
          if (capStyle === "steps") {
            if (load.waterL <= 30) { capJa = `目盛り1未満 (${exactMl}mL)`; capEn = `Below Step 1 (${exactMl}mL)`; }
            else if (load.waterL <= 45) { capJa = `目盛り1 (${exactMl}mL)`; capEn = `Step 1 (${exactMl}mL)`; }
            else if (load.waterL <= 55) { capJa = `目盛り2 (${exactMl}mL)`; capEn = `Step 2 (${exactMl}mL)`; }
            else { capJa = `目盛り3 (${exactMl}mL)`; capEn = `Step 3 (${exactMl}mL)`; }
          } else if (capStyle === "lines") {
            if (load.waterL <= 30) { capJa = `下線 (${exactMl}mL)`; capEn = `Lower Line (${exactMl}mL)`; }
            else if (load.waterL <= 45) { capJa = `下線強 (${exactMl}mL)`; capEn = `Above Lower (${exactMl}mL)`; }
            else if (load.waterL <= 55) { capJa = `中間線 (${exactMl}mL)`; capEn = `Between Lines (${exactMl}mL)`; }
            else { capJa = `上線 (${exactMl}mL)`; capEn = `Upper Line (${exactMl}mL)`; }
          } else if (capStyle === "scoop") {
            if (load.waterL <= 30) { capJa = `0.4スプーン (${exactMl}mL)`; capEn = `0.4 Scoop (${exactMl}mL)`; }
            else if (load.waterL <= 45) { capJa = `0.6スプーン (${exactMl}mL)`; capEn = `0.6 Scoop (${exactMl}mL)`; }
            else if (load.waterL <= 55) { capJa = `0.8スプーン (${exactMl}mL)`; capEn = `0.8 Scoop (${exactMl}mL)`; }
            else { capJa = `すりきり1杯 (${exactMl}mL)`; capEn = `1.0 Scoop (${exactMl}mL)`; }
          } else {
            // Decimal
            if (load.waterL <= 30) { capJa = `0.4杯 (${exactMl}mL / 30L線)`; capEn = `0.4 Cap (${exactMl}mL / 30L)`; }
            else if (load.waterL <= 45) { capJa = `0.6杯 (${exactMl}mL / 45L線)`; capEn = `0.6 Cap (${exactMl}mL / 45L)`; }
            else if (load.waterL <= 55) { capJa = `0.8杯 (${exactMl}mL / 55L線)`; capEn = `0.8 Cap (${exactMl}mL / 55L)`; }
            else { capJa = `1.0杯 (${exactMl}mL / 65L線・満量)`; capEn = `1.0 Cap (${exactMl}mL / 65L)`; }
          }
        }

        return {
          kg: load.kg,
          waterL: load.waterL,
          tagJa: load.tagJa,
          tagEn: load.tagEn,
          amount: amount,
          unit: unit,
          capJa: capJa,
          capEn: capEn
        };
      });
    }

    // Render table rows
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="matrix-cell-load">
          <span class="matrix-load-kg">${r.kg.toFixed(1)} kg</span>
          <span class="matrix-load-tag">${isJa ? r.tagJa : r.tagEn}</span>
        </td>
        <td class="matrix-cell-water">${r.waterL} L</td>
        <td class="matrix-cell-cap">${isJa ? r.capJa : r.capEn}</td>
        <td class="matrix-cell-amount"><strong>${r.amount}</strong> <span class="matrix-unit">${r.unit}</span></td>
      </tr>
    `).join("");

    // Populate fine-tune inputs grid
    const tuneGrid = document.getElementById("matrix-tune-inputs-grid");
    if (tuneGrid) {
      tuneGrid.innerHTML = rows.map((r, i) => `
        <div class="tune-row" data-index="${i}">
          <div class="tune-load-label">${r.kg.toFixed(1)}kg (${r.waterL}L)</div>
          <div class="tune-field-group">
            <label class="tune-field-label">${isJa ? "キャップ表示" : "Cap Mark"}:</label>
            <input type="text" class="tune-input tune-input-cap" data-index="${i}" value="${isJa ? (r.capJa || "") : (r.capEn || "")}">
          </div>
          <div class="tune-field-group">
            <label class="tune-field-label">${isJa ? "実量" : "Dose"}:</label>
            <div class="tune-amount-wrap">
              <input type="number" class="tune-input tune-input-amount" data-index="${i}" value="${r.amount}" step="any" min="0">
              <span class="tune-unit">${r.unit}</span>
            </div>
          </div>
        </div>
      `).join("");

      tuneGrid.querySelectorAll(".tune-input").forEach(inp => {
        inp.addEventListener("input", () => {
          this.collectMatrixOverridesFromTuneGrid(rows);
        });
      });
    }

    // Siphon Safety Alert: check max dose
    const safetyAlert = document.getElementById("dispenser-safety-alert");
    if (safetyAlert) {
      const maxAmount = Math.max(...rows.map(r => Number(r.amount) || 0));
      const isSoftenerOrCitric = catId === "softener" || catId === "citric_rinse";
      if (isSoftenerOrCitric && maxAmount > 45) {
        safetyAlert.classList.remove("hidden");
      } else {
        safetyAlert.classList.add("hidden");
      }
    }

    return rows;
  }

  collectMatrixOverridesFromTuneGrid(baseRows) {
    const tuneGrid = document.getElementById("matrix-tune-inputs-grid");
    if (!tuneGrid) return;

    const isJa = this.currentLang === "ja";
    const tbody = document.getElementById("label-matrix-tbody");
    const checkedRadio = document.querySelector ? document.querySelector('input[name="custom-category"]:checked') : null;
    const catId = checkedRadio ? checkedRadio.value : "liquid_detergent";

    const updatedRows = [];
    const rowEls = tuneGrid.querySelectorAll(".tune-row");
    rowEls.forEach((el, idx) => {
      const base = (baseRows && baseRows[idx]) || {};
      const capInput = el.querySelector(".tune-input-cap");
      const amtInput = el.querySelector(".tune-input-amount");
      const capVal = capInput ? capInput.value.trim() : (isJa ? base.capJa : base.capEn);
      const amtVal = amtInput ? parseFloat(amtInput.value) || 0 : (base.amount || 0);

      updatedRows.push({
        kg: base.kg !== undefined ? base.kg : [2.0, 4.0, 5.0, 6.0][idx],
        waterL: base.waterL !== undefined ? base.waterL : [30, 45, 55, 65][idx],
        tagJa: base.tagJa || ["少量", "中量", "普段", "満量"][idx],
        tagEn: base.tagEn || ["Light", "Med", "Daily", "Full"][idx],
        amount: amtVal,
        unit: base.unit || "mL",
        cap: capVal,
        capJa: isJa ? capVal : (base.capJa || capVal),
        capEn: !isJa ? capVal : (base.capEn || capVal)
      });
    });

    this.customMatrixOverrides = updatedRows;

    // Update table body live
    if (tbody) {
      tbody.innerHTML = updatedRows.map(r => `
        <tr>
          <td class="matrix-cell-load">
            <span class="matrix-load-kg">${r.kg.toFixed(1)} kg</span>
            <span class="matrix-load-tag">${isJa ? r.tagJa : r.tagEn}</span>
          </td>
          <td class="matrix-cell-water">${r.waterL} L</td>
          <td class="matrix-cell-cap">${isJa ? r.capJa : r.capEn}</td>
          <td class="matrix-cell-amount"><strong>${r.amount}</strong> <span class="matrix-unit">${r.unit}</span></td>
        </tr>
      `).join("");
    }

    // Safety Alert
    const safetyAlert = document.getElementById("dispenser-safety-alert");
    if (safetyAlert) {
      const maxAmount = Math.max(...updatedRows.map(r => Number(r.amount) || 0));
      const isSoftenerOrCitric = catId === "softener" || catId === "citric_rinse";
      if (isSoftenerOrCitric && maxAmount > 45) {
        safetyAlert.classList.remove("hidden");
      } else {
        safetyAlert.classList.add("hidden");
      }
    }
  }

  updateSmartName() {
    if (this.userHasTypedName) return;
    const nameInput = document.getElementById("custom-prod-name");
    if (!nameInput) return;

    const checkedRadio = document.querySelector('input[name="custom-category"]:checked');
    const catId = checkedRadio ? checkedRadio.value : "liquid_detergent";
    const mlInput = document.getElementById("custom-prod-ml");
    const baselineVal = mlInput ? parseFloat(mlInput.value) || 10 : 10;

    const pushChk = document.getElementById("custom-is-push");
    const isPush = Boolean(pushChk && pushChk.checked);
    const pushGInput = document.getElementById("custom-push-g");
    const pushG = pushGInput ? parseFloat(pushGInput.value) || 5 : 5;

    nameInput.value = this.getSmartBottleName(catId, baselineVal, isPush, pushG);
  }

  getSmartBottleName(catId, baselineVal, isPush, pushG) {
    const isJa = this.currentLang === "ja";
    if (catId === "pods") {
      return isJa ? "ジェルボール洗剤" : "Gelball Pods / Sticks";
    }
    if (catId === "in_drum_beads") {
      return isJa ? "消臭・香り付けビーズ" : "Scent Booster Beads";
    }
    if (catId === "citric_rinse") {
      return isJa ? "クエン酸消臭すすぎ剤" : "Citric Acid Deodorant Rinse";
    }
    if (catId === "powder_detergent") {
      return isJa ? `粉末洗剤 (${baselineVal}g)` : `Powder Detergent (${baselineVal}g)`;
    }
    if (catId === "powder_bleach") {
      return isJa ? `粉末酸素系漂白剤 (${baselineVal}g)` : `Oxygen Bleach Powder (${baselineVal}g)`;
    }
    if (catId === "liquid_bleach") {
      return isJa ? `液体酸素系漂白剤 (${baselineVal}mL)` : `Oxygen Bleach Liquid (${baselineVal}mL)`;
    }
    if (catId === "softener") {
      return isJa ? `柔軟剤 (${baselineVal}mL)` : `Fabric Softener (${baselineVal}mL)`;
    }
    // liquid_detergent
    if (isPush) {
      return isJa ? `プッシュ式液体洗剤 (${pushG}g/回)` : `Push Liquid Detergent (${pushG}g/push)`;
    }
    if (baselineVal <= 10) {
      return isJa ? `超濃縮液体洗剤 (${baselineVal}mL)` : `Ultra-Concentrate Detergent (${baselineVal}mL)`;
    }
    return isJa ? `液体洗剤 (${baselineVal}mL)` : `Liquid Detergent (${baselineVal}mL)`;
  }

  saveBottleFromBuilder() {
    const isJa = this.currentLang === "ja";
    const editIdInput = document.getElementById("custom-edit-bottle-id");
    const editId = editIdInput ? editIdInput.value.trim() : "";

    const checkedRadio = document.querySelector('input[name="custom-category"]:checked');
    const catId = checkedRadio ? checkedRadio.value : "liquid_detergent";

    const catMeta = (this.data.productCategories && this.data.productCategories.find(c => c.id === catId)) || {
      id: catId,
      name: "Liquid Detergent",
      nameJa: "液体洗剤",
      icon: "🧴",
      defaultSlot: "liquid_detergent",
      slotNameEn: "Main Liquid Detergent Tray",
      slotNameJa: "液体洗剤投入口",
      unit: "mL",
      unitJa: "mL",
      defaultBaseline: 25,
      supportsPush: catId === "liquid_detergent"
    };

    const nameEl = document.getElementById("custom-prod-name");
    const rawName = nameEl ? nameEl.value.trim() : "";

    const mlEl = document.getElementById("custom-prod-ml");
    const rawMl = mlEl ? parseFloat(mlEl.value) : NaN;
    const baselineVal = (!isNaN(rawMl) && rawMl > 0) ? rawMl : (catMeta.defaultBaseline || 10);

    const pushChk = document.getElementById("custom-is-push");
    const isPush = Boolean(catMeta.supportsPush && pushChk && pushChk.checked);

    const pushGEl = document.getElementById("custom-push-g");
    const rawPushG = pushGEl ? parseFloat(pushGEl.value) : NaN;
    const pushG = (!isNaN(rawPushG) && rawPushG > 0) ? rawPushG : 5;

    // Standard dose texts
    let doseText = "";
    let doseTextJa = "";
    if (catId === "pods") {
      doseText = "1 unit ≤6kg, 2 units >6kg";
      doseTextJa = "6kg以下は1個、6kg超は2個";
    } else if (isPush) {
      doseText = `${baselineVal} mL / 30L (${pushG}g/push)`;
      doseTextJa = `水30Lに対し${baselineVal}mL（1プッシュ${pushG}g）`;
    } else if (catMeta.unit === "g") {
      doseText = `${baselineVal} g / 30L`;
      doseTextJa = `水30Lに対し${baselineVal}g`;
    } else if (catId === "in_drum_beads" || catId === "citric_rinse") {
      doseText = `${baselineVal} mL per 1kg`;
      doseTextJa = `衣料1kgに対し${baselineVal}mL`;
    } else {
      doseText = `${baselineVal} mL / 30L`;
      doseTextJa = `水30Lに対し${baselineVal}mL`;
    }

    const defaultName = rawName || this.getSmartBottleName(catId, baselineVal, isPush, pushG);

    const bottleId = editId || ("bottle_" + Date.now());

    let formulaType = "liquid_per_30l";
    if (catId === "pods") formulaType = "unit_count";
    else if (catMeta.unit === "g") formulaType = "powder_per_30l";
    else if (isPush) formulaType = "liquid_push";
    else if (catId === "in_drum_beads") formulaType = "in_drum_beads";
    else if (catId === "citric_rinse") formulaType = "citric_rinse";

    const existingBottle = editId ? this.userBottles.find(b => b.id === editId) : null;
    const barcodeVal = (this.detectedBottleData && this.detectedBottleData.barcode)
      ? this.detectedBottleData.barcode
      : (existingBottle && existingBottle.barcode ? existingBottle.barcode : undefined);

    const bottleObj = {
      id: bottleId,
      name: defaultName,
      nameJa: defaultName,
      category: catId,
      formulaType: formulaType,
      unit: catMeta.unit,
      unitJa: catMeta.unitJa,
      baselineAmount: baselineVal,
      standardDoseText: doseText,
      standardDoseTextJa: doseTextJa,
      defaultSlot: catMeta.defaultSlot,
      slotNameEn: catMeta.slotNameEn,
      slotNameJa: catMeta.slotNameJa,
      icon: catMeta.icon,
      isPush: isPush,
      pushG: isPush ? pushG : null,
      capStyle: this.currentCapStyle || undefined,
      customMatrix: (this.customMatrixOverrides && this.customMatrixOverrides.length > 0) ? this.customMatrixOverrides : undefined,
      barcode: barcodeVal,
      isActive: true,
      instructionsEn: catMeta.guideEn || "",
      instructionsJa: catMeta.guideJa || ""
    };

    if (editId) {
      const idx = this.userBottles.findIndex(b => b.id === editId);
      if (idx !== -1) {
        bottleObj.isActive = this.userBottles[idx].isActive !== false;
        this.userBottles[idx] = bottleObj;
      } else {
        this.userBottles.push(bottleObj);
      }
    } else {
      // Mutual exclusion when adding softener vs citric acid
      if (catId === "citric_rinse") {
        this.userBottles.forEach(b => {
          if (b.category === "softener") b.isActive = false;
        });
      } else if (catId === "softener") {
        this.userBottles.forEach(b => {
          if (b.category === "citric_rinse") b.isActive = false;
        });
      }
      this.userBottles.push(bottleObj);
    }

    if (bottleObj.barcode) {
      this.saveUserBarcode(bottleObj.barcode, {
        name: bottleObj.name,
        nameJa: bottleObj.nameJa,
        category: bottleObj.category,
        baseline: bottleObj.baselineAmount,
        isPush: bottleObj.isPush,
        pushG: bottleObj.pushG,
        capStyle: bottleObj.capStyle
      });
    }
    this.detectedBottleData = null;
    this.clearDetectedBanner();

    this.saveUserBottles();

    // Close modal
    const modal = document.getElementById("modal-custom-bottle");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("active");
    }

    if (this.wasBasketModalOpen) {
      const basketModal = document.getElementById("modal-basket-setup");
      if (basketModal) {
        basketModal.classList.remove("hidden");
        basketModal.classList.add("active");
      }
      this.wasBasketModalOpen = false;
    }

    this.renderUserArsenal();
    this.updatePreDrumBox();
    this.updateDosageView();
    this.renderDrawerSvg();
  }

  deleteBottle(id) {
    const isJa = this.currentLang === "ja";
    const bottle = this.getBottleById(id);
    if (!bottle) return;

    if (typeof window !== "undefined" && typeof window.confirm === "function") {
      const msg = isJa ? `「${bottle.name}」を削除してもよろしいですか？` : `Are you sure you want to remove "${bottle.name}"?`;
      if (!window.confirm(msg)) return;
    }

    this.userBottles = this.userBottles.filter(b => b.id !== id);
    this.saveUserBottles();
    this.renderUserArsenal();
    this.updatePreDrumBox();
    this.updateDosageView();
    this.renderDrawerSvg();
  }

  calculateDoseForProduct(prod, readingObj) {
    const isJa = this.currentLang === "ja";
    const waterL = (readingObj && readingObj.waterEstL) || 30;

    // Parse dry laundry weight in kg
    let kg = 2.0;
    if (readingObj && readingObj.drumKg) {
      const match = String(readingObj.drumKg).match(/([\d\.]+)/);
      if (match) kg = parseFloat(match[1]);
    }

    // 0. Ground-Truth Custom Matrix Overrides
    if (prod.customMatrix && Array.isArray(prod.customMatrix) && prod.customMatrix.length > 0) {
      let bestRow = prod.customMatrix[0];
      let minDiff = Infinity;
      prod.customMatrix.forEach(r => {
        const rowWater = Number(r.waterL) || 30;
        const diff = Math.abs(rowWater - waterL);
        if (diff < minDiff) {
          minDiff = diff;
          bestRow = r;
        }
      });
      if (bestRow) {
        const unitStr = bestRow.unit || prod.unit || "mL";
        const capEnStr = bestRow.capEn || bestRow.cap || `${bestRow.amount} ${unitStr}`;
        const capJaStr = bestRow.capJa || bestRow.cap || `${bestRow.amount}${unitStr}`;
        return {
          amount: bestRow.amount,
          unit: unitStr,
          displayAmount: `${bestRow.amount} ${unitStr}`,
          capEn: capEnStr,
          capJa: capJaStr,
          noteEn: `Custom Matrix (${waterL}L / ~${kg}kg)`,
          noteJa: `個別設定マトリクス（${waterL}L / 約${kg}kg）`,
          isUnit: prod.category === "pods" || prod.formulaType === "unit_count",
          isPush: Boolean(prod.isPush)
        };
      }
    }

    // 1. Soluble Pods or Solid Sticks (Unit count)
    if (prod.formulaType === "unit_count" || prod.category === "pods") {
      const isHighLoad = waterL > 65 || kg > 6.0;
      const count = isHighLoad ? 2 : 1;
      const unit = isJa ? "個" : (count > 1 ? "Pods" : "Pod");
      return {
        amount: count,
        unit: unit,
        displayAmount: `${count} ${unit}`,
        capEn: `${count} ${unit} (Direct in drum bottom)`,
        capJa: `${count}${unit}（洗濯槽の底へ直接ポン）`,
        noteEn: count === 1 ? "Standard load (30-65L / ≤6kg)" : "Large load (>65L / >6kg)",
        noteJa: count === 1 ? "標準（30L〜65L / 6kg以下）" : "大容量（65L超 / 6kg超）",
        isUnit: true,
        isPush: false
      };
    }

    // 2. Powder Detergent & Powder Bleach (Measuring scoop fractions)
    if (prod.formulaType === "powder_per_30l" || prod.unit === "g") {
      const gPer30 = prod.baselineAmount || prod.gPer30L || 20;
      const exactG = Math.round((waterL / 30) * gPer30);
      let scoopEn = "0.4 Scoop";
      let scoopJa = "0.4スプーン";
      if (waterL <= 24 || exactG <= 12) {
        scoopEn = "0.3 Scoop (~12g)";
        scoopJa = "0.3スプーン (約12g)";
      } else if (waterL <= 35 || exactG <= 22) {
        scoopEn = "0.4 Scoop (~20g)";
        scoopJa = "0.4スプーン (約20g)";
      } else if (waterL <= 48 || exactG <= 32) {
        scoopEn = "0.6 Scoop (~30g)";
        scoopJa = "0.6スプーン (約30g)";
      } else if (waterL <= 58 || exactG <= 40) {
        scoopEn = "0.8 Scoop (~35g)";
        scoopJa = "0.8スプーン (約35g)";
      } else {
        scoopEn = "1.0 Level Scoop (~45g)";
        scoopJa = "すりきり1杯 (約45g)";
      }
      return {
        amount: exactG,
        unit: "g",
        displayAmount: `${exactG} g`,
        capEn: `${exactG} g (${scoopEn})`,
        capJa: `${exactG}g (${scoopJa})`,
        noteEn: `${gPer30}g/30L baseline (${scoopEn})`,
        noteJa: `水30Lに対し${gPer30}g基準 (${scoopJa})`,
        isUnit: false,
        isPush: false
      };
    }

    // 3. In-drum Scent/Deodorant Beads (Inner cap line markings)
    if (prod.formulaType === "in_drum_beads" || prod.category === "in_drum_beads" || prod.type === "in_drum_beads") {
      const mlPerKg = prod.baselineAmount || prod.mlPerKg || 12;
      const exactMl = Math.max(15, Math.round(kg * mlPerKg));
      let capEn = `~${exactMl} mL`;
      let capJa = `約${exactMl}mL`;
      if (kg <= 2.0) {
        capEn = `Below Lower Line (~15-20 mL)`;
        capJa = `キャップ下線より少なめ (~15-20mL)`;
      } else if (kg <= 3.5) {
        capEn = `Lower Line (~25-35 mL)`;
        capJa = `キャップ下線 (~25-35mL)`;
      } else if (kg <= 5.0) {
        capEn = `Between Lower & Upper Lines (~40-50 mL)`;
        capJa = `下線〜上線中間 (~40-50mL)`;
      } else {
        capEn = `Upper Line (~55-65 mL)`;
        capJa = `キャップ上線満量 (55-65mL)`;
      }
      return {
        amount: exactMl,
        unit: "mL",
        displayAmount: `${exactMl} mL`,
        capEn: capEn,
        capJa: capJa,
        noteEn: `~${kg}kg clothes (${mlPerKg}mL/kg — Direct in drum)`,
        noteJa: `衣料約${kg}kg（1kgあたり${mlPerKg}mL・洗濯槽へ直接）`,
        isUnit: false,
        isPush: false
      };
    }

    // 4. Push Bottle (Attack ZERO / NANOX Push / Custom Push)
    if (prod.isPush || prod.formulaType === "liquid_push") {
      const pushG = prod.pushG || 5;
      const mlPer30 = prod.baselineAmount || prod.mlPer30L || 10;
      const targetAmount = (waterL / 30) * mlPer30;
      const pushCount = Math.max(1, Math.round(targetAmount / pushG));
      const estG = Math.round(pushCount * pushG);
      return {
        amount: pushCount,
        unit: isJa ? "プッシュ" : (pushCount > 1 ? "pushes" : "push"),
        displayAmount: `${pushCount} ${isJa ? 'プッシュ' : (pushCount > 1 ? 'pushes' : 'push')} (~${estG}g)`,
        capEn: `${pushCount} pushes (~${estG}g)`,
        capJa: `${pushCount}プッシュ (約${estG}g)`,
        noteEn: `${mlPer30}mL/30L baseline (${pushG}g/push)`,
        noteJa: `基準量${mlPer30}mL（1プッシュ約${pushG}g）`,
        isUnit: false,
        isPush: true
      };
    }

    // 5. Citric Acid Rinse (Renoa Citric Acid: 0.4 / 0.6 / 0.8 cap lines, NO 1.0 line)
    if (prod.category === "citric_rinse" || prod.formulaType === "citric_rinse" || prod.isCitricAcid) {
      const mlPerKg = prod.baselineAmount || prod.mlPerKg || 9.1;
      const rawMl = Math.max(10, Math.round(kg * mlPerKg));
      const exactMl = Math.min(50, rawMl); // Softener dispenser tray max capacity is 50-55 mL
      let capEn = "";
      let capJa = "";
      if (exactMl <= 18) {
        capEn = `0.4 Cap weak (~${exactMl} mL / Below 0.4 line)`;
        capJa = `0.4杯弱 (約${exactMl}mL / 0.4線の下)`;
      } else if (exactMl <= 28) {
        capEn = `0.4 Cap (35L line / ~25 mL)`;
        capJa = `0.4杯 (35L線 / 約25mL)`;
      } else if (exactMl <= 38) {
        capEn = `0.6 Cap (45L line / ~35 mL)`;
        capJa = `0.6杯 (45L線 / 約35mL)`;
      } else {
        capEn = `0.8 Cap (55L line / ~45 mL — Max Cap Mark)`;
        capJa = `0.8杯 (55L線 / 約45mL・キャップ最大目盛り)`;
      }
      return {
        amount: exactMl,
        unit: "mL",
        displayAmount: `${exactMl} mL`,
        capEn: capEn,
        capJa: capJa,
        noteEn: `${kg}kg laundry (${mlPerKg}mL/kg — Max Cap Mark is 0.8)`,
        noteJa: `衣料${kg}kg（1kgあたり${mlPerKg}mL・ボトルの最大線は0.8杯）`,
        isUnit: false,
        isPush: false
      };
    }

    // 6. Liquid Bleach (Wide Haiter / Bright: 下線 20mL / 上線 40mL)
    if (prod.category === "liquid_bleach") {
      const mlPer30 = prod.baselineAmount || prod.mlPer30L || 20;
      let exactMl;
      if (mlPer30 >= 40) {
        exactMl = 40;
      } else if (waterL >= 60 || kg > 6.0) {
        exactMl = 40; // 40mL upper line for heavy loads
      } else if (waterL <= 24 || kg <= 1.5) {
        exactMl = 10; // 10mL half lower line for quick/small cycles
      } else {
        exactMl = Math.max(1, Math.round((waterL / 30) * mlPer30));
      }

      let capEn = "";
      let capJa = "";
      if (exactMl <= 12) {
        capEn = `10 mL (Half lower line / 下線半分)`;
        capJa = `10 mL (下線の半分 / 約10mL)`;
      } else if (exactMl <= 16) {
        capEn = `15 mL (Just under lower line / 下線弱)`;
        capJa = `15 mL (下線弱 / 約15mL)`;
      } else if (exactMl <= 25) {
        capEn = `20 mL (Lower Line / 下線 20mL)`;
        capJa = `20 mL (キャップ下線 / 20mL)`;
      } else {
        capEn = `40 mL (Upper Line / 上線 40mL)`;
        capJa = `40 mL (キャップ上線 / 40mL)`;
      }
      return {
        amount: exactMl,
        unit: "mL",
        displayAmount: `${exactMl} mL`,
        capEn: capEn,
        capJa: capJa,
        noteEn: exactMl >= 40 ? "Upper Line 40mL (Heavy stains / Full load)" : "Lower Line 20mL (Standard stain & deodorizing)",
        noteJa: exactMl >= 40 ? "上線 40mL（頑固な黄ばみ・ニオイ・満量）" : "下線 20mL（毎日の消臭・除菌・標準量）",
        isUnit: false,
        isPush: false
      };
    }

    // 7. Fabric Softener (目盛り1 / 目盛り2 / 目盛り3)
    if (prod.category === "softener") {
      const mlPer30 = prod.baselineAmount || prod.mlPer30L || 10;
      let exactMl = Math.max(1, Math.round((waterL / 30) * mlPer30));
      let capEn = "";
      let capJa = "";
      if (waterL <= 35) {
        capEn = `${exactMl} mL (Below Line 1 / 目盛り1未満)`;
        capJa = `${exactMl} mL (目盛り1未満)`;
      } else if (waterL <= 48) {
        capEn = `${exactMl} mL (Line 1 / 目盛り1 — 45L)`;
        capJa = `${exactMl} mL (目盛り1 / 45L線)`;
      } else if (waterL <= 58) {
        capEn = `${exactMl} mL (Line 2 / 目盛り2 — 55L)`;
        capJa = `${exactMl} mL (目盛り2 / 55L線)`;
      } else {
        capEn = `${exactMl} mL (Line 3 / 目盛り3 — 65L)`;
        capJa = `${exactMl} mL (目盛り3 / 65L線)`;
      }
      return {
        amount: exactMl,
        unit: "mL",
        displayAmount: `${exactMl} mL`,
        capEn: capEn,
        capJa: capJa,
        noteEn: `${mlPer30}mL/30L baseline (Caps use step lines: 目盛り1, 2, 3)`,
        noteJa: `水30Lに対し${mlPer30}mL基準（段差目盛り1・2・3）`,
        isUnit: false,
        isPush: false
      };
    }

    // 8. Standard / Ultra-Concentrated Liquid Detergent (0.4 / 0.6 / 0.8 / 1.0 杯)
    const mlPer30 = prod.baselineAmount || prod.mlPer30L || 25;
    let exactMl;
    if (waterL >= 65) {
      exactMl = Math.round(mlPer30 * 2.5); // 25mL full cap for NANOX (10mL), 50mL for 20mL, 62mL for 25mL
    } else if (waterL >= 55 && mlPer30 === 10) {
      exactMl = 20; // Exact 0.8 cap line on NANOX bottles (20 mL)
    } else {
      exactMl = Math.max(1, Math.round((waterL / 30) * mlPer30));
    }

    let capEn = "";
    let capJa = "";
    if (mlPer30 === 10) {
      if (exactMl <= 8) {
        capEn = "8 mL (0.3 Cap / 30L line weak)";
        capJa = "8 mL (0.3杯 / 30L線弱)";
      } else if (exactMl <= 10) {
        capEn = "10 mL (0.4 Cap / 30L line)";
        capJa = "10 mL (0.4杯 / 30L線)";
      } else if (exactMl <= 12) {
        capEn = "12 mL (0.5 Cap / Between 0.4 & 0.6)";
        capJa = "12 mL (0.5杯 / 0.4〜0.6線中間)";
      } else if (exactMl <= 15) {
        capEn = "15 mL (0.6 Cap / 45L line)";
        capJa = "15 mL (0.6杯 / 45L線)";
      } else if (exactMl <= 18) {
        capEn = "17 mL (0.7 Cap / Between 0.6 & 0.8)";
        capJa = "17 mL (0.7杯 / 0.6〜0.8線中間)";
      } else if (exactMl <= 20) {
        capEn = "20 mL (0.8 Cap / 55L line)";
        capJa = "20 mL (0.8杯 / 55L線)";
      } else {
        capEn = "25 mL (1.0 Cap / 65L line - Full)";
        capJa = "25 mL (1杯 / 65L線・満量)";
      }
    } else {
      const fullCapMl = mlPer30 * 2.5;
      const rawFraction = exactMl / fullCapMl;
      let capFraction = Math.round(rawFraction * 10) / 10;
      if (capFraction > 1.0) capFraction = 1.0;
      const capFractionStr = capFraction >= 1.0 ? `${capFraction.toFixed(1)}` : `${capFraction}`;
      capEn = `${exactMl} mL (~${capFractionStr} Cap)`;
      capJa = `${exactMl}mL (約${capFractionStr}杯)`;
    }

    return {
      amount: exactMl,
      unit: "mL",
      displayAmount: `${exactMl} mL`,
      capEn: capEn,
      capJa: capJa,
      noteEn: `${mlPer30}mL/30L baseline`,
      noteJa: `水30Lに対し${mlPer30}mL基準`,
      isUnit: false,
      isPush: false
    };
  }

  generateUserBottleCards(readingObj) {
    const isJa = this.currentLang === "ja";
    const activeBottles = this.userBottles.filter(b => b.isActive !== false);

    if (activeBottles.length === 0) {
      return `
        <div class="product-card" style="text-align:center; padding:24px 16px; opacity:0.85;">
          <div style="font-size:1.8rem; margin-bottom:8px;">🧺</div>
          <div style="font-weight:700; margin-bottom:4px;">
            ${isJa ? '今日の洗濯に選択されている洗剤がありません' : 'No bottles selected for today’s wash'}
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">
            ${isJa ? '上の「持ってきた洗剤」ボタンから、使用する洗剤を有効にしてください。' : 'Tap "My Bottles / Manage Arsenal" above to activate the bottles you brought.'}
          </div>
        </div>
      `;
    }

    const drumKgText = isJa ? (readingObj.drumKgJa || readingObj.drumKg || readingObj.loadEstimateJa) : (readingObj.drumKg || readingObj.loadEstimate);
    const waterText = `${readingObj.waterEstL}L`;
    const readingText = isJa ? (readingObj.labelJa || readingObj.label) : readingObj.label;

    const makeContextHtml = (noteText) => `
      <div class="dosage-context-pills detail-only">
        <span class="context-pill"><span class="context-icon">⚖️</span> ${isJa ? '衣料目安: ' + drumKgText : 'Load: ' + drumKgText}</span>
        <span class="context-pill"><span class="context-icon">🌊</span> ${isJa ? '水量: 約' + waterText : 'Water: ~' + waterText}</span>
        <span class="context-pill"><span class="context-icon">🔢</span> ${isJa ? '表示: ' + readingText : 'Reading: ' + readingText}</span>
        ${noteText ? `<span class="context-pill note"><span class="context-icon">🏷️</span> ${noteText}</span>` : ''}
      </div>
    `;

    // Sort active bottles into sequential load order:
    // 1. Drum bottom direct (Beads, Pods)
    // 2. Main Detergent (Liquid detergent, Powder detergent)
    // 3. Bleach (Liquid bleach, Powder bleach)
    // 4. Rinse (Softener, Citric acid)
    const getCategoryRank = (cat) => {
      if (cat === "in_drum_beads" || cat === "pods") return 1;
      if (cat === "liquid_detergent" || cat === "powder_detergent") return 2;
      if (cat === "liquid_bleach" || cat === "powder_bleach") return 3;
      if (cat === "softener" || cat === "citric_rinse") return 4;
      return 5;
    };

    const sortedBottles = [...activeBottles].sort((a, b) => getCategoryRank(a.category) - getCategoryRank(b.category));

    let cards = [];
    let stepNum = 1;

    sortedBottles.forEach(b => {
      const dose = this.calculateDoseForProduct(b, readingObj);
      const capText = isJa ? dose.capJa : dose.capEn;
      const noteText = isJa ? dose.noteJa : dose.noteEn;
      const slotName = isJa ? (b.slotNameJa || b.slotNameEn) : (b.slotNameEn || b.slotNameJa);
      const instructions = isJa ? b.instructionsJa : b.instructionsEn;

      // Special alert banners
      let warningHtml = "";
      if (b.category === "citric_rinse") {
        warningHtml = `
          <div class="product-instructions" style="background:#fee2e2; border-color:#f87171; color:#991b1b; font-weight:700;">
            ${isJa ? '⚠️【塩素系漂白剤厳禁】塩素系漂白剤と絶対に混ぜないでください（有毒ガス発生）。柔軟剤投入口へ注ぎます。' : '⚠️ DANGER: NEVER mix with chlorine bleach! Toxic chlorine gas hazard. Pour into Softener tray only.'}
          </div>
        `;
      } else if (b.defaultSlot === "drum_direct") {
        warningHtml = `
          <div class="product-instructions" style="background:#fef3c7; border-color:#f59e0b; color:#92400e; font-weight:600;">
            ${isJa ? '⚠️【重要】衣類を入れる前に、洗濯槽の底へ直接投入してください。洗剤ケースには入れないでください。' : '⚠️ Toss directly into drum bottom BEFORE loading clothes! NEVER pour into drawer compartments.'}
          </div>
        `;
      } else if (instructions) {
        warningHtml = `
          <div class="product-instructions detail-only">
            ${instructions}
          </div>
        `;
      }

      cards.push(`
        <div class="product-card" data-category="${b.category}">
          <div class="product-header-row">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="recipe-step-badge">${stepNum++}</span>
              <div>
                <div class="product-title">${b.name}</div>
                <div class="product-subtitle">${isJa ? (b.standardDoseTextJa || b.standardDoseText) : b.standardDoseText}</div>
              </div>
            </div>
            <span class="badge badge-accent slot-indicator-badge" data-slot="${b.defaultSlot}" title="${isJa ? 'タップして投入口を表示' : 'Tap to highlight slot in drawer map'}">
              📥 ${slotName}
            </span>
          </div>
          <div class="dosage-display-box">
            <div class="dosage-highlight-col">
              <div class="dosage-highlight">
                <span class="dosage-cap-level">${b.isPush ? (isJa ? 'プッシュ回数:' : 'Push count:') : (b.formulaType === 'unit_count' ? (isJa ? '投入量:' : 'Amount:') : (b.unit === 'g' ? (isJa ? 'スプーン目安:' : 'Scoop fill:') : (isJa ? 'キャップ目盛り:' : 'Cap fill:')))} ${capText}</span>
                <span class="dosage-ml-pill">${dose.displayAmount}</span>
              </div>
              ${makeContextHtml(noteText)}
            </div>
            <span style="font-size:1.5rem;">${b.icon || '🧴'}</span>
          </div>
          ${warningHtml}
        </div>
      `);
    });

    return cards.join("");
  }

  generateProductDosageCards(readingObj, isDirectTab = false) {
    return this.generateUserBottleCards(readingObj);
  }

  renderDrawerSvg(containerId = "drawer-svg-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const m = this.data.machines[this.currentMachineId];
    const drawerType = m.dispenserDrawer.diagramType;

    let svgHtml = "";
    if (drawerType === "panasonic_lx") {
      svgHtml = this.generatePanasonicLXDrawerSvg();
    } else if (drawerType === "sharp_s7c") {
      svgHtml = this.generateSharpS7CDrawerSvg();
    } else if (drawerType === "sharp_h10") {
      svgHtml = this.generateSharpH10DrawerSvg();
    } else if (drawerType === "panasonic_vx") {
      svgHtml = this.generatePanasonicVXDrawerSvg();
    }

    container.innerHTML = svgHtml;
    this.bindDrawerSlotInteractions(container);
  }

  escapeXml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  truncateText(str, maxLen = 20) {
    if (!str) return "";
    return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
  }

  getDrawerSlotState() {
    const isJa = this.currentLang === "ja";
    const active = (this.userBottles || []).filter(b => b.isActive !== false);

    const liquidDets = active.filter(b => b.category === "liquid_detergent");
    const liquidBleaches = active.filter(b => b.category === "liquid_bleach");
    const powderDets = active.filter(b => b.category === "powder_detergent");
    const powderBleaches = active.filter(b => b.category === "powder_bleach");
    const softeners = active.filter(b => b.category === "softener");
    const citrics = active.filter(b => b.category === "citric_rinse");
    const pods = active.filter(b => b.category === "pods");

    return {
      isJa,
      active,
      liquidDet: liquidDets[0] || null,
      liquidBleach: liquidBleaches[0] || null,
      powderDet: powderDets[0] || null,
      powderBleach: powderBleaches[0] || null,
      softener: softeners[0] || null,
      citric: citrics[0] || null,
      hasPod: pods.length > 0,
      hasPowder: powderDets.length > 0 || powderBleaches.length > 0
    };
  }

  generatePanasonicLXDrawerSvg() {
    const state = this.getDrawerSlotState();
    const isJa = state.isJa;

    // Slot 1: Softener / Citric Acid
    const softActive = Boolean(state.softener || state.citric);
    let softTitleJa = "柔軟剤 / クエン酸";
    let softTitleEn = "Fabric Softener";
    let softName = "";
    let softSub = isJa ? "（最終すすぎで自動投入）" : "Pours into final rinse";

    if (state.softener) {
      softName = `🌸 ${this.truncateText(state.softener.name, 24)}`;
    } else if (state.citric) {
      softTitleJa = "クエン酸消臭";
      softTitleEn = "Citric Acid Rinse";
      softName = `🍋 ${this.truncateText(state.citric.name, 24)}`;
      softSub = isJa ? "（柔軟剤投入口を使用）" : "Dispenses via softener slot";
    } else {
      softName = isJa ? "（今日は未使用）" : "(Not used today)";
      softSub = isJa ? "空のまま • 水ですすぎ" : "Leave empty • Clean rinse";
    }

    const softRect = softActive
      ? `<rect x="45" y="110" width="170" height="125" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2.5" />`
      : `<rect x="45" y="110" width="170" height="125" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    // Slot 2: Liquid Detergent & Bleach
    const liqActive = Boolean(state.liquidDet || state.liquidBleach);
    let liqLine1 = "";
    let liqLine2 = "";
    let liqSub = "";

    if (state.liquidDet && state.liquidBleach) {
      liqLine1 = `🧴 ${this.truncateText(state.liquidDet.name, 22)}`;
      liqLine2 = `+ ✨ ${this.truncateText(state.liquidBleach.name, 22)}`;
      liqSub = isJa ? "（一緒に入れてOK）" : "Dispenses together";
    } else if (state.liquidDet) {
      liqLine1 = `🧴 ${this.truncateText(state.liquidDet.name, 26)}`;
      liqLine2 = isJa ? "（漂白剤なし）" : "(No bleach active)";
      liqSub = isJa ? "液体洗剤投入口" : "Main liquid channel";
    } else if (state.liquidBleach) {
      liqLine1 = `✨ ${this.truncateText(state.liquidBleach.name, 26)}`;
      liqLine2 = isJa ? "（洗剤なし・漂白剤のみ）" : "(Bleach only)";
      liqSub = isJa ? "液体洗剤投入口" : "Main liquid channel";
    } else {
      if (state.hasPowder) {
        liqLine1 = isJa ? "（粉末洗剤時は空のまま）" : "(Leave empty for powder)";
        liqLine2 = isJa ? "奥の粉末ケースへ投入 ▴" : "Pour into rear hopper ▴";
      } else if (state.hasPod) {
        liqLine1 = isJa ? "（ジェルボール時は空のまま）" : "(Leave empty for pods)";
        liqLine2 = isJa ? "洗濯槽の底へ直接投入" : "Toss directly into drum";
      } else {
        liqLine1 = isJa ? "（今日は未使用）" : "(Not used today)";
        liqLine2 = isJa ? "空のまま • 洗剤なし" : "Leave empty • No liquid";
      }
      liqSub = isJa ? "今日は未使用" : "Not used today";
    }

    const liqRect = liqActive
      ? `<rect x="230" y="110" width="225" height="125" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5" />`
      : `<rect x="230" y="110" width="225" height="125" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    // Slot 3: Powder Detergent Hopper
    const powderActive = Boolean(state.hasPowder);
    let powderText = "";
    if (state.powderDet && state.powderBleach) {
      powderText = `📦 ${this.truncateText(state.powderDet.name, 14)} + ✨ ${this.truncateText(state.powderBleach.name, 14)}`;
    } else if (state.powderDet) {
      powderText = `📦 ${this.truncateText(state.powderDet.name, 26)}`;
    } else if (state.powderBleach) {
      powderText = `✨ ${this.truncateText(state.powderBleach.name, 26)}`;
    } else {
      powderText = isJa ? "（今日は未使用・液体洗剤／ジェル使用時は空のまま）" : "(Not used today • Leave dry and empty)";
    }

    const powderRect = powderActive
      ? `<rect x="45" y="45" width="410" height="55" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />`
      : `<rect x="45" y="45" width="410" height="55" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    return `
      <svg viewBox="0 0 500 280" width="100%" height="auto" style="border-radius:8px; display:block;" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Drawer Tray Body -->
        <rect class="svg-tray-outer" x="20" y="20" width="460" height="240" rx="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3" />
        <rect class="svg-tray-inner" x="30" y="30" width="440" height="220" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />

        <!-- Drawer Front Handle Indicator -->
        <rect x="180" y="255" width="140" height="15" rx="6" fill="#64748b" />
        <text x="250" y="266" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">FRONT (手前・引く)</text>

        <!-- Slot 1: Softener (Front-Left) -->
        <g id="slot-softener" class="drawer-interactive-slot svg-slot-softener ${softActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="softener">
          ${softRect}
          <line x1="55" y1="165" x2="205" y2="165" stroke="${softActive ? '#db2777' : '#cbd5e1'}" stroke-width="2" stroke-dasharray="4" />
          <text x="130" y="138" font-size="13" font-weight="800" fill="${softActive ? '#9d174d' : '#94a3b8'}" text-anchor="middle">${softTitleJa}</text>
          <text x="130" y="154" font-size="10" font-weight="700" fill="${softActive ? '#be185d' : '#94a3b8'}" text-anchor="middle">${softTitleEn}</text>
          <text x="130" y="178" font-size="9" font-weight="700" fill="${softActive ? '#e11d48' : '#cbd5e1'}" text-anchor="middle">── ${isJa ? 'これ以下 (MAX 55mL)' : 'MAX 55mL Level'} ──</text>
          <text x="130" y="198" font-size="11" font-weight="700" fill="${softActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(softName)}</text>
          <text x="130" y="216" font-size="9" fill="${softActive ? '#64748b' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(softSub)}</text>
        </g>

        <!-- Slot 2: Liquid Detergent & Bleach (Center/Right-Front) -->
        <g id="slot-liquid-detergent" class="drawer-interactive-slot svg-slot-detergent ${liqActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="liquid_detergent">
          ${liqRect}
          <text x="342" y="138" font-size="13" font-weight="800" fill="${liqActive ? '#0369a1' : '#94a3b8'}" text-anchor="middle">液体洗剤・漂白剤</text>
          <text x="342" y="154" font-size="10" font-weight="700" fill="${liqActive ? '#0284c7' : '#94a3b8'}" text-anchor="middle">Liquid Detergent & Bleach</text>
          ${liqActive && state.liquidDet && state.liquidBleach ? `
            <text x="342" y="176" font-size="10.5" font-weight="700" fill="#0f172a" text-anchor="middle">${this.escapeXml(liqLine1)}</text>
            <text x="342" y="194" font-size="10" font-weight="600" fill="#0369a1" text-anchor="middle">${this.escapeXml(liqLine2)}</text>
            <text x="342" y="214" font-size="8.5" fill="#64748b" text-anchor="middle">${this.escapeXml(liqSub)}</text>
          ` : `
            <text x="342" y="184" font-size="11" font-weight="700" fill="${liqActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(liqLine1)}</text>
            <text x="342" y="204" font-size="9" fill="${liqActive ? '#0284c7' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(liqLine2)}</text>
          `}
        </g>

        <!-- Slot 3: Powder Detergent Hopper (Rear) -->
        <g id="slot-powder-detergent" class="drawer-interactive-slot svg-slot-powder ${powderActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="powder_detergent">
          ${powderRect}
          <text x="250" y="67" font-size="12" font-weight="800" fill="${powderActive ? '#b45309' : '#94a3b8'}" text-anchor="middle">粉末合成洗剤・粉末漂白剤 (Powder Detergent & Bleach)</text>
          <text x="250" y="86" font-size="10" font-weight="${powderActive ? '700' : '600'}" fill="${powderActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(powderText)}</text>
        </g>
      </svg>
    `;
  }

  generateSharpS7CDrawerSvg() {
    const state = this.getDrawerSlotState();
    const isJa = state.isJa;

    // Slot 1: Softener (Front Compartment)
    const softActive = Boolean(state.softener || state.citric);
    let softName = "";
    let softSub = isJa ? "最終すすぎ用 • 引き出しは静かに閉める" : "Pours into final rinse • Close drawer gently!";
    if (state.softener) {
      softName = `🌸 ${this.truncateText(state.softener.name, 28)}`;
    } else if (state.citric) {
      softName = `🍋 ${this.truncateText(state.citric.name, 28)} (クエン酸)`;
      softSub = isJa ? "柔軟剤投入口を使用 • 塩素系漂白剤厳禁" : "Pours into final rinse • NEVER mix with chlorine";
    } else {
      softName = isJa ? "（今日は未使用・空のまま）" : "(Not used today • Leave empty)";
      softSub = isJa ? "最終すすぎ用（水のみですすぎ）" : "Pours into final rinse • Clean water rinse today";
    }

    const softRect = softActive
      ? `<rect x="45" y="145" width="410" height="90" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2.5" />`
      : `<rect x="45" y="145" width="410" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    // Slot 2: Liquid Detergent & Bleach (Rear-Left)
    const liqActive = Boolean(state.liquidDet || state.liquidBleach);
    let liqLine1 = "";
    let liqLine2 = "";
    if (state.liquidDet && state.liquidBleach) {
      liqLine1 = `🧴 ${this.truncateText(state.liquidDet.name, 22)}`;
      liqLine2 = `+ ✨ ${this.truncateText(state.liquidBleach.name, 22)}`;
    } else if (state.liquidDet) {
      liqLine1 = `🧴 ${this.truncateText(state.liquidDet.name, 26)}`;
      liqLine2 = isJa ? "（漂白剤なし）" : "(No bleach active)";
    } else if (state.liquidBleach) {
      liqLine1 = `✨ ${this.truncateText(state.liquidBleach.name, 26)}`;
      liqLine2 = isJa ? "（漂白剤のみ）" : "(Bleach only)";
    } else {
      if (state.hasPowder) {
        liqLine1 = isJa ? "（粉末洗剤時は空のまま）" : "(Leave empty for powder)";
        liqLine2 = isJa ? "右側の粉末スロットへ ➔" : "Use right powder slot ➔";
      } else {
        liqLine1 = isJa ? "（今日は未使用・空のまま）" : "(Not used today • Leave empty)";
        liqLine2 = isJa ? "液体洗剤の選択なし" : "No liquid detergent";
      }
    }

    const liqRect = liqActive
      ? `<rect x="45" y="45" width="220" height="90" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5" />`
      : `<rect x="45" y="45" width="220" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    // Slot 3: Powder Detergent (Rear-Right)
    const powderActive = Boolean(state.hasPowder);
    let powderLine1 = "";
    let powderLine2 = "";
    if (state.powderDet) {
      powderLine1 = `📦 ${this.truncateText(state.powderDet.name, 22)}`;
      powderLine2 = isJa ? "（右側フラップ下）" : "(Under right flap)";
    } else if (state.powderBleach) {
      powderLine1 = `✨ ${this.truncateText(state.powderBleach.name, 22)}`;
      powderLine2 = isJa ? "（右側フラップ下）" : "(Under right flap)";
    } else {
      powderLine1 = isJa ? "（今日は未使用）" : "(Not used today)";
      powderLine2 = isJa ? "液体洗剤時は空のまま" : "Empty when using liquid";
    }

    const powderRect = powderActive
      ? `<rect x="275" y="45" width="180" height="90" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />`
      : `<rect x="275" y="45" width="180" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    return `
      <svg viewBox="0 0 500 280" width="100%" height="auto" style="border-radius:8px; display:block;" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Drawer Tray Body -->
        <rect class="svg-tray-outer" x="20" y="20" width="460" height="240" rx="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3" />
        <rect class="svg-tray-inner" x="30" y="30" width="440" height="220" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />

        <!-- Front Pull -->
        <rect x="180" y="255" width="140" height="15" rx="6" fill="#64748b" />
        <text x="250" y="266" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">FRONT (手前・引く)</text>

        <!-- Slot 1: Softener (Front Compartment) -->
        <g id="slot-softener" class="drawer-interactive-slot svg-slot-softener ${softActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="softener">
          ${softRect}
          <line x1="60" y1="185" x2="440" y2="185" stroke="${softActive ? '#db2777' : '#cbd5e1'}" stroke-width="2" stroke-dasharray="4" />
          <text x="250" y="170" font-size="13" font-weight="800" fill="${softActive ? '#9d174d' : '#94a3b8'}" text-anchor="middle">柔軟剤 (Fabric Softener) / クエン酸 (Citric Acid)</text>
          <text x="250" y="198" font-size="10" font-weight="700" fill="${softActive ? '#e11d48' : '#cbd5e1'}" text-anchor="middle">── 満量 (MAX 65mL - Do Not Exceed) ──</text>
          <text x="250" y="216" font-size="11" font-weight="700" fill="${softActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(softName)}</text>
          <text x="250" y="228" font-size="8.5" fill="${softActive ? '#64748b' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(softSub)}</text>
        </g>

        <!-- Slot 2: Liquid Detergent & Bleach (Rear-Left) -->
        <g id="slot-liquid-detergent" class="drawer-interactive-slot svg-slot-detergent ${liqActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="liquid_detergent">
          ${liqRect}
          <text x="155" y="68" font-size="12" font-weight="800" fill="${liqActive ? '#0369a1' : '#94a3b8'}" text-anchor="middle">洗剤・漂白剤 液体</text>
          <text x="155" y="84" font-size="10" font-weight="700" fill="${liqActive ? '#0284c7' : '#94a3b8'}" text-anchor="middle">Liquid Detergent & Bleach</text>
          <text x="155" y="106" font-size="10.5" font-weight="700" fill="${liqActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(liqLine1)}</text>
          <text x="155" y="122" font-size="9" fill="${liqActive ? '#0284c7' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(liqLine2)}</text>
        </g>

        <!-- Slot 3: Powder Detergent (Rear-Right) -->
        <g id="slot-powder-detergent" class="drawer-interactive-slot svg-slot-powder ${powderActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="powder_detergent">
          ${powderRect}
          <text x="365" y="68" font-size="12" font-weight="800" fill="${powderActive ? '#b45309' : '#94a3b8'}" text-anchor="middle">粉末 (Powder)</text>
          <text x="365" y="84" font-size="10" font-weight="700" fill="${powderActive ? '#b45309' : '#94a3b8'}" text-anchor="middle">Powder Detergent Slot</text>
          <text x="365" y="106" font-size="10.5" font-weight="700" fill="${powderActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(powderLine1)}</text>
          <text x="365" y="122" font-size="9" fill="${powderActive ? '#78350f' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(powderLine2)}</text>
        </g>
      </svg>
    `;
  }

  generateSharpH10DrawerSvg() {
    const state = this.getDrawerSlotState();
    const isJa = state.isJa;

    // Slot 1: Dedicated Liquid Bleach (Left)
    const bleachActive = Boolean(state.liquidBleach);
    let bleachName = "";
    let bleachSub = "";
    if (state.liquidBleach) {
      bleachName = `✨ ${this.truncateText(state.liquidBleach.name, 20)}`;
      bleachSub = isJa ? "（液体漂白剤投入）" : "Liquid Bleach Only";
    } else {
      bleachName = isJa ? "（今日は未使用）" : "(Not used today)";
      bleachSub = isJa ? "空のまま • 漂白剤なし" : "Leave empty • No bleach";
    }

    const bleachRect = bleachActive
      ? `<rect x="45" y="45" width="125" height="190" rx="8" fill="#d1fae5" stroke="#059669" stroke-width="2.5" />`
      : `<rect x="45" y="45" width="125" height="190" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    // Slot 2: Synthetic Detergent (Center - Liquid or Powder)
    const detActive = Boolean(state.liquidDet || state.powderDet);
    let detName = "";
    let detSub = "";
    let detRectFill = "#f8fafc";
    let detRectStroke = "#cbd5e1";
    let detRectDash = 'stroke-dasharray="4 3"';

    if (state.liquidDet) {
      detName = `🧴 ${this.truncateText(state.liquidDet.name, 22)}`;
      detSub = isJa ? "（液体洗剤投入）" : "Liquid Detergent";
      detRectFill = "#e0f2fe";
      detRectStroke = "#0284c7";
      detRectDash = "";
    } else if (state.powderDet) {
      detName = `📦 ${this.truncateText(state.powderDet.name, 22)}`;
      detSub = isJa ? "（粉末洗剤投入）" : "Powder Detergent";
      detRectFill = "#fef3c7";
      detRectStroke = "#d97706";
      detRectDash = "";
    } else {
      detName = isJa ? "（今日は未使用）" : "(Not used today)";
      detSub = state.hasPod
        ? (isJa ? "ジェルボールは槽の底へ" : "Pods go in drum")
        : (isJa ? "空のまま • 洗剤なし" : "Leave empty • No detergent");
    }

    const detRect = `<rect x="180" y="45" width="140" height="190" rx="8" fill="${detRectFill}" stroke="${detRectStroke}" stroke-width="2.5" ${detRectDash} />`;

    // Slot 3: Fabric Softener (Right)
    const softActive = Boolean(state.softener || state.citric);
    let softName = "";
    let softSub = "";
    if (state.softener) {
      softName = `🌸 ${this.truncateText(state.softener.name, 20)}`;
      softSub = isJa ? "（最終すすぎで投入）" : "Final rinse";
    } else if (state.citric) {
      softName = `🍋 ${this.truncateText(state.citric.name, 20)}`;
      softSub = isJa ? "（クエン酸消臭）" : "Citric Rinse";
    } else {
      softName = isJa ? "（今日は未使用）" : "(Not used today)";
      softSub = isJa ? "水のみですすぎ" : "Clean water rinse";
    }

    const softRect = softActive
      ? `<rect x="330" y="45" width="125" height="190" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2.5" />`
      : `<rect x="330" y="45" width="125" height="190" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    return `
      <svg viewBox="0 0 500 280" width="100%" height="auto" style="border-radius:8px; display:block;" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Drawer Tray Body -->
        <rect class="svg-tray-outer" x="20" y="20" width="460" height="240" rx="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3" />
        <rect class="svg-tray-inner" x="30" y="30" width="440" height="220" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />

        <!-- Front Pull -->
        <rect x="180" y="255" width="140" height="15" rx="6" fill="#64748b" />
        <text x="250" y="266" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">FRONT (手前・引く)</text>

        <!-- Slot 1: Left - Dedicated Liquid Bleach -->
        <g id="slot-bleach" class="drawer-interactive-slot svg-slot-bleach ${bleachActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="bleach">
          ${bleachRect}
          <text x="107" y="80" font-size="13" font-weight="800" fill="${bleachActive ? '#065f46' : '#94a3b8'}" text-anchor="middle">漂白剤</text>
          <text x="107" y="98" font-size="10" font-weight="700" fill="${bleachActive ? '#047857' : '#94a3b8'}" text-anchor="middle">Liquid Bleach</text>
          <text x="107" y="116" font-size="9" font-weight="600" fill="${bleachActive ? '#064e3b' : '#cbd5e1'}" text-anchor="middle">(液体タイプ専用)</text>
          <text x="107" y="160" font-size="11" font-weight="700" fill="${bleachActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(bleachName)}</text>
          <text x="107" y="180" font-size="9" fill="${bleachActive ? '#047857' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(bleachSub)}</text>
        </g>

        <!-- Slot 2: Center - Synthetic Detergent (Liquid or Powder) -->
        <g id="slot-liquid-detergent" class="drawer-interactive-slot svg-slot-detergent ${detActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="liquid_detergent">
          ${detRect}
          <text x="250" y="80" font-size="13" font-weight="800" fill="${detActive ? (state.powderDet ? '#b45309' : '#0369a1') : '#94a3b8'}" text-anchor="middle">合成洗剤</text>
          <text x="250" y="98" font-size="10" font-weight="700" fill="${detActive ? (state.powderDet ? '#b45309' : '#0284c7') : '#94a3b8'}" text-anchor="middle">Synthetic Detergent</text>
          <text x="250" y="116" font-size="9" fill="${detActive ? '#475569' : '#cbd5e1'}" text-anchor="middle">(液体または粉末)</text>
          <text x="250" y="160" font-size="11" font-weight="800" fill="${detActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(detName)}</text>
          <text x="250" y="180" font-size="9" fill="${detActive ? (state.powderDet ? '#b45309' : '#0369a1') : '#94a3b8'}" text-anchor="middle">${this.escapeXml(detSub)}</text>
        </g>

        <!-- Slot 3: Right - Softener -->
        <g id="slot-softener" class="drawer-interactive-slot svg-slot-softener ${softActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="softener">
          ${softRect}
          <line x1="335" y1="135" x2="450" y2="135" stroke="${softActive ? '#db2777' : '#cbd5e1'}" stroke-width="2" stroke-dasharray="4" />
          <text x="392" y="80" font-size="13" font-weight="800" fill="${softActive ? '#9d174d' : '#94a3b8'}" text-anchor="middle">柔軟剤</text>
          <text x="392" y="98" font-size="10" font-weight="700" fill="${softActive ? '#be185d' : '#94a3b8'}" text-anchor="middle">Fabric Softener</text>
          <text x="392" y="150" font-size="9" font-weight="700" fill="${softActive ? '#e11d48' : '#cbd5e1'}" text-anchor="middle">─ ${isJa ? '満量 (70mL)' : 'MAX 70mL'} ─</text>
          <text x="392" y="175" font-size="11" font-weight="700" fill="${softActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(softName)}</text>
          <text x="392" y="195" font-size="9" fill="${softActive ? '#9d174d' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(softSub)}</text>
        </g>
      </svg>
    `;
  }

  generatePanasonicVXDrawerSvg() {
    const state = this.getDrawerSlotState();
    const isJa = state.isJa;

    // Slot 1: Softener (Left-Front)
    const softActive = Boolean(state.softener || state.citric);
    let softTitleJa = "柔軟剤";
    let softTitleEn = "Fabric Softener";
    let softName = "";
    let softSub = isJa ? "（最終すすぎで自動投入）" : "Pours into final rinse";

    if (state.softener) {
      softName = `🌸 ${this.truncateText(state.softener.name, 24)}`;
    } else if (state.citric) {
      softTitleJa = "クエン酸消臭";
      softTitleEn = "Citric Acid Rinse";
      softName = `🍋 ${this.truncateText(state.citric.name, 24)}`;
      softSub = isJa ? "（柔軟剤投入口を使用）" : "Dispenses via softener slot";
    } else {
      softName = isJa ? "（今日は未使用）" : "(Not used today)";
      softSub = isJa ? "空のまま • 水ですすぎ" : "Leave empty • Clean rinse";
    }

    const softRect = softActive
      ? `<rect x="45" y="110" width="180" height="125" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2.5" />`
      : `<rect x="45" y="110" width="180" height="125" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    // Slot 2: Liquid Detergent & Bleach (Right Channel)
    const liqActive = Boolean(state.liquidDet || state.liquidBleach);
    let liqLine1 = "";
    let liqLine2 = "";
    let liqSub = "";

    if (state.liquidDet && state.liquidBleach) {
      liqLine1 = `🧴 ${this.truncateText(state.liquidDet.name, 22)}`;
      liqLine2 = `+ ✨ ${this.truncateText(state.liquidBleach.name, 22)}`;
      liqSub = isJa ? "（一緒に入れてOK）" : "Dispenses together";
    } else if (state.liquidDet) {
      liqLine1 = `🧴 ${this.truncateText(state.liquidDet.name, 26)}`;
      liqLine2 = isJa ? "（漂白剤なし）" : "(No bleach active)";
      liqSub = isJa ? "液体洗剤投入口" : "Main liquid channel";
    } else if (state.liquidBleach) {
      liqLine1 = `✨ ${this.truncateText(state.liquidBleach.name, 26)}`;
      liqLine2 = isJa ? "（洗剤なし・漂白剤のみ）" : "(Bleach only)";
      liqSub = isJa ? "液体洗剤投入口" : "Main liquid channel";
    } else {
      if (state.hasPowder) {
        liqLine1 = isJa ? "（粉末洗剤時は空のまま）" : "(Leave empty for powder)";
        liqLine2 = isJa ? "奥の粉末ケースへ投入 ▴" : "Pour into rear hopper ▴";
      } else if (state.hasPod) {
        liqLine1 = isJa ? "（ジェルボール時は空のまま）" : "(Leave empty for pods)";
        liqLine2 = isJa ? "洗濯槽の底へ直接投入" : "Toss directly into drum";
      } else {
        liqLine1 = isJa ? "（今日は未使用）" : "(Not used today)";
        liqLine2 = isJa ? "空のまま • 洗剤なし" : "Leave empty • No liquid";
      }
      liqSub = isJa ? "今日は未使用" : "Not used today";
    }

    const liqRect = liqActive
      ? `<rect x="240" y="110" width="215" height="125" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5" />`
      : `<rect x="240" y="110" width="215" height="125" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    // Slot 3: Powder Detergent Hopper (Rear)
    const powderActive = Boolean(state.hasPowder);
    let powderText = "";
    if (state.powderDet && state.powderBleach) {
      powderText = `📦 ${this.truncateText(state.powderDet.name, 14)} + ✨ ${this.truncateText(state.powderBleach.name, 14)}`;
    } else if (state.powderDet) {
      powderText = `📦 ${this.truncateText(state.powderDet.name, 26)}`;
    } else if (state.powderBleach) {
      powderText = `✨ ${this.truncateText(state.powderBleach.name, 26)}`;
    } else {
      powderText = isJa ? "（今日は未使用・液体洗剤／ジェル使用時は空のまま）" : "(Not used today • Leave dry and empty)";
    }

    const powderRect = powderActive
      ? `<rect x="45" y="45" width="410" height="55" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />`
      : `<rect x="45" y="45" width="410" height="55" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3" />`;

    return `
      <svg viewBox="0 0 500 280" width="100%" height="auto" style="border-radius:8px; display:block;" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Drawer Tray Body -->
        <rect class="svg-tray-outer" x="20" y="20" width="460" height="240" rx="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3" />
        <rect class="svg-tray-inner" x="30" y="30" width="440" height="220" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />

        <!-- Front Pull -->
        <rect x="180" y="255" width="140" height="15" rx="6" fill="#64748b" />
        <text x="250" y="266" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">FRONT (手前・引く)</text>

        <!-- Slot 1: Softener (Left-Front) -->
        <g id="slot-softener" class="drawer-interactive-slot svg-slot-softener ${softActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="softener">
          ${softRect}
          <line x1="55" y1="165" x2="215" y2="165" stroke="${softActive ? '#db2777' : '#cbd5e1'}" stroke-width="2" stroke-dasharray="4" />
          <text x="135" y="138" font-size="13" font-weight="800" fill="${softActive ? '#9d174d' : '#94a3b8'}" text-anchor="middle">${softTitleJa}</text>
          <text x="135" y="154" font-size="10" font-weight="700" fill="${softActive ? '#be185d' : '#94a3b8'}" text-anchor="middle">${softTitleEn}</text>
          <text x="135" y="178" font-size="9" font-weight="700" fill="${softActive ? '#e11d48' : '#cbd5e1'}" text-anchor="middle">── ${isJa ? 'これ以下 (MAX 55mL)' : 'MAX 55mL Level'} ──</text>
          <text x="135" y="198" font-size="11" font-weight="700" fill="${softActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(softName)}</text>
          <text x="135" y="216" font-size="9" fill="${softActive ? '#64748b' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(softSub)}</text>
        </g>

        <!-- Slot 2: Liquid Detergent & Bleach (Right Channel) -->
        <g id="slot-liquid-detergent" class="drawer-interactive-slot svg-slot-detergent ${liqActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="liquid_detergent">
          ${liqRect}
          <text x="347" y="138" font-size="13" font-weight="800" fill="${liqActive ? '#0369a1' : '#94a3b8'}" text-anchor="middle">液体洗剤・漂白剤</text>
          <text x="347" y="154" font-size="10" font-weight="700" fill="${liqActive ? '#0284c7' : '#94a3b8'}" text-anchor="middle">Liquid Detergent & Bleach</text>
          ${liqActive && state.liquidDet && state.liquidBleach ? `
            <text x="347" y="176" font-size="10.5" font-weight="700" fill="#0f172a" text-anchor="middle">${this.escapeXml(liqLine1)}</text>
            <text x="347" y="194" font-size="10" font-weight="600" fill="#0369a1" text-anchor="middle">${this.escapeXml(liqLine2)}</text>
            <text x="347" y="214" font-size="8.5" fill="#64748b" text-anchor="middle">${this.escapeXml(liqSub)}</text>
          ` : `
            <text x="347" y="184" font-size="11" font-weight="700" fill="${liqActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(liqLine1)}</text>
            <text x="347" y="204" font-size="9" fill="${liqActive ? '#0284c7' : '#94a3b8'}" text-anchor="middle">${this.escapeXml(liqLine2)}</text>
          `}
        </g>

        <!-- Slot 3: Powder Detergent Hopper (Rear) -->
        <g id="slot-powder-detergent" class="drawer-interactive-slot svg-slot-powder ${powderActive ? 'slot-active' : 'slot-unused'}" style="cursor:pointer;" data-slot="powder_detergent">
          ${powderRect}
          <text x="250" y="67" font-size="12" font-weight="800" fill="${powderActive ? '#b45309' : '#94a3b8'}" text-anchor="middle">粉末合成洗剤 (Powder Detergent Hopper)</text>
          <text x="250" y="86" font-size="10" font-weight="${powderActive ? '700' : '600'}" fill="${powderActive ? '#0f172a' : '#64748b'}" text-anchor="middle">${this.escapeXml(powderText)}</text>
        </g>
      </svg>
    `;
  }

  bindDrawerSlotInteractions(container) {
    container.querySelectorAll(".drawer-interactive-slot").forEach(slot => {
      slot.addEventListener("click", () => {
        const slotId = slot.getAttribute("data-slot");
        this.highlightDrawerSlot(slotId, null);
      });
    });
  }

  highlightDrawerSlot(slotId, activeBadgeCard = null) {
    this.activeDrawerSlot = slotId;

    // Auto-expand drawer map if collapsed when a slot is tapped
    if (slotId && slotId !== "drum_direct") {
      const drawerBody = document.getElementById("drawer-collapsible-body");
      const drawerPill = document.getElementById("lbl-toggle-drawer");
      if (drawerBody && drawerBody.classList.contains("hidden")) {
        drawerBody.classList.remove("hidden");
        const isJa = this.currentLang === "ja";
        if (drawerPill) {
          drawerPill.textContent = isJa ? "閉じる ▴" : "Hide Map ▴";
        }
      }
    }

    // 1. Highlight matching SVG drawer compartment(s)
    const allSlots = document.querySelectorAll(".drawer-interactive-slot");
    allSlots.forEach(s => {
      const rect = s.querySelector("rect");
      if (s.getAttribute("data-slot") === slotId) {
        if (rect) {
          rect.setAttribute("stroke-width", "5");
          rect.style.filter = "drop-shadow(0 0 10px rgba(59,130,246,0.9))";
        }
      } else {
        if (rect) {
          const defaultWidth = s.classList.contains("slot-unused") ? "2" : "2.5";
          rect.setAttribute("stroke-width", defaultWidth);
          rect.style.filter = "none";
        }
      }
    });

    // 2. Reset styles on all product cards
    const allCards = document.querySelectorAll(".product-card");
    allCards.forEach(c => {
      c.style.boxShadow = "var(--shadow-sm)";
      c.style.borderColor = "var(--border)";
    });

    // 3. Find all cards matching this slotId (e.g. both detergent and bleach for liquid_detergent)
    const matchingCards = [];
    document.querySelectorAll(`.product-card[data-slot="${slotId}"], .slot-indicator-badge[data-slot="${slotId}"]`).forEach(el => {
      const card = el.classList.contains("product-card") ? el : el.closest(".product-card");
      if (card && !matchingCards.includes(card)) {
        matchingCards.push(card);
      }
    });

    matchingCards.forEach(card => {
      if (activeBadgeCard && card === activeBadgeCard) {
        // Direct click on this card's badge: primary focus
        card.style.boxShadow = "0 0 0 3.5px #2563eb, 0 4px 14px rgba(37,99,235,0.35)";
        card.style.borderColor = "#2563eb";
      } else if (activeBadgeCard && card !== activeBadgeCard) {
        // Shared-slot peer card (e.g. detergent when bleach clicked, or vice-versa)
        card.style.boxShadow = "0 0 0 2.5px #60a5fa, 0 2px 8px rgba(96,165,250,0.3)";
        card.style.borderColor = "#60a5fa";
      } else {
        // Clicked from drawer SVG: highlight all matching cards equally
        card.style.boxShadow = "0 0 0 3.5px #2563eb, 0 4px 14px rgba(37,99,235,0.35)";
        card.style.borderColor = "#2563eb";
      }
    });

    // 4. Scroll target into view
    if (activeBadgeCard) {
      activeBadgeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (matchingCards.length > 0) {
      matchingCards[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  renderPanelMap() {
    const isJa = this.currentLang === "ja";
    const m = this.data.machines[this.currentMachineId];
    if (!m || !m.interactivePanel) return;

    const panel = m.interactivePanel;
    const isWomenOnly = m.floor === 3;

    // Update banner in Panel View
    const nameElem = document.getElementById("panel-machine-name");
    if (nameElem) {
      nameElem.textContent = isJa ? (panel.modelLabelJa || panel.modelLabel) : panel.modelLabel;
    }

    const floorElem = document.getElementById("panel-floor-badge");
    if (floorElem) {
      floorElem.textContent = isWomenOnly
        ? (isJa ? "🌸 3F 女性専用" : "🌸 3F Women Only")
        : (isJa ? `${m.floor}階` : `${m.floor}F`);
      floorElem.classList.toggle("women-only", isWomenOnly);
    }

    // Render Smart Portrait Console for active machine
    this.renderSmartConsole();

    // Bind click and key handlers across all panel-btn-item elements
    const allPanelBtns = document.querySelectorAll(".panel-btn-item");
    allPanelBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const btnId = btn.getAttribute("data-btn-id");
        if (btnId) this.inspectPanelButton(btnId);
      };
      btn.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const btnId = btn.getAttribute("data-btn-id");
          if (btnId) this.inspectPanelButton(btnId);
        }
      };
    });

    // Default inspection target: course button or active button
    const defaultBtnId = this.selectedPanelButtonId || "btn_course";
    this.inspectPanelButton(defaultBtnId);
  }

  switchPanelMode(mode) {
    this.currentPanelLayoutMode = mode;
  }

  jumpToZone(zone) {}

  togglePanelScale() {}

  updateScaleFitState() {}

  filterSpatialZone(filter) {}

  renderSmartConsole() {
    const isJa = this.currentLang === "ja";
    const m = this.data.machines[this.currentMachineId];
    if (!m || !m.interactivePanel) return;

    const panel = m.interactivePanel;
    const chassis = document.getElementById("smart-panel-chassis");
    if (!chassis) return;

    const activeReading = this.currentReading || "0.6";

    let chassisHtml = "";
    if (panel.panelType === "panasonic_lx") {
      chassisHtml = this.buildPanasonicLXSmartHtml(panel, isJa, activeReading);
    } else if (panel.panelType === "panasonic_vx") {
      chassisHtml = this.buildPanasonicVXSmartHtml(panel, isJa, activeReading);
    } else if (panel.panelType === "sharp_s7c") {
      chassisHtml = this.buildSharpS7CSmartHtml(panel, isJa, activeReading);
    } else if (panel.panelType === "sharp_h10") {
      chassisHtml = this.buildSharpH10SmartHtml(panel, isJa, activeReading);
    }

    chassis.innerHTML = chassisHtml;
  }

  renderRealisticChassis() {}

  renderSpatialZonesView() {}

  renderButtonFinderView() {}

  getButtonLocationDescription(buttonId, isJa) {
    const m = this.data.machines[this.currentMachineId];
    const pType = m && m.interactivePanel ? m.interactivePanel.panelType : "";

    if (pType === "panasonic_lx") {
      if (["btn_wash", "btn_rinse", "btn_spin", "btn_dry"].includes(buttonId)) {
        return isJa ? "📍 左側：個別行程" : "📍 Left: Process Ladders";
      }
      if (["disp_screen_lx", "btn_timer", "btn_water_level", "btn_care"].includes(buttonId)) {
        return isJa ? "📍 中央：表示窓・設定" : "📍 Center: Screen & Care";
      }
      if (["btn_course", "btn_mode_switch"].includes(buttonId)) {
        return isJa ? "📍 右側：コース・洗乾切換" : "📍 Right: Courses & Modes";
      }
      return isJa ? "📍 右端：電源・スタート" : "📍 Far Right: Power & Start";
    }

    if (pType === "panasonic_vx") {
      if (["btn_wash", "btn_rinse", "btn_spin", "btn_dry"].includes(buttonId)) {
        return isJa ? "📍 左側：個別行程" : "📍 Left: Process Ladders";
      }
      if (["btn_course", "btn_auto_care", "disp_screen_vx"].includes(buttonId)) {
        return isJa ? "📍 中央：コース・表示窓" : "📍 Center: Courses & Screen";
      }
      if (["btn_mode_wash", "btn_mode_wash_dry", "btn_mode_dry"].includes(buttonId)) {
        return isJa ? "📍 中央右：運転内容3連" : "📍 Center-Right: Mode Buttons";
      }
      return isJa ? "📍 右端：電源・スタート" : "📍 Far Right: Power & Start";
    }

    if (pType === "sharp_s7c") {
      if (["btn_timer", "btn_plasmacluster_direct", "btn_delicates", "btn_wash", "btn_rinse", "btn_spin", "btn_dry", "btn_adjust_arrows", "disp_screen_s7c"].includes(buttonId)) {
        return isJa ? "📍 左側：行程・表示部" : "📍 Left: Display & Steps";
      }
      if (["btn_course", "btn_mode_switch"].includes(buttonId)) {
        return isJa ? "📍 中央：コース・運転切換" : "📍 Center: Courses & Modes";
      }
      return isJa ? "📍 右側：電源・スタート・ロック" : "📍 Right: Power, Start & Lock";
    }

    // sharp_h10
    if (["btn_unlock", "btn_wash", "btn_rinse", "btn_spin", "btn_dry"].includes(buttonId)) {
      return isJa ? "📍 左側：ロック・行程" : "📍 Left: Lock & Steps";
    }
    if (["disp_screen_h10", "btn_timer", "btn_delicates_kiwame"].includes(buttonId)) {
      return isJa ? "📍 中央：表示窓・極め洗い" : "📍 Center: Screen & Delicates";
    }
    if (["btn_course", "btn_mode_switch"].includes(buttonId)) {
      return isJa ? "📍 中央右：コース・運転切換" : "📍 Center-Right: Courses & Modes";
    }
    return isJa ? "📍 右端：電源・スタート" : "📍 Far Right: Power & Start";
  }

  buildPanasonicLXSmartHtml(panel, isJa, activeReading) {
    return `
      <div class="smart-faceplate smart-panasonic-lx">
        <div class="smart-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">Panasonic</span>
            <span class="chassis-model-name">NA-LX113BL</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">${isJa ? 'スゴ落ち 泡洗浄 / ヒートポンプ' : 'Micro-Foam / Heat Pump'}</span>
          </div>
        </div>

        <!-- TIER 1: Cycle Customization & Digital Screen -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 1 • ${isJa ? '行程設定 & 表示窓' : 'Cycle Customization & Screen'}</span>
            <span class="smart-tier-desc">${isJa ? '左側〜中央' : 'Console Left & Center'}</span>
          </div>
          <div class="process-columns-grid">
            <!-- 洗い -->
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">25分以上</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20分</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">15分</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">7分</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_wash">
                <span class="btn-main-label">洗い</span>
                <span class="btn-sub-label">自動槽洗浄(3秒)</span>
              </button>
            </div>
            <!-- すすぎ -->
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">注水</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3回以上</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">2回</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1回</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_rinse">
                <span class="btn-main-label">すすぎ</span>
                <span class="btn-sub-label">注水</span>
              </button>
            </div>
            <!-- 脱水 -->
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10分以上</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">6分</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3分</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1分</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_spin">
                <span class="btn-main-label">脱水</span>
                <span class="btn-sub-label">ジェットほぐし(3秒)</span>
              </button>
            </div>
            <!-- 乾燥 -->
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">タイマー</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">しっかり</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">標準</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">省エネ</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_dry">
                <span class="btn-main-label">乾燥</span>
                <span class="btn-sub-label">自動槽乾燥</span>
              </button>
            </div>
          </div>

          <!-- Digital Readout + Options Subrow -->
          <div class="smart-split-row" style="margin-top:6px;">
            <div class="recessed-screen panel-btn-item" data-btn-id="disp_screen_lx" role="button" tabindex="0">
              <div class="top-indicator-row">
                <span class="top-ind-item"><span class="led-dot"></span>プレ乾燥</span>
                <span class="top-ind-item"><span class="led-dot"></span>自動槽洗浄</span>
                <span class="top-ind-item"><span class="led-dot"></span>自動槽乾燥</span>
              </div>
              <div class="screen-labels-top">
                <span>残り(約)</span><span>洗剤(杯)</span><span>見直し中</span>
              </div>
              <div class="screen-digits-row">
                <span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span>
              </div>
              <div class="screen-labels-bottom">
                <span>時間後</span><span>分</span><span>回</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; justify-content:space-between;">
              <button class="chassis-btn btn-pill panel-btn-item" data-btn-id="btn_timer">
                <span class="btn-main-label">予約</span>
                <span class="btn-sub-label">${isJa ? 'タイマー' : 'Timer'}</span>
              </button>
              <div style="display:flex; gap:6px;">
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_water_level" style="flex:1;">
                  <span class="btn-main-label">水位</span>
                  <span class="btn-sub-label">排水F(3秒)</span>
                </button>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_care" style="flex:1;">
                  <span class="btn-main-label">お手入れ</span>
                  <span class="btn-sub-label">槽洗浄(3秒)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TIER 2: Course Programs & Operational Command Station -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 2 • ${isJa ? 'コース選択 & 電源・スタート' : 'Courses & Operations'}</span>
            <span class="smart-tier-desc">${isJa ? '右側〜右端' : 'Console Right & Far Right'}</span>
          </div>
          <div class="smart-split-row">
            <!-- Left: Courses & Modes -->
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div class="chassis-subcard course-subcard">
                <div class="course-matrix-grid">
                  <div class="course-item active"><span class="led-dot led-green"></span><span>おまかせ</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>おうちクリーニング</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>わたし流</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>どろんこ</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>パワフル滝</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>ナイト</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>ダニバスター</span></div>
                </div>
                <div style="display:flex; gap:6px; margin-top:4px;">
                  <button class="chassis-btn btn-pill-rocker panel-btn-item" data-btn-id="btn_course" style="flex:1.2;">
                    <span class="rocker-arrow">∧</span>
                    <span class="btn-main-label">コース選択</span>
                    <span class="rocker-arrow">∨</span>
                  </button>
                  <button class="chassis-btn panel-btn-item" data-btn-id="btn_mode_switch" style="flex:1;">
                    <span class="btn-main-label">洗乾切換</span>
                    <span class="btn-sub-label">チャイルド(5秒)</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Power & Start Station -->
            <div class="smart-command-station">
              <div class="safety-eco-row">
                <div class="door-lock-lamp"><span class="led-dot led-red"></span><span>🔒 ロック</span></div>
                <div class="econavi-badge-wrap"><span class="led-dot led-green"></span><span class="econavi-text">ECONAVI</span></div>
              </div>
              <div class="smart-power-start-actions">
                <button class="chassis-btn btn-power-round panel-btn-item" data-btn-id="btn_power_on">
                  <span class="power-sym">①</span>
                  <span class="btn-power-label">電源</span>
                </button>
                <button class="chassis-btn btn-start-illuminated panel-btn-item" data-btn-id="btn_start" style="flex:1;">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
              </div>
              <button class="chassis-btn btn-pill-mini panel-btn-item" data-btn-id="btn_fluff_keep" style="width:100%;">
                <span class="btn-sub-label">ふんわりキープ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildPanasonicVXSmartHtml(panel, isJa, activeReading) {
    return `
      <div class="smart-faceplate smart-panasonic-vx">
        <div class="smart-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">Panasonic</span>
            <span class="chassis-model-name">NA-VX3800L</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">10.0 HEAT PUMP</span>
          </div>
        </div>

        <!-- TIER 1: Ladders & Digital Display -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 1 • ${isJa ? '行程設定 & 表示窓' : 'Cycle Customization & Screen'}</span>
            <span class="smart-tier-desc">${isJa ? '左側〜中央' : 'Console Left & Center'}</span>
          </div>
          <div class="process-columns-grid">
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">30以上</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">25</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">15</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">7</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_wash"><span class="btn-main-label">洗い</span></button>
            </div>
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">注水</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">4</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">2</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_rinse"><span class="btn-main-label">すすぎ</span></button>
            </div>
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">ジェットほぐし</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10以上</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">6</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_spin">
                <span class="btn-main-label">脱水</span>
                <span class="btn-sub-label">ジェットほぐし(5秒)</span>
              </button>
            </div>
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">しっかり</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">標準</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">省エネ</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">ジェット乾燥</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">120/60/30</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_dry">
                <span class="btn-main-label">乾燥</span>
                <span class="btn-sub-label">ジェット乾燥(5秒)</span>
              </button>
            </div>
          </div>

          <!-- Display & Mode Select -->
          <div class="smart-split-row" style="margin-top:6px;">
            <div class="recessed-screen panel-btn-item" data-btn-id="disp_screen_vx" role="button" tabindex="0">
              <div class="screen-labels-top"><span>残り(約)分</span><span>予約(時間後)</span><span>洗剤(杯)</span></div>
              <div class="screen-digits-row"><span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span></div>
              <div class="top-indicator-row vx-top-row" style="margin-top:4px;">
                <span class="top-ind-item"><span class="led-dot"></span>自動槽洗浄</span>
                <span class="top-ind-item"><span class="led-dot"></span>見直し中</span>
                <span class="top-ind-item"><span class="led-dot"></span>フィルター掃除</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; justify-content:center;">
              <button class="chassis-btn btn-mode-bar panel-btn-item" data-btn-id="btn_mode_wash">
                <span class="mode-led-bar"></span><span class="btn-main-label">洗濯</span>
              </button>
              <button class="chassis-btn btn-mode-bar panel-btn-item" data-btn-id="btn_mode_wash_dry">
                <span class="mode-led-bar active"></span><span class="btn-main-label">洗濯〜乾燥</span>
              </button>
              <button class="chassis-btn btn-mode-bar panel-btn-item" data-btn-id="btn_mode_dry">
                <span class="mode-led-bar"></span><span class="btn-main-label">乾燥のみ</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TIER 2: Courses & Operations -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 2 • ${isJa ? 'コース選択 & 電源・スタート' : 'Courses & Operations'}</span>
            <span class="smart-tier-desc">${isJa ? '中央〜右端' : 'Console Center & Right'}</span>
          </div>
          <div class="smart-split-row">
            <div class="course-subcard">
              <div class="course-matrix-grid vx-grid">
                <div class="course-item active"><span class="led-dot led-green"></span><span>おまかせ</span></div>
                <div class="course-item"><span class="led-dot"></span><span>わたし流</span></div>
                <div class="course-item"><span class="led-dot"></span><span>ナイト</span></div>
                <div class="course-item"><span class="led-dot"></span><span>どろんこ</span></div>
                <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                <div class="course-item"><span class="led-dot"></span><span>おうちクリーニング</span></div>
                <div class="course-item"><span class="led-dot"></span><span>化繊60分</span></div>
                <div class="course-item"><span class="led-dot"></span><span>槽洗浄/乾燥</span></div>
              </div>
              <div class="vx-center-btn-row">
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_course"><span class="btn-main-label">コース</span></button>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_auto_care"><span class="btn-main-label">自動お手入れ</span></button>
              </div>
            </div>

            <div class="smart-command-station">
              <div class="safety-eco-row">
                <div class="door-lock-lamp"><span class="led-dot led-red"></span><span>🔒 ロック</span></div>
                <div class="econavi-badge-wrap"><span class="led-dot led-green"></span><span class="econavi-text">ECO</span></div>
              </div>
              <div class="smart-power-start-actions">
                <div class="power-box-cluster" style="margin:0; padding:4px 6px;">
                  <div class="power-box-title">電源</div>
                  <div class="power-box-buttons">
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_off">切</button>
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_on">入</button>
                  </div>
                </div>
                <button class="chassis-btn btn-start-illuminated panel-btn-item" data-btn-id="btn_start" style="flex:1;">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildSharpS7CSmartHtml(panel, isJa, activeReading) {
    return `
      <div class="smart-faceplate smart-sharp-s7c">
        <div class="smart-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">SHARP</span>
            <span class="chassis-model-name">ES-S7C</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">Plasmacluster 7000</span>
          </div>
        </div>

        <!-- TIER 1: Steps & Arched Screen -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 1 • ${isJa ? '行程設定 & 表示窓' : 'Cycle Steps & Screen'}</span>
            <span class="smart-tier-desc">${isJa ? '左側コンソール' : 'Console Left'}</span>
          </div>
          <div class="top-pills-row">
            <button class="chassis-btn btn-pill-top panel-btn-item" data-btn-id="btn_timer"><span class="btn-main-label">予約</span></button>
            <button class="chassis-btn btn-pill-top panel-btn-item" data-btn-id="btn_plasmacluster_direct"><span class="btn-main-label">槽クリーン</span></button>
            <button class="chassis-btn btn-pill-top panel-btn-item" data-btn-id="btn_delicates"><span class="btn-main-label">おしゃれ着</span></button>
          </div>
          <div class="process-horizontal-row">
            <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_wash"><span class="btn-main-label">洗い</span></button>
            <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_rinse"><span class="btn-main-label">すすぎ</span></button>
            <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_spin"><span class="btn-main-label">脱水</span></button>
            <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_dry"><span class="btn-main-label">乾かす</span></button>
            <div class="adjuster-rocker-s7c panel-btn-item" data-btn-id="btn_adjust_arrows" title="調節 ∨ ∧">
              <span class="adj-btn">∨</span>
              <span class="adj-btn">∧</span>
            </div>
          </div>
          <div class="recessed-screen arched-screen panel-btn-item" data-btn-id="disp_screen_s7c" role="button" tabindex="0">
            <div class="screen-labels-top"><span>予約(時間後)</span><span>残り</span><span>冷却中</span></div>
            <div class="screen-digits-row"><span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span></div>
            <div class="screen-labels-bottom"><span>洗剤(杯)</span><span>注水</span><span>分</span><span>回</span></div>
          </div>
        </div>

        <!-- TIER 2: Courses & Operational Command -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 2 • ${isJa ? 'コース・運転切換 & 電源・開始' : 'Courses & Operations'}</span>
            <span class="smart-tier-desc">${isJa ? '中央〜右端' : 'Console Center & Right'}</span>
          </div>
          <div class="smart-split-row">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div class="chassis-subcard">
                <div class="subcard-header"><span>コース</span></div>
                <div class="s7c-grid-courses">
                  <div class="course-item active"><span class="led-dot led-green"></span><span>標準</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>おうち流</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>時短</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>部屋干し</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>槽洗浄</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_course" style="margin-top:4px;"><span class="btn-main-label">コース</span></button>
              </div>
              <div class="chassis-subcard">
                <div class="subcard-header"><span>運転切換</span></div>
                <div class="s7c-stack-modes">
                  <div class="mode-item"><span class="led-dot"></span><span>🍇消臭</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>乾燥</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>洗濯</span></div>
                  <div class="mode-item active"><span class="led-dot led-green"></span><span>洗〜乾</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_mode_switch" style="margin-top:4px;"><span class="btn-main-label">運転切換</span></button>
              </div>
            </div>

            <div class="smart-command-station">
              <div class="safety-eco-row">
                <div class="door-lamp"><span class="led-dot led-red"></span>ロック</div>
                <span class="eco-badge">ECO</span>
              </div>
              <div class="smart-power-start-actions">
                <div class="power-box-cluster" style="margin:0; padding:4px 6px;">
                  <div class="power-box-title">電源</div>
                  <div class="power-box-buttons">
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_off">切</button>
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_on">入</button>
                  </div>
                </div>
                <button class="chassis-btn btn-start-circle panel-btn-item" data-btn-id="btn_start">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
              </div>
              <button class="chassis-btn btn-unlock-s7c panel-btn-item" data-btn-id="btn_unlock" style="width:100%;">
                <span class="btn-main-label">ロック解除</span>
                <span class="btn-sub-label">チャイルド(3秒)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildSharpH10SmartHtml(panel, isJa, activeReading) {
    const m = this.data.machines[this.currentMachineId];
    return `
      <div class="smart-faceplate smart-sharp-h10">
        <div class="smart-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">SHARP</span>
            <span class="chassis-model-name">${m.model}</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">マイクロ高圧洗浄 / プラズマクラスター</span>
          </div>
        </div>

        <!-- TIER 1: Steps & Screen -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 1 • ${isJa ? 'ロック・行程 & 表示窓' : 'Cycles & Screen'}</span>
            <span class="smart-tier-desc">${isJa ? '左側〜中央' : 'Console Left & Center'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div class="door-lamp"><span class="led-dot led-red"></span>ドアロック</div>
            <button class="chassis-btn btn-unlock-h10 panel-btn-item" data-btn-id="btn_unlock">
              <span class="btn-main-label">ロック解除</span>
              <span class="btn-sub-label">チャイルド(3秒)</span>
            </button>
          </div>
          <div class="process-columns-grid">
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">5分</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_wash"><span class="btn-main-label">洗い</span></button>
            </div>
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">注水</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">2</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1回</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_rinse"><span class="btn-main-label">すすぎ</span></button>
            </div>
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">自動</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">5</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1分</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_spin"><span class="btn-main-label">脱水</span></button>
            </div>
            <div class="process-col">
              <div class="led-ladder">
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">(点滅)自動</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">30 3</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20 2</span></div>
                <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10分 1.5h</span></div>
              </div>
              <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_dry"><span class="btn-main-label">乾かす</span></button>
            </div>
          </div>

          <div class="smart-split-row" style="margin-top:6px;">
            <div class="recessed-screen panel-btn-item" data-btn-id="disp_screen_h10" role="button" tabindex="0">
              <div class="screen-labels-top"><span>残り(分)</span><span>冷却中</span><span>🍇</span></div>
              <div class="screen-digits-row"><span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span></div>
              <div class="screen-labels-bottom"><span>洗剤(杯)</span><span>予約(時間後)</span></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; justify-content:center;">
              <button class="chassis-btn btn-pill panel-btn-item" data-btn-id="btn_timer"><span class="btn-main-label">予約</span></button>
              <button class="chassis-btn btn-kiwame panel-btn-item" data-btn-id="btn_delicates_kiwame">
                <span class="btn-icon">👔</span><span class="btn-main-label">極め洗い</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TIER 2: Courses & Operations -->
        <div class="smart-tier-section">
          <div class="smart-tier-header">
            <span class="smart-tier-tag">STEP 2 • ${isJa ? 'コース・運転切換 & 電源・開始' : 'Courses & Operations'}</span>
            <span class="smart-tier-desc">${isJa ? '中央右〜右端' : 'Console Center & Right'}</span>
          </div>
          <div class="smart-split-row">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div class="chassis-subcard">
                <div class="subcard-header"><span>コース</span></div>
                <div class="h10-grid-courses">
                  <div class="course-item active"><span class="led-dot led-green"></span><span>標準</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>サッと予洗い</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>おうち流</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>部屋干し</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>時短(2kg)</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>槽洗浄</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_course" style="margin-top:4px;"><span class="btn-main-label">コース</span></button>
              </div>
              <div class="chassis-subcard">
                <div class="subcard-header"><span>運転切換</span></div>
                <div class="h10-stack-modes">
                  <div class="mode-item active"><span class="led-dot led-green"></span><span>洗濯</span></div>
                  <div class="mode-item active"><span class="led-dot led-green"></span><span>乾燥</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>消臭</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>槽クリーン</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_mode_switch" style="margin-top:4px;"><span class="btn-main-label">運転切換</span></button>
              </div>
            </div>

            <div class="smart-command-station">
              <div class="safety-eco-row">
                <span class="eco-badge">ECO</span>
              </div>
              <div class="smart-power-start-actions">
                <div class="power-box-cluster" style="margin:0; padding:4px 6px;">
                  <div class="power-box-title">電源</div>
                  <div class="power-box-buttons">
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_off">切</button>
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_on">入</button>
                  </div>
                </div>
                <button class="chassis-btn btn-start-circle panel-btn-item" data-btn-id="btn_start">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildPanasonicLXChassisHtml(panel, isJa, activeReading) {
    return `
      <div class="chassis-faceplate chassis-panasonic-lx">
        <div class="chassis-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">Panasonic</span>
            <span class="chassis-model-name">NA-LX113BL</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">${isJa ? 'スゴ落ち 泡洗浄 / ヒートポンプ乾燥' : 'Micro-Foam Wash / Heat Pump'}</span>
          </div>
        </div>

        <div class="chassis-main-bar">
          <!-- 1. Left Zone: Process Customization Ladders & Buttons -->
          <div class="chassis-phys-zone zone-left" data-zone="left">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">◀ ${isJa ? '左側' : 'Left'}</span>
              <span class="zone-title-text">${isJa ? '個別行程設定' : 'Cycle Customization'}</span>
            </div>
            <div class="process-columns-grid">
              <!-- 洗い -->
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">25分以上</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20分</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">15分</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">7分</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_wash">
                  <span class="btn-main-label">洗い</span>
                  <span class="btn-sub-label">自動槽洗浄(3秒)</span>
                </button>
              </div>

              <!-- すすぎ -->
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">注水</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3回以上</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">2回</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1回</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_rinse">
                  <span class="btn-main-label">すすぎ</span>
                  <span class="btn-sub-label">注水</span>
                </button>
              </div>

              <!-- 脱水 -->
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10分以上</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">6分</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3分</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1分</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_spin">
                  <span class="btn-main-label">脱水</span>
                  <span class="btn-sub-label">ジェットほぐし(3秒)</span>
                </button>
              </div>

              <!-- 乾燥 -->
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">タイマー</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">しっかり</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">標準</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">省エネ</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_dry">
                  <span class="btn-main-label">乾燥</span>
                  <span class="btn-sub-label">自動槽乾燥</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Center Zone: Digital Display, Timer & Maintenance -->
          <div class="chassis-phys-zone zone-center" data-zone="center">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⏺ ${isJa ? '中央' : 'Center'}</span>
              <span class="zone-title-text">${isJa ? '表示部・設定' : 'Display & Options'}</span>
            </div>
            <div class="center-subsections-wrap">
              <div class="display-timer-block">
                <div class="recessed-screen panel-btn-item" data-btn-id="disp_screen_lx" role="button" tabindex="0" title="デジタル表示窓">
                  <div class="top-indicator-row">
                    <span class="top-ind-item"><span class="led-dot"></span>プレ乾燥</span>
                    <span class="top-ind-item"><span class="led-dot"></span>自動槽洗浄</span>
                    <span class="top-ind-item"><span class="led-dot"></span>自動槽乾燥</span>
                  </div>
                  <div class="screen-labels-top">
                    <span>残り(約)</span>
                    <span>洗剤(杯)</span>
                    <span>見直し中</span>
                  </div>
                  <div class="screen-digits-row">
                    <span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span>
                  </div>
                  <div class="screen-labels-bottom">
                    <span>時間後</span>
                    <span>分</span>
                    <span>回</span>
                  </div>
                </div>
                <button class="chassis-btn btn-pill panel-btn-item" data-btn-id="btn_timer">
                  <span class="btn-main-label">予約</span>
                  <span class="btn-sub-label">${isJa ? 'タイマー' : 'Timer'}</span>
                </button>
              </div>

              <div class="care-level-block">
                <div class="status-lamps-cluster">
                  <div class="lamp-row"><span class="led-dot"></span><span>槽洗浄</span></div>
                  <div class="lamp-row"><span class="led-dot"></span><span>乾燥F</span></div>
                  <div class="lamp-row"><span class="led-dot"></span><span>水位高め</span></div>
                  <div class="lamp-row"><span class="led-dot"></span><span>ふんわり</span></div>
                </div>
                <div class="care-level-btns">
                  <button class="chassis-btn panel-btn-item" data-btn-id="btn_water_level">
                    <span class="btn-main-label">水位</span>
                    <span class="btn-sub-label">排水F(3秒)</span>
                  </button>
                  <button class="chassis-btn panel-btn-item" data-btn-id="btn_care">
                    <span class="btn-main-label">お手入れ</span>
                    <span class="btn-sub-label">槽洗浄(3秒)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Right Zone: Course Selection & Mode Switch -->
          <div class="chassis-phys-zone zone-right" data-zone="right">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">▶ ${isJa ? '右側' : 'Right'}</span>
              <span class="zone-title-text">${isJa ? 'コース・運転切換' : 'Courses & Modes'}</span>
            </div>
            <div class="courses-mode-wrap">
              <div class="chassis-subcard course-subcard">
                <div class="course-matrix-grid">
                  <div class="course-item active"><span class="led-dot led-green"></span><span>おまかせ</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>おうちクリーニング</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>わたし流</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>どろんこ</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>パワフル滝</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>ナイト</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>ダニバスター</span></div>
                </div>
                <button class="chassis-btn btn-pill-rocker panel-btn-item" data-btn-id="btn_course">
                  <span class="rocker-arrow">∧</span>
                  <span class="btn-main-label">コース選択</span>
                  <span class="rocker-arrow">∨</span>
                </button>
              </div>

              <div class="chassis-subcard mode-subcard">
                <div class="mode-led-stack">
                  <div class="mode-led-item"><span class="led-dot"></span><span>洗濯</span></div>
                  <div class="mode-led-item active"><span class="led-dot led-green"></span><span>洗〜乾</span></div>
                  <div class="mode-led-item"><span class="led-dot"></span><span>乾燥</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_mode_switch">
                  <span class="btn-main-label">洗乾切換</span>
                  <span class="btn-sub-label">チャイルドロック(5秒)</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 4. Far Right Zone: Power, Start & Door Lock -->
          <div class="chassis-phys-zone zone-far-right" data-zone="far-right">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⚡ ${isJa ? '右端' : 'Far Right'}</span>
              <span class="zone-title-text">${isJa ? '電源・スタート' : 'Power & Start'}</span>
            </div>
            <div class="far-right-stack">
              <div class="safety-eco-row">
                <div class="door-lock-lamp"><span class="led-dot led-red"></span><span>🔒 ロック</span></div>
                <div class="econavi-badge-wrap"><span class="led-dot led-green"></span><span class="econavi-text">ECONAVI</span></div>
              </div>
              <div class="power-start-actions">
                <button class="chassis-btn btn-start-illuminated panel-btn-item" data-btn-id="btn_start">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
                <button class="chassis-btn btn-power-round panel-btn-item" data-btn-id="btn_power_on">
                  <span class="power-sym">①</span>
                  <span class="btn-power-label">電源</span>
                </button>
              </div>
              <button class="chassis-btn btn-pill-mini panel-btn-item" data-btn-id="btn_fluff_keep" style="margin-top:4px;">
                <span class="btn-sub-label">ふんわりキープ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildPanasonicVXChassisHtml(panel, isJa, activeReading) {
    return `
      <div class="chassis-faceplate chassis-panasonic-vx">
        <div class="chassis-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">Panasonic</span>
            <span class="chassis-model-name">NA-VX3800L</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">10.0 HEAT PUMP</span>
          </div>
        </div>

        <div class="chassis-main-bar">
          <!-- 1. Left Zone: 4 Process Ladders -->
          <div class="chassis-phys-zone zone-left" data-zone="left">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">◀ ${isJa ? '左側' : 'Left'}</span>
              <span class="zone-title-text">${isJa ? '個別行程' : 'Process Steps'}</span>
            </div>
            <div class="process-columns-grid">
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">30以上</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">25</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">15</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">7</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_wash"><span class="btn-main-label">洗い</span></button>
              </div>
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">注水</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">4</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">2</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_rinse"><span class="btn-main-label">すすぎ</span></button>
              </div>
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">ジェットほぐし</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10以上</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">6</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_spin">
                  <span class="btn-main-label">脱水</span>
                  <span class="btn-sub-label">ジェットほぐし(5秒)</span>
                </button>
              </div>
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">しっかり</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">標準</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">省エネ</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">ジェット乾燥</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">120/60/30</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_dry">
                  <span class="btn-main-label">乾燥</span>
                  <span class="btn-sub-label">ジェット乾燥(5秒)</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Center-Left: Courses & Auto Care -->
          <div class="chassis-phys-zone zone-center-left" data-zone="center">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⏺ ${isJa ? '中央左' : 'Courses'}</span>
              <span class="zone-title-text">${isJa ? 'コース・お手入れ' : 'Programs & Care'}</span>
            </div>
            <div class="course-subcard">
              <div class="course-matrix-grid vx-grid">
                <div class="course-item active"><span class="led-dot led-green"></span><span>おまかせ</span></div>
                <div class="course-item"><span class="led-dot"></span><span>わたし流</span></div>
                <div class="course-item"><span class="led-dot"></span><span>ナイト</span></div>
                <div class="course-item"><span class="led-dot"></span><span>どろんこ</span></div>
                <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                <div class="course-item"><span class="led-dot"></span><span>おうちクリーニング</span></div>
                <div class="course-item"><span class="led-dot"></span><span>化繊60分</span></div>
                <div class="course-item"><span class="led-dot"></span><span>槽洗浄/乾燥</span></div>
              </div>
              <div class="vx-center-btn-row">
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_course"><span class="btn-main-label">コース</span></button>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_auto_care"><span class="btn-main-label">自動お手入れ</span></button>
              </div>
            </div>
          </div>

          <!-- 3. Center: Digital Display -->
          <div class="chassis-phys-zone zone-center" data-zone="center">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⏺ ${isJa ? '中央' : 'Display'}</span>
              <span class="zone-title-text">${isJa ? '表示窓' : 'Readout'}</span>
            </div>
            <div class="recessed-screen panel-btn-item" data-btn-id="disp_screen_vx" role="button" tabindex="0">
              <div class="screen-labels-top"><span>残り(約)分</span><span>予約(時間後)</span><span>洗剤(杯)</span></div>
              <div class="screen-digits-row"><span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span></div>
              <div class="top-indicator-row vx-top-row" style="margin-top:4px;">
                <span class="top-ind-item"><span class="led-dot"></span>自動槽洗浄</span>
                <span class="top-ind-item"><span class="led-dot"></span>見直し中</span>
                <span class="top-ind-item"><span class="led-dot"></span>フィルター</span>
              </div>
            </div>
          </div>

          <!-- 4. Center-Right: Mode Stack -->
          <div class="chassis-phys-zone zone-center-right" data-zone="right">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">▶ ${isJa ? '中央右' : 'Modes'}</span>
              <span class="zone-title-text">${isJa ? '運転内容' : 'Mode Select'}</span>
            </div>
            <div class="mode-stack-col">
              <button class="chassis-btn btn-mode-bar panel-btn-item" data-btn-id="btn_mode_wash">
                <span class="mode-led-bar"></span>
                <span class="btn-main-label">洗濯</span>
              </button>
              <button class="chassis-btn btn-mode-bar panel-btn-item" data-btn-id="btn_mode_wash_dry">
                <span class="mode-led-bar active"></span>
                <span class="btn-main-label">洗濯〜乾燥</span>
              </button>
              <button class="chassis-btn btn-mode-bar panel-btn-item" data-btn-id="btn_mode_dry">
                <span class="mode-led-bar"></span>
                <span class="btn-main-label">乾燥のみ</span>
              </button>
            </div>
          </div>

          <!-- 5. Far Right: Power, Start & Locks -->
          <div class="chassis-phys-zone zone-far-right" data-zone="far-right">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⚡ ${isJa ? '右端' : 'Far Right'}</span>
              <span class="zone-title-text">${isJa ? '電源・開始' : 'Power & Start'}</span>
            </div>
            <div class="far-right-stack">
              <div class="safety-eco-row">
                <div class="door-lock-lamp"><span class="led-dot led-red"></span><span>🔒 ロック</span></div>
                <div class="econavi-badge-wrap"><span class="led-dot led-green"></span><span class="econavi-text">ECO</span></div>
              </div>
              <div class="power-start-actions">
                <button class="chassis-btn btn-start-illuminated panel-btn-item" data-btn-id="btn_start">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
                <div class="power-box-cluster" style="margin-top:4px;">
                  <div class="power-box-title">電源</div>
                  <div class="power-box-buttons">
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_off">切</button>
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_on">入</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildSharpS7CChassisHtml(panel, isJa, activeReading) {
    return `
      <div class="chassis-faceplate chassis-sharp-s7c">
        <div class="chassis-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">SHARP</span>
            <span class="chassis-model-name">ES-S7C</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">Plasmacluster 7000</span>
          </div>
        </div>

        <div class="chassis-main-bar">
          <!-- 1. Left Zone: Pills, Steps & Arched Display -->
          <div class="chassis-phys-zone zone-left" data-zone="left" style="flex: 1.6;">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">◀ ${isJa ? '左側' : 'Left'}</span>
              <span class="zone-title-text">${isJa ? '行程・表示部' : 'Steps & Display'}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div class="top-pills-row">
                <button class="chassis-btn btn-pill-top panel-btn-item" data-btn-id="btn_timer"><span class="btn-main-label">予約</span></button>
                <button class="chassis-btn btn-pill-top panel-btn-item" data-btn-id="btn_plasmacluster_direct"><span class="btn-main-label">槽クリーン</span></button>
                <button class="chassis-btn btn-pill-top panel-btn-item" data-btn-id="btn_delicates"><span class="btn-main-label">おしゃれ着</span></button>
              </div>
              <div class="process-horizontal-row">
                <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_wash"><span class="btn-main-label">洗い</span></button>
                <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_rinse"><span class="btn-main-label">すすぎ</span></button>
                <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_spin"><span class="btn-main-label">脱水</span></button>
                <button class="chassis-btn btn-s7c-proc panel-btn-item" data-btn-id="btn_dry"><span class="btn-main-label">乾かす</span></button>
                <div class="adjuster-rocker-s7c panel-btn-item" data-btn-id="btn_adjust_arrows" title="調節 ∨ ∧">
                  <span class="adj-btn">∨</span>
                  <span class="adj-btn">∧</span>
                </div>
              </div>
              <div class="recessed-screen arched-screen panel-btn-item" data-btn-id="disp_screen_s7c" role="button" tabindex="0">
                <div class="screen-labels-top"><span>予約(時間後)</span><span>残り</span><span>冷却中</span></div>
                <div class="screen-digits-row"><span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span></div>
                <div class="screen-labels-bottom"><span>洗剤(杯)</span><span>注水</span><span>分</span><span>回</span></div>
              </div>
            </div>
          </div>

          <!-- 2. Center Zone: Courses & Modes -->
          <div class="chassis-phys-zone zone-center" data-zone="center">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⏺ ${isJa ? '中央' : 'Center'}</span>
              <span class="zone-title-text">${isJa ? 'コース・切換' : 'Programs & Modes'}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div class="chassis-subcard">
                <div class="subcard-header"><span>コース</span></div>
                <div class="s7c-grid-courses">
                  <div class="course-item active"><span class="led-dot led-green"></span><span>標準</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>おうち流</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>時短</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>部屋干し</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>槽洗浄</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_course" style="margin-top:4px;"><span class="btn-main-label">コース</span></button>
              </div>
              <div class="chassis-subcard">
                <div class="subcard-header"><span>運転切換</span></div>
                <div class="s7c-stack-modes">
                  <div class="mode-item"><span class="led-dot"></span><span>🍇消臭</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>乾燥</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>洗濯</span></div>
                  <div class="mode-item active"><span class="led-dot led-green"></span><span>洗〜乾</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_mode_switch" style="margin-top:4px;"><span class="btn-main-label">運転切換</span></button>
              </div>
            </div>
          </div>

          <!-- 3. Right Zone: Power, Start & Lock -->
          <div class="chassis-phys-zone zone-far-right" data-zone="far-right">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⚡ ${isJa ? '右端' : 'Far Right'}</span>
              <span class="zone-title-text">${isJa ? '電源・開始' : 'Power & Start'}</span>
            </div>
            <div class="far-right-stack">
              <div class="safety-eco-row">
                <div class="door-lamp"><span class="led-dot led-red"></span>ロック</div>
                <span class="eco-badge">ECO</span>
              </div>
              <div class="power-start-actions">
                <button class="chassis-btn btn-start-circle panel-btn-item" data-btn-id="btn_start">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
                <div class="power-box-cluster" style="margin-top:4px;">
                  <div class="power-box-title">電源</div>
                  <div class="power-box-buttons">
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_off">切</button>
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_on">入</button>
                  </div>
                </div>
              </div>
              <button class="chassis-btn btn-unlock-s7c panel-btn-item" data-btn-id="btn_unlock" style="margin-top:4px; width:100%;">
                <span class="btn-main-label">ロック解除</span>
                <span class="btn-sub-label">チャイルド(3秒)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildSharpH10ChassisHtml(panel, isJa, activeReading) {
    const m = this.data.machines[this.currentMachineId];
    return `
      <div class="chassis-faceplate chassis-sharp-h10">
        <div class="chassis-brand-strip">
          <div class="chassis-brand-left">
            <span class="chassis-brand-name">SHARP</span>
            <span class="chassis-model-name">${m.model}</span>
          </div>
          <div class="chassis-brand-right">
            <span class="chassis-tech-pill">マイクロ高圧洗浄 / プラズマクラスター</span>
          </div>
        </div>

        <div class="chassis-main-bar">
          <!-- 1. Left Zone: Lock & Cycle Ladders -->
          <div class="chassis-phys-zone zone-left" data-zone="left" style="flex: 1.5;">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">◀ ${isJa ? '左側' : 'Left'}</span>
              <span class="zone-title-text">${isJa ? 'ロック・個別行程' : 'Lock & Cycles'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <div class="door-lamp"><span class="led-dot led-red"></span>ドアロック</div>
              <button class="chassis-btn btn-unlock-h10 panel-btn-item" data-btn-id="btn_unlock">
                <span class="btn-main-label">ロック解除</span>
                <span class="btn-sub-label">チャイルド(3秒)</span>
              </button>
            </div>
            <div class="process-columns-grid">
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">5分</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_wash"><span class="btn-main-label">洗い</span></button>
              </div>
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">注水</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">2</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1回</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_rinse"><span class="btn-main-label">すすぎ</span></button>
              </div>
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">自動</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">5</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">3</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">1分</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_spin"><span class="btn-main-label">脱水</span></button>
              </div>
              <div class="process-col">
                <div class="led-ladder">
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">(点滅)自動</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">30 3</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">20 2</span></div>
                  <div class="ladder-step"><span class="led-dot"></span><span class="ladder-label">10分 1.5h</span></div>
                </div>
                <button class="chassis-btn btn-process panel-btn-item" data-btn-id="btn_dry"><span class="btn-main-label">乾かす</span></button>
              </div>
            </div>
          </div>

          <!-- 2. Center Zone: Screen, Timer & Delicates Direct -->
          <div class="chassis-phys-zone zone-center" data-zone="center">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⏺ ${isJa ? '中央' : 'Center'}</span>
              <span class="zone-title-text">${isJa ? '表示部・専用' : 'Screen & Delicates'}</span>
            </div>
            <div class="recessed-screen panel-btn-item" data-btn-id="disp_screen_h10" role="button" tabindex="0">
              <div class="screen-labels-top"><span>残り(分)</span><span>冷却中</span><span>🍇</span></div>
              <div class="screen-digits-row"><span class="digital-7seg">${activeReading}</span><span class="digital-7seg-unit">杯</span></div>
              <div class="screen-labels-bottom"><span>洗剤(杯)</span><span>予約(時間後)</span></div>
            </div>
            <div style="display:flex; gap:4px; margin-top:6px;">
              <button class="chassis-btn btn-pill panel-btn-item" data-btn-id="btn_timer" style="flex:1;"><span class="btn-main-label">予約</span></button>
              <button class="chassis-btn btn-kiwame panel-btn-item" data-btn-id="btn_delicates_kiwame" style="flex:1.2;">
                <span class="btn-icon">👔</span><span class="btn-main-label">極め洗い</span>
              </button>
            </div>
          </div>

          <!-- 3. Center-Right: Courses & Modes -->
          <div class="chassis-phys-zone zone-center-right" data-zone="right">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">▶ ${isJa ? '中央右' : 'Courses'}</span>
              <span class="zone-title-text">${isJa ? 'コース・切換' : 'Programs & Modes'}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div class="chassis-subcard">
                <div class="subcard-header"><span>コース</span></div>
                <div class="h10-grid-courses">
                  <div class="course-item active"><span class="led-dot led-green"></span><span>標準</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>サッと予洗い</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>おうち流</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>部屋干し</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>時短(2kg)</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>槽洗浄</span></div>
                  <div class="course-item"><span class="led-dot"></span><span>毛布</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_course" style="margin-top:4px;"><span class="btn-main-label">コース</span></button>
              </div>
              <div class="chassis-subcard">
                <div class="subcard-header"><span>運転切換</span></div>
                <div class="h10-stack-modes">
                  <div class="mode-item active"><span class="led-dot led-green"></span><span>洗濯</span></div>
                  <div class="mode-item active"><span class="led-dot led-green"></span><span>乾燥</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>消臭</span></div>
                  <div class="mode-item"><span class="led-dot"></span><span>槽クリーン</span></div>
                </div>
                <button class="chassis-btn panel-btn-item" data-btn-id="btn_mode_switch" style="margin-top:4px;"><span class="btn-main-label">運転切換</span></button>
              </div>
            </div>
          </div>

          <!-- 4. Far Right: Power, Start & ECO -->
          <div class="chassis-phys-zone zone-far-right" data-zone="far-right">
            <div class="phys-zone-header">
              <span class="zone-pos-tag">⚡ ${isJa ? '右端' : 'Far Right'}</span>
              <span class="zone-title-text">${isJa ? '電源・開始' : 'Power & Start'}</span>
            </div>
            <div class="far-right-stack">
              <div class="safety-eco-row">
                <span class="eco-badge">ECO</span>
              </div>
              <div class="power-start-actions">
                <button class="chassis-btn btn-start-circle panel-btn-item" data-btn-id="btn_start">
                  <span class="btn-start-label">スタート</span>
                  <span class="btn-start-sub">一時停止</span>
                </button>
                <div class="power-box-cluster" style="margin-top:4px;">
                  <div class="power-box-title">電源</div>
                  <div class="power-box-buttons">
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_off">切</button>
                    <button class="chassis-btn btn-power-sq panel-btn-item" data-btn-id="btn_power_on">入</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  findPanelItem(buttonId) {
    const m = this.data.machines[this.currentMachineId];
    if (!m || !m.interactivePanel) return null;
    const panel = m.interactivePanel;

    // Search across sections
    if (panel.sections) {
      for (const sec of panel.sections) {
        if (sec.columns) {
          for (const col of sec.columns) {
            if (col.buttonId === buttonId || col.id === buttonId) return col;
          }
        }
        if (sec.processColumns) {
          for (const col of sec.processColumns) {
            if (col.buttonId === buttonId || col.id === buttonId) return col;
          }
        }
        if (sec.screen && sec.screen.id === buttonId) return sec.screen;
        if (sec.button && sec.button.id === buttonId) {
          // If course button, attach course grid options
          if (sec.courseGrid) {
            sec.button.options = sec.courseGrid.flat();
          }
          return sec.button;
        }
        if (sec.startButton && sec.startButton.id === buttonId) return sec.startButton;
        if (sec.powerButton && sec.powerButton.id === buttonId) return sec.powerButton;
        if (sec.powerBox) {
          if (sec.powerBox.offButton && sec.powerBox.offButton.id === buttonId) return sec.powerBox.offButton;
          if (sec.powerBox.onButton && sec.powerBox.onButton.id === buttonId) return sec.powerBox.onButton;
        }
        if (sec.extraButtons) {
          for (const b of sec.extraButtons) {
            if (b.id === buttonId) return b;
          }
        }
        if (sec.items) {
          for (const item of sec.items) {
            if (item.id === buttonId) return item;
          }
        }
        if (sec.topPills) {
          for (const p of sec.topPills) {
            if (p.id === buttonId) return p;
          }
        }
        if (sec.processRow) {
          for (const p of sec.processRow) {
            if (p.id === buttonId) return p;
          }
        }
        if (sec.adjusters && sec.adjusters.id === buttonId) return sec.adjusters;
        if (sec.courseCol && sec.courseCol.button && sec.courseCol.button.id === buttonId) {
          if (sec.courseCol.grid) sec.courseCol.button.options = sec.courseCol.grid.flat().filter(o => o.kanji);
          return sec.courseCol.button;
        }
        if (sec.modeCol && sec.modeCol.button && sec.modeCol.button.id === buttonId) {
          if (sec.modeCol.modes) sec.modeCol.button.options = sec.modeCol.modes;
          return sec.modeCol.button;
        }
        if (sec.modeCol && sec.modeCol.virtualButtons) {
          for (const b of sec.modeCol.virtualButtons) {
            if (b.id === buttonId) return b;
          }
        }
        if (sec.buttons) {
          for (const b of sec.buttons) {
            if (b.id === buttonId) {
              if (b.id === "btn_course" && sec.courseRows) {
                b.options = sec.courseRows.flat();
              }
              return b;
            }
          }
        }
        if (sec.doorLock && sec.doorLock.button && sec.doorLock.button.id === buttonId) return sec.doorLock.button;
        if (sec.doorLockBox && sec.doorLockBox.button && sec.doorLockBox.button.id === buttonId) return sec.doorLockBox.button;
        if (sec.timerButton && sec.timerButton.id === buttonId) return sec.timerButton;
        if (sec.delicatesDirectButton && sec.delicatesDirectButton.id === buttonId) return sec.delicatesDirectButton;
      }
    }

    // Fallback for legacy zones if present
    if (panel.zones) {
      for (const zone of panel.zones) {
        for (const item of zone.items) {
          if (item.id === buttonId) return item;
        }
      }
    }

    return null;
  }

  inspectPanelButton(buttonId) {
    const isJa = this.currentLang === "ja";
    let targetItem = this.findPanelItem(buttonId);
    if (!targetItem && buttonId !== "btn_course") {
      targetItem = this.findPanelItem("btn_course");
      if (targetItem) buttonId = "btn_course";
    }
    if (!targetItem) return;
    this.selectedPanelButtonId = buttonId;

    // Highlight button across all views (chassis, spatial zones, button finder)
    document.querySelectorAll(".panel-btn-item").forEach(b => {
      b.classList.toggle("active-inspect", b.getAttribute("data-btn-id") === buttonId);
    });

    // Populate inspector card
    const card = document.getElementById("panel-inspector-card");
    if (!card) return;

    const locDesc = this.getButtonLocationDescription(buttonId, isJa);
    const badgeText = isJa ? (targetItem.badgeJa || targetItem.badgeEn) : targetItem.badgeEn;
    const descText = isJa ? (targetItem.descJa || targetItem.descEn) : targetItem.descEn;

    // Hold function banner if present
    let holdHtml = "";
    if (targetItem.subtext || targetItem.subtextEn) {
      const holdText = isJa ? (targetItem.subtext || targetItem.subtextEn) : (targetItem.subtextEn || targetItem.subtext);
      holdHtml = `
        <div class="inspector-hold-callout">
          <span class="hold-icon">⏱️</span>
          <div>
            <strong>${isJa ? '長押し機能:' : 'Long-Press Function:'}</strong> ${holdText}
          </div>
        </div>
      `;
    }

    // Ladder steps banner if present
    let ladderHtml = "";
    if (targetItem.ladder && targetItem.ladder.length > 0) {
      ladderHtml = `
        <div class="inspector-ladder-box">
          <div class="inspector-ladder-title">${isJa ? '設定値（押すたびに切り替え）:' : 'Configurable Steps (Press to cycle):'}</div>
          <div class="inspector-ladder-pills">
            ${targetItem.ladder.map(step => `<span class="ladder-pill">${step}</span>`).join(" ➔ ")}
          </div>
        </div>
      `;
    }

    // Options list if present
    let optionsHtml = "";
    if (targetItem.options && targetItem.options.length > 0) {
      const optRows = targetItem.options.map(opt => {
        const optName = isJa ? `${opt.kanji}（${opt.romaji}）` : `${opt.kanji} • ${opt.en}`;
        const optSub = isJa ? (opt.descJa || opt.descEn || "") : (opt.descEn || opt.descJa || "");
        return `
          <div class="inspector-option-row">
            <div class="inspector-opt-name">${opt.kanji} <span style="font-weight:normal; opacity:0.8;">[${opt.romaji}]</span> — <strong>${opt.en}</strong></div>
            ${optSub ? `<div class="inspector-opt-sub">${optSub}</div>` : ''}
          </div>
        `;
      }).join("");

      optionsHtml = `
        <div class="inspector-options-box">
          <div class="inspector-options-title">${isJa ? '選択肢一覧:' : 'Available Cycle Options:'}</div>
          <div class="inspector-options-list">
            ${optRows}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="inspector-header-row">
        <div class="inspector-kanji-wrap">
          <span style="font-size:1.3rem;">${targetItem.icon || '🔘'}</span>
          <span class="inspector-kanji">${targetItem.kanji}</span>
          <span class="inspector-romaji">/${targetItem.romaji}/</span>
        </div>
        <div class="inspector-badges-wrap">
          ${locDesc ? `<span class="inspector-location-badge">${locDesc}</span>` : ''}
          ${badgeText ? `<span class="inspector-badge">${badgeText}</span>` : ''}
        </div>
      </div>
      <div class="inspector-en">${targetItem.en}</div>
      <div class="inspector-desc">${descText}</div>
      ${holdHtml}
      ${ladderHtml}
      ${optionsHtml}
    `;
  }

  renderPanelDictionary() {
    const grid = document.getElementById("dictionary-grid");
    if (!grid) return;

    const q = (this.dictSearchQuery || "").toLowerCase().trim();
    const filtered = this.data.panelDictionary.filter(item => {
      if (!q) return true;
      const text = `${item.ja} ${item.romaji} ${item.en} ${item.note}`.toLowerCase();
      return text.includes(q);
    });

    if (filtered.length === 0) {
      const isJa = this.currentLang === "ja";
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-muted);">
          ${isJa ? `「${this.dictSearchQuery}」に一致する用語は見つかりませんでした。` : `No matching glossary terms found for "${this.dictSearchQuery}".`}
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <div class="dict-card">
        <div class="dict-ja">${item.ja}</div>
        <div class="dict-romaji">${item.romaji}</div>
        <div class="dict-en">${item.en}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${item.note}</div>
      </div>
    `).join("");
  }


  renderErrorList() {
    const isJa = this.currentLang === "ja";
    const container = document.getElementById("error-cards-list");
    if (!container) return;

    const m = this.data.machines[this.currentMachineId];
    const brand = m.brand;
    const q = this.searchQuery;

    const filtered = this.data.errorCodes.filter(err => {
      const brandMatch = err.brands.includes(brand) || err.brands.includes("All");
      if (!brandMatch && !q) return false;

      if (q) {
        const text = `${err.code} ${err.titleEn} ${err.titleJa} ${err.cause} ${err.actions.join(" ")}`.toLowerCase();
        return text.includes(q);
      }
      return brandMatch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:24px; color:var(--text-muted);">
          ${isJa ? `「${this.searchQuery}」に一致するエラーコードは見つかりませんでした。` : `No matching error codes found for "${this.searchQuery}".`}
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(err => {
      const primaryTitle = isJa ? err.titleJa : err.titleEn;
      const subTitle = isJa ? err.titleEn : err.titleJa;
      return `
        <div class="error-card">
          <div class="error-card-top">
            <span class="error-code-badge">${err.code}</span>
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">${err.brands.join(", ")}</span>
          </div>
          <div class="error-title-en">${primaryTitle}</div>
          <div class="error-title-ja">${subTitle}</div>
          <div class="error-details">
            <div style="color:var(--text-main); font-weight:600;">${isJa ? '主な原因' : 'Likely Cause'}: ${err.cause}</div>
            <ul class="error-action-list">
              ${err.actions.map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    }).join("");
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new LaundryApp();
});
