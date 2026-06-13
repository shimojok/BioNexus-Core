３が基本となると思います。

了解しました。  
**「生産者 40% / PBPE基金 40% / プラットフォーム 20%」を基本モデルとして採用**し、  
これを前提に **AgriImpactConnect（価値分配モデル）** を設計します。

Stripe Connect の「自動送金ロジック」を農業インパクトに置き換え、  
圃場単位で PBPE 価値が発生した瞬間に **自動で価値が分配される仕組み**を作ります。

---

# 🌾 AgriImpactConnect（価値分配モデル）  
**基本モデル：生産者 40% / PBPE基金 40% / プラットフォーム 20%**

このモデルは、  
- 生産者のインセンティブ  
- PBPE の気候価値の蓄積  
- プラットフォームの持続性  
を同時に満たす「バランス型モデル」です。

---

# 1. **価値分配の計算式（MVP）**

AgriImpactIntent の計算結果として得られる **PBPE価値（円）** を `V` とします。

```
farmer_reward = V * 0.40
pbpe_fund     = V * 0.40
platform_fee  = V * 0.20
```

Stripe Connect の「transfer」「application_fee_amount」に相当する概念です。

---

# 2. **AgriImpactConnect の JSON（MVP）**

Stripe Connect のレスポンス構造を参考に、  
Planetary Health API 用に最適化した JSON を定義します。

```json
{
  "connect_id": "agc_2026_0001",
  "intent_id": "agi_intent_2026_0001",
  "field_id": "field_45",

  "pbpe_value_jpy": 12800,

  "distribution": {
    "farmer_reward_jpy": 5120,
    "pbpe_fund_jpy": 5120,
    "platform_fee_jpy": 2560
  },

  "status": "settled",
  "settled_at": "2026-04-30T08:20:00"
}
```

---

# 3. **価値分配の発生タイミング**

Stripe と同じく、**イベント駆動**で動きます。

### ① AgriImpactIntent が計算完了  
→ `agriimpact.intent.computed`

### ② PBPE価値が確定  
→ `pbpe_value_jpy` が算出される

### ③ AgriImpactConnect が自動生成  
→ 分配ロジックが走る

### ④ 分配完了  
→ `agriimpact.connect.settled` が発火

---

# 4. **AgriImpactConnect のイベント（Webhook）**

Stripe Connect の `transfer.paid` に相当。

```
agriimpact.connect.settled
  intent_id
  field_id
  farmer_reward_jpy
  pbpe_fund_jpy
  platform_fee_jpy
  settled_at
```

これにより、  
**生産者・PBPE基金・プラットフォームがリアルタイムで価値を受け取る**。

---

# 5. **このモデルが生み出すメリット**

## 生産者（40%）
- PBPE価値が自動で還元される  
- SOC改善・収量改善のインセンティブが強化  
- 圃場単位で「価値の見える化」が進む  

## PBPE基金（40%）
- 気候価値が蓄積され、PBPEの信用力が上がる  
- 国際的な気候ファイナンスの基盤になる  

## プラットフォーム（20%）
- 持続的な運営資金を確保  
- Planetary Health API の拡張が可能  

---

# 6. **農業インパクトの価値分配が Stripe Connect を超える理由**

Stripe Connect は「お金の分配」。  
AgriImpactConnect は **「地球価値の分配」**。

- CO₂吸収  
- 土壌再生  
- 水使用削減  
- 微生物代謝改善  
- PBPE価値生成  

これらが **リアルタイムで価値化され、分配される**。

Stripe が「決済の OS」なら、  
Kaz の構想は **「地球価値の OS」** になる。

---

# 🔥 次のステップ  
次は **AgriImpactCheckout（可視化 UI のデータ契約）** に進みます。

Checkout は Stripe の「決済 UI」に相当し、  
農業インパクトでは **CO₂・土壌・収量・水・PBPE価値を一画面で可視化する UI** になります。

進めてよいでしょうか。

[[PM10. AgriImpactCheckout（UI）]]
