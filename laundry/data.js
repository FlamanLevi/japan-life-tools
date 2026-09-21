// Laundry Care Japan - Machine, Cycle, Dosage, and Error Data

const LAUNDRY_DATA = {
  floors: [
    {
      id: 2,
      name: "2nd Floor",
      nameJa: "2階",
      badge: "Mixed Floor",
      badgeJa: "共用フロア",
      note: "Two machines: 1 Panasonic and 1 Sharp compact",
      noteJa: "パナソニック製1台、シャープ製コンパクト1台",
      machines: ["panasonic_na_lx113b", "sharp_es_s7c"]
    },
    {
      id: 3,
      name: "3rd Floor",
      nameJa: "3階",
      badge: "Women Only Floor",
      badgeJa: "女性専用フロア",
      note: "Restricted to female residents. 1 Sharp and 1 Panasonic heat pump",
      noteJa: "女性専用。シャープ製1台、パナソニック製ヒートポンプ1台",
      machines: ["sharp_es_h10c", "panasonic_na_vx3800l"]
    },
    {
      id: 4,
      name: "4th Floor",
      nameJa: "4階",
      badge: "Mixed Floor",
      badgeJa: "共用フロア",
      note: "Two identical high-capacity Sharp drum machines",
      noteJa: "同型のシャープ製大型ドラム式洗濯乾燥機が2台設置されています",
      machines: ["sharp_es_h10b"]
    }
  ],

  machines: {
    "panasonic_na_lx113b": {
      id: "panasonic_na_lx113b",
      brand: "Panasonic",
      brandJa: "パナソニック",
      model: "NA-LX113B",
      fullName: "Panasonic NA-LX113BL (Wash 11kg / Dry 6kg)",
      fullNameJa: "パナソニック NA-LX113BL (洗濯 11kg / 乾燥 6kg)",
      floor: 2,
      type: "Front-Load Drum Washer / Dryer",
      typeJa: "ななめドラム洗濯乾燥機",
      capacityWashKg: 11,
      capacityDryKg: 6,
      manualPdf: "Panasonic NA-LX113BL.pdf",
      features: [
        "ECONAVI sensor automatic energy/water saving",
        "Large 11kg capacity drum",
        "Soft touch membrane controls with digital cup display",
        "Fluff keep (ふんわりキープ) post-dry wrinkle prevention"
      ],
      featuresJa: [
        "エコナビ（ECONAVI）自動省エネ・節水機能",
        "11kg大容量ドラム",
        "操作しやすいソフトタッチボタン＆杯数デジタル表示",
        "乾燥後のシワを防ぐ「ふんわりキープ」機能"
      ],
      interactivePanel: {
      "modelLabel": "Panasonic NA-LX113BL (2F)",
      "modelLabelJa": "パナソニック NA-LX113BL (2階)",
      "panelType": "panasonic_lx",
      "brandBadge": "Panasonic",
      "subBadge": "スゴ落ち 泡洗浄 / ヒートポンプ乾燥",
      "sections": [
            {
                  "id": "lx_process_section",
                  "type": "process-strip",
                  "titleEn": "Process Adjusters (Wash / Rinse / Spin / Dry)",
                  "titleJa": "個別行程設定（洗い・すすぎ・脱水・乾燥）",
                  "columns": [
                        {
                              "id": "lx_col_wash",
                              "buttonId": "btn_wash",
                              "kanji": "洗い",
                              "romaji": "Arai",
                              "en": "Wash Time",
                              "role": "process",
                              "subtext": "自動槽洗浄(3秒押し)",
                              "subtextEn": "Auto Tub Clean (Hold 3s)",
                              "ladder": [
                                    "25分以上",
                                    "20分",
                                    "15分",
                                    "7分"
                              ],
                              "badgeEn": "Wash Setting",
                              "badgeJa": "洗い設定",
                              "descEn": "Sets wash time between 7, 15, 20, or 25+ minutes. Press to cycle time. Hold for 3 seconds to toggle Automatic Tub Clean (自動槽洗浄).",
                              "descJa": "洗い時間を7分、15分、20分、25分以上から選びます。3秒以上長押しすると「自動槽洗浄」の設定／解除ができます。"
                        },
                        {
                              "id": "lx_col_rinse",
                              "buttonId": "btn_rinse",
                              "kanji": "すすぎ",
                              "romaji": "Susugi",
                              "en": "Rinse Count",
                              "role": "process",
                              "subtext": "注水",
                              "subtextEn": "Water Inflow",
                              "ladder": [
                                    "注水",
                                    "3回以上",
                                    "2回",
                                    "1回"
                              ],
                              "badgeEn": "Rinse Setting",
                              "badgeJa": "すすぎ設定",
                              "descEn": "Selects rinse count (1, 2, 3+ times) or continuous overflow freshwater rinse (注水すすぎ) for sensitive skin.",
                              "descJa": "すすぎ回数を1回、2回、3回以上、または水を給水しながら流す「注水」から選びます。"
                        },
                        {
                              "id": "lx_col_spin",
                              "buttonId": "btn_spin",
                              "kanji": "脱水",
                              "romaji": "Dassui",
                              "en": "Spin Time",
                              "role": "process",
                              "subtext": "ジェットほぐし(3秒押し)",
                              "subtextEn": "Jet Fluffing (Hold 3s)",
                              "ladder": [
                                    "10分以上",
                                    "6分",
                                    "3分",
                                    "1分"
                              ],
                              "badgeEn": "Spin Setting",
                              "badgeJa": "脱水設定",
                              "descEn": "Selects spin duration (1, 3, 6, or 10+ minutes). Hold for 3 seconds to toggle Jet Fluffing (ジェットほぐし) which tumbles clothes with warm air at the end of spin to prevent tangling.",
                              "descJa": "脱水時間を1分、3分、6分、10分以上から選びます。3秒長押しで衣類の絡みをほぐす「ジェットほぐし」を設定／解除できます。"
                        },
                        {
                              "id": "lx_col_dry",
                              "buttonId": "btn_dry",
                              "kanji": "乾燥",
                              "romaji": "Kansō",
                              "en": "Dry Level",
                              "role": "process",
                              "subtext": "自動槽乾燥",
                              "subtextEn": "Auto Tub Dry",
                              "ladder": [
                                    "タイマー",
                                    "しっかり",
                                    "標準",
                                    "省エネ"
                              ],
                              "badgeEn": "Dry Setting",
                              "badgeJa": "乾燥設定",
                              "descEn": "Selects drying intensity: Eco (省エネ), Standard (標準), Extra Dry (しっかり), or Timer (タイマー). Hold 3 seconds to toggle Auto Tub Dry (自動槽乾燥) after cycles.",
                              "descJa": "乾燥の種類を「省エネ」「標準」「しっかり」「タイマー」から選びます。3秒長押しで「自動槽乾燥」を設定／解除できます。"
                        }
                  ]
            },
            {
                  "id": "lx_display_section",
                  "type": "display-timer",
                  "titleEn": "Display Window & Delay Timer",
                  "titleJa": "表示窓・予約タイマー",
                  "topLamps": [
                        "プレ乾燥",
                        "自動槽洗浄",
                        "自動槽乾燥"
                  ],
                  "screen": {
                        "id": "disp_screen_lx",
                        "type": "display",
                        "kanji": "デジタル表示窓",
                        "romaji": "Dejitaru Hyōji-mado",
                        "en": "Digital Display Readout",
                        "readout": "8:8.8",
                        "labels": [
                              "残り(約)",
                              "洗剤(杯)",
                              "見直し中",
                              "時間後",
                              "分",
                              "回"
                        ],
                        "badgeEn": "Display",
                        "badgeJa": "表示窓",
                        "descEn": "Displays estimated remaining cycle time, detergent cap dose (0.4–1.0杯), delay countdown hours, or error codes (e.g. U11, U13).",
                        "descJa": "運転の残り時間、洗剤の目安杯数（0.4〜1.0杯）、予約完了時間、エラー表示などをデジタル表示します。"
                  },
                  "button": {
                        "id": "btn_timer",
                        "kanji": "予約",
                        "romaji": "Yoyaku",
                        "en": "Delay Timer",
                        "role": "feature",
                        "badgeEn": "Timer",
                        "badgeJa": "予約機能",
                        "descEn": "Sets the wash or dry cycle to finish in 2 to 24 hours (e.g., ready in 8 hours when you wake up).",
                        "descJa": "運転終了時刻を2〜24時間後から1時間単位で予約設定します。"
                  }
            },
            {
                  "id": "lx_maintenance_section",
                  "type": "maintenance-strip",
                  "titleEn": "Water Level & Tub Maintenance",
                  "titleJa": "水位・お手入れ",
                  "items": [
                        {
                              "id": "btn_water_level",
                              "kanji": "水位",
                              "romaji": "Sui-i",
                              "en": "Water Level",
                              "role": "feature",
                              "subtext": "排水フィルター(3秒押し)",
                              "subtextEn": "Drain Filter (Hold 3s)",
                              "lamps": [
                                    "水位高め",
                                    "乾燥フィルター",
                                    "排水フィルター"
                              ],
                              "badgeEn": "Water / Filter",
                              "badgeJa": "水位／フィルター",
                              "descEn": "Raises water level for extra immersion and rinsing. Hold for 3 seconds to clear or reset the drain filter clean reminder lamp.",
                              "descJa": "水位を高めに設定します。3秒以上長押しすると「排水フィルター」のお手入れサインを設定／解除できます。"
                        },
                        {
                              "id": "btn_care",
                              "kanji": "お手入れ",
                              "romaji": "O-teire",
                              "en": "Tub Maintenance",
                              "role": "feature",
                              "subtext": "槽洗浄サイン(3秒押し)",
                              "subtextEn": "Tub Clean Sign (Hold 3s)",
                              "lamps": [
                                    "ふんわり",
                                    "槽洗浄サイン",
                                    "サッと槽すすぎ",
                                    "槽洗浄",
                                    "槽乾燥"
                              ],
                              "badgeEn": "Maintenance",
                              "badgeJa": "お手入れ",
                              "descEn": "Dedicated tub cleaning button. Toggles between Tub Wash (槽洗浄), Quick Tub Rinse (サッと槽すすぎ), and Tub Dry (槽乾燥). Hold 3s to reset tub wash alert.",
                              "descJa": "洗濯槽のお手入れ（槽洗浄・サッと槽すすぎ・槽乾燥）を選びます。3秒長押しで「槽洗浄サイン」を解除できます。"
                        }
                  ]
            },
            {
                  "id": "lx_course_section",
                  "type": "course-matrix",
                  "titleEn": "Course Selection (Up / Down)",
                  "titleJa": "コース選択（∧／∨）",
                  "indicator": "ふんわり",
                  "courseGrid": [
                        [
                              {
                                    "kanji": "おまかせ",
                                    "romaji": "Omakase",
                                    "en": "Standard Auto",
                                    "descEn": "Everyday laundry. Automatically detects fabric weight and sets optimal water.",
                                    "descJa": "普段の衣類をセンサーで自動計量してきれいに洗います。"
                              },
                              {
                                    "kanji": "おうちクリーニング",
                                    "romaji": "O-uchi Kurīningu",
                                    "en": "Delicates / Wool",
                                    "descEn": "Gentle wash with minimal agitation for sweaters, knits, and lingerie.",
                                    "descJa": "デリケートなニット、下着、おしゃれ着を優しく洗います。"
                              }
                        ],
                        [
                              {
                                    "kanji": "わたし流",
                                    "romaji": "Watashi-ryū",
                                    "en": "My Custom Cycle",
                                    "descEn": "Memorizes your personalized wash/rinse/spin settings.",
                                    "descJa": "お好みの洗い・すすぎ・脱水時間を記憶させて運転します。"
                              },
                              {
                                    "kanji": "どろんこ",
                                    "romaji": "Doronko",
                                    "en": "Muddy / Heavily Soiled",
                                    "descEn": "High-soak vigorous tumble wash for gym wear, sports uniforms, and mud.",
                                    "descJa": "泥汚れやスポーツウェアなどのガンコな汚れをしっかり落とします。"
                              }
                        ],
                        [
                              {
                                    "kanji": "パワフル滝",
                                    "romaji": "Pawafuru Taki",
                                    "en": "Powerful Waterfall",
                                    "descEn": "High-flow circulating shower dissolves stubborn stains and collar grime.",
                                    "descJa": "大流量シャワーで頑固な皮脂汚れや食べこぼしを強力洗浄します。"
                              },
                              {
                                    "kanji": "毛布",
                                    "romaji": "Mōfu",
                                    "en": "Blanket / Duvet",
                                    "descEn": "Large blankets, bedspreads, and towels up to 4.2kg.",
                                    "descJa": "毛布や掛け布団などの大物をすっきり洗います。"
                              }
                        ],
                        [
                              {
                                    "kanji": "ナイト",
                                    "romaji": "Naito",
                                    "en": "Night (Silent)",
                                    "descEn": "Quiet low-noise tumbling for late-night washing without disturbing neighbors.",
                                    "descJa": "低騒音で運転し、夜間や早朝の洗濯・乾燥に適しています。"
                              },
                              {
                                    "kanji": "ダニバスター",
                                    "romaji": "Dani Basutā",
                                    "en": "Mite Buster",
                                    "descEn": "High-temperature 65°C hot air kills dust mites before washing away allergens.",
                                    "descJa": "温風でダニを加熱退治してからきれいに洗い流します。"
                              }
                        ]
                  ],
                  "button": {
                        "id": "btn_course",
                        "kanji": "コース選択 ∧ ∨",
                        "romaji": "Kōsu Sentaku",
                        "en": "Course Selector (∧ / ∨)",
                        "role": "course",
                        "badgeEn": "Course Selector",
                        "badgeJa": "コース選択",
                        "descEn": "Press the Up (∧) or Down (∨) arrow buttons to scroll through the 8 wash & dry courses above.",
                        "descJa": "∧・∨矢印ボタンを押して、上記8種類のコースを順番に選択します。"
                  }
            },
            {
                  "id": "lx_mode_section",
                  "type": "mode-strip",
                  "titleEn": "Operation Mode Toggle",
                  "titleJa": "洗乾切換（運転内容）",
                  "doorLock": "🔒 ドアロック",
                  "modeLadders": [
                        "洗濯",
                        "洗〜乾",
                        "乾燥"
                  ],
                  "button": {
                        "id": "btn_mode_switch",
                        "kanji": "洗乾切換",
                        "romaji": "Sen-Kan Kirikae",
                        "en": "Wash / Dry Mode Switch",
                        "role": "mode",
                        "subtext": "チャイルドロック(5秒押し)",
                        "subtextEn": "Child Lock (Hold 5s)",
                        "badgeEn": "Mode Switch",
                        "badgeJa": "運転切換",
                        "descEn": "Press to cycle between Wash Only (洗濯), Wash to Dry (洗〜乾), and Dry Only (乾燥). Hold for 5 seconds to activate or deactivate Child Lock (チャイルドロック).",
                        "descJa": "押すたびに「洗濯」→「洗濯〜乾燥」→「乾燥」が切り替わります。5秒以上長押しするとチャイルドロックを設定／解除できます。"
                  }
            },
            {
                  "id": "lx_power_start_section",
                  "type": "power-start-strip",
                  "titleEn": "Start & Power (Right End)",
                  "titleJa": "スタート・電源（右端）",
                  "econavi": "■ ECONAVI",
                  "startButton": {
                        "id": "btn_start",
                        "kanji": "スタート / 一時停止",
                        "romaji": "Sutāto / Ichiji Teishi",
                        "en": "Start / Pause",
                        "role": "start",
                        "badgeEn": "Start / Pause",
                        "badgeJa": "スタート／一時停止",
                        "descEn": "Large illuminated button. Press after closing door to begin cycle. Press again to pause.",
                        "descJa": "ドアを閉めた後、このボタンを押して運転を開始します。運転中に押すと一時停止します。"
                  },
                  "powerButton": {
                        "id": "btn_power_on",
                        "kanji": "電源 ①",
                        "romaji": "Dengen",
                        "en": "Power Push Button",
                        "role": "power",
                        "badgeEn": "Power",
                        "badgeJa": "電源スイッチ",
                        "descEn": "Master push switch. Turns power on or off. Auto shutoff triggers after 10 minutes of inactivity or upon cycle finish.",
                        "descJa": "電源を入／切するプッシュスイッチです。運転終了時や10分放置で自動電源オフになります。"
                  },
                  "extraButtons": [
                        {
                              "id": "btn_fluff_keep",
                              "kanji": "ふんわりキープ",
                              "romaji": "Funwari Kīpu",
                              "en": "Fluff Keep (Anti-Wrinkle)",
                              "role": "extra",
                              "badgeEn": "Anti-Wrinkle",
                              "badgeJa": "シワ防止",
                              "descEn": "Periodically tumbles drum with air for up to 2 hours after drying ends to prevent wrinkles.",
                              "descJa": "乾燥終了後、取り出すまでの最大2時間、定期的に回転してシワを防ぎます。"
                        }
                  ]
            }
      ]
},
      panelLayout: {
        powerButtons: ["電源 入 (Power On)", "電源 切 (Power Off)"],
        startButton: "スタート / 一時停止 (Start / Pause)",
        modeSwitch: "運転内容 (Operation Mode): 洗濯 (Wash) → 洗濯〜乾燥 (Wash & Dry) → 乾燥 (Dry)",
        courseSelect: "コース (Course): おまかせ (Standard/Auto), パワフル滝 (Waterfall), ナイト (Night), どろんこ (Muddy), おうちクリーニング (Delicates), 毛布 (Blanket), わたし流 (My Custom)",
        processAdjust: ["洗い (Wash min)", "すすぎ (Rinse count)", "脱水 (Spin min)", "乾燥 (Dry time)"]
      },
      dispenserDrawer: {
        title: "Panasonic NA-LX113B Detergent Drawer",
        diagramType: "panasonic_lx",
        slots: [
          {
            id: "softener",
            name: "Fabric Softener (柔軟剤)",
            nameJa: "柔軟剤",
            position: "Front-Left slot",
            color: "#ec4899",
            maxCapacity: "Max 55 mL (Do not exceed 'これ以下' line)",
            notes: "Takes your fabric softener or citric acid rinse (クエン酸). Siphon structure rinses into final rinse automatically.",
            warning: "Never exceed the MAX fill line, or liquid drains immediately prematurely!"
          },
          {
            id: "liquid_detergent",
            name: "Liquid Detergent & Bleach (液体洗剤・漂白剤)",
            nameJa: "液体洗剤／漂白剤",
            position: "Center channel",
            color: "#3b82f6",
            notes: "Pour your active liquid detergent here. Liquid oxygen bleach can also be poured here alongside liquid detergent."
          },
          {
            id: "powder_detergent",
            name: "Powder Detergent / Powder Bleach (粉末洗剤)",
            nameJa: "粉末 合成洗剤／漂白剤",
            position: "Right / Rear hopper",
            color: "#f59e0b",
            notes: "For powder detergents and powder oxygen bleaches. Keep slot dry before adding powder to avoid clumping."
          },
          {
            id: "drum_direct",
            name: "Direct Drum (Drum ONLY - NOT in drawer!)",
            nameJa: "洗濯槽へ直接投入 (ケースに入れない)",
            position: "Inside drum directly with clothes",
            color: "#10b981",
            notes: "CRITICAL: Scent beads and Gel Pods / Sticks MUST be thrown directly into the drum bottom before clothes! Putting them in the drawer will clog pipes and cause leaks!"
          }
        ]
      },
      displayReadings: [
        {
          reading: "0.4",
          label: "0.4 杯 (Cup)",
          labelJa: "0.4 杯",
          loadEstimate: "Small load: ≤0.5 kg (1-2 shirts/undergarments)",
          loadEstimateJa: "少量衣類: 0.5kg以下（1〜2枚のシャツや下着）",
          drumKg: "≤ 0.5 kg",
          drumKgJa: "0.5kg以下",
          waterEstL: 30,
          description: "Light load: 1-2 shirts or undergarments.",
          descriptionJa: "1〜2枚のシャツや下着など軽い洗濯物",
          dosages: {
            nanox: { cap: "0.4杯 (30L線)", capJa: "0.4杯 (30L線)", ml: 10, note: "Bottle bottom line (30L)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Light wash dose" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Light load softening" },
            citric: { cap: "Below 0.4 (~12 mL)", capJa: "0.4杯弱 (約12mL)", ml: 12, note: "Light load rinse" },
            beads: { cap: "Below Lower Mark (~15 mL)", capJa: "下線より少なめ (約15mL)", ml: 15, note: "Subtle scent" }
          }
        },
        {
          reading: "0.6",
          label: "0.6 杯 (Cup)",
          labelJa: "0.6 杯",
          loadEstimate: "Medium-light load: ≤2.5 kg (1-2 days clothes)",
          loadEstimateJa: "普段の洗濯: 2.5kg以下（1人分の1〜2日分）",
          drumKg: "≤ 2.5 kg",
          drumKgJa: "2.5kg以下",
          waterEstL: 45,
          description: "Approx 1-2 days of clothing for 1 person.",
          descriptionJa: "1人分の1〜2日分の衣類",
          dosages: {
            nanox: { cap: "0.6杯 (45L線)", capJa: "0.6杯 (45L線)", ml: 15, note: "Bottle 2nd line (45L)" },
            bleach: { cap: "20 mL (Lower Line)", capJa: "20 mL (キャップ下線)", ml: 20, note: "Standard drum dose" },
            softener: { cap: "Line 1 (45L / 22 mL)", capJa: "目盛り1 (45L線 / 22mL)", ml: 22, note: "Line 1 graduation" },
            citric: { cap: "0.4杯 (35L / 25 mL)", capJa: "0.4杯 (35L線 / 25mL)", ml: 25, note: "Line 0.4 graduation" },
            beads: { cap: "Lower Mark (~25-30 mL)", capJa: "キャップ下線弱 (~25-30mL)", ml: 25, note: "Moderate scent" }
          }
        },
        {
          reading: "0.8",
          label: "0.8 杯 (Cup)",
          labelJa: "0.8 杯",
          loadEstimate: "Medium-heavy load: ≤4.5 kg (daily basket)",
          loadEstimateJa: "多めの洗濯: 4.5kg以下（バスケット一杯分）",
          drumKg: "≤ 4.5 kg",
          drumKgJa: "4.5kg以下",
          waterEstL: 55,
          description: "Full laundry basket or 3-4 days of clothes.",
          descriptionJa: "3〜4日分の衣類またはバスケット一杯分",
          dosages: {
            nanox: { cap: "0.8杯 (55L線)", capJa: "0.8杯 (55L線)", ml: 20, note: "Bottle 3rd line (55L)" },
            bleach: { cap: "20 mL (Lower Line)", capJa: "20 mL (キャップ下線)", ml: 20, note: "Standard drum dose" },
            softener: { cap: "Line 2 (55L / 32 mL)", capJa: "目盛り2 (55L線 / 32mL)", ml: 32, note: "Line 2 graduation" },
            citric: { cap: "0.6杯 (45L / 35 mL)", capJa: "0.6杯 (45L線 / 35mL)", ml: 35, note: "Line 0.6 graduation" },
            beads: { cap: "Lower Mark (~35-45 mL)", capJa: "キャップ下線 (約35〜45mL)", ml: 35, note: "Medium-heavy dose" }
          }
        },
        {
          reading: "1.0",
          label: "1.0 杯 (Cup)",
          labelJa: "1.0 杯",
          loadEstimate: "Heavy / Full load: ≤11 kg (drum max)",
          loadEstimateJa: "大物・満量: 11kg以下（最大容量・毛布・シーツ）",
          drumKg: "≤ 11 kg",
          drumKgJa: "11kg以下 (満量)",
          waterEstL: 65,
          description: "Full drum load, towels, bedding or sheets.",
          descriptionJa: "満量ドラム、大判タオル、シーツ・毛布など",
          dosages: {
            nanox: { cap: "1杯 (65L線 / 満量)", capJa: "1杯 (65L線 / 満量)", ml: 25, note: "Full cap rim (65L)" },
            bleach: { cap: "40 mL (Upper Line)", capJa: "40 mL (キャップ上線)", ml: 40, note: "Full load maximum dose" },
            softener: { cap: "Line 3 (65L / 42 mL)", capJa: "目盛り3 (65L線 / 42mL)", ml: 42, note: "Line 3 graduation (up to 55mL)" },
            citric: { cap: "0.8杯 (55L / 45 mL)", capJa: "0.8杯 (55L線 / 45mL)", ml: 45, note: "Line 0.8 graduation" },
            beads: { cap: "Upper Mark (~55-70 mL)", capJa: "キャップ上線 (約55〜70mL)", ml: 55, note: "Full cap scent dose" }
          }
        }
      ]
    },

    "sharp_es_s7c": {
      id: "sharp_es_s7c",
      brand: "Sharp",
      brandJa: "シャープ",
      model: "ES-S7C",
      fullName: "Sharp ES-S7C Compact (Wash 7kg / Dry 3.5kg)",
      fullNameJa: "シャープ ES-S7C コンパクト (洗濯 7kg / 乾燥 3.5kg)",
      floor: 2,
      type: "Compact Front-Load Drum Washer / Dryer",
      typeJa: "コンパクトドラム式洗濯乾燥機",
      capacityWashKg: 7,
      capacityDryKg: 3.5,
      manualPdf: "Sharp ES-S7C.pdf",
      features: [
        "Compact 60cm body width",
        "Plasmacluster ion odor elimination and tub disinfection",
        "Dedicated 'Room Hang Dry' (部屋干し) cycle button",
        "Extremely water efficient drum"
      ],
      featuresJa: [
        "幅60cmスリム＆コンパクト設計",
        "プラズマクラスター除菌・消臭機能",
        "専用「部屋干し」ボタン搭載",
        "節水型ドラム構造"
      ],
      interactivePanel: {
      "modelLabel": "Sharp ES-S7C Compact (2F)",
      "modelLabelJa": "シャープ ES-S7C コンパクト (2階)",
      "panelType": "sharp_s7c",
      "brandBadge": "SHARP",
      "subBadge": "Plasmacluster 7000",
      "sections": [
            {
                  "id": "s7c_process_display_section",
                  "type": "process-display-block",
                  "titleEn": "Top Pills, Process Adjusters & Display Screen",
                  "titleJa": "ワンタッチボタン・個別行程・デジタル表示部",
                  "topPills": [
                        {
                              "id": "btn_timer",
                              "kanji": "予約",
                              "romaji": "Yoyaku",
                              "en": "Delay Timer",
                              "role": "feature",
                              "badgeEn": "Timer",
                              "badgeJa": "予約タイマー",
                              "descEn": "Sets completion time in 2 to 24 hours.",
                              "descJa": "何時間後に洗濯を終了させるかを予約設定します。"
                        },
                        {
                              "id": "btn_plasmacluster_direct",
                              "kanji": "槽クリーン（プラズマクラスター）",
                              "romaji": "Sō Kurīn (Purazumakurasutā)",
                              "en": "Plasmacluster Tub Clean",
                              "role": "feature",
                              "badgeEn": "Plasmacluster",
                              "badgeJa": "プラズマクラスター",
                              "descEn": "Direct button for tub sterilization using active Plasmacluster ions to prevent mold growth.",
                              "descJa": "プラズマクラスターイオンで洗濯槽のカビ菌の繁殖を抑制・除菌します。"
                        },
                        {
                              "id": "btn_delicates",
                              "kanji": "おしゃれ着",
                              "romaji": "Oshare-gi",
                              "en": "Delicates / Wool",
                              "role": "feature",
                              "badgeEn": "Delicates",
                              "badgeJa": "おしゃれ着",
                              "descEn": "Direct one-touch gentle cycle for knitwear, wool, and delicate garments.",
                              "descJa": "ウールやデリケートな衣類を縮みや傷みを防ぎながら優しく洗います。"
                        }
                  ],
                  "processRow": [
                        {
                              "id": "btn_wash",
                              "kanji": "洗い",
                              "romaji": "Arai",
                              "en": "Wash Time",
                              "role": "process",
                              "badgeEn": "Wash",
                              "badgeJa": "洗い",
                              "descEn": "Press to select wash step, then use ∨ / ∧ to adjust minutes.",
                              "descJa": "洗い工程を選択し、右の∨・∧ボタンで時間を変更します。"
                        },
                        {
                              "id": "btn_rinse",
                              "kanji": "すすぎ",
                              "romaji": "Susugi",
                              "en": "Rinse Count",
                              "role": "process",
                              "badgeEn": "Rinse",
                              "badgeJa": "すすぎ",
                              "descEn": "Press to select rinse step, then use ∨ / ∧ to adjust counts (1-3 rinses or 注水).",
                              "descJa": "すすぎ工程を選択し、右の∨・∧ボタンで回数や注水を変更します。"
                        },
                        {
                              "id": "btn_spin",
                              "kanji": "脱水",
                              "romaji": "Dassui",
                              "en": "Spin Time",
                              "role": "process",
                              "badgeEn": "Spin",
                              "badgeJa": "脱水",
                              "descEn": "Press to select spin step, then use ∨ / ∧ to adjust duration.",
                              "descJa": "脱水工程を選択し、右の∨・∧ボタンで時間を変更します。"
                        },
                        {
                              "id": "btn_dry",
                              "kanji": "乾かす",
                              "romaji": "Kawakasu",
                              "en": "Dry Time",
                              "role": "process",
                              "badgeEn": "Dry",
                              "badgeJa": "乾かす",
                              "descEn": "Press to select drying step, then use ∨ / ∧ to adjust drying duration.",
                              "descJa": "乾燥工程を選択し、右の∨・∧ボタンで時間を変更します。"
                        }
                  ],
                  "adjusters": {
                        "id": "btn_adjust_arrows",
                        "kanji": "調節 ∨ ∧",
                        "romaji": "Chōsetsu",
                        "en": "Adjust (Down ∨ / Up ∧)",
                        "role": "process",
                        "badgeEn": "Adjusters",
                        "badgeJa": "数値調節",
                        "descEn": "Press ∨ (減る) to decrease or ∧ (増える) to increase wash minutes, rinse counts, or dry time.",
                        "descJa": "∨（減る）または∧（増える）を押して、工程の数値や時間を変更します。"
                  },
                  "screen": {
                        "id": "disp_screen_s7c",
                        "type": "display",
                        "kanji": "数字表示部",
                        "romaji": "Sūji Hyōji-bu",
                        "en": "Digital Display Readout",
                        "readout": "8:88",
                        "labels": [
                              "予約(時間後)",
                              "残り",
                              "冷却中",
                              "洗剤(杯)",
                              "注水",
                              "分",
                              "回"
                        ],
                        "badgeEn": "Display",
                        "badgeJa": "表示部",
                        "descEn": "Displays compact cup fractions (0.2, 0.3, 0.4, 0.5杯), remaining minutes, cooling notice, or error codes (e.g. C01, C02, E01).",
                        "descJa": "洗剤目安杯数（0.2〜0.5杯）、残り時間、冷却中、エラーコードなどを表示します。"
                  }
            },
            {
                  "id": "s7c_course_mode_section",
                  "type": "course-mode-block",
                  "titleEn": "Course & Operation Mode Selectors",
                  "titleJa": "コース・運転切換",
                  "courseCol": {
                        "grid": [
                              [
                                    {
                                          "kanji": "標準",
                                          "romaji": "Hyōjun",
                                          "en": "Standard"
                                    },
                                    {
                                          "kanji": "おうち流",
                                          "romaji": "O-uchi Ryū",
                                          "en": "Custom"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "時短",
                                          "romaji": "Jitan",
                                          "en": "Quick"
                                    },
                                    {
                                          "kanji": "部屋干し",
                                          "romaji": "Heya-boshi",
                                          "en": "Room Dry"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "毛布",
                                          "romaji": "Mōfu",
                                          "en": "Blanket"
                                    },
                                    {
                                          "kanji": "槽洗浄",
                                          "romaji": "Sō Senjō",
                                          "en": "Tub Wash"
                                    }
                              ]
                        ],
                        "button": {
                              "id": "btn_course",
                              "kanji": "コース",
                              "romaji": "Kōsu",
                              "en": "Course Selector",
                              "role": "course",
                              "badgeEn": "Course",
                              "badgeJa": "コース",
                              "descEn": "Cycles through Sharp's compact drum wash/dry programs: 標準 (Standard), おうち流 (Custom), 時短 (Quick), 部屋干し (Room Dry), 毛布 (Blanket), 槽洗浄 (Tub Wash).",
                              "descJa": "標準、おうち流、時短、部屋干し、毛布、槽洗浄から選びます。"
                        }
                  },
                  "modeCol": {
                        "modes": [
                              {
                                    "kanji": "🍇消臭",
                                    "romaji": "Shōshū",
                                    "en": "Plasmacluster Deodorize"
                              },
                              {
                                    "kanji": "乾燥",
                                    "romaji": "Kansō",
                                    "en": "Dry Only"
                              },
                              {
                                    "kanji": "洗濯",
                                    "romaji": "Sentaku",
                                    "en": "Wash Only"
                              },
                              {
                                    "kanji": "洗〜乾",
                                    "romaji": "Sen-Kan",
                                    "en": "Wash to Dry"
                              }
                        ],
                        "button": {
                              "id": "btn_mode_switch",
                              "kanji": "運転切換",
                              "romaji": "Unten Kirikae",
                              "en": "Operation Mode Switch",
                              "role": "mode",
                              "badgeEn": "Mode Switch",
                              "badgeJa": "運転切換",
                              "descEn": "Press repeatedly to cycle between: 洗〜乾 (Wash & Dry) → 洗濯 (Wash) → 乾燥 (Dry) → 🍇消臭 (Deodorize).",
                              "descJa": "押すたびに「洗〜乾」「洗濯」「乾燥」「消臭」が順に切り替わります。"
                        }
                  }
            },
            {
                  "id": "s7c_power_start_section",
                  "type": "power-start-strip",
                  "titleEn": "Power, Start & Door Lock (Far Right)",
                  "titleJa": "電源・スタート・ドアロック（右端）",
                  "powerBox": {
                        "title": "電源",
                        "offButton": {
                              "id": "btn_power_off",
                              "kanji": "切",
                              "romaji": "Kiri",
                              "en": "Power OFF",
                              "role": "power",
                              "badgeEn": "Power Off",
                              "badgeJa": "電源切",
                              "descEn": "Immediately shuts off machine power.",
                              "descJa": "電源を切ります。"
                        },
                        "onButton": {
                              "id": "btn_power_on",
                              "kanji": "入",
                              "romaji": "Iri",
                              "en": "Power ON",
                              "role": "power",
                              "badgeEn": "Power On",
                              "badgeJa": "電源入",
                              "descEn": "Turns on machine power.",
                              "descJa": "電源を入れます。オートパワーオフ（5分放置で自動電源切）付き。"
                        }
                  },
                  "ecoIndicator": "ECO",
                  "startButton": {
                        "id": "btn_start",
                        "kanji": "スタート / 一時停止",
                        "romaji": "Sutāto / Ichiji Teishi",
                        "en": "Start / Pause",
                        "role": "start",
                        "badgeEn": "Start / Pause",
                        "badgeJa": "スタート／一時停止",
                        "descEn": "Large circular button. Press to start cycle; door latches automatically.",
                        "descJa": "運転を開始または一時停止します。スタート後にドアが自動ロックされます。"
                  },
                  "doorLockBox": {
                        "lamp": "ドアロック",
                        "button": {
                              "id": "btn_unlock",
                              "kanji": "ロック解除",
                              "romaji": "Rokku Kaijo",
                              "en": "Unlock Door",
                              "role": "safety",
                              "subtext": "チャイルドロック(3秒押し)",
                              "subtextEn": "Child Lock (Hold 3s)",
                              "badgeEn": "Door / Lock",
                              "badgeJa": "ドアロック解除",
                              "descEn": "Press during pause to unlock door once water level is safe. Hold 3 seconds to engage or disengage Child Lock.",
                              "descJa": "一時停止中にドアロックを解除します。3秒長押しでチャイルドロックを設定／解除できます。"
                        }
                  }
            }
      ]
},
      panelLayout: {
        powerButtons: ["電源スイッチ (Power Switch - Auto off after 5 min)"],
        startButton: "スタート / 一時停止 (Start / Pause)",
        modeSwitch: "運転切換 (Mode): 洗濯 (Wash) → 洗濯〜乾燥 (Wash & Dry) → 乾燥 (Dry) → 消臭 (Deodorize)",
        courseSelect: "コース (Course): 標準 (Standard), おうち流 (Custom), 時短 (Quick), 部屋干し (Room Dry), 毛布 (Blanket), 槽洗浄 (Tub Clean)",
        quickButtons: ["予約 (Timer)", "槽クリーン (Tub Clean)", "おしゃれ着 (Delicates)"],
        processAdjust: ["洗い (Wash)", "すすぎ (Rinse)", "脱水 (Spin)", "乾かす (Dry)"]
      },
      dispenserDrawer: {
        title: "Sharp ES-S7C Detergent Drawer",
        diagramType: "sharp_s7c",
        slots: [
          {
            id: "softener",
            name: "Fabric Softener (柔軟剤)",
            nameJa: "柔軟剤",
            position: "Front compartment",
            color: "#ec4899",
            maxCapacity: "Max 65 mL (Do not exceed '満量' line)",
            notes: "Dispenses during final rinse. Fabric softener or citric acid rinse goes here.",
            warning: "Do not slam drawer shut or liquid triggers premature siphoning!"
          },
          {
            id: "liquid_detergent",
            name: "Liquid Detergent & Bleach (液体洗剤・漂白剤)",
            nameJa: "洗剤・漂白剤 液体",
            position: "Rear-left main section",
            color: "#3b82f6",
            notes: "Pour your active liquid detergent here. Liquid oxygen bleach can also be added here alongside liquid detergent."
          },
          {
            id: "powder_detergent",
            name: "Powder Detergent / Powder Bleach (粉末洗剤)",
            nameJa: "粉末洗剤・粉末漂白剤",
            position: "Rear-right under flap",
            color: "#f59e0b",
            notes: "For powder synthetic detergent and powder bleach. (Cannot use powder detergent and powder bleach together in this compact drawer)."
          },
          {
            id: "drum_direct",
            name: "Direct Drum (Drum ONLY - NOT in drawer!)",
            nameJa: "洗濯槽へ直接投入 (ケースに入れない)",
            position: "Inside drum directly with clothes",
            color: "#10b981",
            notes: "CRITICAL: Scent beads and Gel Pods / Sticks MUST be thrown directly into the drum bottom before clothes! Never put them in the drawer."
          }
        ]
      },
      displayReadings: [
        {
          reading: "0.2",
          label: "0.2 杯 (Cup)",
          labelJa: "0.2 杯",
          loadEstimate: "Very small quick load: ~1 kg",
          loadEstimateJa: "時短コース: 約1kg以下",
          drumKg: "Quick ~1 kg",
          drumKgJa: "時短 約1kg",
          waterEstL: 22,
          description: "Quick 2kg/1kg cycle.",
          descriptionJa: "少量の軽い汚れ・時短洗い",
          dosages: {
            nanox: { cap: "0.4杯弱 (約7 mL)", capJa: "0.4杯弱 (約7mL)", ml: 7, note: "Slightly below 0.4 line" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Light sanitize dose" },
            softener: { cap: "Below Line 1 (~10-12 mL)", capJa: "目盛り1未満 (約10〜12mL)", ml: 10, note: "Light softening" },
            citric: { cap: "Below 0.4 (~10-12 mL)", capJa: "0.4杯弱 (約10〜12mL)", ml: 10, note: "Light rinse" },
            beads: { cap: "Small dose (~12-15 mL)", capJa: "少量 (~12〜15mL)", ml: 12, note: "Toss in drum" }
          }
        },
        {
          reading: "0.3",
          label: "0.3 杯 (Cup)",
          labelJa: "0.3 杯",
          loadEstimate: "Light load: ≤1.5 kg (1-2 days clothes)",
          loadEstimateJa: "軽めの洗濯: 約1.5kg以下（1〜2日分のシャツ・下着）",
          drumKg: "≤ 1.5 kg",
          drumKgJa: "約1.5kg以下",
          waterEstL: 30,
          description: "Up to 1.5kg (approx. 1-2 days shirts/underwear).",
          descriptionJa: "1〜2日分のシャツ・下着など",
          dosages: {
            nanox: { cap: "0.3杯 (30L線弱 / 8 mL)", capJa: "0.3杯 (30L線弱 / 8mL)", ml: 8, note: "Manual specifies 8mL (0.3 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Manual specifies 10mL" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "Below 0.4 (~15 mL)", capJa: "0.4杯弱 (約15mL)", ml: 15, note: "Light rinse" },
            beads: { cap: "Below Lower Mark (~15-18 mL)", capJa: "下線より少なめ (約15〜18mL)", ml: 18, note: "Light scent dose" }
          }
        },
        {
          reading: "0.4",
          label: "0.4 杯 (Cup)",
          labelJa: "0.4 杯",
          loadEstimate: "Medium load: ~1.5 to 3.5 kg (half drum)",
          loadEstimateJa: "普段の洗濯: 約1.5〜3.5kg（ドラム半分程度）",
          drumKg: "1.5 - 3.5 kg",
          drumKgJa: "約1.5〜3.5kg",
          waterEstL: 45,
          description: "Moderate wash load (half drum).",
          descriptionJa: "一般的な毎日の洗濯物（ドラム半分程度）",
          dosages: {
            nanox: { cap: "0.4杯 (30L線 / 10 mL)", capJa: "0.4杯 (30L線 / 10mL)", ml: 10, note: "Manual specifies 10mL (0.4 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線弱 / 約10mL)", ml: 10, note: "Manual specifies 10mL" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "0.4杯 (35L線 / ~25 mL)", capJa: "0.4杯 (35L線 / 約25mL)", ml: 25, note: "Line 0.4 graduation" },
            beads: { cap: "Lower Mark (~25-30 mL)", capJa: "キャップ下線弱 (約25〜30mL)", ml: 30, note: "Medium load dose" }
          }
        },
        {
          reading: "0.5",
          label: "0.5 杯 (Cup)",
          labelJa: "0.5 杯",
          loadEstimate: "Full compact drum load: ~3.5 to 7.0 kg",
          loadEstimateJa: "満量・厚手衣類: 約3.5〜7kg（コンパクト機満量）",
          drumKg: "3.5 - 7.0 kg (Full)",
          drumKgJa: "約3.5〜7kg (満量)",
          waterEstL: 55,
          description: "Full drum load, towels, heavy garments.",
          descriptionJa: "コンパクト機満量、バスタオル、厚手衣類",
          dosages: {
            nanox: { cap: "0.5杯 (12 mL)", capJa: "0.5杯 (12mL)", ml: 12, note: "Manual specifies 12mL for full compact load" },
            bleach: { cap: "20 mL (Lower Line)", capJa: "20 mL (キャップ下線)", ml: 20, note: "Manual specifies 20mL (0.5杯)" },
            softener: { cap: "Line 1 (45L / 20 mL)", capJa: "目盛り1 (45L線 / 20mL)", ml: 20, note: "Manual specifies 20mL (Line 1)" },
            citric: { cap: "0.6〜0.8杯 (~35-40 mL)", capJa: "0.6〜0.8杯 (約35〜40mL)", ml: 38, note: "Between line 0.6 and 0.8" },
            beads: { cap: "Between Marks (~35-45 mL)", capJa: "下線〜上線中間 (約35〜45mL)", ml: 40, note: "Full compact drum dose" }
          }
        }
      ]
    },

    "sharp_es_h10c": {
      id: "sharp_es_h10c",
      brand: "Sharp",
      brandJa: "シャープ",
      model: "ES-H10C",
      fullName: "Sharp ES-H10C (Wash 10kg / Dry 6kg)",
      fullNameJa: "シャープ ES-H10C (洗濯 10kg / 乾燥 6kg)",
      floor: 3,
      type: "Full-Size Front-Load Drum Washer / Dryer",
      typeJa: "ドラム式洗濯乾燥機",
      capacityWashKg: 10,
      capacityDryKg: 6,
      manualPdf: "Sharp ES-H10C.pdf",
      features: [
        "Located on 3rd floor (Women only)",
        "Plasmacluster odor & bacteria elimination",
        "Dedicated separate slot for liquid bleach",
        "Micro-water-saving drum with high-power tumble wash"
      ],
      featuresJa: [
        "3階女性専用フロア設置",
        "プラズマクラスター除菌・消臭機能",
        "液体漂白剤の専用投入口あり (一番左)",
        "高圧シャワー洗浄＆省水ドラム"
      ],
      interactivePanel: {
      "modelLabel": "Sharp ES-H10C (3F)",
      "modelLabelJa": "シャープ ES-H10C (3F)",
      "panelType": "sharp_h10",
      "brandBadge": "SHARP",
      "subBadge": "マイクロ高圧洗浄 / プラズマクラスター",
      "sections": [
            {
                  "id": "h10_door_process_section",
                  "type": "door-process-block",
                  "titleEn": "Door Lock & Process Adjusters (Far Left)",
                  "titleJa": "ドアロック・個別行程（左側）",
                  "doorLock": {
                        "lamp": "ドアロック",
                        "button": {
                              "id": "btn_unlock",
                              "kanji": "ロック解除",
                              "romaji": "Rokku Kaijo",
                              "en": "Unlock Door",
                              "role": "safety",
                              "subtext": "チャイルドロック(3秒押し)",
                              "subtextEn": "Child Lock (Hold 3s)",
                              "badgeEn": "Door / Safety",
                              "badgeJa": "ドアロック解除",
                              "descEn": "Press during pause to unlock front door. Hold for 3 seconds to activate Child Lock.",
                              "descJa": "一時停止中にドアロックを解除して洗濯物を追加・取り出しします。3秒長押しでチャイルドロックを設定／解除できます。"
                        }
                  },
                  "processColumns": [
                        {
                              "id": "h10_col_wash",
                              "buttonId": "btn_wash",
                              "kanji": "洗い",
                              "romaji": "Arai",
                              "en": "Wash Time",
                              "role": "process",
                              "ladder": [
                                    "20",
                                    "10",
                                    "5分"
                              ],
                              "badgeEn": "Wash",
                              "badgeJa": "洗い",
                              "descEn": "Sets wash minutes (5, 10, 20 min). Press to cycle through options.",
                              "descJa": "洗い時間を5分、10分、20分から選びます。"
                        },
                        {
                              "id": "h10_col_rinse",
                              "buttonId": "btn_rinse",
                              "kanji": "すすぎ",
                              "romaji": "Susugi",
                              "en": "Rinse Count",
                              "role": "process",
                              "ladder": [
                                    "注水",
                                    "3",
                                    "2",
                                    "1回"
                              ],
                              "badgeEn": "Rinse",
                              "badgeJa": "すすぎ",
                              "descEn": "Sets rinse count (1, 2, 3 times) or continuous freshwater overflow rinse (注水).",
                              "descJa": "すすぎ回数を1回、2回、3回、または注水から選びます。"
                        },
                        {
                              "id": "h10_col_spin",
                              "buttonId": "btn_spin",
                              "kanji": "脱水",
                              "romaji": "Dassui",
                              "en": "Spin Time",
                              "role": "process",
                              "ladder": [
                                    "自動",
                                    "5",
                                    "3",
                                    "1分"
                              ],
                              "badgeEn": "Spin",
                              "badgeJa": "脱水",
                              "descEn": "Sets spin duration: 1 min, 3 min, 5 min, or Auto (自動).",
                              "descJa": "脱水時間を1分、3分、5分、または自動から選びます。"
                        },
                        {
                              "id": "h10_col_dry",
                              "buttonId": "btn_dry",
                              "kanji": "乾かす",
                              "romaji": "Kawakasu",
                              "en": "Dry Time",
                              "role": "process",
                              "ladder": [
                                    "(点滅)自動",
                                    "30 3",
                                    "20 2",
                                    "10分 1.5時間"
                              ],
                              "badgeEn": "Dry",
                              "badgeJa": "乾かす",
                              "descEn": "Sets dry duration: 10 min, 20 min, 30 min, 1.5 hrs, 2 hrs, 3 hrs, or Auto (自動).",
                              "descJa": "乾燥時間を10分、20分、30分、1.5時間、2時間、3時間、または自動から選びます。"
                        }
                  ]
            },
            {
                  "id": "h10_display_direct_section",
                  "type": "display-direct-block",
                  "titleEn": "Digital Display & Direct Intensive Wash",
                  "titleJa": "デジタル表示部・極め洗い",
                  "screen": {
                        "id": "disp_screen_h10",
                        "type": "display",
                        "kanji": "デジタル表示部",
                        "romaji": "Dejitaru Hyōji-bu",
                        "en": "Digital Display Readout",
                        "readout": "8:88",
                        "labels": [
                              "残り(分)",
                              "冷却中",
                              "🍇",
                              "洗剤(杯)",
                              "予約(時間後)"
                        ],
                        "badgeEn": "Display",
                        "badgeJa": "表示部",
                        "descEn": "Displays detergent cup fractions (0.3, 0.5, 0.7, 0.8杯), remaining minutes, Plasmacluster status, or error codes (e.g. E02, C04).",
                        "descJa": "洗剤の目安杯数（0.3, 0.5, 0.7, 0.8杯）、残り時間、冷却中、プラズマクラスター稼働状況、エラーコードを表示します。"
                  },
                  "timerButton": {
                        "id": "btn_timer",
                        "kanji": "予約",
                        "romaji": "Yoyaku",
                        "en": "Delay Timer",
                        "role": "feature",
                        "badgeEn": "Timer",
                        "badgeJa": "予約タイマー",
                        "descEn": "Sets cycle to finish in 2 to 24 hours.",
                        "descJa": "運転終了時刻を予約します。"
                  },
                  "delicatesDirectButton": {
                        "id": "btn_delicates_kiwame",
                        "kanji": "極め洗い・ホームクリーニング",
                        "romaji": "Kiwame-arai / Hōmu Kurīningu",
                        "en": "Intensive Wash & Home Dry Cleaning",
                        "icon": "👔",
                        "role": "feature",
                        "subtext": "1 極め洗い / 2 ホームクリーニング",
                        "subtextEn": "1 Intensive Wash / 2 Delicates",
                        "badgeEn": "Dedicated Cycle",
                        "badgeJa": "ダイレクト専用",
                        "descEn": "Dedicated one-touch cycle button with shirt icon. Press 1 for Kiwame-arai (micro-bubble intensive stain removal) or 2 for Home Cleaning (gentle dry-cleaning cycle for wool/suits).",
                        "descJa": "専用ダイレクトボタン。1回押すと「極め洗い」（頑固汚れ・黄ばみ落とし）、2回押すと「ホームクリーニング」（縮みやすいスーツ・ニットのおしゃれ着洗い）になります。"
                  }
            },
            {
                  "id": "h10_course_mode_section",
                  "type": "course-mode-block",
                  "titleEn": "Course Selection & Operation Modes",
                  "titleJa": "コース選択・運転切換",
                  "courseCol": {
                        "grid": [
                              [
                                    {
                                          "kanji": "標準",
                                          "romaji": "Hyōjun",
                                          "en": "Standard"
                                    },
                                    {
                                          "kanji": "サッと予洗い",
                                          "romaji": "Satto Yo-arai",
                                          "en": "Quick Pre-Wash"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "おうち流",
                                          "romaji": "O-uchi Ryū",
                                          "en": "Custom"
                                    },
                                    {
                                          "kanji": "部屋干し",
                                          "romaji": "Heya-boshi",
                                          "en": "Room Dry"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "時短(2kg)",
                                          "romaji": "Jitan",
                                          "en": "Quick (2kg)"
                                    },
                                    {
                                          "kanji": "槽洗浄",
                                          "romaji": "Sō Senjō",
                                          "en": "Tub Wash"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "毛布",
                                          "romaji": "Mōfu",
                                          "en": "Blanket"
                                    },
                                    {
                                          "kanji": "",
                                          "romaji": "",
                                          "en": ""
                                    }
                              ]
                        ],
                        "button": {
                              "id": "btn_course",
                              "kanji": "コース",
                              "romaji": "Kōsu",
                              "en": "Course Selector",
                              "role": "course",
                              "badgeEn": "Course",
                              "badgeJa": "コース",
                              "descEn": "Cycles through Sharp's 10kg drum courses: 標準 (Standard), おうち流 (Custom), 時短 (Quick 2kg), 毛布 (Blanket), サッと予洗い (Quick Pre-Wash), 部屋干し (Room Dry), 槽洗浄 (Tub Wash).",
                              "descJa": "標準、おうち流、時短(2kg)、毛布、サッと予洗い、部屋干し、槽洗浄から選びます。"
                        }
                  },
                  "modeCol": {
                        "modes": [
                              {
                                    "kanji": "洗濯",
                                    "romaji": "Sentaku",
                                    "en": "Wash Only"
                              },
                              {
                                    "kanji": "乾燥",
                                    "romaji": "Kansō",
                                    "en": "Dry Only"
                              },
                              {
                                    "kanji": "消臭",
                                    "romaji": "Shōshū",
                                    "en": "Plasmacluster Deodorize"
                              },
                              {
                                    "kanji": "槽クリーン",
                                    "romaji": "Sō Kurīn",
                                    "en": "Tub Clean with Ions"
                              }
                        ],
                        "noteEn": "(Both 洗濯 and 乾燥 light up together for 洗〜乾 Wash & Dry)",
                        "noteJa": "（洗濯と乾燥の両方が点灯すると「洗〜乾」になります）",
                        "button": {
                              "id": "btn_mode_switch",
                              "kanji": "運転切換",
                              "romaji": "Unten Kirikae",
                              "en": "Operation Mode Switch",
                              "role": "mode",
                              "badgeEn": "Mode Switch",
                              "badgeJa": "運転切換",
                              "descEn": "Cycles operation mode: 洗〜乾 (Wash & Dry) → 洗濯 (Wash) → 乾燥 (Dry) → 消臭 (Deodorize) → 槽クリーン (Tub Clean).",
                              "descJa": "押すたびに「洗濯〜乾燥」「洗濯」「乾燥」「消臭」「槽クリーン」が切り替わります。"
                        },
                        "virtualButtons": [
                              {
                                    "id": "btn_mode_wash",
                                    "kanji": "洗濯",
                                    "romaji": "Sentaku",
                                    "en": "Wash Only (Air Dry)",
                                    "role": "mode",
                                    "badgeEn": "Direct Mode",
                                    "badgeJa": "直接選択",
                                    "descEn": "Wash-only cycle (up to 10kg) for line or balcony drying.",
                                    "descJa": "外干し・部屋干し用の「洗濯のみ」モードです（最大10kg）。"
                              },
                              {
                                    "id": "btn_mode_wash_dry",
                                    "kanji": "洗〜乾",
                                    "romaji": "Sen-Kan",
                                    "en": "Wash & Dry (Full Cycle)",
                                    "role": "mode",
                                    "badgeEn": "Direct Mode",
                                    "badgeJa": "直接選択",
                                    "descEn": "Full automatic wash and dry (up to 6kg). Both 洗濯 and 乾燥 indicators illuminate.",
                                    "descJa": "洗濯から乾燥まで全自動で行います（最大6kg）。"
                              },
                              {
                                    "id": "btn_mode_dry",
                                    "kanji": "乾燥",
                                    "romaji": "Kansō",
                                    "en": "Dry Only",
                                    "role": "mode",
                                    "badgeEn": "Direct Mode",
                                    "badgeJa": "直接選択",
                                    "descEn": "Tumble dry freshly washed clothes or damp items up to 6kg.",
                                    "descJa": "濡れた衣類やタオルだけを乾燥させます（最大6kg）。"
                              },
                              {
                                    "id": "btn_mode_deodorize",
                                    "kanji": "消臭",
                                    "romaji": "Shōshū",
                                    "en": "Plasmacluster Deodorize",
                                    "role": "mode",
                                    "badgeEn": "Plasmacluster",
                                    "badgeJa": "消臭",
                                    "descEn": "Waterless disinfection and odor removal for jackets, suits, and shoes.",
                                    "descJa": "水洗いできないスーツ、上着、靴などをプラズマクラスターイオンで除菌・消臭します。"
                              }
                        ]
                  }
            },
            {
                  "id": "h10_power_start_section",
                  "type": "power-start-strip",
                  "titleEn": "Power, ECO & Start (Far Right)",
                  "titleJa": "電源・エコ・スタート（右端）",
                  "powerBox": {
                        "title": "電源",
                        "offButton": {
                              "id": "btn_power_off",
                              "kanji": "切",
                              "romaji": "Kiri",
                              "en": "Power OFF",
                              "role": "power",
                              "badgeEn": "Power Off",
                              "badgeJa": "電源切",
                              "descEn": "Immediately turns off power.",
                              "descJa": "電源を切ります。"
                        },
                        "onButton": {
                              "id": "btn_power_on",
                              "kanji": "入",
                              "romaji": "Iri",
                              "en": "Power ON",
                              "role": "power",
                              "badgeEn": "Power On",
                              "badgeJa": "電源入",
                              "descEn": "Turns on machine power.",
                              "descJa": "電源を入れます。5分放置で自動電源オフ。"
                        }
                  },
                  "ecoLamp": "ECO",
                  "startButton": {
                        "id": "btn_start",
                        "kanji": "スタート / 一時停止",
                        "romaji": "Sutāto / Ichiji Teishi",
                        "en": "Start / Pause",
                        "role": "start",
                        "badgeEn": "Start / Pause",
                        "badgeJa": "スタート／一時停止",
                        "descEn": "Large circular button. Press to start cycle; front door locks automatically.",
                        "descJa": "運転を開始または一時停止します。スタート後にドアが自動ロックされます。"
                  }
            }
      ]
},
      panelLayout: {
        powerButtons: ["電源スイッチ (Power Switch - Auto off)"],
        startButton: "スタート / 一時停止 (Start / Pause)",
        modeSwitch: "運転切換 (Mode): 洗濯 (Wash) → 洗濯〜乾燥 (Wash & Dry) → 乾燥 (Dry) → 消臭 (Deodorize) → 槽クリーン (Tub Clean)",
        courseSelect: "コース (Course): 標準 (Standard), おうち流 (Custom), 時短 (Quick), サッと予洗い (Pre-Wash), 部屋干し (Room Dry), 毛布 (Blanket), 槽洗浄 (Tub Wash)",
        specialButtons: ["極め洗い・ホームクリーニング (Intensive Clean / Delicates)", "ロック解除 (Unlock Door)", "予約 (Timer)"]
      },
      dispenserDrawer: {
        title: "Sharp ES-H10C 3-Slot Detergent Drawer",
        diagramType: "sharp_h10",
        slots: [
          {
            id: "bleach",
            name: "Liquid Bleach (漂白剤 液体タイプ)",
            nameJa: "漂白剤(液体タイプ)",
            position: "Left slot",
            color: "#10b981",
            notes: "Dedicated liquid bleach dispenser! Pour liquid oxygen bleach directly here. Dispenses with wash water."
          },
          {
            id: "detergent",
            name: "Synthetic Detergent (合成洗剤 液体または粉末タイプ)",
            nameJa: "合成洗剤(液体または粉末タイプ)",
            position: "Center slot",
            color: "#3b82f6",
            notes: "For synthetic detergents. Pour your active liquid or powder detergent here. If using powder bleach with liquid detergent, pour liquid first, then powder bleach on top."
          },
          {
            id: "softener",
            name: "Fabric Softener (柔軟剤)",
            nameJa: "柔軟剤",
            position: "Right slot",
            color: "#ec4899",
            maxCapacity: "Max 70 mL (Do not exceed '満量' line)",
            notes: "Takes your fabric softener or citric acid rinse (クエン酸). Automatically dispenses in final rinse.",
            warning: "Do not exceed the MAX mark."
          },
          {
            id: "drum_direct",
            name: "Direct Drum (Drum ONLY - NOT in drawer!)",
            nameJa: "洗濯槽へ直接投入 (ケースに入れない)",
            position: "Inside drum directly with clothes",
            color: "#8b5cf6",
            notes: "CRITICAL: Scent beads and Gel Pods / Sticks MUST be thrown directly into the drum bottom before clothes! Never put them in the drawer."
          }
        ]
      },
      displayReadings: [
        {
          reading: "0.3",
          label: "0.3 杯 (Cup)",
          labelJa: "0.3 杯",
          loadEstimate: "Quick course: ≤1.5 kg (1-2 shirts)",
          loadEstimateJa: "時短コース: 約1.5kg以下（1〜2枚のシャツ）",
          drumKg: "≤ 1.5 kg",
          drumKgJa: "約1.5kg以下 (時短)",
          waterEstL: 16,
          description: "Quick 2kg cycle (light load).",
          descriptionJa: "時短コース・少量の洗濯物（約16L）",
          dosages: {
            nanox: { cap: "0.3杯 (30L線弱 / 8 mL)", capJa: "0.3杯 (30L線弱 / 8mL)", ml: 8, note: "Manual specifies 8mL (0.3 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Manual specifies 10mL (0.2 cap)" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "Below 0.4 (~15 mL)", capJa: "0.4杯弱 (約15mL)", ml: 15, note: "Light rinse" },
            beads: { cap: "Below Lower Mark (~15-18 mL)", capJa: "下線より少なめ (約15〜18mL)", ml: 18, note: "Light scent dose" }
          }
        },
        {
          reading: "0.4",
          label: "0.4 杯 (Cup)",
          labelJa: "0.4 杯",
          loadEstimate: "Light load: ≤2.0 kg",
          loadEstimateJa: "軽めの洗濯: 約2kg以下",
          drumKg: "≤ 2.0 kg",
          drumKgJa: "約2kg以下",
          waterEstL: 20,
          description: "Up to 2kg of clothes.",
          descriptionJa: "シャツや下着など約2kg以下（約20L）",
          dosages: {
            nanox: { cap: "0.4杯 (30L線 / 10 mL)", capJa: "0.4杯 (30L線 / 10mL)", ml: 10, note: "Manual specifies 10mL (0.4 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Manual specifies 10mL (0.2 cap)" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "0.4杯弱 (~18-20 mL)", capJa: "0.4杯弱 (約18〜20mL)", ml: 20, note: "Light dose" },
            beads: { cap: "Below Lower Mark (~20 mL)", capJa: "下線より少なめ (約20mL)", ml: 20, note: "Light scent dose" }
          }
        },
        {
          reading: "0.5",
          label: "0.5 杯 (Cup)",
          labelJa: "0.5 杯",
          loadEstimate: "Medium load: 2.0 - 4.0 kg",
          loadEstimateJa: "普段の洗濯: 約2〜4kg",
          drumKg: "2.0 - 4.0 kg",
          drumKgJa: "約2〜4kg",
          waterEstL: 24,
          description: "Approx. 2-4kg daily clothing.",
          descriptionJa: "普段の毎日の衣類（約24L）",
          dosages: {
            nanox: { cap: "0.5杯 (0.4〜0.6線中間 / 12 mL)", capJa: "0.5杯 (0.4〜0.6線中間 / 12mL)", ml: 12, note: "Manual specifies 12mL (0.5 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Manual specifies 10mL (0.2 cap)" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "0.4〜0.6杯 (~25-30 mL)", capJa: "0.4〜0.6杯 (約25〜30mL)", ml: 28, note: "Between line 0.4 and 0.6" },
            beads: { cap: "Lower Mark (~25-30 mL)", capJa: "キャップ下線弱 (約25〜30mL)", ml: 30, note: "Medium load dose" }
          }
        },
        {
          reading: "0.6",
          label: "0.6 杯 (Cup)",
          labelJa: "0.6 杯",
          loadEstimate: "Medium-heavy load: 4.0 - 6.0 kg",
          loadEstimateJa: "多めの洗濯: 約4〜6kg",
          drumKg: "4.0 - 6.0 kg",
          drumKgJa: "約4〜6kg",
          waterEstL: 26,
          description: "Approx. 4-6kg (moderate to full basket).",
          descriptionJa: "バスケット一杯分または4〜6kg（約26L）",
          dosages: {
            nanox: { cap: "0.7杯 (0.6〜0.8線中間 / 17 mL)", capJa: "0.7杯 (0.6〜0.8線中間 / 17mL)", ml: 17, note: "Manual specifies 17mL (0.7 cap)" },
            bleach: { cap: "15 mL (Lower line weak)", capJa: "15 mL (下線弱 / 約15mL)", ml: 15, note: "Manual specifies 15mL (0.4 cap)" },
            softener: { cap: "Line 1 (45L / 20 mL)", capJa: "目盛り1 (45L線 / 20mL)", ml: 20, note: "Manual specifies 20mL (Line 1)" },
            citric: { cap: "0.6〜0.8杯 (~35-40 mL)", capJa: "0.6〜0.8杯 (約35〜40mL)", ml: 38, note: "Between line 0.6 and 0.8" },
            beads: { cap: "Between Marks (~35-45 mL)", capJa: "下線〜上線中間 (約35〜45mL)", ml: 40, note: "Medium-heavy dose" }
          }
        },
        {
          reading: "0.8",
          label: "0.8 杯 (Cup)",
          labelJa: "0.8 杯",
          loadEstimate: "Full drum load: 6.0 - 10.0 kg",
          loadEstimateJa: "大物・まとめ洗い: 約6〜10kg（満量）",
          drumKg: "6.0 - 10.0 kg (Full)",
          drumKgJa: "約6〜10kg (満量)",
          waterEstL: 30,
          description: "Large 6-10kg loads, towels, sheets, bedding.",
          descriptionJa: "大物・毛布・まとめ洗い（最大10kg満量・約30L）",
          dosages: {
            nanox: { cap: "0.8杯 (55L線 / 19 mL)", capJa: "0.8杯 (55L線 / 19mL)", ml: 19, note: "Manual specifies 19mL (0.8 cap)" },
            bleach: { cap: "20 mL (Lower Line)", capJa: "20 mL (キャップ下線)", ml: 20, note: "Manual specifies 20mL (0.5 cap / 下線)" },
            softener: { cap: "Line 2 weak (~28 mL)", capJa: "目盛り2弱 (約28mL)", ml: 28, note: "Manual specifies 28mL (~Line 2)" },
            citric: { cap: "0.8杯 (55L線 / ~45-50 mL)", capJa: "0.8杯 (55L線 / 約45〜50mL)", ml: 48, note: "Full load dose" },
            beads: { cap: "Upper Mark (~50-60 mL)", capJa: "キャップ上線 (約50〜60mL)", ml: 55, note: "Full cap scent dose" }
          }
        }
      ]
    },

    "panasonic_na_vx3800l": {
      id: "panasonic_na_vx3800l",
      brand: "Panasonic",
      brandJa: "パナソニック",
      model: "NA-VX3800L",
      fullName: "Panasonic NA-VX3800L Heat Pump (Wash 10kg / Dry 6kg)",
      fullNameJa: "パナソニック NA-VX3800L ヒートポンプ (洗濯 10kg / 乾燥 6kg)",
      floor: 3,
      type: "Heat Pump Front-Load Drum Washer / Dryer",
      typeJa: "ヒートポンプななめドラム洗濯乾燥機",
      capacityWashKg: 10,
      capacityDryKg: 6,
      manualPdf: "Panasonic NA-VX3800.pdf",
      features: [
        "Located on 3rd floor (Women only)",
        "Heat Pump drying technology (gentle on fabrics, energy efficient)",
        "ECONAVI smart load and water temperature sensors",
        "Jet Drying (ジェット乾燥) and Jet Fluffing (ジェットほぐし)"
      ],
      featuresJa: [
        "3階女性専用フロア設置",
        "衣類が傷みにくく省エネなヒートポンプ乾燥方式",
        "エコナビ（ECONAVI）インテリジェントセンサー",
        "シワを抑える「ジェット乾燥」＆「ジェットほぐし」"
      ],
      interactivePanel: {
      "modelLabel": "Panasonic NA-VX3800L Heat Pump (3F)",
      "modelLabelJa": "パナソニック NA-VX3800L ヒートポンプ (3階)",
      "panelType": "panasonic_vx",
      "brandBadge": "Panasonic",
      "subBadge": "10.0 HEAT PUMP",
      "sections": [
            {
                  "id": "vx_process_section",
                  "type": "process-strip",
                  "titleEn": "Process Adjusters (Wash / Rinse / Spin / Dry)",
                  "titleJa": "個別行程設定（洗い・すすぎ・脱水・乾燥）",
                  "leftIndicators": [
                        "洗い",
                        "すすぎ1",
                        "高め",
                        "プレ乾燥"
                  ],
                  "topIndicators": [
                        "フィルター掃除",
                        "見直し中",
                        "自動槽洗浄",
                        "自動槽乾燥"
                  ],
                  "columns": [
                        {
                              "id": "vx_col_wash",
                              "buttonId": "btn_wash",
                              "kanji": "洗い",
                              "romaji": "Arai",
                              "en": "Wash Time",
                              "role": "process",
                              "ladder": [
                                    "30以上",
                                    "25",
                                    "20",
                                    "15",
                                    "7"
                              ],
                              "badgeEn": "Wash Setting",
                              "badgeJa": "洗い設定",
                              "descEn": "Selects wash duration between 7, 15, 20, 25, or 30+ minutes.",
                              "descJa": "洗い時間を7、15、20、25、30分以上から選びます。"
                        },
                        {
                              "id": "vx_col_rinse",
                              "buttonId": "btn_rinse",
                              "kanji": "すすぎ",
                              "romaji": "Susugi",
                              "en": "Rinse Count",
                              "role": "process",
                              "ladder": [
                                    "注水",
                                    "4",
                                    "3",
                                    "2",
                                    "1"
                              ],
                              "badgeEn": "Rinse Setting",
                              "badgeJa": "すすぎ設定",
                              "descEn": "Selects rinse count (1, 2, 3, 4 times) or continuous freshwater overflow rinse (注水).",
                              "descJa": "すすぎ回数を1、2、3、4回、または注水すすぎから選びます。"
                        },
                        {
                              "id": "vx_col_spin",
                              "buttonId": "btn_spin",
                              "kanji": "脱水",
                              "romaji": "Dassui",
                              "en": "Spin Time",
                              "role": "process",
                              "subtext": "ジェットほぐし(5秒押し)",
                              "subtextEn": "Jet Fluffing (Hold 5s)",
                              "ladder": [
                                    "ジェットほぐし",
                                    "10以上",
                                    "6",
                                    "3",
                                    "1"
                              ],
                              "badgeEn": "Spin Setting",
                              "badgeJa": "脱水設定",
                              "descEn": "Selects spin time (1, 3, 6, 10+ min). Hold for 5 seconds to toggle Jet Fluffing (ジェットほぐし).",
                              "descJa": "脱水時間を1、3、6、10分以上から選びます。5秒長押しでジェットほぐしを設定／解除できます。"
                        },
                        {
                              "id": "vx_col_dry",
                              "buttonId": "btn_dry",
                              "kanji": "乾燥",
                              "romaji": "Kansō",
                              "en": "Dry Mode / Time",
                              "role": "process",
                              "subtext": "ジェット乾燥(5秒押し)",
                              "subtextEn": "Jet Dry (Hold 5s)",
                              "ladder": [
                                    "しっかり",
                                    "標準",
                                    "省エネ",
                                    "ジェット乾燥",
                                    "120",
                                    "60",
                                    "30"
                              ],
                              "badgeEn": "Dry Setting",
                              "badgeJa": "乾燥設定",
                              "descEn": "Selects timed dry (30, 60, 120 min) or sensor dry modes: Jet Dry (ジェット乾燥), Eco (省エネ), Standard (標準), or Extra (しっかり). Hold 5s to toggle Jet Dry.",
                              "descJa": "タイマー乾燥（30・60・120分）またはセンサー乾燥（ジェット乾燥・省エネ・標準・しっかり）を選びます。5秒長押しでジェット乾燥を設定／解除できます。"
                        }
                  ]
            },
            {
                  "id": "vx_center_section",
                  "type": "display-course",
                  "titleEn": "Display Screen & Course Selection",
                  "titleJa": "表示部・コース選択",
                  "screen": {
                        "id": "disp_screen_vx",
                        "type": "display",
                        "kanji": "デジタル表示部",
                        "romaji": "Dejitaru Hyōji-bu",
                        "en": "Digital Display Readout",
                        "readout": "8:8.8",
                        "labels": [
                              "残り(約)分",
                              "予約(時間後)",
                              "洗剤(杯)"
                        ],
                        "badgeEn": "Display",
                        "badgeJa": "表示部",
                        "descEn": "Displays remaining time in minutes, detergent cup dose (0.4–1.0杯), and delay timer countdown.",
                        "descJa": "残り時間（分）、洗剤目安杯数（0.4〜1.0杯）、予約時間などを表示します。"
                  },
                  "fluffIndicator": "ふんわりキープ",
                  "courseRows": [
                        [
                              {
                                    "kanji": "おまかせ",
                                    "romaji": "Omakase",
                                    "en": "Standard Auto",
                                    "descEn": "Auto senses load and runs optimal wash and dry.",
                                    "descJa": "日常の洗濯。センサーで自動計量して最適に洗います。"
                              },
                              {
                                    "kanji": "わたし流",
                                    "romaji": "Watashi-ryū",
                                    "en": "My Custom",
                                    "descEn": "Stores user-selected custom times.",
                                    "descJa": "お好みの設定を記憶させて洗います。"
                              },
                              {
                                    "kanji": "ナイト",
                                    "romaji": "Naito",
                                    "en": "Night Silent",
                                    "descEn": "Low-noise quiet tumbling for nighttime.",
                                    "descJa": "低騒音で夜間の洗濯に適しています。"
                              },
                              {
                                    "kanji": "どろんこ",
                                    "romaji": "Doronko",
                                    "en": "Muddy Wash",
                                    "descEn": "Intense cleaning for mud and sports gear.",
                                    "descJa": "泥汚れや作業着を強力に洗います。"
                              }
                        ],
                        [
                              {
                                    "kanji": "毛布",
                                    "romaji": "Mōfu",
                                    "en": "Blanket",
                                    "descEn": "Large blankets and quilts up to 4.2kg.",
                                    "descJa": "毛布やタオルケットなどの大物洗い。"
                              },
                              {
                                    "kanji": "おうちクリーニング",
                                    "romaji": "O-uchi Kurīningu",
                                    "en": "Delicates / Soft Dry",
                                    "descEn": "Gentle agitation for knitwear and fine garments.",
                                    "descJa": "型崩れを防ぎたいデリケート衣類向け。"
                              },
                              {
                                    "kanji": "化繊60分",
                                    "romaji": "Kasen 60-fun",
                                    "en": "Synthetic 60 Min",
                                    "descEn": "Wash to completely dry 1kg synthetic clothes in 60 min.",
                                    "descJa": "化繊1kg以下の衣類を洗濯〜乾燥まで約60分で仕上げます。"
                              },
                              {
                                    "kanji": "槽洗浄/乾燥",
                                    "romaji": "Sō Senjō/Kansō",
                                    "en": "Tub Clean / Dry",
                                    "descEn": "Sterilizes drum with hot air and water.",
                                    "descJa": "洗濯槽の黒カビ予防・殺菌・乾燥を行います。"
                              }
                        ]
                  ],
                  "buttons": [
                        {
                              "id": "btn_course",
                              "kanji": "コース",
                              "romaji": "Kōsu",
                              "en": "Course Selector",
                              "role": "course",
                              "badgeEn": "Course",
                              "badgeJa": "コース",
                              "descEn": "Cycles through the 8 wash/dry programs above.",
                              "descJa": "上記の8コースを順に切り替えます。"
                        },
                        {
                              "id": "btn_auto_care",
                              "kanji": "自動お手入れ",
                              "romaji": "Jidō O-teire",
                              "en": "Auto Tub Care",
                              "role": "feature",
                              "badgeEn": "Tub Care",
                              "badgeJa": "自動お手入れ",
                              "descEn": "Toggles automatic drum rinse and dry after every cycle to prevent mold buildup.",
                              "descJa": "毎回の洗濯終了後に自動で洗濯槽を黒カビから守るお手入れを設定します。"
                        }
                  ]
            },
            {
                  "id": "vx_mode_section",
                  "type": "mode-stack",
                  "titleEn": "Direct Operation Modes (Vertical Stack)",
                  "titleJa": "運転内容（ダイレクト切換）",
                  "buttons": [
                        {
                              "id": "btn_mode_wash",
                              "kanji": "洗濯",
                              "romaji": "Sentaku",
                              "en": "Wash Only (Air Dry)",
                              "role": "mode",
                              "badgeEn": "Direct Mode",
                              "badgeJa": "ダイレクト選択",
                              "descEn": "Runs wash, rinse, and spin without heat-pump drying (up to 10kg capacity) for line or balcony drying.",
                              "descJa": "乾燥を行わず、洗濯〜脱水のみを行うモードです（最大10kg）。外干し・部屋干しに。"
                        },
                        {
                              "id": "btn_mode_wash_dry",
                              "kanji": "洗濯〜乾燥",
                              "romaji": "Sentaku~Kansō",
                              "en": "Wash to Dry (Full Cycle)",
                              "role": "mode",
                              "badgeEn": "Direct Mode",
                              "badgeJa": "ダイレクト選択",
                              "descEn": "Full automatic wash and heat pump tumble dry up to 6kg. Clothes come out 100% warm and dry.",
                              "descJa": "洗濯から乾燥まで全自動で行います（最大6kg）。干す手間なくフワフワに仕上がります。"
                        },
                        {
                              "id": "btn_mode_dry",
                              "kanji": "乾燥のみ",
                              "romaji": "Kansō Nomi",
                              "en": "Dry Only",
                              "role": "mode",
                              "badgeEn": "Direct Mode",
                              "badgeJa": "ダイレクト選択",
                              "descEn": "Heat pump tumble dries damp laundry or freshly washed towels up to 6kg.",
                              "descJa": "濡れた衣類やタオルだけをヒートポンプでふんわり乾燥させます（最大6kg）。"
                        }
                  ]
            },
            {
                  "id": "vx_power_start_section",
                  "type": "power-start-strip",
                  "titleEn": "Start, Power & Econavi (Far Right)",
                  "titleJa": "スタート・電源・エコナビ（右端）",
                  "doorLock": "🔒 ドアロック",
                  "econavi": "● ECONAVI",
                  "startButton": {
                        "id": "btn_start",
                        "kanji": "スタート / 一時停止",
                        "romaji": "Sutāto / Ichiji Teishi",
                        "en": "Start / Pause",
                        "role": "start",
                        "badgeEn": "Start / Pause",
                        "badgeJa": "スタート／一時停止",
                        "descEn": "Large illuminated push button. Starts cycle after door is closed; press to pause.",
                        "descJa": "ドアを閉めた後、押して運転開始。運転中に押すと一時停止します。"
                  },
                  "powerBox": {
                        "title": "電源",
                        "offButton": {
                              "id": "btn_power_off",
                              "kanji": "切",
                              "romaji": "Kiri",
                              "en": "Power OFF",
                              "role": "power",
                              "badgeEn": "Power Off",
                              "badgeJa": "電源切",
                              "descEn": "Immediately shuts off machine power.",
                              "descJa": "電源を「切」にします。"
                        },
                        "onButton": {
                              "id": "btn_power_on",
                              "kanji": "入",
                              "romaji": "Iri",
                              "en": "Power ON",
                              "role": "power",
                              "badgeEn": "Power On",
                              "badgeJa": "電源入",
                              "descEn": "Turns on machine power with opening chime.",
                              "descJa": "電源を「入」にします。"
                        }
                  }
            }
      ]
},
      panelLayout: {
        powerButtons: ["切 (Power Off)", "入 (Power On)"],
        startButton: "スタート / 一時停止 (Start / Pause)",
        modeSwitch: "運転内容 (Mode): 洗濯 (Wash) | 洗濯〜乾燥 (Wash & Dry) | 乾燥のみ (Dry Only)",
        courseSelect: "コース (Course): おまかせ (Standard/Auto), わたし流 (My Custom), ナイト (Night), どろんこ (Muddy), 毛布 (Blanket), おうちクリーニング/ソフト乾燥 (Delicates/Soft Dry), 化繊60分 (Synthetics 60min), ダニバスター (Mite Buster), 槽洗浄/乾燥 (Tub Clean/Dry)",
        extraButtons: ["自動お手入れ (Auto Tub Clean)", "予約 (Timer)", "ジェット乾燥 (Jet Dry)"]
      },
      dispenserDrawer: {
        title: "Panasonic NA-VX3800L Detergent Drawer",
        diagramType: "panasonic_vx",
        slots: [
          {
            id: "softener",
            name: "Fabric Softener (柔軟剤)",
            nameJa: "柔軟剤",
            position: "Left front compartment",
            color: "#ec4899",
            maxCapacity: "Max 55 mL (Do not exceed 'これ以下' line)",
            notes: "Pour your fabric softener or citric acid rinse here. Water siphons into drum during final rinse.",
            warning: "Never exceed the MAX mark or close drawer violently."
          },
          {
            id: "liquid_detergent",
            name: "Liquid Detergent & Bleach (液体洗剤・漂白剤)",
            nameJa: "液体洗剤・漂白剤",
            position: "Right channel",
            color: "#3b82f6",
            notes: "Pour your active liquid detergent here. Liquid oxygen bleach can also be poured together here."
          },
          {
            id: "powder_detergent",
            name: "Powder Detergent (粉末合成洗剤)",
            nameJa: "粉末合成洗剤",
            position: "Rear hopper",
            color: "#f59e0b",
            notes: "For powder synthetic detergent and powder oxygen bleach. Wipe moisture before filling to prevent caking."
          },
          {
            id: "drum_direct",
            name: "Direct Drum (Drum ONLY - NOT in drawer!)",
            nameJa: "洗濯槽へ直接投入 (ケースに入れない)",
            position: "Inside drum directly with clothes",
            color: "#10b981",
            notes: "CRITICAL: Scent beads and Gel Pods / Sticks MUST be thrown directly into the drum bottom before clothes! Never put them in the drawer."
          }
        ]
      },
      displayReadings: [
        {
          reading: "0.4",
          label: "0.4 杯 (Cup)",
          labelJa: "0.4 杯",
          loadEstimate: "Small load: ≤0.5 kg (1-2 shirts/undergarments)",
          loadEstimateJa: "少量衣類: 0.5kg以下（1〜2枚のシャツや下着）",
          drumKg: "≤ 0.5 kg",
          drumKgJa: "0.5kg以下",
          waterEstL: 30,
          description: "Light load: 1-2 small clothing items.",
          descriptionJa: "1〜2枚のシャツや下着など少量の衣類",
          dosages: {
            nanox: { cap: "0.4杯 (30L線)", capJa: "0.4杯 (30L線)", ml: 10, note: "Bottle bottom line (30L)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Light wash dose" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Light load softening" },
            citric: { cap: "Below 0.4 (~12 mL)", capJa: "0.4杯弱 (約12mL)", ml: 12, note: "Light load rinse" },
            beads: { cap: "Below Lower Mark (~15 mL)", capJa: "下線より少なめ (約15mL)", ml: 15, note: "Subtle scent" }
          }
        },
        {
          reading: "0.6",
          label: "0.6 杯 (Cup)",
          labelJa: "0.6 杯",
          loadEstimate: "Medium-light load: ≤2.5 kg (1-2 days clothes)",
          loadEstimateJa: "普段の洗濯: 2.5kg以下（1人分の1〜2日分）",
          drumKg: "≤ 2.5 kg",
          drumKgJa: "2.5kg以下",
          waterEstL: 45,
          description: "Approx 1-2 days clothes for 1 person.",
          descriptionJa: "1人分の1〜2日分の衣類",
          dosages: {
            nanox: { cap: "0.6杯 (45L線)", capJa: "0.6杯 (45L線)", ml: 15, note: "Bottle 2nd line (45L)" },
            bleach: { cap: "20 mL (Lower Line)", capJa: "20 mL (キャップ下線)", ml: 20, note: "Standard drum dose" },
            softener: { cap: "Line 1 (45L / 22 mL)", capJa: "目盛り1 (45L線 / 22mL)", ml: 22, note: "Line 1 graduation" },
            citric: { cap: "0.4杯 (35L / 25 mL)", capJa: "0.4杯 (35L線 / 25mL)", ml: 25, note: "Line 0.4 graduation" },
            beads: { cap: "Lower Mark (~25-30 mL)", capJa: "キャップ下線弱 (~25-30mL)", ml: 25, note: "Moderate scent" }
          }
        },
        {
          reading: "0.8",
          label: "0.8 杯 (Cup)",
          labelJa: "0.8 杯",
          loadEstimate: "Medium-heavy load: ≤4.5 kg (daily basket)",
          loadEstimateJa: "多めの洗濯: 4.5kg以下（バスケット一杯分）",
          drumKg: "≤ 4.5 kg",
          drumKgJa: "4.5kg以下",
          waterEstL: 55,
          description: "Standard daily basket load.",
          descriptionJa: "毎日の洗濯物バスケット一杯分",
          dosages: {
            nanox: { cap: "0.8杯 (55L線)", capJa: "0.8杯 (55L線)", ml: 20, note: "Bottle 3rd line (55L)" },
            bleach: { cap: "20 mL (Lower Line)", capJa: "20 mL (キャップ下線)", ml: 20, note: "Standard drum dose" },
            softener: { cap: "Line 2 (55L / 32 mL)", capJa: "目盛り2 (55L線 / 32mL)", ml: 32, note: "Line 2 graduation" },
            citric: { cap: "0.6杯 (45L / 35 mL)", capJa: "0.6杯 (45L線 / 35mL)", ml: 35, note: "Line 0.6 graduation" },
            beads: { cap: "Lower Mark (~35-45 mL)", capJa: "キャップ下線 (約35〜45mL)", ml: 35, note: "Medium-heavy dose" }
          }
        },
        {
          reading: "1.0",
          label: "1.0 杯 (Cup)",
          labelJa: "1.0 杯",
          loadEstimate: "Heavy / Full load: ≤10 kg (drum max)",
          loadEstimateJa: "大物・満量: 10kg以下（最大容量・毛布・シーツ）",
          drumKg: "≤ 10 kg",
          drumKgJa: "10kg以下 (満量)",
          waterEstL: 65,
          description: "Full drum load, large towels, bedding.",
          descriptionJa: "満量ドラム、大判バスタオル、寝具など",
          dosages: {
            nanox: { cap: "1杯 (65L線 / 満量)", capJa: "1杯 (65L線 / 満量)", ml: 25, note: "Full cap rim (65L)" },
            bleach: { cap: "40 mL (Upper Line)", capJa: "40 mL (キャップ上線)", ml: 40, note: "Full load maximum dose" },
            softener: { cap: "Line 3 (65L / 42 mL)", capJa: "目盛り3 (65L線 / 42mL)", ml: 42, note: "Line 3 graduation (up to 55mL)" },
            citric: { cap: "0.8杯 (55L / 45 mL)", capJa: "0.8杯 (55L線 / 45mL)", ml: 45, note: "Line 0.8 graduation" },
            beads: { cap: "Upper Mark (~55-70 mL)", capJa: "キャップ上線 (約55〜70mL)", ml: 55, note: "Full cap scent dose" }
          }
        }
      ]
    },

    "sharp_es_h10b": {
      id: "sharp_es_h10b",
      brand: "Sharp",
      brandJa: "シャープ",
      model: "ES-H10B",
      fullName: "Sharp ES-H10B (Both Units / 2台設置)",
      fullNameJa: "シャープ ES-H10B (2台共通)",
      floor: 4,
      type: "Full-Size Front-Load Drum Washer / Dryer",
      typeJa: "ドラム式洗濯乾燥機 (左開き/右開き 2台共通)",
      capacityWashKg: 10,
      capacityDryKg: 6,
      manualPdf: "Sharp ES-H10B.pdf",
      features: [
        "Two identical machines on 4th floor (Left & Right units)",
        "Plasmacluster ion technology",
        "Dedicated separate slot for liquid bleach",
        "Identical control panel & dispenser to ES-H10C"
      ],
      featuresJa: [
        "4階に同型機が2台設置されています (左右共通仕様)",
        "プラズマクラスター除菌・消臭機能",
        "液体漂白剤の専用投入口あり (一番左)",
        "操作パネルおよび投入口構造はES-H10Cと共通"
      ],
      interactivePanel: {
      "modelLabel": "Sharp ES-H10B (4F)",
      "modelLabelJa": "シャープ ES-H10B (4F)",
      "panelType": "sharp_h10",
      "brandBadge": "SHARP",
      "subBadge": "マイクロ高圧洗浄 / プラズマクラスター",
      "sections": [
            {
                  "id": "h10_door_process_section",
                  "type": "door-process-block",
                  "titleEn": "Door Lock & Process Adjusters (Far Left)",
                  "titleJa": "ドアロック・個別行程（左側）",
                  "doorLock": {
                        "lamp": "ドアロック",
                        "button": {
                              "id": "btn_unlock",
                              "kanji": "ロック解除",
                              "romaji": "Rokku Kaijo",
                              "en": "Unlock Door",
                              "role": "safety",
                              "subtext": "チャイルドロック(3秒押し)",
                              "subtextEn": "Child Lock (Hold 3s)",
                              "badgeEn": "Door / Safety",
                              "badgeJa": "ドアロック解除",
                              "descEn": "Press during pause to unlock front door. Hold for 3 seconds to activate Child Lock.",
                              "descJa": "一時停止中にドアロックを解除して洗濯物を追加・取り出しします。3秒長押しでチャイルドロックを設定／解除できます。"
                        }
                  },
                  "processColumns": [
                        {
                              "id": "h10_col_wash",
                              "buttonId": "btn_wash",
                              "kanji": "洗い",
                              "romaji": "Arai",
                              "en": "Wash Time",
                              "role": "process",
                              "ladder": [
                                    "20",
                                    "10",
                                    "5分"
                              ],
                              "badgeEn": "Wash",
                              "badgeJa": "洗い",
                              "descEn": "Sets wash minutes (5, 10, 20 min). Press to cycle through options.",
                              "descJa": "洗い時間を5分、10分、20分から選びます。"
                        },
                        {
                              "id": "h10_col_rinse",
                              "buttonId": "btn_rinse",
                              "kanji": "すすぎ",
                              "romaji": "Susugi",
                              "en": "Rinse Count",
                              "role": "process",
                              "ladder": [
                                    "注水",
                                    "3",
                                    "2",
                                    "1回"
                              ],
                              "badgeEn": "Rinse",
                              "badgeJa": "すすぎ",
                              "descEn": "Sets rinse count (1, 2, 3 times) or continuous freshwater overflow rinse (注水).",
                              "descJa": "すすぎ回数を1回、2回、3回、または注水から選びます。"
                        },
                        {
                              "id": "h10_col_spin",
                              "buttonId": "btn_spin",
                              "kanji": "脱水",
                              "romaji": "Dassui",
                              "en": "Spin Time",
                              "role": "process",
                              "ladder": [
                                    "自動",
                                    "5",
                                    "3",
                                    "1分"
                              ],
                              "badgeEn": "Spin",
                              "badgeJa": "脱水",
                              "descEn": "Sets spin duration: 1 min, 3 min, 5 min, or Auto (自動).",
                              "descJa": "脱水時間を1分、3分、5分、または自動から選びます。"
                        },
                        {
                              "id": "h10_col_dry",
                              "buttonId": "btn_dry",
                              "kanji": "乾かす",
                              "romaji": "Kawakasu",
                              "en": "Dry Time",
                              "role": "process",
                              "ladder": [
                                    "(点滅)自動",
                                    "30 3",
                                    "20 2",
                                    "10分 1.5時間"
                              ],
                              "badgeEn": "Dry",
                              "badgeJa": "乾かす",
                              "descEn": "Sets dry duration: 10 min, 20 min, 30 min, 1.5 hrs, 2 hrs, 3 hrs, or Auto (自動).",
                              "descJa": "乾燥時間を10分、20分、30分、1.5時間、2時間、3時間、または自動から選びます。"
                        }
                  ]
            },
            {
                  "id": "h10_display_direct_section",
                  "type": "display-direct-block",
                  "titleEn": "Digital Display & Direct Intensive Wash",
                  "titleJa": "デジタル表示部・極め洗い",
                  "screen": {
                        "id": "disp_screen_h10",
                        "type": "display",
                        "kanji": "デジタル表示部",
                        "romaji": "Dejitaru Hyōji-bu",
                        "en": "Digital Display Readout",
                        "readout": "8:88",
                        "labels": [
                              "残り(分)",
                              "冷却中",
                              "🍇",
                              "洗剤(杯)",
                              "予約(時間後)"
                        ],
                        "badgeEn": "Display",
                        "badgeJa": "表示部",
                        "descEn": "Displays detergent cup fractions (0.3, 0.5, 0.7, 0.8杯), remaining minutes, Plasmacluster status, or error codes (e.g. E02, C04).",
                        "descJa": "洗剤の目安杯数（0.3, 0.5, 0.7, 0.8杯）、残り時間、冷却中、プラズマクラスター稼働状況、エラーコードを表示します。"
                  },
                  "timerButton": {
                        "id": "btn_timer",
                        "kanji": "予約",
                        "romaji": "Yoyaku",
                        "en": "Delay Timer",
                        "role": "feature",
                        "badgeEn": "Timer",
                        "badgeJa": "予約タイマー",
                        "descEn": "Sets cycle to finish in 2 to 24 hours.",
                        "descJa": "運転終了時刻を予約します。"
                  },
                  "delicatesDirectButton": {
                        "id": "btn_delicates_kiwame",
                        "kanji": "極め洗い・ホームクリーニング",
                        "romaji": "Kiwame-arai / Hōmu Kurīningu",
                        "en": "Intensive Wash & Home Dry Cleaning",
                        "icon": "👔",
                        "role": "feature",
                        "subtext": "1 極め洗い / 2 ホームクリーニング",
                        "subtextEn": "1 Intensive Wash / 2 Delicates",
                        "badgeEn": "Dedicated Cycle",
                        "badgeJa": "ダイレクト専用",
                        "descEn": "Dedicated one-touch cycle button with shirt icon. Press 1 for Kiwame-arai (micro-bubble intensive stain removal) or 2 for Home Cleaning (gentle dry-cleaning cycle for wool/suits).",
                        "descJa": "専用ダイレクトボタン。1回押すと「極め洗い」（頑固汚れ・黄ばみ落とし）、2回押すと「ホームクリーニング」（縮みやすいスーツ・ニットのおしゃれ着洗い）になります。"
                  }
            },
            {
                  "id": "h10_course_mode_section",
                  "type": "course-mode-block",
                  "titleEn": "Course Selection & Operation Modes",
                  "titleJa": "コース選択・運転切換",
                  "courseCol": {
                        "grid": [
                              [
                                    {
                                          "kanji": "標準",
                                          "romaji": "Hyōjun",
                                          "en": "Standard"
                                    },
                                    {
                                          "kanji": "サッと予洗い",
                                          "romaji": "Satto Yo-arai",
                                          "en": "Quick Pre-Wash"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "おうち流",
                                          "romaji": "O-uchi Ryū",
                                          "en": "Custom"
                                    },
                                    {
                                          "kanji": "部屋干し",
                                          "romaji": "Heya-boshi",
                                          "en": "Room Dry"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "時短(2kg)",
                                          "romaji": "Jitan",
                                          "en": "Quick (2kg)"
                                    },
                                    {
                                          "kanji": "槽洗浄",
                                          "romaji": "Sō Senjō",
                                          "en": "Tub Wash"
                                    }
                              ],
                              [
                                    {
                                          "kanji": "毛布",
                                          "romaji": "Mōfu",
                                          "en": "Blanket"
                                    },
                                    {
                                          "kanji": "",
                                          "romaji": "",
                                          "en": ""
                                    }
                              ]
                        ],
                        "button": {
                              "id": "btn_course",
                              "kanji": "コース",
                              "romaji": "Kōsu",
                              "en": "Course Selector",
                              "role": "course",
                              "badgeEn": "Course",
                              "badgeJa": "コース",
                              "descEn": "Cycles through Sharp's 10kg drum courses: 標準 (Standard), おうち流 (Custom), 時短 (Quick 2kg), 毛布 (Blanket), サッと予洗い (Quick Pre-Wash), 部屋干し (Room Dry), 槽洗浄 (Tub Wash).",
                              "descJa": "標準、おうち流、時短(2kg)、毛布、サッと予洗い、部屋干し、槽洗浄から選びます。"
                        }
                  },
                  "modeCol": {
                        "modes": [
                              {
                                    "kanji": "洗濯",
                                    "romaji": "Sentaku",
                                    "en": "Wash Only"
                              },
                              {
                                    "kanji": "乾燥",
                                    "romaji": "Kansō",
                                    "en": "Dry Only"
                              },
                              {
                                    "kanji": "消臭",
                                    "romaji": "Shōshū",
                                    "en": "Plasmacluster Deodorize"
                              },
                              {
                                    "kanji": "槽クリーン",
                                    "romaji": "Sō Kurīn",
                                    "en": "Tub Clean with Ions"
                              }
                        ],
                        "noteEn": "(Both 洗濯 and 乾燥 light up together for 洗〜乾 Wash & Dry)",
                        "noteJa": "（洗濯と乾燥の両方が点灯すると「洗〜乾」になります）",
                        "button": {
                              "id": "btn_mode_switch",
                              "kanji": "運転切換",
                              "romaji": "Unten Kirikae",
                              "en": "Operation Mode Switch",
                              "role": "mode",
                              "badgeEn": "Mode Switch",
                              "badgeJa": "運転切換",
                              "descEn": "Cycles operation mode: 洗〜乾 (Wash & Dry) → 洗濯 (Wash) → 乾燥 (Dry) → 消臭 (Deodorize) → 槽クリーン (Tub Clean).",
                              "descJa": "押すたびに「洗濯〜乾燥」「洗濯」「乾燥」「消臭」「槽クリーン」が切り替わります。"
                        },
                        "virtualButtons": [
                              {
                                    "id": "btn_mode_wash",
                                    "kanji": "洗濯",
                                    "romaji": "Sentaku",
                                    "en": "Wash Only (Air Dry)",
                                    "role": "mode",
                                    "badgeEn": "Direct Mode",
                                    "badgeJa": "直接選択",
                                    "descEn": "Wash-only cycle (up to 10kg) for line or balcony drying.",
                                    "descJa": "外干し・部屋干し用の「洗濯のみ」モードです（最大10kg）。"
                              },
                              {
                                    "id": "btn_mode_wash_dry",
                                    "kanji": "洗〜乾",
                                    "romaji": "Sen-Kan",
                                    "en": "Wash & Dry (Full Cycle)",
                                    "role": "mode",
                                    "badgeEn": "Direct Mode",
                                    "badgeJa": "直接選択",
                                    "descEn": "Full automatic wash and dry (up to 6kg). Both 洗濯 and 乾燥 indicators illuminate.",
                                    "descJa": "洗濯から乾燥まで全自動で行います（最大6kg）。"
                              },
                              {
                                    "id": "btn_mode_dry",
                                    "kanji": "乾燥",
                                    "romaji": "Kansō",
                                    "en": "Dry Only",
                                    "role": "mode",
                                    "badgeEn": "Direct Mode",
                                    "badgeJa": "直接選択",
                                    "descEn": "Tumble dry freshly washed clothes or damp items up to 6kg.",
                                    "descJa": "濡れた衣類やタオルだけを乾燥させます（最大6kg）。"
                              },
                              {
                                    "id": "btn_mode_deodorize",
                                    "kanji": "消臭",
                                    "romaji": "Shōshū",
                                    "en": "Plasmacluster Deodorize",
                                    "role": "mode",
                                    "badgeEn": "Plasmacluster",
                                    "badgeJa": "消臭",
                                    "descEn": "Waterless disinfection and odor removal for jackets, suits, and shoes.",
                                    "descJa": "水洗いできないスーツ、上着、靴などをプラズマクラスターイオンで除菌・消臭します。"
                              }
                        ]
                  }
            },
            {
                  "id": "h10_power_start_section",
                  "type": "power-start-strip",
                  "titleEn": "Power, ECO & Start (Far Right)",
                  "titleJa": "電源・エコ・スタート（右端）",
                  "powerBox": {
                        "title": "電源",
                        "offButton": {
                              "id": "btn_power_off",
                              "kanji": "切",
                              "romaji": "Kiri",
                              "en": "Power OFF",
                              "role": "power",
                              "badgeEn": "Power Off",
                              "badgeJa": "電源切",
                              "descEn": "Immediately turns off power.",
                              "descJa": "電源を切ります。"
                        },
                        "onButton": {
                              "id": "btn_power_on",
                              "kanji": "入",
                              "romaji": "Iri",
                              "en": "Power ON",
                              "role": "power",
                              "badgeEn": "Power On",
                              "badgeJa": "電源入",
                              "descEn": "Turns on machine power.",
                              "descJa": "電源を入れます。5分放置で自動電源オフ。"
                        }
                  },
                  "ecoLamp": "ECO",
                  "startButton": {
                        "id": "btn_start",
                        "kanji": "スタート / 一時停止",
                        "romaji": "Sutāto / Ichiji Teishi",
                        "en": "Start / Pause",
                        "role": "start",
                        "badgeEn": "Start / Pause",
                        "badgeJa": "スタート／一時停止",
                        "descEn": "Large circular button. Press to start cycle; front door locks automatically.",
                        "descJa": "運転を開始または一時停止します。スタート後にドアが自動ロックされます。"
                  }
            }
      ]
},
      panelLayout: {
        powerButtons: ["電源スイッチ (Power Switch - Auto off)"],
        startButton: "スタート / 一時停止 (Start / Pause)",
        modeSwitch: "運転切換 (Mode): 洗濯 (Wash) → 洗濯〜乾燥 (Wash & Dry) → 乾燥 (Dry) → 消臭 (Deodorize) → 槽クリーン (Tub Clean)",
        courseSelect: "コース (Course): 標準 (Standard), おうち流 (Custom), 時短 (Quick), サッと予洗い (Pre-Wash), 部屋干し (Room Dry), 毛布 (Blanket), 槽洗浄 (Tub Wash)",
        specialButtons: ["極め洗い・ホームクリーニング (Intensive Clean / Delicates)", "ロック解除 (Unlock Door)", "予約 (Timer)"]
      },
      dispenserDrawer: {
        title: "Sharp ES-H10B 3-Slot Detergent Drawer",
        titleJa: "シャープ ES-H10B 洗剤投入口 (3スロット)",
        diagramType: "sharp_h10",
        slots: [
          {
            id: "bleach",
            name: "Liquid Bleach (漂白剤 液体タイプ)",
            nameJa: "漂白剤(液体タイプ)",
            position: "Left slot",
            positionJa: "左スロット",
            color: "#10b981",
            notes: "Dedicated bleach dispenser! Pour liquid oxygen bleach directly here.",
            notesJa: "液体酸素系漂白剤専用です。衣類用酸素系漂白剤を投入してください。"
          },
          {
            id: "detergent",
            name: "Synthetic Detergent (合成洗剤 液体または粉末タイプ)",
            nameJa: "合成洗剤(液体または粉末タイプ)",
            position: "Center slot",
            positionJa: "中央スロット",
            color: "#3b82f6",
            notes: "Pour your active liquid or powder detergent here.",
            notesJa: "お使いの洗剤を投入してください。"
          },
          {
            id: "softener",
            name: "Fabric Softener (柔軟剤)",
            nameJa: "柔軟剤",
            position: "Right slot",
            positionJa: "右スロット",
            color: "#ec4899",
            maxCapacity: "Max 70 mL (Do not exceed '満量' line)",
            notes: "Takes your fabric softener or citric acid rinse (クエン酸).",
            notesJa: "柔軟剤またはクエン酸消臭すすぎ剤を投入してください。",
            warning: "Do not exceed the MAX mark."
          },
          {
            id: "drum_direct",
            name: "Direct Drum (Drum ONLY - NOT in drawer!)",
            nameJa: "洗濯槽へ直接投入 (ケースに入れない)",
            position: "Inside drum directly with clothes",
            positionJa: "衣類と一緒に洗濯槽の中へ",
            color: "#8b5cf6",
            notes: "CRITICAL: Scent beads and Gel Pods / Sticks MUST be thrown directly into the drum bottom before clothes! Never put them in the drawer.",
            notesJa: "【重要】香り付けビーズやジェルボールは必ず洗濯槽の底へ直接投入してください。洗剤ケースには絶対に入れないでください。"
          }
        ]
      },
      displayReadings: [
        {
          reading: "0.3",
          label: "0.3 杯 (Cup)",
          labelJa: "0.3 杯",
          loadEstimate: "Quick course: ≤1.5 kg (1-2 shirts)",
          loadEstimateJa: "時短コース: 約1.5kg以下（1〜2枚のシャツ）",
          drumKg: "≤ 1.5 kg",
          drumKgJa: "約1.5kg以下 (時短)",
          waterEstL: 16,
          description: "Quick 2kg cycle (light load).",
          descriptionJa: "時短コース・少量の洗濯物（約16L）",
          dosages: {
            nanox: { cap: "0.3杯 (30L線弱 / 8 mL)", capJa: "0.3杯 (30L線弱 / 8mL)", ml: 8, note: "Manual specifies 8mL (0.3 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Manual specifies 10mL (0.2 cap)" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "Below 0.4 (~15 mL)", capJa: "0.4杯弱 (約15mL)", ml: 15, note: "Light rinse" },
            beads: { cap: "Below Lower Mark (~15-18 mL)", capJa: "下線より少なめ (約15〜18mL)", ml: 18, note: "Light scent dose" }
          }
        },
        {
          reading: "0.4",
          label: "0.4 杯 (Cup)",
          labelJa: "0.4 杯",
          loadEstimate: "Light load: ≤2.0 kg",
          loadEstimateJa: "軽めの洗濯: 約2kg以下",
          drumKg: "≤ 2.0 kg",
          drumKgJa: "約2kg以下",
          waterEstL: 20,
          description: "Up to 2kg of clothes.",
          descriptionJa: "シャツや下着など約2kg以下（約20L）",
          dosages: {
            nanox: { cap: "0.4杯 (30L線 / 10 mL)", capJa: "0.4杯 (30L線 / 10mL)", ml: 10, note: "Manual specifies 10mL (0.4 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Manual specifies 10mL (0.2 cap)" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "0.4杯弱 (~18-20 mL)", capJa: "0.4杯弱 (約18〜20mL)", ml: 20, note: "Light dose" },
            beads: { cap: "Below Lower Mark (~20 mL)", capJa: "下線より少なめ (約20mL)", ml: 20, note: "Light scent dose" }
          }
        },
        {
          reading: "0.5",
          label: "0.5 杯 (Cup)",
          labelJa: "0.5 杯",
          loadEstimate: "Medium load: 2.0 - 4.0 kg",
          loadEstimateJa: "普段の洗濯: 約2〜4kg",
          drumKg: "2.0 - 4.0 kg",
          drumKgJa: "約2〜4kg",
          waterEstL: 24,
          description: "Approx. 2-4kg daily clothing.",
          descriptionJa: "普段の毎日の衣類（約24L）",
          dosages: {
            nanox: { cap: "0.5杯 (0.4〜0.6線中間 / 12 mL)", capJa: "0.5杯 (0.4〜0.6線中間 / 12mL)", ml: 12, note: "Manual specifies 12mL (0.5 cap)" },
            bleach: { cap: "10 mL (Half lower line)", capJa: "10 mL (下線の半分)", ml: 10, note: "Manual specifies 10mL (0.2 cap)" },
            softener: { cap: "Below Line 1 (~12 mL)", capJa: "目盛り1未満 (約12mL)", ml: 12, note: "Manual specifies 12mL" },
            citric: { cap: "0.4〜0.6杯 (~25-30 mL)", capJa: "0.4〜0.6杯 (約25〜30mL)", ml: 28, note: "Between line 0.4 and 0.6" },
            beads: { cap: "Lower Mark (~25-30 mL)", capJa: "キャップ下線弱 (約25〜30mL)", ml: 30, note: "Medium load dose" }
          }
        },
        {
          reading: "0.6",
          label: "0.6 杯 (Cup)",
          labelJa: "0.6 杯",
          loadEstimate: "Medium-heavy load: 4.0 - 6.0 kg",
          loadEstimateJa: "多めの洗濯: 約4〜6kg",
          drumKg: "4.0 - 6.0 kg",
          drumKgJa: "約4〜6kg",
          waterEstL: 26,
          description: "Approx. 4-6kg (moderate to full basket).",
          descriptionJa: "バスケット一杯分または4〜6kg（約26L）",
          dosages: {
            nanox: { cap: "0.7杯 (0.6〜0.8線中間 / 17 mL)", capJa: "0.7杯 (0.6〜0.8線中間 / 17mL)", ml: 17, note: "Manual specifies 17mL (0.7 cap)" },
            bleach: { cap: "15 mL (Lower line weak)", capJa: "15 mL (下線弱 / 約15mL)", ml: 15, note: "Manual specifies 15mL (0.4 cap)" },
            softener: { cap: "Line 1 (45L / 20 mL)", capJa: "目盛り1 (45L線 / 20mL)", ml: 20, note: "Manual specifies 20mL (Line 1)" },
            citric: { cap: "0.6〜0.8杯 (~35-40 mL)", capJa: "0.6〜0.8杯 (約35〜40mL)", ml: 38, note: "Between line 0.6 and 0.8" },
            beads: { cap: "Between Marks (~35-45 mL)", capJa: "下線〜上線中間 (約35〜45mL)", ml: 40, note: "Medium-heavy dose" }
          }
        },
        {
          reading: "0.8",
          label: "0.8 杯 (Cup)",
          labelJa: "0.8 杯",
          loadEstimate: "Full drum load: 6.0 - 10.0 kg",
          loadEstimateJa: "大物・まとめ洗い: 約6〜10kg（満量）",
          drumKg: "6.0 - 10.0 kg (Full)",
          drumKgJa: "約6〜10kg (満量)",
          waterEstL: 30,
          description: "Large 6-10kg loads, towels, sheets, bedding.",
          descriptionJa: "大物・毛布・まとめ洗い（最大10kg満量・約30L）",
          dosages: {
            nanox: { cap: "0.8杯 (55L線 / 19 mL)", capJa: "0.8杯 (55L線 / 19mL)", ml: 19, note: "Manual specifies 19mL (0.8 cap)" },
            bleach: { cap: "20 mL (Lower Line)", capJa: "20 mL (キャップ下線)", ml: 20, note: "Manual specifies 20mL (0.5 cap / 下線)" },
            softener: { cap: "Line 2 weak (~28 mL)", capJa: "目盛り2弱 (約28mL)", ml: 28, note: "Manual specifies 28mL (~Line 2)" },
            citric: { cap: "0.8杯 (55L線 / ~45-50 mL)", capJa: "0.8杯 (55L線 / 約45〜50mL)", ml: 48, note: "Full load dose" },
            beads: { cap: "Upper Mark (~50-60 mL)", capJa: "キャップ上線 (約50〜60mL)", ml: 55, note: "Full cap scent dose" }
          }
        }
      ]
    }
  },

  goals: [
    {
      id: "balcony_dry",
      title: "Wash Only (Balcony Hang Dry)",
      titleJa: "洗濯のみ（外干し・ベランダ）",
      icon: "☀️",
      summary: "Wash and spin dry for hanging clothes outside on the balcony on sunny days.",
      steps: {
        panasonic: [
          { step: 1, action: "Turn Power ON", actionJa: "電源を入れる", buttonJa: "入", buttonEn: "Power On" },
          { step: 2, action: "Select Wash Mode", actionJa: "運転内容を「洗濯」にする", buttonJa: "洗濯", buttonEn: "Wash Only mode", note: "Ensure '洗濯' LED is lit", noteJa: "「洗濯」ランプが点灯していることを確認" },
          { step: 3, action: "Select Course", actionJa: "コースを選ぶ", buttonJa: "コース", buttonEn: "Course button", note: "Default 'おまかせ' (Auto/Standard) is selected", noteJa: "標準の「おまかせ」が選択されます" },
          { step: 4, action: "Press Start to Weigh", actionJa: "スタートを押して計量する", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum will rotate empty for ~15s to weigh load", noteJa: "ドアが自動ロックされ、ドラムが空回りして洗濯物の重さを自動計量します" },
          { step: 5, action: "Check Number & Add Detergent", actionJa: "表示された数字を確認し、洗剤を投入", buttonJa: "洗剤投入", buttonEn: "Display number", note: "Machine displays 0.4, 0.6, 0.8, or 1.0. Pour products into drawer before water starts!", noteJa: "画面に「0.4」「0.6」などの数字が表示されます。給水が始まる前に速やかに洗剤ケースへ投入してください！" }
        ],
        sharp: [
          { step: 1, action: "Turn Power ON", actionJa: "電源スイッチを入れる", buttonJa: "電源 入/切", buttonEn: "Power Switch" },
          { step: 2, action: "Select Wash Mode", actionJa: "運転切換で「洗濯」を選ぶ", buttonJa: "運転切換", buttonEn: "Mode Switch", note: "Press until '洗濯' (Wash) is lit", noteJa: "「洗濯」ランプが点灯するまで押す" },
          { step: 3, action: "Select Standard Course", actionJa: "「標準」コースを確認する", buttonJa: "コース", buttonEn: "Course button", note: "Ensure '標準' (Standard) is lit", noteJa: "「標準」ランプが点灯していることを確認" },
          { step: 4, action: "Press Start to Weigh", actionJa: "スタートを押して計量する", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum senses weight and beeps", noteJa: "ドアが自動ロックされ、ドラムが回転して重さを量ります" },
          { step: 5, action: "Check Number & Add Detergent", actionJa: "表示された杯数を確認し、洗剤を投入", buttonJa: "洗剤(杯)", buttonEn: "Cup display", note: "Shows e.g. 0.3, 0.4, 0.5, 0.6, or 0.8. Add products to drawer immediately!", noteJa: "画面に0.3〜0.8の杯数が表示されます。給水が始まる前に速やかに洗剤ケースへ投入してください！" }
        ]
      }
    },
    {
      id: "room_dry",
      title: "Wash Only (Indoor Room Hang Dry)",
      titleJa: "洗濯のみ（部屋干し・雨の日）",
      icon: "🌧️",
      summary: "Special anti-odor indoor drying cycle with high spin speed and odor prevention for rainy days.",
      steps: {
        panasonic: [
          { step: 1, action: "Turn Power ON", actionJa: "電源を入れる", buttonJa: "入", buttonEn: "Power On" },
          { step: 2, action: "Select Wash Mode", actionJa: "運転内容を「洗濯」にする", buttonJa: "洗濯", buttonEn: "Wash Only mode", noteJa: "「洗濯」ランプを点灯させる" },
          { step: 3, action: "Select Course", actionJa: "「おまかせ」または「パワフル滝」を選ぶ", buttonJa: "コース", buttonEn: "Course", note: "Select 'おまかせ' (Auto) or 'パワフル滝'", noteJa: "「おまかせ」または「パワフル滝」を選択" },
          { step: 4, action: "Maximize Spin Speed", actionJa: "脱水時間を長めに設定する", buttonJa: "脱水", buttonEn: "Spin button", note: "Press '脱水' until highest setting (e.g. 10分 or 14分) to remove maximum moisture for indoor hanging", noteJa: "「脱水」ボタンを押して最長（10分〜14分）に設定し、部屋干しの生乾き臭を防ぎます" },
          { step: 5, action: "Press Start & Add Detergent", actionJa: "スタートを押し、洗剤・消臭剤を投入", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Add anti-odor detergent and Citric Acid rinse into drawer", noteJa: "スタート後、部屋干し用洗剤やクエン酸消臭剤を洗剤ケースへ投入" }
        ],
        sharp: [
          { step: 1, action: "Turn Power ON", actionJa: "電源スイッチを入れる", buttonJa: "電源 入/切", buttonEn: "Power Switch" },
          { step: 2, action: "Select Wash Mode", actionJa: "運転切換で「洗濯」を選ぶ", buttonJa: "運転切換", buttonEn: "Mode Switch", note: "Press until '洗濯' (Wash) is lit", noteJa: "「洗濯」ランプが点灯するまで押す" },
          { step: 3, action: "Select Dedicated Room Dry Course", actionJa: "専用「部屋干し」コースを選ぶ", buttonJa: "コース", buttonEn: "Course button", note: "Press 'コース' until '部屋干し' (Room Dry) lights up! Uses Plasmacluster and dedicated spin pattern.", noteJa: "「部屋干し」ランプが点灯するまで「コース」ボタンを押す（プラズマクラスター除菌＆専用脱水）" },
          { step: 4, action: "Press Start to Weigh", actionJa: "スタートを押して計量する", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum senses weight and beeps", noteJa: "ドアがロックされ、ドラムが回転して重さを量ります" },
          { step: 5, action: "Add Detergent & Products", actionJa: "洗剤・柔軟剤を投入する", buttonJa: "洗剤投入", buttonEn: "Pour into drawer", note: "Pour products quickly as prompted by cup indicator.", noteJa: "表示された杯数に応じて、給水前に素早く洗剤ケースへ投入します" }
        ]
      }
    },
    {
      id: "wash_and_dry",
      title: "Wash & Dry All-in-One",
      titleJa: "洗濯〜乾燥（全自動・急ぎ）",
      icon: "⚡",
      summary: "Puts dirty clothes in, takes dry clean clothes out. Ideal for hurried loads or towels.",
      steps: {
        panasonic: [
          { step: 1, action: "Turn Power ON", actionJa: "電源を入れる", buttonJa: "入", buttonEn: "Power On" },
          { step: 2, action: "Switch to Wash & Dry", actionJa: "「洗濯〜乾燥」モードに切り替える", buttonJa: "洗濯〜乾燥", buttonEn: "Wash & Dry mode", note: "Press '運転内容' until '洗濯〜乾燥' lights up", noteJa: "「運転内容」を押して「洗濯〜乾燥」ランプを点灯させる" },
          { step: 3, action: "Course Selection", actionJa: "「おまかせ」コースを確認する", buttonJa: "コース", buttonEn: "Course", note: "Default 'おまかせ' (Auto Standard). Max dry load: LX113B 6kg / VX3800 6kg.", noteJa: "標準の「おまかせ」が選択されます（最大乾燥容量: 6kgまで）" },
          { step: 4, action: "Press Start to Weigh", actionJa: "スタートを押して計量する", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum rotates dry to weigh load", noteJa: "ドラムが空回りして衣類の重さを量ります" },
          { step: 5, action: "Add Detergent into Drawer", actionJa: "洗剤・柔軟剤を投入する", buttonJa: "洗剤投入", buttonEn: "Dispenser drawer", note: "Do NOT overload past half drum for drying efficiency.", noteJa: "しっかり乾かすため、衣類はドラムの半分以下に抑えてください" }
        ],
        sharp: [
          { step: 1, action: "Turn Power ON", actionJa: "電源スイッチを入れる", buttonJa: "電源 入/切", buttonEn: "Power Switch" },
          { step: 2, action: "Switch to Wash & Dry", actionJa: "「洗〜乾」モードに切り替える", buttonJa: "運転切換", buttonEn: "Mode Switch", note: "Press until '洗〜乾' (Wash & Dry) lights up", noteJa: "「運転切換」を押して「洗〜乾」ランプを点灯させる" },
          { step: 3, action: "Course Selection", actionJa: "コースを選ぶ", buttonJa: "コース", buttonEn: "Course", note: "'標準' (Standard) or '時短'. Max dry load: S7C 3.5kg / H10B & H10C 6kg.", noteJa: "「標準」または「時短」を選択（乾燥容量: S7Cは3.5kgまで、H10は6kgまで）" },
          { step: 4, action: "Press Start to Weigh", actionJa: "スタートを押して計量する", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum senses weight and beeps", noteJa: "ドラムが回転して重さを量ります" },
          { step: 5, action: "Add Detergent into Drawer", actionJa: "洗剤・柔軟剤を投入する", buttonJa: "洗剤投入", buttonEn: "Dispenser drawer", note: "Pour products into drawer before water starts.", noteJa: "給水開始前に洗剤ケースへ投入してください" }
        ]
      }
    },
    {
      id: "quick_wash",
      title: "Quick Wash (Light Soil in a Hurry)",
      titleJa: "時短・スピーディー（軽い汚れ）",
      icon: "⏱️",
      summary: "Short 20-30 minute cycle for small, lightly soiled loads (gym clothes, single outfit).",
      steps: {
        panasonic: [
          { step: 1, action: "Turn Power ON", actionJa: "電源を入れる", buttonJa: "入", buttonEn: "Power On" },
          { step: 2, action: "Press Course or Adjust Wash", actionJa: "「コース」または「洗い」時間を短縮", buttonJa: "コース", buttonEn: "Course", note: "Or press '洗い' to reduce to 7 min, rinse 1 time, spin 3 min", noteJa: "「洗い7分・すすぎ1回・脱水3分」に短縮するとスピーディーに完了します" },
          { step: 3, action: "Start & Weigh", actionJa: "スタートを押して計量する", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum rotates dry to weigh load", noteJa: "ドラムが空回りして重さを量ります" },
          { step: 4, action: "Add Quick-Rinse Detergent", actionJa: "洗剤を投入する", buttonJa: "洗剤投入", buttonEn: "Dispenser", note: "Use detergent compatible with 1 rinse (すすぎ1回OK)!", noteJa: "「すすぎ1回」対応の洗剤を使用すると時短になります！" }
        ],
        sharp: [
          { step: 1, action: "Turn Power ON", actionJa: "電源スイッチを入れる", buttonJa: "電源 入/切", buttonEn: "Power Switch" },
          { step: 2, action: "Press Course to 時短", actionJa: "コースを「時短」に合わせる", buttonJa: "コース", buttonEn: "Course", note: "Cycle 'コース' button until '時短' (Quick) lights up", noteJa: "「時短」ランプが点灯するまで「コース」ボタンを押す" },
          { step: 3, action: "Press Start to Weigh", actionJa: "スタートを押して計量する", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum senses weight and beeps", noteJa: "ドラムが回転して重さを量ります" },
          { step: 4, action: "Add Detergent", actionJa: "洗剤を投入する", buttonJa: "洗剤投入", buttonEn: "Dispenser", note: "Ultra-concentrated liquid recommended.", noteJa: "超濃縮液体洗剤が推奨です" }
        ]
      }
    },
    {
      id: "delicates",
      title: "Delicates / Sweaters / Wool",
      titleJa: "おしゃれ着・ホームクリーニング",
      icon: "🧶",
      summary: "Gentle cradle wash with low agitation for delicate garments and woolens.",
      steps: {
        panasonic: [
          { step: 1, action: "Turn Power ON", actionJa: "電源を入れる", buttonJa: "入", buttonEn: "Power On" },
          { step: 2, action: "Select Course to おうちクリーニング", actionJa: "「おうちクリーニング」コースを選ぶ", buttonJa: "コース", buttonEn: "Course", note: "Select 'おうちクリーニング'. Detergent reading is fixed (approx 30-40mL neutral delicates liquid).", noteJa: "「おうちクリーニング」を選択（中性おしゃれ着洗剤約30〜40mL使用）" },
          { step: 3, action: "Press Start", actionJa: "スタートボタンを押す", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Drum begins gentle cradle tumble", noteJa: "やさしい揺動洗いが始まります" },
          { step: 4, action: "Add Neutral Detergent", actionJa: "おしゃれ着専用洗剤を投入する", buttonJa: "おしゃれ着洗剤", buttonEn: "Drawer", note: "Use neutral detergent (like Emal/Acron). Do NOT use bleach.", noteJa: "エマール・アクロンなどの中性洗剤を使用してください。漂白剤は使用厳禁！" }
        ],
        sharp: [
          { step: 1, action: "Turn Power ON", actionJa: "電源スイッチを入れる", buttonJa: "電源 入/切", buttonEn: "Power Switch" },
          { step: 2, action: "Press Dedicated Delicates Button", actionJa: "「おしゃれ着」または「ホームクリーニング」ボタンを押す", buttonJa: "おしゃれ着", buttonEn: "Delicates button", note: "On S7C: press 'おしゃれ着' button. On H10: press 'ホームクリーニング'.", noteJa: "S7Cは「おしゃれ着」、H10は「ホームクリーニング」ボタンを押す" },
          { step: 3, action: "Press Start", actionJa: "スタートボタンを押す", buttonJa: "スタート", buttonEn: "Start / Pause", note: "Gentle agitation begins", noteJa: "布傷みを抑える弱水流洗いが始まります" },
          { step: 4, action: "Add Neutral Detergent", actionJa: "中性おしゃれ着洗剤を投入する", buttonJa: "洗剤投入", buttonEn: "Drawer", note: "Use neutral liquid detergent.", noteJa: "中性洗剤を使用し、漂白剤は入れないでください" }
        ]
      }
    },
    {
      id: "blanket",
      title: "Blankets & Comforters",
      titleJa: "毛布・大物",
      icon: "🛏️",
      summary: "Heavy water volume and slow high-torque tumble for blankets, sheets, and curtains.",
      steps: {
        panasonic: [
          { step: 1, action: "Fold Blanket in Accordion", actionJa: "毛布を屏風たたみ（M字型）にしてドラムへ入れる", buttonJa: "毛布のたたみ方", buttonEn: "Fold M-shape", note: "Fold item in thirds into drum", noteJa: "3つ折りまたはM字型にたたんで入れます" },
          { step: 2, action: "Turn Power ON", actionJa: "電源を入れる", buttonJa: "入", buttonEn: "Power On" },
          { step: 3, action: "Select Blanket Course", actionJa: "「毛布」コースを選ぶ", buttonJa: "コース", buttonEn: "Course", note: "Select '毛布' (Blanket)", noteJa: "「毛布」を選択（大水量でしっかり洗います）" },
          { step: 4, action: "Start & Add Detergent", actionJa: "スタートを押し、液体洗剤を投入する", buttonJa: "スタート", buttonEn: "Start", note: "Liquid detergent is recommended to avoid powder residue in thick fabric.", noteJa: "毛布の繊維に粉残りしないよう、液体洗剤がおすすめです" }
        ],
        sharp: [
          { step: 1, action: "Fold Blanket in Accordion", actionJa: "毛布を屏風たたみにしてドラムへ入れる", buttonJa: "毛布のたたみ方", buttonEn: "Fold M-shape", note: "Fold neatly into drum", noteJa: "きれいにたたんでドラムの奥まで入れます" },
          { step: 2, action: "Turn Power ON", actionJa: "電源スイッチを入れる", buttonJa: "電源 入/切", buttonEn: "Power Switch" },
          { step: 3, action: "Select Blanket Course", actionJa: "「毛布」コースを選ぶ", buttonJa: "コース", buttonEn: "Course", note: "Press 'コース' until '毛布' lights up", noteJa: "「毛布」ランプが点灯するまで「コース」ボタンを押す" },
          { step: 4, action: "Start & Add Detergent", actionJa: "スタートを押し、洗剤を投入する", buttonJa: "スタート", buttonEn: "Start", note: "Dissolve liquid detergent in drawer.", noteJa: "洗剤ケースに液体洗剤を投入してください" }
        ]
      }
    }
  ],

  productCategories: [
    {
      id: "liquid_detergent",
      category: "detergent",
      name: "Liquid Detergent",
      nameJa: "液体洗剤",
      icon: "🧴",
      defaultSlot: "liquid_detergent",
      slotNameEn: "Main Liquid Detergent Tray",
      slotNameJa: "液体洗剤投入口",
      unit: "mL",
      unitJa: "mL",
      capProfile: "fractional_cap",
      capLines: ["0.4", "0.6", "0.8", "1.0"],
      baselineLabelEn: "Cap Markings & Baseline: 0.4 / 0.6 / 0.8 / 1.0 杯",
      baselineLabelJa: "キャップ目盛り・水30L基準量: 0.4 / 0.6 / 0.8 / 1.0 杯",
      defaultBaseline: 10,
      placeholder: "e.g. My Detergent, Ultra Liquid, Blue Bottle",
      placeholderJa: "例: マイ洗剤, 部屋干し用, 青いボトル",
      guideEn: "Look for '水30Lに対して...' on bottle back. Ultra-concentrates (10mL) align directly with 0.4, 0.6, 0.8, and 1.0 cap marks.",
      guideJa: "裏面の「水30Lに対して」を確認。超濃縮型（10mL）はボトルの0.4杯・0.6杯・0.8杯・1杯の目盛りと正確に対応します。",
      kanjiHunter: {
        searchTargetEn: "水30Lに対する使用量",
        searchTargetJa: "水30Lに対する使用量",
        locationTipEn: "Scan the back label for '水30Lに対する使用量' or the table titled '使用量の目安'.",
        locationTipJa: "裏面の「水30Lに対する使用量」または「使用量の目安」の枠内をご確認ください。"
      },
      presets: [
        { labelEn: "10 mL (Ultra-Concentrated 4x)", labelJa: "10mL（超濃縮型 4倍）", value: 10 },
        { labelEn: "20 mL (Concentrated 2x)", labelJa: "20mL（濃縮型 2倍）", value: 20 },
        { labelEn: "25 mL (Standard Regular)", labelJa: "25mL（標準型・一般）", value: 25 },
        { labelEn: "40 mL (Mild / Gentle)", labelJa: "40mL（マイルド・大容量）", value: 40 },
        { labelEn: "50 mL (Pure Liquid Soap)", labelJa: "50mL（無添加・純石けん）", value: 50 }
      ],
      supportsPush: true,
      pushPresets: [
        { labelEn: "5 g / push (High Output)", labelJa: "1プッシュ 5g（大吐出）", value: 5 },
        { labelEn: "3 g / push (Standard Output)", labelJa: "1プッシュ 3g（標準吐出）", value: 3 }
      ]
    },
    {
      id: "powder_detergent",
      category: "detergent",
      name: "Powder Detergent",
      nameJa: "粉末洗剤",
      icon: "📦",
      defaultSlot: "powder_detergent",
      slotNameEn: "Powder Hopper / Drum Direct",
      slotNameJa: "粉末洗剤入れ / 洗濯槽",
      unit: "g",
      unitJa: "g",
      capProfile: "scoop_levels",
      capLines: ["0.3", "0.6", "0.8", "すりきり1杯"],
      baselineLabelEn: "Measuring Scoop: 水30Lに対する使用量 (g)",
      baselineLabelJa: "付属スプーン計量: 水30Lに対する使用量 (g)",
      defaultBaseline: 20,
      placeholder: "e.g. My Powder Detergent",
      placeholderJa: "例: マイ粉末洗剤, 酵素プラス",
      guideEn: "Look for '水30Lに対して...' on box back. Dosed with measuring scoop (0.3 / 0.6 / 0.8 / 1.0 scoop).",
      guideJa: "箱の裏面の「水30Lに対して」を確認。付属スプーン（0.3 / 0.6 / 0.8 / すりきり1杯）で計量します。",
      kanjiHunter: {
        searchTargetEn: "水30Lに対する使用量 (スプーン計量)",
        searchTargetJa: "水30Lに対する使用量 (スプーン計量)",
        locationTipEn: "Scan box back for '水30Lに対する使用量' and scoop guide (すりきり1杯).",
        locationTipJa: "箱裏面の「水30Lに対する使用量」とスプーン目安（すりきり1杯）をご確認ください。"
      },
      presets: [
        { labelEn: "20 g (Standard Synthetic Powder)", labelJa: "20g（標準合成粉末洗剤）", value: 20 },
        { labelEn: "35 g (Natural Powder Soap)", labelJa: "35g（無添加粉末石けん）", value: 35 }
      ],
      supportsPush: false
    },
    {
      id: "softener",
      category: "softener",
      name: "Fabric Softener",
      nameJa: "柔軟剤",
      icon: "🌸",
      defaultSlot: "softener",
      slotNameEn: "Fabric Softener Dispenser",
      slotNameJa: "柔軟剤投入口",
      unit: "mL",
      unitJa: "mL",
      capProfile: "step_graduations",
      capLines: ["目盛り1 (45L)", "目盛り2 (55L)", "目盛り3 (65L)"],
      baselineLabelEn: "Cap Step Graduations: 目盛り1 / 2 / 3 (水30Lに対して)",
      baselineLabelJa: "キャップ段差目盛り: 目盛り1 / 2 / 3 (水30Lに対して)",
      defaultBaseline: 10,
      placeholder: "e.g. Floral Softener, Fresh Aroma",
      placeholderJa: "例: フローラル柔軟剤, フレッシュ消臭",
      guideEn: "Caps use step graduations: 目盛り1 (45L), 目盛り2 (55L), 目盛り3 (65L). Check '水30Lに対して' on bottle back. Pour into Softener tray.",
      guideJa: "キャップは段差目盛り「目盛り1（45L）」「目盛り2（55L）」「目盛り3（65L）」です。裏面の「水30Lに対して」を確認し柔軟剤投入口へ。",
      kanjiHunter: {
        searchTargetEn: "水30Lに対する使用量 (目盛り1/2/3)",
        searchTargetJa: "水30Lに対する使用量 (目盛り1/2/3)",
        locationTipEn: "Look for '水30Lに対する使用量'. Caps use step graduations (目盛り1/2/3).",
        locationTipJa: "裏面の「水30Lに対する使用量」を確認。キャップの段差目盛り（目盛り1〜3）に対応。"
      },
      presets: [
        { labelEn: "10 mL (Ultra-Concentrated / High Scent)", labelJa: "10mL（高濃縮・強力消臭型 / 目盛り1=20mL）", value: 10 },
        { labelEn: "15 mL (Standard Softener)", labelJa: "15mL（標準柔軟剤 / 目盛り1=22mL）", value: 15 },
        { labelEn: "20 mL (Mild / Large Capacity)", labelJa: "20mL（微香・大容量型 / 目盛り1=28mL）", value: 20 }
      ],
      supportsPush: false
    },
    {
      id: "liquid_bleach",
      category: "bleach",
      name: "Liquid Oxygen Bleach",
      nameJa: "液体酸素系漂白剤",
      icon: "✨",
      defaultSlot: "bleach",
      slotNameEn: "Liquid Bleach Tray (or Detergent Slot)",
      slotNameJa: "漂白剤投入口（または洗剤口）",
      unit: "mL",
      unitJa: "mL",
      capProfile: "level_lines",
      capLines: ["下線 20mL", "上線 40mL"],
      baselineLabelEn: "Cap Calibration Lines: 下線 20mL / 上線 40mL",
      baselineLabelJa: "キャップ目盛り線: 下線 20mL / 上線 40mL",
      defaultBaseline: 20,
      placeholder: "e.g. Color-Safe Oxygen Bleach",
      placeholderJa: "例: 液体酸素系漂白剤, 色柄用",
      guideEn: "Liquid bleach caps only have two fill lines: 下線 (Lower line = 20mL) and 上線 (Upper line = 40mL). No fractional cups!",
      guideJa: "液体漂白剤のキャップは「下線（20mL）」と「上線（40mL）」の2本線のみです（分数キャップではありません）。",
      kanjiHunter: {
        searchTargetEn: "水30Lに20mL (下線 / 上線)",
        searchTargetJa: "水30Lに20mL (下線 / 上線)",
        locationTipEn: "Look for '水30Lに20mL'. Caps have two lines: 下線 (20mL) and 上線 (40mL).",
        locationTipJa: "裏面の「水30Lに20mL」を確認。キャップは「下線（20mL）」と「上線（40mL）」の2本線のみ。"
      },
      presets: [
        { labelEn: "20 mL (Lower Line: Standard Wash)", labelJa: "20mL（下線: 普段の洗濯・除菌）", value: 20 },
        { labelEn: "40 mL (Upper Line: Heavy Stains)", labelJa: "40mL（上線: 頑固な黄ばみ・ドラム満量）", value: 40 }
      ],
      supportsPush: false
    },
    {
      id: "powder_bleach",
      category: "bleach",
      name: "Powder Oxygen Bleach",
      nameJa: "粉末酸素系漂白剤",
      icon: "🧂",
      defaultSlot: "powder_detergent",
      slotNameEn: "Powder Hopper / Drum Direct",
      slotNameJa: "粉末投入口 / 洗濯槽",
      unit: "g",
      unitJa: "g",
      capProfile: "scoop_levels",
      capLines: ["0.3", "0.6", "0.8", "すりきり1杯"],
      baselineLabelEn: "Measuring Scoop: 水30Lに対する使用量 (g)",
      baselineLabelJa: "付属スプーン計量: 水30Lに対する使用量 (g)",
      defaultBaseline: 10,
      placeholder: "e.g. Oxygen Bleach Powder",
      placeholderJa: "例: 粉末酸素系漂白剤, つけおき用",
      guideEn: "Alkaline booster (sodium percarbonate). Dosed with measuring scoop. Place in powder drawer or dissolve in warm water.",
      guideJa: "強力な過炭酸ナトリウム。付属スプーンで計量し粉末投入口へ。またはぬるま湯で溶かして投入。",
      kanjiHunter: {
        searchTargetEn: "水30Lに10g (スプーン計量)",
        searchTargetJa: "水30Lに10g (スプーン計量)",
        locationTipEn: "Look for '水30Lに...' on back. Dosed with included measuring scoop.",
        locationTipJa: "裏面の「水30Lに対して」を確認。付属スプーンで計量します。"
      },
      presets: [
        { labelEn: "10 g (Standard Oxygen Powder)", labelJa: "10g（標準酸素系粉末）", value: 10 },
        { labelEn: "15 g (Deep Stain / Disinfection)", labelJa: "15g（頑固なシミ・強力除菌）", value: 15 }
      ],
      supportsPush: false
    },
    {
      id: "in_drum_beads",
      category: "beads",
      name: "In-Drum Scent & Deodorant Beads",
      nameJa: "香り付け・消臭ビーズ",
      icon: "💎",
      defaultSlot: "drum_direct",
      slotNameEn: "Drum Bottom (Direct with Clothes)",
      slotNameJa: "洗濯槽の底（直接投入）",
      unit: "mL",
      unitJa: "mL",
      capProfile: "inner_markings",
      capLines: ["下線 (~35mL)", "上線 (~55mL)"],
      baselineLabelEn: "Cap Markings: 下線 (~35mL) / 上線 (~55mL) (12 mL/kg)",
      baselineLabelJa: "キャップ内側ライン: 下線 (~35mL) / 上線 (~55mL) (12mL/kg)",
      defaultBaseline: 12,
      placeholder: "e.g. Scent Booster Beads",
      placeholderJa: "例: 消臭ビーズ, 香り付けビーズ",
      guideEn: "CRITICAL: Toss directly into the bottom of the drum BEFORE clothes! NEVER put into drawer! Cap markings: 下線 (Lower line ~35mL) and 上線 (Upper line ~55mL).",
      guideJa: "【重要】衣類を入れる前に洗濯槽の底へ直接投入！洗剤ケースには絶対に入れないこと。キャップ内側の「下線（約35mL）」と「上線（約55mL）」で計量。",
      kanjiHunter: {
        searchTargetEn: "衣料1kgに対して12mL",
        searchTargetJa: "衣料1kgに対して12mL",
        locationTipEn: "Look for '衣料1kgに対して...' and cap inside markings (下線 / 上線).",
        locationTipJa: "裏面の「衣料1kgに対して」とキャップ内側のライン（下線・上線）をご確認ください。"
      },
      presets: [
        { labelEn: "12 mL per 1kg (Standard Deodorant)", labelJa: "12mL/kg（普段約35mL 下線、満量約55mL 上線）", value: 12 }
      ],
      supportsPush: false
    },
    {
      id: "pods",
      category: "detergent",
      name: "Gel Ball Pods / Sticks",
      nameJa: "ジェルボール・スティック洗剤",
      icon: "🍬",
      defaultSlot: "drum_direct",
      slotNameEn: "Drum Bottom (Direct Under Clothes)",
      slotNameJa: "洗濯槽の底（衣類の下に直接ポン）",
      unit: "count",
      unitJa: "個",
      capProfile: "unit_count",
      baselineLabelEn: "Single-Dose Unit: 1 Pod (≤6kg) / 2 Pods (>6kg)",
      baselineLabelJa: "投入個数: 1個 (6kg以下) / 2個 (6kg超)",
      defaultBaseline: 1,
      placeholder: "e.g. Gelball Detergent Pods",
      placeholderJa: "例: ジェルボール洗剤, スティック",
      guideEn: "CRITICAL: Toss 1 unit (≤6kg) or 2 units (>6kg) at the bottom of the drum BEFORE adding clothes!",
      guideJa: "【重要】衣類を入れる前に洗濯槽の底へ直接ポン！6kg以下は1個、6kg超は2個。",
      kanjiHunter: {
        searchTargetEn: "1個 / 2個 (個数投入)",
        searchTargetJa: "1個 / 2個 (個数投入)",
        locationTipEn: "Pre-measured: 1 pod for ≤6kg, 2 pods for >6kg. Place directly at bottom of drum.",
        locationTipJa: "計量不要：6kg以下は1個、6kg超は2個。洗濯槽の底（衣類の下）へ直接投入。"
      },
      presets: [
        { labelEn: "1 unit (≤6kg) / 2 units (>6kg)", labelJa: "6kg以下は1個、6kg超は2個", value: 1 }
      ],
      supportsPush: false
    },
    {
      id: "citric_rinse",
      category: "softener",
      name: "Citric Acid Deodorant Rinse",
      nameJa: "クエン酸消臭すすぎ剤",
      icon: "🍋",
      defaultSlot: "softener",
      slotNameEn: "Fabric Softener Dispenser",
      slotNameJa: "柔軟剤投入口",
      unit: "mL",
      unitJa: "mL",
      capProfile: "citric_3_level",
      capLines: ["0.4 (35L)", "0.6 (45L)", "0.8 (55L)"],
      baselineLabelEn: "Cap Fill Lines: 0.4 / 0.6 / 0.8 杯 (9.1 mL per 1kg Laundry)",
      baselineLabelJa: "キャップ目盛り: 0.4 / 0.6 / 0.8 杯 (衣料1kgに対し9.1mL)",
      defaultBaseline: 9.1,
      placeholder: "e.g. Citric Acid Rinse",
      placeholderJa: "例: クエン酸すすぎ剤, 消臭リンス",
      guideEn: "Caps only have 0.4 (35L/2-3kg), 0.6 (45L/3-4kg), and 0.8 (55L/4-6kg) marks (NO 1.0 line). Doses at 9.1 mL/kg. Pour into Softener tray. NEVER mix with chlorine bleach!",
      guideJa: "キャップは0.4（35L）、0.6（45L）、0.8（55L）の3段階のみ（1.0線はありません）。衣料1kgあたり9.1mL。柔軟剤投入口へ。【危険】塩素系漂白剤との併用厳禁！",
      kanjiHunter: {
        searchTargetEn: "衣料1kgに対して9.1mL",
        searchTargetJa: "衣料1kgに対して9.1mL",
        locationTipEn: "Look for '衣料1kgに対して...' on back. Dosed by dry weight (3 cap marks only).",
        locationTipJa: "裏面の「衣料1kgに対して」をご確認ください。水量ではなく衣類重量で計量（3段階目盛）。"
      },
      presets: [
        { labelEn: "9.1 mL per 1kg (Deodorant Rinse)", labelJa: "9.1mL/kg（消臭すすぎ剤・上限0.8杯）", value: 9.1 }
      ],
      supportsPush: false
    }
  ],

  errorCodes: [
    {
      code: "U11",
      brands: ["Panasonic"],
      titleEn: "Cannot Drain Water (Drain Blockage / Hose Error)",
      titleJa: "排水できません",
      severity: "warning",
      cause: "Water remaining in drum; drain filter clogged, drain hose bent, raised higher than 10cm, or frozen.",
      actions: [
        "1. Check the drain hose: Ensure it is laid flat and not crushed, kinked, or raised higher than 10 cm.",
        "2. Clean the drain lint filter (排水フィルター) at the bottom right corner of the machine.",
        "3. Open and clean any lint accumulation in the floor drain trap.",
        "4. Close door and press 'スタート' (Start) to resume."
      ]
    },
    {
      code: "U12",
      brands: ["Panasonic"],
      titleEn: "Door Open / Door Lock Error",
      titleJa: "ドアが開いています／ロックできません",
      severity: "warning",
      cause: "Door is ajar or clothes are caught in the rubber gasket.",
      actions: [
        "1. Open the door and check for caught clothing or debris along the rubber gasket.",
        "2. Push the door firmly until you hear a distinct 'Click' (カチッ).",
        "3. Press 'スタート' (Start) to resume."
      ]
    },
    {
      code: "U13",
      brands: ["Panasonic"],
      titleEn: "Unbalanced Load During Spin",
      titleJa: "脱水できません（衣類の片寄り）",
      severity: "warning",
      cause: "Laundry is clumped to one side, or single large heavy item (bath mat, heavy towel) preventing high-speed spin.",
      actions: [
        "1. Open door and untangle clothes, spreading them evenly inside the drum.",
        "2. If washing only 1 large item (like a towel blanket), add 1-2 regular towels to balance weight.",
        "3. Do NOT wash laundry net containing too many clothes alone.",
        "4. Close door and press 'スタート' (Start)."
      ]
    },
    {
      code: "U14",
      brands: ["Panasonic"],
      titleEn: "Cannot Fill Water (Water Supply Issue)",
      titleJa: "給水できません",
      severity: "warning",
      cause: "Water faucet is closed, supply line frozen, or water inlet filter clogged.",
      actions: [
        "1. Check the water faucet above the machine: Make sure the faucet tap is turned completely counter-clockwise to OPEN.",
        "2. Check if building water supply is temporarily suspended.",
        "3. Inspect the water inlet hose filter for debris.",
        "4. Press 'スタート' (Start) to retry."
      ]
    },
    {
      code: "U04",
      brands: ["Panasonic"],
      titleEn: "Drying Lint Filter Clogged",
      titleJa: "乾燥フィルターの目詰まり",
      severity: "info",
      cause: "Lint accumulation in the top drying air filter.",
      actions: [
        "1. Pull out the dry filter (乾燥フィルター) located on top of machine.",
        "2. Peel off accumulated lint or gently wash with water and dry thoroughly.",
        "3. Reinstall filter firmly and press 'スタート' (Start)."
      ]
    },
    {
      code: "U18",
      brands: ["Panasonic"],
      titleEn: "Drain Filter Loose / Not Inserted",
      titleJa: "排水フィルターがセットされていません",
      severity: "warning",
      cause: "Bottom drain filter is removed, unlatched, or not turned into the locked position.",
      actions: [
        "1. Open the small lower door at the front bottom-right.",
        "2. Insert the drain filter and twist firmly clockwise until the arrow matches the locked mark.",
        "3. Press 'スタート' (Start)."
      ]
    },
    {
      code: "Hxx",
      brands: ["Panasonic"],
      titleEn: "Hardware Error (H-series: H01 - H99)",
      titleJa: "点検・修理のお知らせ",
      severity: "critical",
      cause: "Internal mechanical, motor, heating, or sensor failure.",
      actions: [
        "1. Turn off power switch and unplug from the electrical wall outlet.",
        "2. Close the water faucet.",
        "3. Note the exact 2-digit number after 'H' and notify building management or repair service."
      ]
    },
    {
      code: "C01",
      brands: ["Sharp"],
      titleEn: "Water Supply Error (Cannot Fill Water)",
      titleJa: "給水できません",
      severity: "warning",
      cause: "Water tap closed, frozen hose, or clogged inlet filter.",
      actions: [
        "1. Ensure the water faucet tap on the wall is turned on (counter-clockwise).",
        "2. Confirm building is not under water outage.",
        "3. Clean the water supply connector filter if blocked.",
        "4. Open/close door and press 'スタート' (Start)."
      ]
    },
    {
      code: "C02",
      brands: ["Sharp"],
      titleEn: "Drainage Error (Cannot Drain)",
      titleJa: "排水できません",
      severity: "warning",
      cause: "Drain hose collapsed, submerged, frozen, or lint filter blocked.",
      actions: [
        "1. Inspect drain hose at floor: Make sure it is completely flat, unbent, and unobstructed.",
        "2. Open bottom lint filter cover and clear lint and coins/foreign objects.",
        "3. Open and close the door, then press 'スタート' (Start)."
      ]
    },
    {
      code: "C04",
      brands: ["Sharp"],
      titleEn: "Unbalanced Spin Error",
      titleJa: "脱水できません（洗濯物の片寄り）",
      severity: "warning",
      cause: "Clothes lumped to one side of the drum, causing vibration sensor to trip.",
      actions: [
        "1. Pause machine and open door.",
        "2. Manually untangle and distribute clothes around drum perimeter.",
        "3. If washing one thick item, add two bath towels for counterbalance.",
        "4. Close door and press 'スタート' (Start)."
      ]
    },
    {
      code: "C05",
      brands: ["Sharp"],
      titleEn: "Door Lock Error / Door Open",
      titleJa: "ドアがロックできません／開いています",
      severity: "warning",
      cause: "Door latch not catching or clothes trapped in frame.",
      actions: [
        "1. Ensure clothes are pushed well into the drum away from the glass door edge.",
        "2. Firmly press door shut until latch engages.",
        "3. Press 'スタート' (Start)."
      ]
    },
    {
      code: "C06",
      brands: ["Sharp"],
      titleEn: "Dry Filter Clogged / Dry Air Impeded",
      titleJa: "乾燥できません（乾燥フィルター目詰まり）",
      severity: "info",
      cause: "Lint buildup in the top dry filter causing excessive heat in drying cycle.",
      actions: [
        "1. Pull out the drying lint filter located on top of the machine.",
        "2. Remove lint with fingers or soft toothbrush under running water.",
        "3. Reinstall filter firmly and restart drying."
      ]
    },
    {
      code: "C14",
      brands: ["Sharp"],
      titleEn: "Voltage Fluctuation / Power Noise",
      titleJa: "電源の異常電圧・ノイズ",
      severity: "info",
      cause: "Temporary fluctuation in power supply voltage.",
      actions: [
        "1. Press power switch to turn OFF.",
        "2. Unplug power cord, wait 10 seconds, then plug back in.",
        "3. Restart desired cycle."
      ]
    },
    {
      code: "C22",
      brands: ["Sharp"],
      titleEn: "Bottom Lint Filter Not Inserted Correctly",
      titleJa: "糸くずフィルターが外れている",
      severity: "warning",
      cause: "Lower drain filter knob is not tightened clockwise.",
      actions: [
        "1. Open lower service panel.",
        "2. Turn lint filter clockwise until arrow lines up and firmly seated.",
        "3. Close door and restart."
      ]
    },
    {
      code: "Exx",
      brands: ["Sharp"],
      titleEn: "Sharp Machine System / Sensor Failure (E01 - E24)",
      titleJa: "機器の異常・点検表示",
      severity: "critical",
      cause: "Internal sensor, thermistor, heater, or motor fault.",
      actions: [
        "1. Press power OFF and disconnect plug from electrical socket.",
        "2. Close water supply tap.",
        "3. Record exact E-code (e.g. E01, E02, E04) and inform apartment management."
      ]
    }
  ],

  panelDictionary: [
    { ja: "入", romaji: "Iri", en: "Power ON", note: "Turns machine on" },
    { ja: "切", romaji: "Kiri", en: "Power OFF", note: "Turns machine off" },
    { ja: "スタート", romaji: "Sutāto", en: "Start", note: "Begins cycle or confirms settings" },
    { ja: "一時停止", romaji: "Ichiji teishi", en: "Pause", note: "Temporarily pause drum rotation" },
    { ja: "運転切換", romaji: "Unten kirikae", en: "Mode Switch", note: "Toggles Wash / Wash & Dry / Dry" },
    { ja: "洗濯", romaji: "Sentaku", en: "Wash Only", note: "Standard wash cycle without hot air drying" },
    { ja: "洗濯〜乾燥", romaji: "Sentaku~Kansō", en: "Wash & Dry", note: "All-in-one complete automatic cycle" },
    { ja: "乾燥", romaji: "Kansō", en: "Dry Only", note: "Dries damp clothes" },
    { ja: "コース", romaji: "Kōsu", en: "Course / Cycle", note: "Selects wash pattern" },
    { ja: "標準", romaji: "Hyōjun", en: "Standard", note: "Standard everyday wash (Sharp)" },
    { ja: "おまかせ", romaji: "Omakase", en: "Auto Standard", note: "Standard everyday smart sensor wash (Panasonic)" },
    { ja: "部屋干し", romaji: "Heyaboshi", en: "Room Hang Dry", note: "High spin & anti-odor cycle for indoor drying on rainy days" },
    { ja: "時短", romaji: "Jitan", en: "Quick / Time Saver", note: "Fast wash for lightly soiled clothing" },
    { ja: "おうち流", romaji: "Ouchiryū", en: "My Custom Cycle", note: "User customized settings (Sharp)" },
    { ja: "わたし流", romaji: "Watashiryū", en: "My Custom Cycle", note: "User customized settings (Panasonic)" },
    { ja: "毛布", romaji: "Mōfu", en: "Blanket", note: "Heavy load cycle for blankets and bedsheets" },
    { ja: "おしゃれ着", romaji: "Osharegi", en: "Delicates / Knitwear", note: "Gentle wash for woolens and dresses" },
    { ja: "おうちクリーニング", romaji: "Ouchi Kurīningu", en: "Home Dry Clean", note: "Gentle wash for silk and dry-cleanables (Panasonic)" },
    { ja: "どろんこ", romaji: "Doronko", en: "Muddy / Heavy Soil", note: "Intensive wash for heavily soiled workwear or mud" },
    { ja: "サッと予洗い", romaji: "Satto Yoarai", en: "Quick Pre-Wash", note: "5-min pre-wash without detergent (Sharp)" },
    { ja: "極め洗い", romaji: "Kiwame-arai", en: "Intensive Deep Wash", note: "High temperature / heavy agitation wash (Sharp)" },
    { ja: "消臭", romaji: "Shōshū", en: "Deodorize", note: "Plasmacluster dry odor removal (Sharp)" },
    { ja: "槽クリーン", romaji: "Sō Kurīn", en: "Tub Clean", note: "Cleans drum with ions to prevent mold" },
    { ja: "槽洗浄", romaji: "Sō Senjō", en: "Tub Wash (Chemical)", note: "Extended tub wash using washing machine cleaner bleach" },
    { ja: "予約", romaji: "Yoyaku", en: "Timer / Delay Start", note: "Sets hours until completion" },
    { ja: "ロック解除", romaji: "Rokku kaijo", en: "Door Unlock", note: "Unlocks door if water level and temp are safe" },
    { ja: "チャイルドロック", romaji: "Chairudo rokku", en: "Child Lock", note: "Hold button 3-5 seconds to lock door" },
    { ja: "洗い", romaji: "Arai", en: "Wash", note: "Sets wash duration in minutes" },
    { ja: "すすぎ", romaji: "Susugi", en: "Rinse", note: "Sets rinse count (e.g. 1 time, 2 times)" },
    { ja: "脱水", romaji: "Dassui", en: "Spin", note: "Sets spin duration in minutes" },
    { ja: "乾かす", romaji: "Kawakasu", en: "Dry", note: "Sets dry time in minutes" },
    { ja: "ふんわりキープ", romaji: "Funwari Kīpu", en: "Fluff Keep", note: "Tumbles drum after dry to prevent wrinkles" }
  ],

  barcodeRegistry: [
    {
      jan: "4901301419958",
      name: "Wide Haiter EX Power Liquid",
      nameJa: "ワイドハイター EXパワー 液体",
      brand: "Kao",
      category: "liquid_bleach",
      baseline: 20,
      capStyle: "lines",
      unit: "mL",
      defaultSlot: "bleach",
      notes: "Lower line 20mL (30L water) / Upper line 40mL (60L water)"
    },
    {
      jan: "4901301422446",
      name: "Attack ZERO Auto-Dose",
      nameJa: "アタックZERO 自動投入専用",
      brand: "Kao",
      category: "liquid_detergent",
      baseline: 6,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Hyper-concentrated 6mL/30L for automatic dispenser tanks"
    },
    {
      jan: "4901301396655",
      name: "Attack ZERO One-Hand Push",
      nameJa: "アタックZERO ワンハンドプッシュ",
      brand: "Kao",
      category: "liquid_detergent",
      baseline: 10,
      isPush: true,
      pushG: 5,
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Ultra-concentrated 10mL/30L (1 push = 5g, 2 pushes for 30L)"
    },
    {
      jan: "4901301396631",
      name: "Attack ZERO Regular Bottle",
      nameJa: "アタックZERO レギュラーボトル",
      brand: "Kao",
      category: "liquid_detergent",
      baseline: 10,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Ultra-concentrated 10mL/30L with 0.4, 0.6, 0.8, 1.0 cap lines"
    },
    {
      jan: "4901301396679",
      name: "Attack ZERO Drum Specific Bottle",
      nameJa: "アタックZERO ドラム式専用ボトル",
      brand: "Kao",
      category: "liquid_detergent",
      baseline: 10,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Dosed by drum dry weight (2kg/4kg/5kg/6kg)"
    },
    {
      jan: "4901301381835",
      name: "Attack Antibacterial EX Liquid",
      nameJa: "アタック 抗菌EX 液体",
      brand: "Kao",
      category: "liquid_detergent",
      baseline: 40,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Standard regular synthetic liquid 40mL/30L"
    },
    {
      jan: "4901301334886",
      name: "Attack High Activity Bio EX Powder",
      nameJa: "アタック 高活性バイオEX 粉末",
      brand: "Kao",
      category: "powder_detergent",
      baseline: 21,
      capStyle: "scoop",
      unit: "g",
      defaultSlot: "powder_detergent",
      notes: "Alkaline powder detergent 21g/30L (0.4 scoop)"
    },
    {
      jan: "4901301349484",
      name: "New Beads Powder",
      nameJa: "ニュービーズ 粉末",
      brand: "Kao",
      category: "powder_detergent",
      baseline: 21,
      capStyle: "scoop",
      unit: "g",
      defaultSlot: "powder_detergent",
      notes: "Enzymatic powder detergent 21g/30L"
    },
    {
      jan: "4901301332769",
      name: "Wide Haiter PRO Powder",
      nameJa: "ワイドハイター PRO 粉末",
      brand: "Kao",
      category: "powder_bleach",
      baseline: 10,
      capStyle: "scoop",
      unit: "g",
      defaultSlot: "powder_detergent",
      notes: "Sodium percarbonate oxygen powder 10g/30L"
    },
    {
      jan: "4903301320456",
      name: "NANOX one PRO Liquid",
      nameJa: "NANOX one PRO 液体",
      brand: "Lion",
      category: "liquid_detergent",
      baseline: 10,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Ultra-concentrated 10mL/30L with 0.4, 0.6, 0.8, 1.0 cap lines"
    },
    {
      jan: "4903301320449",
      name: "NANOX one Standard",
      nameJa: "NANOX one スタンダード",
      brand: "Lion",
      category: "liquid_detergent",
      baseline: 10,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Ultra-concentrated 10mL/30L"
    },
    {
      jan: "4903301306450",
      name: "NANOX Push Bottle",
      nameJa: "トップ スーパーNANOX プッシュ",
      brand: "Lion",
      category: "liquid_detergent",
      baseline: 10,
      isPush: true,
      pushG: 3,
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Ultra-concentrate with 3g/push (3-4 pushes for 30L)"
    },
    {
      jan: "4903301340126",
      name: "Heyaboshi Top EX Powder",
      nameJa: "部屋干しトップ 除菌EX 粉末",
      brand: "Lion",
      category: "powder_detergent",
      baseline: 25,
      capStyle: "scoop",
      unit: "g",
      defaultSlot: "powder_detergent",
      notes: "Heavy enzyme powder 25g/30L"
    },
    {
      jan: "4903301282679",
      name: "Bright STRONG Liquid Bleach",
      nameJa: "ブライトSTRONG 漂白＆抗菌 液体",
      brand: "Lion",
      category: "liquid_bleach",
      baseline: 20,
      capStyle: "lines",
      unit: "mL",
      defaultSlot: "bleach",
      notes: "Lower line 20mL / Upper line 40mL"
    },
    {
      jan: "4903301282686",
      name: "Bright STRONG Powder Bleach",
      nameJa: "ブライトSTRONG 極 パウダー",
      brand: "Lion",
      category: "powder_bleach",
      baseline: 10,
      capStyle: "scoop",
      unit: "g",
      defaultSlot: "powder_detergent",
      notes: "Oxygen powder booster 10g/30L"
    },
    {
      jan: "4903301353041",
      name: "Soflan Aroma Rich Juliette",
      nameJa: "ソフラン アロマリッチ ジュリエット",
      brand: "Lion",
      category: "softener",
      baseline: 10,
      capStyle: "steps",
      unit: "mL",
      defaultSlot: "softener",
      notes: "Step marks: 目盛り1 (45L / 20mL), 目盛り2 (55L / 30mL), 目盛り3 (65L / 40mL)"
    },
    {
      jan: "4903301329435",
      name: "Soflan Premium Deodorant",
      nameJa: "ソフラン プレミアム消臭",
      brand: "Lion",
      category: "softener",
      baseline: 10,
      capStyle: "steps",
      unit: "mL",
      defaultSlot: "softener",
      notes: "Step markings 目盛り1〜3"
    },
    {
      jan: "4902430489515",
      name: "Renoa Citric Acid in Deodorant Rinse",
      nameJa: "レノア クエン酸in 超消臭 すすぎ消臭剤",
      brand: "P&G",
      category: "citric_rinse",
      baseline: 9.1,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "softener",
      notes: "Dosed by weight (9.1mL/kg). Cap lines 0.4, 0.6, 0.8 (NO 1.0 line). NEVER mix with bleach!"
    },
    {
      jan: "4902430890663",
      name: "Renoa Reset Fabric Softener",
      nameJa: "レノア リセット 柔軟剤",
      brand: "P&G",
      category: "softener",
      baseline: 16,
      capStyle: "steps",
      unit: "mL",
      defaultSlot: "softener",
      notes: "Wrinkle-recovery softener 16mL/30L (目盛り1=22mL)"
    },
    {
      jan: "4902430890687",
      name: "Renoa Happiness Softener",
      nameJa: "レノア ハピネス 柔軟剤",
      brand: "P&G",
      category: "softener",
      baseline: 10,
      capStyle: "steps",
      unit: "mL",
      defaultSlot: "softener",
      notes: "High scent fabric softener with step lines"
    },
    {
      jan: "4902430892025",
      name: "Renoa Super Deodorant 1WEEK",
      nameJa: "レノア 超消臭1WEEK 柔軟剤",
      brand: "P&G",
      category: "softener",
      baseline: 10,
      capStyle: "steps",
      unit: "mL",
      defaultSlot: "softener",
      notes: "Deodorant fabric softener with step markings"
    },
    {
      jan: "4902430815994",
      name: "Renoa Aroma Jewel Scent Beads",
      nameJa: "レノア アロマジュエル 消臭ビーズ",
      brand: "P&G",
      category: "in_drum_beads",
      baseline: 12,
      capStyle: "lines",
      unit: "mL",
      defaultSlot: "drum_direct",
      notes: "Dosed by laundry weight (12mL/kg). Toss into drum bottom BEFORE clothes!"
    },
    {
      jan: "4902430131445",
      name: "Ariel MiRAi Concentrated Liquid",
      nameJa: "アリエール MiRAi 濃縮液体",
      brand: "P&G",
      category: "liquid_detergent",
      baseline: 13,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Concentrated liquid 13mL/30L"
    },
    {
      jan: "4902430473293",
      name: "Ariel Bio Science Gel",
      nameJa: "アリエール ジェル 洗剤",
      brand: "P&G",
      category: "liquid_detergent",
      baseline: 27,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Standard regular synthetic liquid 27mL/30L"
    },
    {
      jan: "4902430473354",
      name: "Ariel Gelball 4D Pods",
      nameJa: "アリエール ジェルボール4D",
      brand: "P&G",
      category: "pods",
      baseline: 1,
      capStyle: "decimal",
      unit: "count",
      defaultSlot: "drum_direct",
      notes: "1 pod for ≤6kg load, 2 pods for >6kg. Direct in drum bottom!"
    },
    {
      jan: "4902430473415",
      name: "Bold Gelball 4D Pods",
      nameJa: "ボールド ジェルボール4D",
      brand: "P&G",
      category: "pods",
      baseline: 1,
      capStyle: "decimal",
      unit: "count",
      defaultSlot: "drum_direct",
      notes: "1 pod for ≤6kg load, 2 pods for >6kg"
    },
    {
      jan: "4902430473385",
      name: "Bold Gel Liquid Detergent",
      nameJa: "ボールド ジェル 液体洗剤",
      brand: "P&G",
      category: "liquid_detergent",
      baseline: 25,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Standard liquid with softener 25mL/30L"
    },
    {
      jan: "4902430473446",
      name: "Sarasa Gentle Liquid Detergent",
      nameJa: "さらさ 無添加植物性 液体洗剤",
      brand: "P&G",
      category: "liquid_detergent",
      baseline: 26,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Gentle plant-based liquid 26mL/30L"
    },
    {
      jan: "4901301388483",
      name: "Humming Flair Fragrance Softener",
      nameJa: "ハミング フレア フレグランス 柔軟剤",
      brand: "Kao",
      category: "softener",
      baseline: 10,
      capStyle: "steps",
      unit: "mL",
      defaultSlot: "softener",
      notes: "Step markings 目盛り1〜3"
    },
    {
      jan: "4901301388506",
      name: "Humming Deodorant EX Softener",
      nameJa: "ハミング 消臭実感 柔軟剤",
      brand: "Kao",
      category: "softener",
      baseline: 10,
      capStyle: "steps",
      unit: "mL",
      defaultSlot: "softener",
      notes: "Step markings 目盛り1〜3"
    },
    {
      jan: "4973512257278",
      name: "Saraya arau. Liquid Soap",
      nameJa: "アラウ 洗濯用せっけん 液体",
      brand: "Saraya",
      category: "liquid_detergent",
      baseline: 50,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Pure potassium soap 50mL/30L"
    },
    {
      jan: "4901797032013",
      name: "Shabondama Snoul Liquid Pure Soap",
      nameJa: "シャボン玉スノール 液体石けん",
      brand: "Shabondama",
      category: "liquid_detergent",
      baseline: 50,
      capStyle: "decimal",
      unit: "mL",
      defaultSlot: "liquid_detergent",
      notes: "Pure liquid soap 50mL/30L"
    },
    {
      jan: "4901797032020",
      name: "Shabondama Snoul Powder Soap",
      nameJa: "シャボン玉スノール 粉石けん",
      brand: "Shabondama",
      category: "powder_detergent",
      baseline: 35,
      capStyle: "scoop",
      unit: "g",
      defaultSlot: "powder_detergent",
      notes: "Pure powder soap 35g/30L (pre-dissolve in warm water)"
    },
    {
      jan: "4901329190426",
      name: "Kaneyo Bleach L",
      nameJa: "カネヨ 衣料用ブリーチL",
      brand: "Kaneyo",
      category: "liquid_bleach",
      baseline: 20,
      capStyle: "lines",
      unit: "mL",
      defaultSlot: "bleach",
      notes: "Liquid bleach 20mL/30L (Lower line 20mL / Upper line 40mL)"
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LAUNDRY_DATA;
}
