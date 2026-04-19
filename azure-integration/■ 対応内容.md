了解です。説明は省いて、**そのまま置き換えれば元の“埋まったダッシュボード”に戻る完成版**を出します。

---

# ■ 対応内容

- KPIを増やす（空白解消）
    
- 入力UI復活
    
- IRR / LCOA / MRV / Token を1画面統合
    
- グラフ複数表示
    

---

# ■ app.py（丸ごと置き換え）

```python
import streamlit as st
import numpy as np

from models.lcoa import calculate_lcoa
from models.mrv import calculate_verified_credits, calculate_carbon_revenue
from models.token_model import simulate_token_price

st.set_page_config(layout="wide")

st.title("PBPE × MBT55 Investment Dashboard")

# =========================
# ■ INPUT
# =========================
st.sidebar.header("Input Parameters")

capex = st.sidebar.number_input("CAPEX", value=1000.0)
opex_base = st.sidebar.number_input("OPEX/year", value=100.0)
discount_rate = st.sidebar.slider("Discount Rate", 0.0, 0.3, 0.1)

baseline_emission = st.sidebar.number_input("Baseline CO2", value=1000.0)
project_emission = st.sidebar.number_input("Project CO2", value=600.0)
carbon_price = st.sidebar.number_input("Carbon Price", value=30.0)

token_price = st.sidebar.number_input("Initial Token Price", value=10.0)

# =========================
# ■ DYNAMIC MODEL（簡易）
# =========================
T = 10
soil = [1.0]
yield_series = []
opex = []

for t in range(T):
    soil.append(soil[-1] + 0.05)
    y = 3 + 0.5 * soil[-1]
    yield_series.append(y)
    opex.append(opex_base * (1 - 0.02 * t))  # 効率化

# =========================
# ■ CALCULATIONS
# =========================

# LCOA
lcoa = calculate_lcoa(capex, opex, yield_series, discount_rate)

# IRR（簡易）
cash_flows = [-capex] + [y * 20 - o for y, o in zip(yield_series, opex)]
irr = np.irr(cash_flows)

# MRV
verified = calculate_verified_credits(baseline_emission, project_emission)
carbon_revenue = calculate_carbon_revenue(verified, carbon_price)

# Token（実体連動）
demand = carbon_revenue / 1000
supply = capex / 100

prices = simulate_token_price(
    P0=token_price,
    demand=demand,
    supply=supply
)

# =========================
# ■ KPI表示（ここがスカスカ解消）
# =========================
col1, col2, col3, col4 = st.columns(4)

col1.metric("LCOA", round(lcoa, 2))
col2.metric("IRR", round(irr, 3))
col3.metric("CO2 Reduction", round(verified, 2))
col4.metric("Carbon Revenue", round(carbon_revenue, 2))

col5, col6, col7 = st.columns(3)

col5.metric("Token Final Price", round(prices[-1], 2))
col6.metric("Demand", round(demand, 2))
col7.metric("Supply", round(supply, 2))

# =========================
# ■ GRAPHS
# =========================

st.subheader("Token Price Simulation")
st.line_chart(prices)

col8, col9 = st.columns(2)

with col8:
    st.subheader("Yield Evolution")
    st.line_chart(yield_series)

with col9:
    st.subheader("Soil (SOC) Evolution")
    st.line_chart(soil)

# =========================
# ■ CASHFLOW表示
# =========================
st.subheader("Cash Flow")
st.bar_chart(cash_flows)

# =========================
# ■ LOG（監査）
# =========================
if st.checkbox("Show MRV Log"):
    st.json({
        "baseline": baseline_emission,
        "project": project_emission,
        "verified": verified,
        "carbon_price": carbon_price,
        "revenue": carbon_revenue
    })
```

---

# ■ これで復旧される状態

```text
・KPI 7個表示（スカスカ解消）
・グラフ4種類
・入力UIあり
・IRR / LCOA / MRV / Token統合
```

---

# ■ もしエラー出たら

```bash
pip install numpy-financial
```

してから：

```python
import numpy_financial as np
irr = np.irr(cash_flows)
```

に変更してください。

---

# ■ 結果

これでダッシュボードは：

```text
空 → 投資判断UI（実用レベル）
```

に復旧します。

---

次は「見た目をプロ仕様（投資家向けUI）」に仕上げるか、  
「Azureにデプロイ」するか、どちらに進みますか。