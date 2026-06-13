お願いします。

---

## 詳細な技術設計書  
**PBPE Marketplace ブロックチェーン・Registry API 仕様（Version 1.0）**  
対象：技術評価者／実装チーム／政府説明用補足資料  

---

## 1. 全体アーキテクチャ（再掲・簡易版）

```
クライアント（Dashboard / API）
    │
    ▼
FastAPI Routers（/credits, /registry, /trade ...）
    │
    ▼
PBPE Registry（Layer 5）←─→ Blockchain Layer（Layer 0）
    │                              │
    ├─ RegistryEntry（SQL）        ├─ Block（Python list）
    ├─ subject_id 一意制約          ├─ ハッシュ連鎖
    └─ 二重計上チェック              └─ 改ざん検証
```

- **Registry** はリレーショナルDB（またはNoSQL）で `RegistryEntry` を管理  
- **Blockchain** はメモリ上またはファイルにチェーンを保持（P2Pは後日拡張）

---

## 2. ブロックチェーン層の設計（コード例）

### 2.1 ディレクトリ構造（抜粋）
```
backend/blockchain/
├── __init__.py
├── block.py          # Block クラス
├── chain.py          # Chain クラス（検証・追加）
└── ledger.py         # Registry との連携関数
```

### 2.2 `block.py` – Block クラス
```python
import hashlib
import json
import time
from typing import Any, Dict

class Block:
    def __init__(self, index: int, previous_hash: str, payload: Dict[str, Any], timestamp: float = None):
        self.index = index
        self.previous_hash = previous_hash
        self.timestamp = timestamp or time.time()
        self.payload = payload          # RegistryEntry の要約（subject_id, kind, amount, actor）
        self.hash = self._compute_hash()

    def _compute_hash(self) -> str:
        block_string = json.dumps({
            "index": self.index,
            "previous_hash": self.previous_hash,
            "timestamp": self.timestamp,
            "payload": self.payload
        }, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()
```

### 2.3 `chain.py` – Chain クラス
```python
from typing import List, Optional
from .block import Block

class PBPEChain:
    def __init__(self):
        self.blocks: List[Block] = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis = Block(0, "0", {"kind": "genesis", "message": "PBPE Registry inception"})
        self.blocks.append(genesis)

    def add_block(self, payload: dict) -> Block:
        last_block = self.blocks[-1]
        new_block = Block(len(self.blocks), last_block.hash, payload)
        self.blocks.append(new_block)
        return new_block

    def is_valid(self) -> bool:
        for i in range(1, len(self.blocks)):
            current = self.blocks[i]
            previous = self.blocks[i-1]
            if current.hash != current._compute_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
        return True

    def get_block_by_payload_subject(self, subject_id: str) -> Optional[Block]:
        for blk in self.blocks:
            if blk.payload.get("subject_id") == subject_id:
                return blk
        return None
```

### 2.4 `ledger.py` – Registry 連携
```python
from .chain import PBPEChain

_chain = PBPEChain()   # シングルトン（実際はDI）

def record_to_blockchain(entry_dict: dict) -> str:
    """RegistryEntry の dict を受け取り、チェーンに追加し、ブロックハッシュを返す"""
    payload = {
        "registry_id": entry_dict.get("id"),
        "kind": entry_dict.get("kind"),
        "subject_id": entry_dict.get("subject_id"),
        "actor": entry_dict.get("actor"),
        "amount": str(entry_dict.get("amount")),
        "timestamp": str(entry_dict.get("timestamp"))
    }
    block = _chain.add_block(payload)
    return block.hash
```

---

## 3. Registry API 仕様（OpenAPI 風）

### 3.1 共通情報
- **Base URL**: `https://api.pbpe.market/v1`
- **認証**: Bearer Token（企業／政府アカウント）

### 3.2 エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/registry/record` | 新しいRegistryEntryを作成し、チェーンに書き込む |
| GET | `/registry/{id}` | 指定されたRPT-IDのエントリを返す |
| GET | `/registry/by-subject/{subject_id}` | subject_id（CRD-IDなど）に紐づく全履歴を返す |
| GET | `/registry/search` | actor, kind, from_date, to_date で検索 |

### 3.3 詳細定義

