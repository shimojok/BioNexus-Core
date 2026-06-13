前者でしょうね。

---

了解しました。  
**AGRIX は「圃場単位（field-based）」で進める。**  
これは Planetary Health API の農業インパクト設計として最も合理的で、  
MRV（測定・報告・検証）や PBPE 価値生成にも最適です。

ここからは、圃場単位を前提に **次のステップ：AgriImpactWebhook（MRV 自動化のイベント設計）** に進みます。

---

# 🌾 AgriImpactWebhook（農業インパクトの MRV 自動化）  
**Stripe の Webhook を農業インパクトに完全対応させた設計**

Webhook は「イベントが発生した瞬間に通知する仕組み」。  
Stripe では「支払い成功」「返金」「失敗」など。  
AGRIX では「SOC 増加」「収量改善」「水削減」「MBT55 改善」など。

圃場単位での MRV を自動化するため、  
**農業インパクトに特化した 7 種類のイベント** を定義します。

---

# 🌱 **AgriImpactWebhook：7つの標準イベント（MVP）**

## 1. **soil.soc.updated**  
SOC（炭素量）が変化した瞬間に発火。

```
soil.soc.updated
  field_id
  soc_before
  soc_after
  delta
  area_ha
```

→ CO₂吸収量の再計算が自動で走る。

---

## 2. **crop.yield.updated**  
収量が変化した瞬間に発火。

```
crop.yield.updated
  field_id
  yield_before
  yield_after
  delta_percent
```

→ 収量改善インパクトが自動更新。

---

## 3. **water.use.updated**  
水使用量が変化した瞬間に発火。

```
water.use.updated
  field_id
  before
  after
  reduction_percent
```

→ 水使用削減インパクトが自動更新。

---

## 4. **microbiome.mbt55.updated**  
MBT55（微生物代謝指数）が変化した瞬間に発火。

```
microbiome.mbt55.updated
  field_id
  mbt55_before
  mbt55_after
  factor
```

→ 土壌再生指数が自動更新。

---

## 5. **agriimpact.intent.created**  
AgriImpactIntent が生成された瞬間。

```
agriimpact.intent.created
  intent_id
  field_id
  inputs
```

→ Stripe の payment_intent.created と同じ役割。

---

## 6. **agriimpact.intent.computed**  
インパクト計算が完了した瞬間。

```
agriimpact.intent.computed
  intent_id
  computed:
    co2_sequestration_t
    soil_regeneration_index
    pbpe_value_jpy
    esg_score
```

→ Stripe の payment_intent.succeeded に相当。

---

## 7. **agriimpact.connect.settled**  
価値分配（PBPE、生産者還元）が完了した瞬間。

```
agriimpact.connect.settled
  intent_id
  farmer_reward_jpy
  pbpe_value_jpy
  climate_fund_jpy
```

→ Stripe Connect の transfer.paid に相当。

---

# 🌍 **Webhook が成立すると何が起きるか（圃場単位の MRV 自動化）**

### ① SOC が変わる → 自動で CO₂吸収量が更新  
### ② 収量が変わる → 自動で収量改善価値が更新  
### ③ 水使用が変わる → 自動で水削減価値が更新  
### ④ MBT55 が変わる → 自動で土壌再生指数が更新  
### ⑤ インパクト計算が完了 → PBPE価値が生成  
### ⑥ 価値分配が完了 → 生産者に自動還元  

Stripe の「決済 → 入金 → 通知」の流れが、  
AGRIX では「データ → インパクト → 価値分配」に置き換わる。

---

# 🔥 次のステップ  
次は **AgriImpactConnect（価値分配モデル）** に進みます。

ここで確認したいことがひとつあります。

---

# ❓ PBPE価値の分配モデルは、どれが理想ですか  
（圃場単位の価値分配）

1) **生産者 70% / PBPE基金 20% / プラットフォーム 10%**  
2) **生産者 50% / PBPE基金 30% / 地域自治体 20%**  
3) **生産者 40% / PBPE基金 40% / プラットフォーム 20%**  
4) **カスタム（Kaz が新しいモデルを作る）**

どれで進めますか。

[[PM9. AgriImpactConnect_Value distribution model]]
