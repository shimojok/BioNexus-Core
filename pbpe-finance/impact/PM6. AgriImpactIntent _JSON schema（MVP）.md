全て必要ですね？順次進めてください。

---

いいですね、全部必要です。順番を決めて、ひとつずつ “実装できる粒度” に落としていきましょう。

進める順番はこうします：

1. **AgriImpactIntent の JSON スキーマ設計（中核）**  
2. **AgriImpactSource（AGRIX データ標準化）**  
3. **AgriImpactWebhook（MRV 自動化のイベント設計）**  
4. **AgriImpactConnect（価値分配モデル）**  
5. **AgriImpactCheckout（可視化 UI のデータ契約）**

まずは 1 からいきます。

---

### 1) AgriImpactIntent の JSON スキーマ（MVP）

**目的：**  
「この JSON を投げれば、農業インパクトが一意に計算できる」  
という **中核オブジェクト** を定義します（Stripe の PaymentIntent に相当）。

```json
{
  "id": "agi_intent_2026_0001",
  "farmer_id": "farmer_123",
  "field_id": "field_45",
  "crop_type": "rice",
  "season": "2026_spring",

  "inputs": {
    "soc_increase_t_per_ha": 0.42,
    "area_ha": 1.8,
    "yield_gain_percent": 12.3,
    "water_use_reduction_percent": 8.5,
    "mbt55_factor": 1.18
  },

  "context": {
    "country": "JP",
    "region": "Chiba",
    "method": "regenerative",
    "baseline_year": 2024
  },

  "computed": {
    "co2_sequestration_t": null,
    "soil_regeneration_index": null,
    "pbpe_value_jpy": null,
    "esg_score": null
  },

  "status": "pending", 
  "created_at": "2026-04-30T08:15:00",
  "updated_at": "2026-04-30T08:15:00"
}
```

**ポイントだけ整理すると：**

- **`inputs`：AGRIX から来る “生データ”**  
  SOC増加、面積、収量改善、水使用削減、MBT55係数など  
- **`context`：場所・栽培方法・ベースライン**  
- **`computed`：PH-API が計算して埋める “インパクト値”**  
  CO₂吸収量、土壌再生指数、PBPE価値、ESGスコア  
- **`status`：`pending` → `computed` → `settled` のような状態遷移**  

Stripe でいう：

- `amount` → `inputs`  
- `currency` → `context`（地域・制度）  
- `status` → 同じ概念  
- `charges` → 今回は `computed` に相当  

---

次のステップとしては：

- **2) AgriImpactSource（AGRIX データ標準化）**  
  → どのような AGRIX データを受け取るか、その最小セットを定義する

から進めますが、その前に一つだけ確認させてください。

**AGRIX 側で、すでに「SOC・収量・水・MBT55」などの項目は  
ある程度フィールドとして整理されていますか？**  

- はい → その構造に合わせて `inputs` をマッピングします  
- まだ → こちらで「MVP 用の AGRIX 標準フィールド案」を出します

[[PM7. AGRIX Data Standards（MVP）]]
