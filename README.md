# 🧶 智慧成衣工廠即時監控系統 (Smart Garment Factory)

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](./FRONTEND_PLAN.md)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](./backend/README.md)
[![TypeScript](https://img.shields.io/badge/Code-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Logic-Python%203.9+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)

這是一個專為「工業 4.0 智慧物流」打造的自動化監控與管理系統。結合高頻數據流處理與現代化 Web 架構，實現工廠設備狀態的毫秒級同步。

---

## 🚀 專案核心架構

本專案採用**混合渲染 (Hybrid Rendering)** 與 **邊緣模擬 (Edge Simulation)** 技術，解決工業大數據下的即時性與流暢度挑戰。

### 🏗️ 系統組成
1.  **Frontend (Next.js + Zustand)**: 高效能即時儀表板，支援 RWD 與深色模式。
2.  **Backend (FastAPI + SQLModel)**: 非同步數據處理中心，支援 WebSocket 廣播。
3.  **Real-time Snapshot (Redis)**: 首屏加載優化，提供極速的狀態快照。
4.  **Factory Simulator**: 模擬真實工業環境的數據生產與異常報警。

---

## 📖 開發計劃與技術深度

我們將專案拆分為兩個核心維度，您可以點擊下方連結深入了解相關的設計理念與實作邏輯：

### 🖥️ [前端開發計劃 (Frontend Plan)](./FRONTEND_PLAN.md)
> 探討 **Zustand 效能優化**、**混合渲染同步 (Hydration Guard)** 與 **工業風格 UI/UX**。

### ⚙️ [後端開發計劃 (Backend Plan)](./backend/README.md)
> 探討 **Redis 狀態快照**、**WebSocket 穩定性策略** 與 **工業數據模擬 (Simulator)**。

---

## 🚥 目前開發狀態

詳細的任務追蹤請參考 [TASK_LIST.md](./TASK_LIST.md)。

- [x] Phase 1: 核心監控體驗與資料串接
- [ ] Phase 2: 管理功能擴充 (設備列表、歷史紀錄)
- [ ] Phase 3: 品質優化 (Theme、RWD、Error State)

---

## 🛠️ 快速啟動

### 前端
```bash
npm install
npm run dev
```

### 後端
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

> [!NOTE]
> 註解與文件統一使用 **繁體中文** 撰寫，以確保開發動機與邏輯的清晰傳達。
