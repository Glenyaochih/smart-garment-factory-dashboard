# 智慧成衣工廠儀表板：後端與資料流開發計劃 (作品集強化版)

## 0. 設計理念
本計劃旨在建立一個「生產等級」的監控系統架構。核心亮點在於「混合渲染 (Hybrid Rendering)」與「高頻數據流管理」，確保儀表板在面對即時工業數據時，依然具備優異的效能與資料一致性。

## 1. 技術棧選型
- **後端框架**: FastAPI (Python) - 利用非同步 (Async) 特性處理高併發 IoT 數據。
- **資料庫**: PostgreSQL (SQLModel) - 儲存結構化設備配置與產線狀態。
- **狀態管理 (前端)**: Zustand - 專為高頻更新設計，避免 React Context 的效能樽頸。
- **即時通訊**: WebSockets - 實現毫秒級的系統事件推送。
- **混合渲染**: Next.js App Router (RSC + RCC)。

## 2. 資料庫 Schema 設計 (精簡版)
### A. 靜態配置 (Static Config)
- **`production_zones`**: `id`, `name`, `description` (裁片區、縫製區等)。
- **`hardware_assets`**: `id`, `zone_id`, `name`, `type`, `status_thresholds` (儲存如溫度警告值等元數據)。

### B. 動態狀態 (Dynamic State)
- **`machine_state`**: `asset_id`, `current_status`, `oee_score`, `last_ping`。
- **`production_metrics`**: `timestamp`, `daily_total`, `target_pct` (時序型數據)。

---

## 3. 前後端資料契約 (Data Contract)
為了確保全端協作，定義以下數據轉換與處理邏輯：

### A. 資料類型分離
- **生資料 (Raw Data)**: 後端僅傳遞數值與原始狀態碼 (如 `0.875`, `IDLE`)。
- **呈現邏輯 (UI Logic)**: 前端負責轉換 (如 `87.5%`, `bg-neon-cyan`)。

### B. 通訊模式
1. **初始化 (Bootstrap)**: 使用 `GET /api/v1/factory/init` (由 Server Component 呼叫)。
2. **實時更新 (Live Update)**: 使用 `WebSocket /ws/factory/stream`。

---

## 4. 全端同步策略：混合渲染架構
### 階段一：Server-Side Initial Fetch (RSC)
- 在 `page.tsx` 中直接呼叫 `init` API。
- 目的：解決首屏「白畫面」或「載入中」問題，讓使用者瞬間看到完整工廠配置。

### 階段二：Client-Side Real-time Hydration (RCC)
- **Zustand Store**: 接收 Server 傳入的初始狀態作為 `initialState`。
- **WebSocket 監聽**: Zustand Store 建立連線，收到數據後直接更新對應機器的狀態。
- **數據過濾**: 實作 Throttling (節流)，並搭配 **Last Event ID** 篩選邏輯，解決 SSR 與 WS 之間的 Hydration 資料衝突（詳見第 9 章）。

---

## 5. API 端點詳細規劃
- `GET /api/v1/factory/init`: 
  - 回傳完整工廠地圖、所有機器當前狀態、以及最近 20 筆事件日誌。
- `GET /api/v1/events/history`: 
  - 分頁查詢歷史日誌。
- `WS /ws/factory/stream`: 
  - 推送即時數據包 (Payload 包含 `asset_id`, `new_value`, `timestamp`)。

---

## 6. 模擬資料與測試策略
- **Mock Service**: 實作一個 `simulation_service.py`。
- **漂移邏輯**: 
  - OEE 數值每 30 秒在 ±0.2% 之間隨機波動。
  - 自動生成「機器進入維護」或「入料警告」的隨機事件。
- **時序模擬**: 模擬 8 小時內的產量增長曲線，提供前端繪製趨勢圖。

---

## 7. 雲端部署建議 (免費資源)
- **API Server**: Render (Free Tier) - 部署 FastAPI。
- **Database**: Supabase (Free Tier) - 提供永久免費的 PostgreSQL。
- **Frontend**: Vercel - 完美整合 Next.js 的 SSR 緩存。

---

## 8. 專業亮點 (作品集加分點)
- **性能優化**: 展現如何使用 Zustand 解決多元件同步更新的 Re-render 問題。
- **架構深度**: 解釋為什麼選擇混合渲染 (RSC + WS) 而非純前端渲染。
- **工業思維**: 加入異常判斷邏輯（如 Heartbeat 檢測機器離線）。

---

## 9. 技術細節深度規格 (Deep Dive)

### 9.1 SSR 與 CSR 的數據同步機制 (SSR-to-CSR Handover)
為了確保 Next.js 在 Hydration 過程中資料的一致性並避免畫面閃爍：
- **版本控制**: `GET /api/v1/factory/init` 回傳的數據將包含一個 `last_event_id` 或 `sync_timestamp`。
- **篩選邏輯**: 前端 Zustand Store 在接收 WebSocket 推播時，僅處理 `event_id > last_event_id` 的訊息，確保「舊推播」不會覆蓋「新快照」。

### 9.2 WebSocket 穩定性與安全策略
- **連線維持 (Heartbeat)**: 伺服器每 25 秒主動發送一個空 Payload 作為心跳包，維持 Render (Free Tier) 等雲端平台的 L7 連線。
- **Ticket-based Auth**: 考量 WS 原生 API 不支援 Headers，連線前需先透過一次性憑證 (One-time Ticket) 模式進行認證。

### 9.3 效能優化 (Backend-Side Throttling)
- **數據聚合**: 模擬服務產生的數據先進入快取，每 500ms 聚合一次後再透過 WS 廣播，避免前端 DOM 更新頻率過高導致效能下降。

### 9.4 開發運維 (DevOps & Reliability)
- **資料庫遷移**: 使用 Alembic (Python) 管理 PostgreSQL Schema，確保資料庫變更版本化。
- **錯誤規範**: 定義標準化的 API Response Schema (含 RequestID)，強化除錯效率。
- **自動化文件**: 完整配置 FastAPI Swagger UI，提供 Request/Response Body 範例以便快速對接。
