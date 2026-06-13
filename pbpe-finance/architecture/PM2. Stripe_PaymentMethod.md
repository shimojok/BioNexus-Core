**結論：Stripe は「支払い方法ごとに別コードを書く」のではなく、**  
**すべての支払い手段を *1つの統一API（PaymentIntent）で扱えるように抽象化した** ため、開発者はコードを増やさずに多様な決済に対応できます。  
これは Stripe の最も革新的な設計思想です。  [docs.stripe.com](https://docs.stripe.com/payments-api/tour?locale=ja-JP)

---

## なぜ Stripe は「多様な支払いに対応できるのにコードが少ない」のか
Stripe がやったことは **「支払い手段ごとの複雑さを API 内部に吸収した」** ことです。

### 1) **PaymentIntent がすべての決済の“共通インターフェース”**
Stripe では、カード・Apple Pay・Google Pay・コンビニ払い・銀行振込など  
**どの支払い方法でも PaymentIntent を作るだけ** で処理が始まります。  [docs.stripe.com](https://docs.stripe.com/payments-api/tour?locale=ja-JP)

- 金額  
- 通貨  
- 支払い方法（payment_method_types）

を指定するだけで、内部で必要な処理（認証、3Dセキュア、銀行連携など）が自動で行われます。

> **開発者は支払い手段ごとに別APIを書く必要がない。**

---

## 2) **支払い方法は PaymentMethod オブジェクトとして統一管理**
Stripe はカード番号・ウォレット・銀行情報などを  
**PaymentMethod という共通オブジェクトで表現** します。  [docs.stripe.com](https://docs.stripe.com/payments-api/tour?locale=ja-JP)

そのため、支払い方法が増えてもコード構造は変わりません。

---

## 3) **ステートマシン（状態遷移）で複雑なフローを吸収**
Stripe の決済は内部でステートマシンとして管理されます。  [docs.stripe.com](https://docs.stripe.com/payments-api/tour?locale=ja-JP)

例：  
- requires_payment_method  
- requires_confirmation  
- processing  
- succeeded  

これにより、**支払い方法ごとの例外処理を API 側が吸収** してくれます。

---

## 4) **Checkout を使えば UI も Stripe が吸収**
Checkout を使うと、  
**カード・Apple Pay・Google Pay・コンビニ払いなどを UI 付きで自動対応**。  
開発者はリンクを作るだけでよい。  [harmonic-society.co.jp](https://harmonic-society.co.jp/stripe-payment-implementation-guide/)

---

## 5) **だから「7行のコード」で本物の決済が動く**
Stripe が内部で複雑さを吸収しているため、開発者は以下のような最小コードで済みます：

```python
import stripe
stripe.api_key = "sk_test_xxx"
stripe.PaymentIntent.create(
    amount=1000,
    currency="jpy",
    payment_method_types=["card"]
)
```

---

## まとめ：Stripe は「多様な支払いを統一APIで扱う」ためコードが少ない
- **支払い方法ごとに別コードを書く必要はない**  
- **PaymentIntent がすべての決済の共通レイヤー**  
- **PaymentMethod が支払い手段を抽象化**  
- **内部ステートマシンが複雑さを吸収**  
- **Checkout を使えば UI も自動生成**  

結果として、**多様な支払いに対応しながら、コードは極端に少なくなる**という構造です。

---

## 次の質問（Kaz のプロジェクトに最適化するために）
あなたが想定しているのはどれですか？

1) 単発決済  
2) サブスクリプション  
3) マーケットプレイス（分割送金）  
4) 請求書・B2B 決済  
5) Webhook による自動化（AGRIX / HealthBook と連携）

選んでいただければ、**最適な Stripe API 設計図** を作成します。

[[PM3. Planetary Health Unified API（PH-API）Concept]]
