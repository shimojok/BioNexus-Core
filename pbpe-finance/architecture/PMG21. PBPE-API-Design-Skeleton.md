Kaz、了解しました。  
README や Whitepaper の細かい修正は後でまとめて行う前提で、**次の主要ブロック：API（OpenAPI 3.1）の骨格作成**に進みます。

あなたは GitHub Web でフォルダを開き、私が作る内容を貼るだけで進めます。  
ローカル Git は完全に排除したので、もう push エラーに悩む必要はありません。

---

# 📌 **進行状況（2026/05/06 08:32 JST 時点）**

### ✔ 完了
- Architecture 図（PNG）  
- Whitepaper（Draft）  
- Pitch Deck ディレクトリ構築  
- Pitch Deck README（あなたが貼るだけの状態）

### ⏳ 次に進む項目（今回）
- **API セクションの骨格（OpenAPI 3.1）**

---

# 🚀 **STEP 4：API（OpenAPI 3.1）の骨格を作成する**

Kaz、次に GitHub Web で以下を作成してください：

1. `api/openapi/` フォルダを開く  
2. **Add file → Create new file**  
3. ファイル名：  
   `api/openapi/openapi.yaml`  
4. 下記の内容をそのまま貼って Commit

---

## 📄 **api/openapi/openapi.yaml（OpenAPI 3.1・骨格・そのまま貼れる）**

```yaml
openapi: 3.1.0
info:
  title: PBPE Marketplace API
  version: 0.1.0
  description: >
    The PBPE Marketplace API provides access to PBPE issuance, settlement,
    rating, project data, and ledger transactions. This is a draft specification
    and will evolve as the system architecture is refined.

servers:
  - url: https://api.pbpe-marketplace.example.com
    description: Draft server placeholder

paths:

  /projects:
    get:
      summary: List all registered PBPE projects
      responses:
        '200':
          description: A list of PBPE projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'

  /projects/{projectId}:
    get:
      summary: Get details of a specific PBPE project
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Project details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'

  /pbpe/issue:
    post:
      summary: Issue new PBPE units based on validated impact data
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PBPEIssueRequest'
      responses:
        '201':
          description: PBPE units issued
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PBPEIssueResponse'

  /pbpe/settle:
    post:
      summary: Settle PBPE units between accounts or contracts
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PBPESettleRequest'
      responses:
        '200':
          description: Settlement result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PBPESettleResponse'

  /pbpe/rating:
    post:
      summary: Generate a PBPE rating score for a project or PBPE batch
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PBPERatingRequest'
      responses:
        '200':
          description: Rating result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PBPERatingResponse'

  /ledger/transactions:
    get:
      summary: List ledger transactions
      responses:
        '200':
          description: Ledger transaction list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/LedgerTransaction'

components:
  schemas:

    Project:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        location:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [active, inactive, archived]

    PBPEIssueRequest:
      type: object
      properties:
        projectId:
          type: string
        impactData:
          type: object
        methodology:
          type: string

    PBPEIssueResponse:
      type: object
      properties:
        pbpeId:
          type: string
        quantity:
          type: number
        issuedAt:
          type: string
          format: date-time

    PBPESettleRequest:
      type: object
      properties:
        fromAccount:
          type: string
        toAccount:
          type: string
        pbpeId:
          type: string
        quantity:
          type: number

    PBPESettleResponse:
      type: object
      properties:
        transactionId:
          type: string
        status:
          type: string

    PBPERatingRequest:
      type: object
      properties:
        pbpeId:
          type: string
        parameters:
          type: object

    PBPERatingResponse:
      type: object
      properties:
        rating:
          type: number
        confidence:
          type: number

    LedgerTransaction:
      type: object
      properties:
        transactionId:
          type: string
        type:
          type: string
        timestamp:
          type: string
          format: date-time
        details:
          type: object
```

---

# 🧭 **次のステップ（あなたが今すべきこと）**

### ✔ GitHub Web で  
`api/openapi/openapi.yaml` を作成して貼る

完了したら「完了」とだけ伝えてください。

---

# 🔮 次に進む項目（あなたが完了と伝えたら開始）

### **STEP 5：Engine セクションの構築**
- pbpe-impact-engine  
- rating-engine  
- settlement-engine  
- それぞれの README（役割・入出力・計算フロー）

### **STEP 6：Ledger セクションの構築**
- schema（PBPE Ledger Schema）  
- prisma（DB モデル）

### **STEP 7：UI セクションの構築**
- UI 構造  
- ページ構成  
- API との接続ポイント

---

Kaz、  
あなたは GitHub Web に貼るだけで PBPE-Marketplace が国際標準レベルで完成していきます。  
次のステップに進む準備ができています。

[[PMG22. STEP 5：Engine セクションの構築]]
