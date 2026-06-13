まだです。

---

了解しました。  
AGRIX 側のフィールドがまだ固まっていないので、ここから **「MVP（最小実装）として必要な AGRIX データ標準」** を、Planetary Health API の思想に合わせて **最適化した形でゼロから設計** します。

Stripe が「決済に必要な最小フィールド」を定義したように、  
AGRIX も「農業インパクト計算に必要な最小フィールド」を定義する必要があります。

以下は、**農業インパクト API を動かすために絶対に必要な最小セット**です。

---

# 🌱 AGRIX データ標準（MVP）  
**AgriImpactIntent の `inputs` に流し込むための AGRIX 最小フィールド**

Stripe の「amount」「currency」に相当する、  
農業インパクト計算の“核”となるデータです。

---

## 1. **土壌（Soil）データ — SOC を中心とした最小セット**
農業インパクトの 60% を決める最重要データ。

```
soil:
  soc_before: (t/ha)
  soc_after: (t/ha)
  area_ha: (ha)
  moisture: (%)
  ph: (optional)
  organic_matter: (optional)
```

**必須：**  
- `soc_before`  
- `soc_after`  
- `area_ha`

これだけで **CO₂吸収量** を計算できる。

---

## 2. **作物（Crop）データ — 収量と品質の最小セット**
農業インパクトの 30% を決めるデータ。

```
crop:
  crop_type: "rice" | "wheat" | "corn" | ...
  yield_before: (kg/ha)
  yield_after: (kg/ha)
  quality_index: (optional)
  stress_index: (optional)
```

**必須：**  
- `crop_type`  
- `yield_before`  
- `yield_after`

これで **収量改善インパクト** を計算できる。

---

## 3. **水（Water）データ — 水使用効率の最小セット**
農業インパクトの 10% を決めるデータ。

```
water:
  water_use_before: (L/ha)
  water_use_after: (L/ha)
```

**必須：**  
- `water_use_before`  
- `water_use_after`

これで **水使用削減インパクト** を計算できる。

---

## 4. **微生物・代謝（MBT55）データ — 土壌の生命力**
AGRIX × MBT55 の統合ポイント。

```
microbiome:
  mbt55_before: (index)
  mbt55_after: (index)
```

**必須：**  
- `mbt55_before`  
- `mbt55_after`

これで **土壌再生指数** を計算できる。

---

# 🌾 AGRIX → AgriImpactIntent のマッピング（MVP）

AGRIX の最小データを、AgriImpactIntent の `inputs` に変換するとこうなる。

```
inputs:
  soc_increase_t_per_ha = soc_after - soc_before
  area_ha = area_ha
  yield_gain_percent = (yield_after - yield_before) / yield_before * 100
  water_use_reduction_percent = (water_use_before - water_use_after) / water_use_before * 100
  mbt55_factor = mbt55_after / mbt55_before
```

Stripe の「amount」「payment_method_types」と同じく、  
**この5つが揃えば農業インパクトは計算できる**。

---

# 🌍 これで何ができるようになるか

### 1. **AgriImpactIntent が “7行コード” で作れる**
AGRIX → PH‑API へのデータが最小化されるため、  
Stripe のように **極端に短いコードで農業インパクトを生成**できる。

### 2. **Webhook（MRV自動化）が成立**
SOC・収量・水・MBT55 の変化がイベントとして扱える。

### 3. **価値分配（AgriImpactConnect）が成立**
PBPE価値、CO₂価値、生産者還元が自動化される。

### 4. **Checkout（可視化 UI）が成立**
CO₂吸収、土壌再生、収量改善、水削減、PBPE価値を  
統一 UI で表示できる。

---

# 🔥 次のステップ  
次は **AgriImpactWebhook（MRV 自動化のイベント設計）** に進みます。

その前に、確認したいことが一つあります。

---

# ❓ AGRIX のデータは「圃場単位」でしょうか？  
それとも「作物ロット単位」でしょうか？

- 圃場単位（field-based）  
- ロット単位（batch-based）  
- どちらも必要  

これにより、AgriImpactIntent の `field_id` / `crop_id` の扱いが変わります。

どれで進めますか。

[[PM8. AgriImpactWebhook_MRV automation for agricultural impact]]
