# 🧶 智慧成衣工廠儀表板：前端與即時互動開發計劃 (作品集強化版)

---

## 1. 核心設計理念與專業亮點

### 1.1 設計理念
本儀表板不僅是數據的呈現，更是「自動化物流指揮中心」的視覺化延伸。核心挑戰在於如何在**極高頻率的數據流 (High-frequency Streams)** 下，維持介面的絕對流暢，並透過視覺設計提升操作員對異常狀態的反應速度。

### 1.2 專業亮點 (前端加分點)
- **毫秒級反應系統**：實作 WebSocket 監聽與 **Zustand 淺比較 (Shallow Comparison)** 邏輯，確保只有受影響的設備卡片會重新渲染。
- **混合渲染同步 (Hydration Guard)**：解決 SSR 首屏快照與 WebSocket 即時推播之間的版本衝突，防止數據回滾。
- **合成預警監控 (Synthetic Events)**：前端主動交叉比對數據，在數據變更的瞬間自動生成警告日誌，無需等待伺服器推送。
- **工業級 UX**：實作 Skeleton 骨架屏、斷線自動重連機制與呼吸燈狀態指示器。

---

## 2. 現代化技術棧與渲染策略

### 2.1 技術棧選型
- **核心框架**: **Next.js 14 (App Router)** - 實現 Server-side Rendering (SSR) 達到秒開效果。
- **全域狀態管理**: **Zustand** - 專為高頻更新設計，輕量且具備優異的效能表現。
- **CSS 系統**: **Tailwind CSS** - 搭配 **Tailwind Merge** 與 **clsx** 處理複雜的動態狀態切換。
- **UI 元件庫**: **Radix UI / shadcn/ui** - 提供無障礙 (A11y) 且可高度客製化的基礎組件。
- **數據視覺化**: **Recharts / Visx** - 用於展示設備產能趨勢與 OEE 波動圖。

---

## 3. 模組化專案構造

採用「功能導向」的目錄結構，提升程式碼的可維護性：

```text
.
├── app/                  # Next.js App Router (頁面與路由)
├── components/           
│   ├── dashboard/       # 儀表板專用元件 (KPI, 設備格項, 流程圖)
│   ├── ui/              # 原子化基礎元件 (Button, Sheet, Skeleton)
│   └── shared/          # 通用元件 (ThemeToggle, Navbar)
├── hooks/                # 自定義 React Hooks (如 useSocket, useTimer)
├── lib/                  
│   ├── types/           # TypeScript 型別定義 (對標後端 Schema)
│   └── utils/           # 通用工具函式 (格式化、數值運算)
├── store/                # Zustand 中央狀態機
└── styles/               # 全域樣式與 Tailwind 配置
```

---

## 4. 全端同步與效能優化策略

### 4.1 混合渲染 Handover 機制
1. **SSR 預載**: `page.tsx` (RSC) 直接獲獲取後端 Redis 快照，確保使用者進入時直接看到最新的工廠佈局。
2. **CSR 接管**: 客戶端載入後，Zustand 接手狀態，並透過 `last_event_id` 自動過濾掉過時的 WebSocket 訊息。

### 4.2 高頻更新節流 (Data Throttling)
- **局部重繪**: 嚴格使用 `React.memo` 包裝設備卡片，防止總覽頁面 14+ 設備同時因單一設備更新而重繪，將瀏覽器 CPU 佔用率降至最低。

---

## 5. 工業風格 UI/UX 規範

### 5.1 視覺語言 (The System)
- **配色語彙**: 
  - `Running`: `#06b6d4` (Neon Cyan) - 穩定運作。
  - `Warning`: `#f59e0b` (Neon Amber) - 需要關注。
  - `Offline`: `#94a3b8` (Slate) - 離線狀態。
- **字體系統**: 採用 **JetBrains Mono** 展示數值，營造工業儀器感。

### 5.2 狀態提示與回饋
- **連線指示燈**: 呼吸燈動畫展示伺服器連線狀態 (Heartbeat Feedback)。
- **微動畫**: 數據變動時採用細微的數值跳動動畫，提醒操作員數據正在實時更新。

---

## 6. 開發規範與自動化 (CI/CD)

### 6.1 工程品質保證
- **TS 定型**: 嚴格禁止使用 `any`，確保前端介面與後端 Pydantic 模型完全對齊定義。
- **RWD 優化**: 確保所有元件在 375px (手機) 到 2560px (監控電視) 下排版正常。

### 6.2 部署流程
- **環境變數**: 透過 `.env` 管理 API 與 WS 端點。
- **Vercel CD**: 每次 PR 自動生成預覽環境 (Preview Deployment)，確保功能完工才併回 Main。

---

## 10.1 程式碼註解規範 (與後端同步)
- **註解語言**：統一使用 **繁體中文**。
- **內容核心**：解釋複雜的 Hook 邏輯、State 變化機制，確保團隊開發一致性。