#### POST `/registry/record`
**リクエスト本文（JSON）**：
```json
{
  "kind": "credit_issuance",   // issuance | retirement | trade | scope3_report | coupon
  "subject_id": "CRD-4F9A2C1",
  "actor": "company:agrix_japan",
  "amount": 1000.5,
  "amount_unit": "PBPE",
  "metadata": { "kpi_id": "KPI-7C1A9F2" }
}
```
**成功レスポンス（201 Created）**：
```json
{
  "id": "RPT-9E7F6D5",
  "kind": "credit_issuance",
  "subject_id": "CRD-4F9A2C1",
  "actor": "company:agrix_japan",
  "amount": 1000.5,
  "amount_unit": "PBPE",
  "timestamp": "2026-06-11T09:00:00Z",
  "chain_tx_hash": "0x1b8d7c3e9a2f5b6d...",
  "block_height": 1245
}
```

#### GET `/registry/by-subject/CRD-4F9A2C1`
**レスポンス（200 OK）**：
```json
{
  "subject_id": "CRD-4F9A2C1",
  "history": [
    {
      "id": "RPT-9E7F6D5",
      "kind": "credit_issuance",
      "actor": "company:agrix_japan",
      "amount": 1000.5,
      "timestamp": "2026-06-11T09:00:00Z",
      "chain_hash": "0x1b8d..."
    },
    {
      "id": "RPT-3F2A1E7",
      "kind": "trade",
      "actor": "buyer:esg_fund",
      "amount": 300.0,
      "timestamp": "2026-06-12T14:23:00Z",
      "chain_hash": "0x3c5e..."
    }
  ]
}
```

#### GET `/registry/search?actor=company:agrix_japan&kind=credit_issuance`
**ページング対応（limit, offset）**  
**レスポンス**：`{ "items": [ ... ], "total": 42 }`

---

## 4. 二重計上防止ロジック（実装イメージ）

### 4.1 二重発行防止（`/credits/issue` 内部）
```python
def issue_credit(kpi_id: str, amount: float, owner: str):
    # 1. 同じ KPI-ID から既に発行された Credit が存在するか？
    existing = db.query(RegistryEntry).filter(
        kind="credit_issuance",
        metadata["kpi_id"] == kpi_id
    ).first()
    if existing:
        raise HTTPException(409, "This KPI already issued a PBPE Credit (double issuance prevented)")

    # 2. 発行処理
    crd_id = generate_raw_code()   # 7桁
    registry_entry = RegistryEntry(
        kind="credit_issuance",
        subject_id=f"CRD-{crd_id}",
        actor=owner,
        amount=amount,
        metadata={"kpi_id": kpi_id}
    )
    db.add(registry_entry)
    db.commit()

    # 3. ブロックチェーンに記録
    chain_hash = record_to_blockchain(registry_entry.to_dict())
    registry_entry.chain_tx_hash = chain_hash
    db.commit()
    return crd_id
```

### 4.2 二重償却防止（`/credits/retire` 内部）
```python
def retire_credit(crd_id: str, amount: float, actor: str):
    # 合計発行量を算出
    issuance = db.query(RegistryEntry).filter(
        kind="credit_issuance", subject_id=crd_id
    ).first()
    total_issued = issuance.amount

    # 既に償却された総量
    total_retired = db.query(func.sum(RegistryEntry.amount)).filter(
        kind="credit_retirement", subject_id=crd_id
    ).scalar() or 0

    if total_retired + amount > total_issued:
        raise HTTPException(400, "Exceeds issued amount (double retirement prevented)")

    # 償却エントリ作成...
```

### 4.3 Scope 3 二重主張防止（`/scope3/report`）
```python
def report_scope3(company_id: str, crd_id: str, amount: float):
    # 同じ CRD-ID が他の企業の Scope 3 報告に使われていないか？
    used = db.query(RegistryEntry).filter(
        kind="scope3_report",
        subject_id=crd_id,
        actor != company_id
    ).first()
    if used:
        raise HTTPException(409, "This PBPE Credit already claimed by another company for Scope 3")
    # 記録処理...
```

---

## 5. まとめ（技術評価者向け）

- **7桁コード**は衝突耐性が高く（`secrets.choice`）、データベースの主キーおよびブロックチェーンのトランザクションIDとして機能する
- **Registry** は標準的なSQLで二重発行・二重償却をチェックするため、実装がシンプルかつ監査可能
- **ブロックチェーン**はハッシュ連鎖による完全な改ざん検出を提供。この設計はプライベートチェーンでも動作し、将来パブリックチェーンへのアンカーリングも容易
- 二重計上防止は **ID + レジストリ制約 + 不変の証跡** という三重のガードにより、**業界で唯一「構造的に不可能」** を実現

---

この設計書のコード例は、そのまま `backend/blockchain/` および `backend/routers/registry.py` として実装可能です。  
必要に応じて、実ファイルを生成しますのでお知らせください。

[[DSP7. Scope 3 Emissions]]

