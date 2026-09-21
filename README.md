# 🇯🇵 Japan Life Tools | 日本生活便利ツール

A collection of lightweight, bilingual, mobile-first web applications designed to make apartment living and household appliances in Japan effortless.

🌐 **Live Website**: [https://flamanlevi.github.io/japan-life-tools/](https://flamanlevi.github.io/japan-life-tools/)

---

## 🛠️ Tool Directory

### 1. 🧺 [Japan Laundry Care Assistant](./laundry/) (`/laundry/`) — **Active / 公開中**
* **Instant Cap Markings & Push Calculator**: Translates machine weight readings (e.g. `0.6杯`, `35L`) into exact physical bottle cap markings (`下線`, `目盛り1`, `0.6杯`) and push counts (`3プッシュ`) for liquids, powders, bleaches, pods, beads, and citric acid.
* **Hybrid Camera Scanner**: 100% client-side barcode scanner (hardware `BarcodeDetector`) matching 34 retail staples, plus "Learn Once, Remember Forever" local storage persistence and in-browser WASM OCR fallback.
* **1:1 Back-Label Matrix Mirror**: Directly reproduces the 4-row printed back label from Japanese packaging with live fine-tuning.
* **Interactive Control Panel Maps & Error Solvers**: Authentic console mappings for Panasonic and Sharp drum washer models across multiple building floors with bilingual error code resolution.
* **100% Offline PWA**: Installable to iOS / Android home screens with full offline caching.

---

### 2. 🗑️ Trash Sorting & Collection Calendar (`/trash-guide/`) — *In Development*
* Decodes municipal waste separation categories (burnable 燃えるごみ, non-burnable 燃えないごみ, plastics, PET bottles, and bulk waste).
* Schedule reminders for collection mornings.

---

### 3. ❄️ AC & Heating Remote Decoder (`/ac-remote/`) — *In Development*
* Interactive guide to Japanese air conditioner remotes: Cooling (冷房), Heating (暖房), Dehumidifier (除湿), Fan Speed (風量), and Timer controls.

---

### 4. 📦 Apartment Intercom & Delivery Box Helper (`/intercom/`) — *In Development*
* Answering auto-lock doorbells, operating parcel lockers (宅配ボックス), and reading postal redelivery slips (不在連絡票).

---

## 🔒 Privacy & Architecture
* **100% Client-Side**: All user preferences, custom bottles, and machine selections are stored locally on your device via `localStorage`.
* **Zero Accounts / Zero Tracking**: No sign-ups, no cookies, no tracking scripts, and zero cloud database costs.
* **Zero-Cost GitHub Pages**: Hosted entirely on GitHub Pages.

---

## 📄 License
MIT License. Created for international residents and apartment neighbors living in Japan.
