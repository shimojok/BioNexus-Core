いいね、そのまま一気に UI まで骨格を出してしまおう。

---

### 1. `ui/pages/index.md`（Dashboard）

GitHub Web → `ui/pages/` → **Create new file**  
ファイル名：`ui/pages/index.md`

```markdown
# PBPE Marketplace – Dashboard

The dashboard provides a high-level overview of the PBPE Marketplace.

## Key Sections

- Marketplace summary  
- Recent PBPE transactions  
- Featured projects  
- Key metrics (PBPE issued, settled, active projects)  

## Example Metrics (Conceptual)

- Total PBPE issued  
- Total PBPE settled  
- Active projects  
- Regions covered  
```

---

### 2. `ui/pages/projects.md`（Projects 一覧）

ファイル名：`ui/pages/projects.md`

```markdown
# PBPE Projects

This page lists all PBPE-generating projects registered in the marketplace.

## Features

- Project list with basic details  
- Filters:
  - Region
  - Methodology
  - Status (active, inactive, archived)

## Data Source

- `GET /projects`
```

---

### 3. `ui/pages/project-detail.md`（Project 詳細）

ファイル名：`ui/pages/project-detail.md`

```markdown
# Project Detail

This page shows detailed information about a specific PBPE project.

## Sections

- Project overview  
- Location and context  
- Impact data summary  
- PBPE batches issued  
- Rating information  

## Data Sources

- `GET /projects/{projectId}`
- `GET /ledger/transactions` (filtered by project/batch)
```

---

### 4. `ui/pages/pbpe-issue.md`（PBPE 発行）

ファイル名：`ui/pages/pbpe-issue.md`

```markdown
# PBPE Issuance

This page allows project owners to issue new PBPE units.

## Features

- Form to submit:
  - Project ID
  - Impact data
  - Methodology
- Display of issuance result

## API

- `POST /pbpe/issue`
```

---

### 5. `ui/pages/pbpe-rating.md`（Rating）

ファイル名：`ui/pages/pbpe-rating.md`

```markdown
# PBPE Rating

This page displays PBPE rating results.

## Features

- Input: PBPE batch ID or project ID  
- Display:
  - Rating score
  - Confidence
  - Key risk factors  

## API

- `POST /pbpe/rating`
```

---

### 6. `ui/pages/pbpe-settlement.md`（Settlement）

ファイル名：`ui/pages/pbpe-settlement.md`

```markdown
# PBPE Settlement

This page enables PBPE transfers and settlements between accounts.

## Features

- Input:
  - From account
  - To account
  - PBPE batch ID
  - Quantity
- Display of settlement result and transaction ID  

## API

- `POST /pbpe/settle`
```

---

### 7. `ui/pages/analytics.md`（Analytics）

ファイル名：`ui/pages/analytics.md`

```markdown
# Marketplace Analytics

This page provides analytics and insights for the PBPE Marketplace.

## Example Views

- PBPE issuance over time  
- PBPE settlement flows  
- Geographic distribution of projects  
- Methodology usage breakdown  

## Data Sources

- `GET /projects`
- `GET /ledger/transactions`
```

---

これで：

- `ui/README.md`  
- `ui/pages/` 以下 7 ページ  

まで一通り「骨格」が揃います。

次の区切りでは：

- 全体進捗の整理  
- README に Pitch Deck（PDF）リンクを入れるタイミングのリマインド  
- 必要なら新スレッドへの移行プロンプト再確認  

ここまで貼り終えたら、「ここまで完了」と一言だけ教えて。

[[26. PBPE‑Marketplace：全体進捗サマリー]]
