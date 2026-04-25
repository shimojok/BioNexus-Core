# HealthBook Platform v3.0

浜田式問診（154問）× 93疾患マトリックス × MBT55五代謝経路 統合推論エンジン

## ローカル起動

```bash
npm install
npm run dev
# → http://localhost:5173 で起動
```

## GitHub → Azure Static Web Apps デプロイ手順

### Step 1: GitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit: HealthBook v3.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/healthbook-platform.git
git push -u origin main
```

### Step 2: Azure Static Web Apps を作成

1. [Azure Portal](https://portal.azure.com) にログイン
2. 「リソースの作成」→「Static Web Apps」を検索
3. 以下を設定：
   - **名前**: `healthbook-platform`
   - **プラン**: Free（無料）
   - **リージョン**: East Asia（推奨）
   - **デプロイのソース**: GitHub
   - **リポジトリ**: `healthbook-platform`
   - **ブランチ**: `main`
   - **ビルドプリセット**: React
   - **アプリの場所**: `/`
   - **出力の場所**: `dist`

4. 「作成」をクリック

### Step 3: 自動デプロイ確認

Azureが自動的に GitHub Actions の workflow を設定します。
その後 `main` ブランチへの push ごとに自動デプロイされます。

## プロジェクト構成

```
healthbook-platform/
├── src/
│   ├── main.jsx          # Reactエントリーポイント
│   └── App.jsx           # HealthBook v3.0 メインコンポーネント
├── public/
│   └── staticwebapp.config.json  # Azure SWA設定
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # CI/CD
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

## 将来のAzure拡張計画

```
現在（v3.0）
  HealthBook React App
  → Azure Static Web Apps

フェーズ2
  + Azure Functions（Python推論エンジン）
  + Azure Cosmos DB（問診データ蓄積）

フェーズ3
  + Azure Machine Learning（継続学習）
  + Azure API Management（Enterprise API）
```
