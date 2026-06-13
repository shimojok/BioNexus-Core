Kaz、了解しました。  
Engine セクションの 3 つの README が揃ったので、次は **Ledger セクション**に進みます。  
ここは PBPE‑Marketplace の「金融的な背骨」にあたる重要パートです。

あなたは GitHub Web でフォルダを開き、私が作る内容を貼るだけで進めます。

---

# 📌 進行状況（2026/05/06 08:46 JST 時点）

### ✔ 完了
- Architecture 図（PNG）  
- Whitepaper（Draft）  
- Pitch Deck ディレクトリ  
- OpenAPI 3.1（骨格）  
- Engine（Impact / Rating / Settlement）README  

### ⏳ 次に進む項目（今回）
- **Ledger セクションの構築（Schema + Prisma モデル）**

---

# 🚀 STEP 6：Ledger セクションの構築

Ledger は PBPE Marketplace の **取引・発行・所有権・履歴**を記録する基盤です。

作成するファイルは 2 つ：

1. `ledger/schema/pbpe-ledger-schema.md`  
2. `ledger/prisma/schema.prisma`  

---

# ① PBPE Ledger Schema（概念モデル）

GitHub Web で：

- `ledger/schema/` を開く  
- **Add file → Create new file**  
- ファイル名：  
  `ledger/schema/pbpe-ledger-schema.md`  
- 下記を貼って Commit

---

## 📄 ledger/schema/pbpe-ledger-schema.md（そのまま貼れる）

```markdown
# PBPE Ledger – Conceptual Schema

The PBPE Ledger records all PBPE-related events, including issuance, transfers,
settlements, and metadata updates. It is designed for transparency,
auditability, and interoperability with financial systems.

## Core Entities

### 1. Project
Represents a PBPE-generating project.

- `id` (string)
- `name`
- `location`
- `description`
- `status` (active, inactive, archived)

### 2. PBPEBatch
A batch of PBPE units issued from a project.

- `id` (string)
- `projectId`
- `quantity`
- `methodology`
- `issuedAt`
- `metadata` (JSON)

### 3. Account
Represents an entity that can hold PBPE units.

- `id` (string)
- `name`
- `type` (organization, individual, contract)

### 4. LedgerTransaction
Records any PBPE movement or event.

- `id` (string)
- `type` (issue, transfer, settle, retire)
- `timestamp`
- `fromAccount` (nullable)
- `toAccount` (nullable)
- `pbpeBatchId`
- `quantity`
- `metadata` (JSON)

## Relationships

Project 1 --- * PBPEBatch
PBPEBatch 1 --- * LedgerTransaction
Account 1 --- * LedgerTransaction (as sender)
Account 1 --- * LedgerTransaction (as receiver)

## Example Flow

1. Project issues PBPE batch  
2. PBPE batch is transferred to an account  
3. PBPE is settled between accounts  
4. Ledger records each event immutably  

## Next Steps

- Add compliance fields  
- Add audit trail extensions  
- Add multi-chain compatibility layer  
```

---

# ② Prisma モデル（DB モデル）

GitHub Web で：

- `ledger/prisma/` を開く  
- **Add file → Create new file**  
- ファイル名：  
  `ledger/prisma/schema.prisma`  
- 下記を貼って Commit

---

## 📄 ledger/prisma/schema.prisma（そのまま貼れる）

```prisma
// PBPE Marketplace – Ledger Database Schema (Draft)

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Project {
  id          String        @id @default(cuid())
  name        String
  location    String?
  description String?
  status      String        @default("active")
  batches     PBPEBatch[]
}

model PBPEBatch {
  id          String             @id @default(cuid())
  project     Project            @relation(fields: [projectId], references: [id])
  projectId   String
  quantity    Float
  methodology String
  issuedAt    DateTime           @default(now())
  metadata    Json?
  transactions LedgerTransaction[]
}

model Account {
  id          String             @id @default(cuid())
  name        String
  type        String
  sent        LedgerTransaction[] @relation("SentTransactions")
  received    LedgerTransaction[] @relation("ReceivedTransactions")
}

model LedgerTransaction {
  id          String      @id @default(cuid())
  type        String
  timestamp   DateTime    @default(now())
  fromAccount Account?    @relation("SentTransactions", fields: [fromAccountId], references: [id])
  fromAccountId String?
  toAccount   Account?    @relation("ReceivedTransactions", fields: [toAccountId], references: [id])
  toAccountId String?
  pbpeBatch   PBPEBatch   @relation(fields: [pbpeBatchId], references: [id])
  pbpeBatchId String
  quantity    Float
  metadata    Json?
}
```

---

# 🧭 Kaz が今すべきこと（2つ）

1. `ledger/schema/pbpe-ledger-schema.md` を作成  
2. `ledger/prisma/schema.prisma` を作成  

すべて GitHub Web で貼るだけです。

---

# 🔮 次に進む項目（あなたが「次へ」と言ったら開始）

### **STEP 7：UI セクションの構築**
- UI のページ構成  
- API 接続ポイント  
- Marketplace の画面フロー  
- PBPE 発行・閲覧・取引 UI の骨格

---

Kaz、  
あなたのプロジェクトは順調に、国際標準 OSS レベルの構造へと進んでいます。  
Ledger が完成すると、PBPE Marketplace の「金融基盤」が固まります。

次に進む準備ができています。

[[PMG24. STEP 7：UI セクションの構築]]
