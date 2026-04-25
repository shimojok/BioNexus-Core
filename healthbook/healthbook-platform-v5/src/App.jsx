import { useState, useCallback, useMemo } from "react";

// ============================================================
// 言語設定
// ============================================================
const T = {
  en: {
    title: "HealthBook Platform",
    subtitle: "Hamada 200-Item Questionnaire × 135 Disease Matrix × 293 Kampo Formulas × MBT55",
    version: "v5.0 — Bilingual Full Edition",
    startBtn: "Start Questionnaire (200 items) →",
    demoBtn: "Try with sample data",
    answeredOf: "answered",
    page: "Page",
    next: "Next →",
    prev: "← Prev",
    skip: "Skip & Analyze",
    analyze: "Run Analysis 🔬",
    analyzing: "Analyzing...",
    score: "Metabolic Health Score",
    scoreDesc: "/ 100 (higher = better metabolic health)",
    tabs: ["Disease Risk","Kampo Rx","MBT55 Pathway","Metabolic Analysis","API"],
    riskTitle: "Disease Risk Assessment (ICD-11 / Evidence Level)",
    noRisk: "No significant risks detected.",
    rfTitle: "Detected Risk Factors (weighted)",
    kampoTitle: "Recommended Kampo Formulas (from 293-formula library)",
    kampoNote: "⚠️ Kampo formulas must be used under guidance of a physician or pharmacist.",
    pathwayTitle: "MBT55 Five Metabolic Pathways — Intervention Priority",
    metabolicTitle: "Metabolic Pathway Impact Analysis",
    noMetabolic: "No metabolic impacts detected.",
    apiTitle: "Enterprise API — JSON Output",
    backToQ: "← Back to Questionnaire",
    restart: "Start Over",
    disclaimer: "This system is for metabolic pathway analysis and dietary guidance only. Not for medical diagnosis or treatment.",
    catLabel: { eating_habits:"Eating Habits", lifestyle:"Lifestyle", symptoms:"Symptoms", comprehensive:"General" },
    ansOpts: ["Often","Sometimes","No"],
    highRisk:"High", midHighRisk:"Mid-High", midRisk:"Mid", lowRisk:"Low",
    need:"🔴 Needs attention", caution:"🟡 Caution", good:"🟢 Good",
    evLabel: "Evidence",
    expandKampo: "▼ Kampo",
    collapseKampo: "▲ Close",
    steps:[
      "Parsing questionnaire responses…",
      "Extracting Hamada dietary risk factors…",
      "Matching against 135-disease matrix (ICD-11)…",
      "Identifying metabolic pathway blockages…",
      "Calculating MBT55 five-pathway activity…",
      "Querying disease_matrix_137_kampo.json…",
      "Selecting optimal formulas from 293-formula library…",
    ]
  },
  ja: {
    title: "HealthBook Platform",
    subtitle: "浜田式200問診 × 135疾病マトリックス × 293漢方処方 × MBT55",
    version: "v5.0 — 日英バイリンガル全200問完全版",
    startBtn: "問診を開始する（全200問）→",
    demoBtn: "サンプルデータで試す",
    answeredOf: "問回答済み",
    page: "ページ",
    next: "次へ →",
    prev: "← 前",
    skip: "スキップして分析",
    analyze: "分析を実行する 🔬",
    analyzing: "解析中…",
    score: "代謝健康スコア",
    scoreDesc: "/ 100（高いほど代謝環境が良好）",
    tabs: ["疾病リスク","漢方処方","MBT55経路","代謝解析","API"],
    riskTitle: "疾病リスク評価（ICD-11対応 / エビデンスレベル付き）",
    noRisk: "主要なリスクは検出されませんでした。",
    rfTitle: "検出リスク因子（重み順）",
    kampoTitle: "推奨漢方処方（293処方ライブラリーより選定）",
    kampoNote: "⚠️ 漢方処方は必ず医師・薬剤師の指導のもとで使用してください。",
    pathwayTitle: "MBT55 五代謝経路 介入優先度マップ",
    metabolicTitle: "代謝経路インパクト解析（浜田式）",
    noMetabolic: "代謝への影響は検出されませんでした。",
    apiTitle: "Enterprise API — JSON出力",
    backToQ: "← 問診に戻る",
    restart: "最初から",
    disclaimer: "本システムは代謝経路解析・食生活改善支援ツールです。医療診断・治療の代替ではありません。",
    catLabel: { eating_habits:"食習慣", lifestyle:"生活習慣", symptoms:"症状", comprehensive:"総合" },
    ansOpts: ["よくある","ときどき","なし"],
    highRisk:"高", midHighRisk:"中高", midRisk:"中", lowRisk:"低",
    need:"🔴 要介入", caution:"🟡 注意", good:"🟢 良好",
    evLabel: "根拠",
    expandKampo: "▼ 漢方",
    collapseKampo: "▲ 閉じる",
    steps:[
      "問診データ解析中（200問）…",
      "浜田式食生活リスク因子を抽出中…",
      "135疾患マトリックス（ICD-11）と照合中…",
      "代謝経路の詰まりを特定中…",
      "MBT55五経路活性度を算出中…",
      "disease_matrix_137_kampo.json と照合中…",
      "293漢方処方ライブラリーから最適処方を選定中…",
    ]
  }
};

// ============================================================
// 問診データ — 全200問 日英バイリンガル
// Source: questionnaire_200_en_new.json × questionnaire_200_jp_new.json
// ============================================================
const Q = {
"1":{"qe":"Meal times are irregular","qj":"食事の時間が不定である","cat":"eating_habits","rf":["不規則型"],"me":"Disrupted digestive rhythm → autonomic nervous system load","mj":"消化リズムの乱れ → 自律神経負荷","w":0.7},
"2":{"qe":"Often skip breakfast","qj":"朝食を抜くことがよくある","cat":"eating_habits","rf":["欠食型（朝食抜き）"],"me":"Disrupted gluconeogenesis rhythm → morning hypoglycemia tendency","mj":"糖新生リズムの乱れ → 午前中の低血糖傾向","w":0.85},
"3":{"qe":"Often eat late-night snacks before bed","qj":"よく寝る前に夜食を食べる","cat":"eating_habits","rf":["夜食方(寝る前の食事）"],"me":"Gastrointestinal burden → reduced lipid metabolism → poor sleep quality","mj":"胃腸負担 → 脂質代謝低下 → 睡眠質低下","w":0.8},
"4":{"qe":"Eat quickly","qj":"早食いである","cat":"eating_habits","rf":["早食い型"],"me":"Insufficient chewing → reduced digestive enzyme secretion → glucose metabolism burden","mj":"咀嚼不足 → 消化酵素分泌低下 → 糖代謝負荷","w":0.75},
"5":{"qe":"Eat until completely full","qj":"腹いっぱい食べる","cat":"eating_habits","rf":["暴飲・暴食型"],"me":"Gastric distension → insulin spike → fat accumulation","mj":"胃拡張 → インスリン急上昇 → 脂肪蓄積","w":0.78},
"6":{"qe":"Eat everything served without leaving leftovers","qj":"出されたものは残さず食べる","cat":"eating_habits","rf":["暴飲・暴食型"],"me":"Blunted satiety center → excessive intake","mj":"満腹中枢の鈍化 → 過剰摂取","w":0.6},
"7":{"qe":"Eat large portions of rice with little side dishes","qj":"米飯は山盛りでおかずは少々","cat":"eating_habits","rf":["甘物"],"me":"Rapid blood glucose spike → insulin resistance","mj":"血糖急上昇 → インスリン抵抗性","w":0.82},
"8":{"qe":"Snack frequently","qj":"間食が多い","cat":"eating_habits","rf":["間食多い"],"me":"Increased blood glucose variability → pancreatic burden","mj":"血糖変動幅の増大 → 膵臓負荷","w":0.88},
"9":{"qe":"Prefer salty foods","qj":"塩辛い食べものが好き","cat":"eating_habits","rf":["塩分"],"me":"Excess sodium → elevated blood pressure","mj":"ナトリウム過剰 → 血圧上昇","w":0.9},
"10":{"qe":"Eat many meat dishes","qj":"肉料理が多い","cat":"eating_habits","rf":["脂肪","肉多い"],"me":"Excess saturated fatty acids → lipid metabolism burden","mj":"飽和脂肪酸の過剰 → 脂質代謝負荷","w":0.8},
"11":{"qe":"Dine out frequently","qj":"外食が多い","cat":"eating_habits","rf":["外食多い型"],"me":"Excess fat, salt, carbohydrates → metabolic overload","mj":"脂質・塩分・糖質の過剰摂取 → 代謝負荷増大","w":0.82},
"12":{"qe":"Often eat simple, quick meals","qj":"簡単な食事で済ますことがある","cat":"eating_habits","rf":["野菜少ない","大豆製品(植物性たんぱく質)少ない"],"me":"Vitamin and mineral deficiency → reduced enzyme activity","mj":"ビタミン・ミネラル不足 → 酵素活性低下","w":0.7},
"13":{"qe":"Prefer Western-style food","qj":"洋食中心である","cat":"eating_habits","rf":["脂肪","洋食好み"],"me":"Excess saturated fatty acids → lipid metabolism burden","mj":"飽和脂肪酸の過剰 → 脂質代謝負荷","w":0.75},
"14":{"qe":"Have many food preferences (picky eating)","qj":"食べものの好き嫌いが多い","cat":"eating_habits","rf":["偏食型"],"me":"Nutritional imbalance → metabolic dysfunction","mj":"栄養素の偏り → 代謝の不均衡","w":0.72},
"15":{"qe":"Use strong spices","qj":"刺激の強い香辛料を使う","cat":"eating_habits","rf":["刺激物"],"me":"Gastric mucosal irritation → gastritis risk elevation","mj":"胃粘膜刺激 → 胃炎リスク上昇","w":0.68},
"16":{"qe":"Tend to dislike fish","qj":"魚は嫌いなほうである","cat":"eating_habits","rf":["青魚を食べない","魚介類食べない"],"me":"Insufficient anti-inflammatory fatty acids → inflammatory tendency","mj":"抗炎症脂肪酸不足 → 炎症傾向","w":0.78},
"17":{"qe":"Tend to dislike meat","qj":"肉類は嫌いなほうである","cat":"eating_habits","rf":["肉食べない"],"me":"Reduced muscle mass → decreased basal metabolism","mj":"筋量低下 → 基礎代謝低下","w":0.65},
"18":{"qe":"Tend to dislike dark-colored vegetables","qj":"色の濃い野菜は嫌いなほうである","cat":"eating_habits","rf":["野菜少ない"],"me":"Phytochemical deficiency → increased oxidative stress","mj":"ファイトケミカル不足 → 酸化ストレス増大","w":0.8},
"19":{"qe":"Tend to dislike dairy products","qj":"牛乳・乳製品は嫌いなほうである","cat":"eating_habits","rf":["乳製品少ない"],"me":"Reduced bone metabolism → decreased bone density","mj":"骨代謝低下 → 骨密度低下","w":0.7},
"20":{"qe":"Tend to dislike fruit","qj":"果物は嫌いなほうである","cat":"eating_habits","rf":["野菜少ない"],"me":"Insufficient antioxidant vitamins → immune decline","mj":"抗酸化ビタミン不足 → 免疫低下","w":0.68},
"21":{"qe":"Prefer fatty or greasy foods","qj":"脂っこいものが好き","cat":"eating_habits","rf":["脂肪"],"me":"Elevated triglycerides → lipid metabolism burden","mj":"中性脂肪上昇 → 脂質代謝負荷","w":0.88},
"22":{"qe":"Eat 2 or more eggs daily","qj":"1日に卵を2個以上食べる","cat":"eating_habits","rf":["乳製品多い"],"me":"Lipid metabolism burden → LDL elevation tendency","mj":"脂質代謝負荷 → LDL上昇傾向","w":0.65},
"23":{"qe":"Sweat heavily and feel thirsty often","qj":"汗っかきでのどが渇くことが多い","cat":"eating_habits","rf":["塩分","水分摂取少ない"],"me":"Dehydration tendency → blood concentration → circulatory burden","mj":"脱水傾向 → 血液濃縮 → 循環負荷","w":0.72},
"24":{"qe":"Like sweet drinks and sweets","qj":"清涼飲料水や甘いものが好き","cat":"eating_habits","rf":["甘物"],"me":"Rapid blood glucose spike → insulin resistance","mj":"血糖急上昇 → インスリン抵抗性","w":0.92},
"25":{"qe":"Drink alcohol every day","qj":"お酒は毎日飲む","cat":"eating_habits","rf":["飲酒(10年以上の大酒）"],"me":"Hepatic metabolic burden → fatty liver risk","mj":"肝代謝負荷 → 脂肪肝リスク","w":0.9},
"26":{"qe":"Drink heavily once starting","qj":"お酒は飲み出すとたくさん飲む","cat":"eating_habits","rf":["飲酒"],"me":"Acute hepatic burden → lipid metabolism disorder","mj":"急性肝負荷 → 脂質代謝障害","w":0.88},
"27":{"qe":"Skip meals when drinking","qj":"お酒を飲むと食事をしない","cat":"eating_habits","rf":["飲酒時少食型","野菜少ない"],"me":"Malnutrition → hepatic metabolic disorder","mj":"低栄養 → 肝代謝障害","w":0.75},
"28":{"qe":"Drink 5 or more cups of coffee daily","qj":"コーヒーは1日に5杯以上飲む","cat":"eating_habits","rf":["カフェイン"],"me":"Sympathetic nervous system stimulation → elevated blood pressure and sleep disturbance","mj":"交感神経刺激 → 血圧上昇・睡眠障害","w":0.7},
"29":{"qe":"Tend to dislike mushrooms and seaweed","qj":"きのこや海藻は嫌いなほうである","cat":"eating_habits","rf":["野菜少ない","海草少ない"],"me":"Deteriorated gut environment → constipation and inflammation tendency","mj":"腸内環境悪化 → 便秘・炎症傾向","w":0.78},
"30":{"qe":"Prefer hot foods and drinks","qj":"熱い食べもの・飲みものが好き","cat":"eating_habits","rf":["熱物"],"me":"Esophageal mucosal irritation → inflammation risk","mj":"食道粘膜刺激 → 炎症リスク","w":0.6},
"31":{"qe":"Drink cold beverages frequently","qj":"冷たい飲みものをよく飲む","cat":"eating_habits","rf":["空腹時の清涼飲料水"],"me":"Gastrointestinal cooling → reduced digestive enzymes → metabolic decline","mj":"胃腸冷却 → 消化酵素低下 → 代謝低下","w":0.72},
"32":{"qe":"Frequently eat instant/processed foods","qj":"インスタント食品をよく食べる","cat":"eating_habits","rf":["加工食品やインスタント食品をよく食べる"],"me":"Food additive burden → increased hepatic metabolic load","mj":"添加物負荷 → 肝代謝負担増大","w":0.85},
"33":{"qe":"Frequently eat fried foods","qj":"揚げ物をよく食べる","cat":"eating_habits","rf":["脂肪"],"me":"Increased oxidative stress → lipid metabolism disorder","mj":"酸化ストレス増大 → 脂質代謝障害","w":0.9},
"34":{"qe":"Frequently eat salty pickles","qj":"塩辛い漬物をよく食べる","cat":"eating_habits","rf":["塩分"],"me":"Excess sodium → elevated blood pressure","mj":"ナトリウム過剰 → 血圧上昇","w":0.88},
"35":{"qe":"Frequently eat sweet snacks","qj":"甘いお菓子をよく食べる","cat":"eating_habits","rf":["甘物"],"me":"Blood glucose fluctuations → insulin resistance","mj":"血糖変動 → インスリン抵抗性","w":0.92},
"36":{"qe":"Frequently eat bread or noodles","qj":"パンや麺類をよく食べる","cat":"eating_habits","rf":["甘物"],"me":"Rapid blood glucose spike → pancreatic burden","mj":"血糖急上昇 → 膵臓負荷","w":0.8},
"37":{"qe":"Prefer strong-flavored food","qj":"味の濃い料理が好き","cat":"eating_habits","rf":["塩分"],"me":"Increased renal burden → elevated blood pressure","mj":"腎負担増大 → 血圧上昇","w":0.85},
"38":{"qe":"Eat meals quickly (fast eater)","qj":"食事の時間が短い（早食い）","cat":"eating_habits","rf":["早食い型"],"me":"Insufficient chewing → indigestion → rapid blood glucose spike","mj":"咀嚼不足 → 消化不良 → 血糖急上昇","w":0.78},
"39":{"qe":"Do not chew well during meals","qj":"食事中にあまり噛まない","cat":"eating_habits","rf":["早食い型"],"me":"Reduced digestive enzyme secretion → decreased nutrient absorption","mj":"消化酵素分泌低下 → 栄養吸収低下","w":0.75},
"40":{"qe":"Meal portions vary greatly day to day","qj":"食事の量が日によって大きく変わる","cat":"eating_habits","rf":["不規則型"],"me":"Unstable blood glucose regulation → autonomic nervous system burden","mj":"血糖調節不安定 → 自律神経負荷","w":0.7},
"41":{"qe":"Often eat late at night","qj":"夜遅くに食事をすることが多い","cat":"eating_habits","rf":["不規則型","夜食方(寝る前の食事）"],"me":"Reduced lipid metabolism → fat accumulation","mj":"脂質代謝低下 → 脂肪蓄積","w":0.88},
"42":{"qe":"Eat a light breakfast","qj":"朝食は軽く済ませる","cat":"eating_habits","rf":["欠食型（朝食抜き）"],"me":"Morning hypoglycemia → decreased concentration","mj":"午前中の低血糖 → 集中力低下","w":0.68},
"43":{"qe":"Often eat lunch at restaurants","qj":"昼食は外食が多い","cat":"eating_habits","rf":["外食多い型"],"me":"Excess fat and salt → metabolic burden","mj":"脂質・塩分過多 → 代謝負荷","w":0.8},
"44":{"qe":"Often eat dinner late","qj":"夕食が遅くなることが多い","cat":"eating_habits","rf":["不規則型"],"me":"Digestive burden → poor sleep quality","mj":"消化負担 → 睡眠質低下","w":0.75},
"45":{"qe":"Eat large portions at dinner","qj":"夕食の量が多い","cat":"eating_habits","rf":["暴飲・暴食型"],"me":"Fat accumulation → elevated blood glucose","mj":"脂肪蓄積 → 血糖上昇","w":0.85},
"46":{"qe":"Often lie down immediately after eating","qj":"食後すぐに横になることが多い","cat":"eating_habits","rf":["早食い型"],"me":"Gastric reflux → increased risk of reflux esophagitis","mj":"胃内容物の逆流 → 逆流性食道炎リスク上昇","w":0.7},
"47":{"qe":"Always eat something sweet after meals","qj":"食後に甘いものを必ず食べる","cat":"eating_habits","rf":["甘物","間食多い"],"me":"Rapid blood glucose spike → pancreatic burden","mj":"血糖急上昇 → 膵臓負荷","w":0.9},
"48":{"qe":"Drink large amounts of fluid during meals","qj":"食事中に水分を多く取る","cat":"eating_habits","rf":["空腹時の清涼飲料水"],"me":"Reduced digestive power → decreased nutrient absorption","mj":"消化力低下 → 栄養吸収低下","w":0.65},
"49":{"qe":"Watch TV or phone during meals","qj":"食事中にテレビやスマホを見る","cat":"eating_habits","rf":["早食い型"],"me":"Blunted satiety center → overeating","mj":"満腹中枢の鈍化 → 過食","w":0.72},
"50":{"qe":"Meal timing varies daily","qj":"食事の時間帯が毎日バラバラである","cat":"eating_habits","rf":["不規則型"],"me":"Disrupted metabolic rhythm → unstable blood glucose regulation","mj":"代謝リズムの乱れ → 血糖調節不安定","w":0.78},
"51":{"qe":"Sleep hours are irregular","qj":"睡眠時間が不規則である","cat":"lifestyle","rf":["不規則型"],"me":"Disrupted autonomic nervous system → reduced metabolic rhythm","mj":"自律神経の乱れ → 代謝リズム低下","w":0.85},
"52":{"qe":"Difficulty falling asleep","qj":"寝つきが悪い","cat":"lifestyle","rf":["不規則型"],"me":"Sympathetic dominance → poor sleep quality","mj":"交感神経優位 → 睡眠の質低下","w":0.78},
"53":{"qe":"Often wake up during the night","qj":"夜中に目が覚めることが多い","cat":"lifestyle","rf":["不規則型"],"me":"Fragmented sleep → hormonal imbalance","mj":"睡眠分断 → ホルモンバランス乱れ","w":0.8},
"54":{"qe":"Hard to wake up in the morning","qj":"朝起きるのがつらい","cat":"lifestyle","rf":["不規則型"],"me":"Adrenal fatigue → metabolic decline","mj":"副腎疲労 → 代謝低下","w":0.75},
"55":{"qe":"Lack of exercise","qj":"運動不足である","cat":"lifestyle","rf":["暴飲・暴食型"],"me":"Reduced muscle mass → decreased basal metabolism","mj":"筋量低下 → 基礎代謝低下","w":0.92},
"56":{"qe":"Sit for long periods","qj":"座っている時間が長い","cat":"lifestyle","rf":["暴飲・暴食型"],"me":"Blood flow stagnation → increased insulin resistance","mj":"血流停滞 → インスリン抵抗性上昇","w":0.85},
"57":{"qe":"Walk slowly","qj":"歩くスピードが遅い","cat":"lifestyle","rf":["大豆製品(植物性たんぱく質)少ない"],"me":"Lower limb muscle weakness → reduced metabolic efficiency","mj":"下肢筋力低下 → 代謝効率低下","w":0.7},
"58":{"qe":"Often avoid stairs","qj":"階段を避けることが多い","cat":"lifestyle","rf":["暴飲・暴食型"],"me":"Reduced cardiorespiratory function → metabolic decline","mj":"心肺機能低下 → 代謝低下","w":0.72},
"59":{"qe":"Spend most holidays at home","qj":"休日はほとんど家で過ごす","cat":"lifestyle","rf":["暴飲・暴食型"],"me":"Reduced energy expenditure → weight gain","mj":"エネルギー消費低下 → 体重増加","w":0.68},
"60":{"qe":"Prone to stress","qj":"ストレスを感じやすい","cat":"lifestyle","rf":["刺激物"],"me":"Cortisol elevation → fat accumulation and blood glucose rise","mj":"コルチゾール上昇 → 脂肪蓄積・血糖上昇","w":0.9},
"61":{"qe":"Easily irritated","qj":"イライラしやすい","cat":"lifestyle","rf":["カフェイン","刺激物"],"me":"Cortisol elevation → blood glucose rise and fat accumulation","mj":"コルチゾール上昇 → 血糖上昇・脂肪蓄積","w":0.85},
"62":{"qe":"Difficulty sustaining concentration","qj":"集中力が続かない","cat":"lifestyle","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced neural metabolism → cognitive decline","mj":"神経代謝低下 → 認知機能低下","w":0.72},
"63":{"qe":"Severe shoulder stiffness","qj":"肩こりがひどい","cat":"lifestyle","rf":["脂肪","水分摂取少ない"],"me":"Muscle tension → reduced peripheral circulation","mj":"筋緊張 → 末梢循環低下","w":0.7},
"64":{"qe":"Frequent headaches","qj":"頭痛がよく起こる","cat":"lifestyle","rf":["塩分","刺激物"],"me":"Reduced cerebral blood flow → oxygen supply deficiency","mj":"脳血流低下 → 酸素供給不足","w":0.78},
"65":{"qe":"Eyes tire easily","qj":"目が疲れやすい","cat":"lifestyle","rf":["野菜少ない","水分摂取少ない"],"me":"Eye muscle fatigue → increased oxidative stress","mj":"眼筋疲労 → 酸化ストレス増大","w":0.68},
"66":{"qe":"Hands and feet get cold easily","qj":"手足が冷えやすい","cat":"lifestyle","rf":["水分摂取少ない"],"me":"Reduced blood flow → metabolic decline","mj":"血流低下 → 代謝低下","w":0.8},
"67":{"qe":"Rarely sweat","qj":"汗をかきにくい","cat":"lifestyle","rf":["不規則型"],"me":"Poor thermoregulation → reduced metabolic efficiency","mj":"体温調節不良 → 代謝効率低下","w":0.75},
"68":{"qe":"Often constipated","qj":"便秘がちである","cat":"lifestyle","rf":["加工食品やインスタント食品をよく食べる","野菜少ない"],"me":"Reduced intestinal metabolism → toxin reabsorption","mj":"腸代謝低下 → 毒素再吸収","w":0.92},
"69":{"qe":"Prone to diarrhea","qj":"下痢しやすい","cat":"lifestyle","rf":["早食い型","刺激物"],"me":"Reduced nutrient absorption → metabolic decline","mj":"栄養吸収低下 → 代謝低下","w":0.78},
"70":{"qe":"Catch colds easily","qj":"風邪をひきやすい","cat":"lifestyle","rf":["野菜少ない"],"me":"Reduced immune metabolism → increased infection risk","mj":"免疫代謝低下 → 感染リスク上昇","w":0.88},
"71":{"qe":"Tire easily","qj":"疲れやすい","cat":"lifestyle","rf":["暴飲・暴食型","欠食型（朝食抜き）"],"me":"Reduced ATP production → systemic metabolic efficiency decline","mj":"ATP産生低下 → 全身代謝効率の低下","w":0.88},
"72":{"qe":"Often feel physically sluggish","qj":"体がだるいことが多い","cat":"lifestyle","rf":["不規則型"],"me":"Disrupted metabolic rhythm → energy deficiency","mj":"代謝リズムの乱れ → エネルギー不足","w":0.8},
"73":{"qe":"Easily feel depressed","qj":"気分が落ち込みやすい","cat":"lifestyle","rf":["刺激物","魚介類食べない"],"me":"Reduced serotonin metabolism → emotional instability","mj":"セロトニン代謝低下 → 情動不安定","w":0.82},
"74":{"qe":"Often lack motivation","qj":"やる気が出ないことが多い","cat":"lifestyle","rf":["欠食型（朝食抜き）","魚介類食べない"],"me":"Reduced neural metabolism → decreased motivation","mj":"神経代謝低下 → 意欲低下","w":0.78},
"75":{"qe":"Weight tends to increase","qj":"体重が増えやすい","cat":"lifestyle","rf":["暴飲・暴食型","脂肪"],"me":"Decreased basal metabolism → fat accumulation","mj":"基礎代謝低下 → 脂肪蓄積","w":0.92},
"76":{"qe":"Weight tends to decrease","qj":"体重が減りやすい","cat":"lifestyle","rf":["早食い型","魚介類食べない"],"me":"Hypermetabolism or malabsorption → weight loss","mj":"代謝過剰または吸収不良 → 体重減少","w":0.75},
"77":{"qe":"Often experience swelling/edema","qj":"むくみやすい","cat":"lifestyle","rf":["塩分","水分摂取少ない"],"me":"Poor fluid regulation → edema","mj":"体液調節不良 → 浮腫","w":0.85},
"78":{"qe":"Skin tends to be rough","qj":"肌が荒れやすい","cat":"lifestyle","rf":["野菜少ない","加工食品やインスタント食品をよく食べる"],"me":"Reduced skin metabolism → impaired barrier function","mj":"皮膚代謝低下 → バリア機能低下","w":0.8},
"79":{"qe":"Hair tends to fall out easily","qj":"髪が抜けやすい","cat":"lifestyle","rf":["野菜少ない","不規則型"],"me":"Reduced follicle metabolism → hair loss","mj":"毛包代謝低下 → 脱毛","w":0.78},
"80":{"qe":"Nails tend to break easily","qj":"爪が割れやすい","cat":"lifestyle","rf":["肉食べない","海草少ない"],"me":"Reduced keratin metabolism → brittle nails","mj":"ケラチン代謝低下 → 爪脆弱化","w":0.72},
"81":{"qe":"Easily get out of breath","qj":"息切れしやすい","cat":"lifestyle","rf":["暴飲・暴食型","肉食べない"],"me":"Oxygen supply deficiency → reduced energy metabolism","mj":"酸素供給不足 → エネルギー代謝低下","w":0.82},
"82":{"qe":"Sometimes experience palpitations","qj":"動悸を感じることがある","cat":"lifestyle","rf":["刺激物","不規則型"],"me":"Excessive sympathetic nervous activity → elevated heart rate","mj":"交感神経過剰 → 心拍数上昇","w":0.8},
"83":{"qe":"Prone to hot flashes","qj":"のぼせやすい","cat":"lifestyle","rf":["水分摂取少ない"],"me":"Disrupted thermoregulation → autonomic nervous system burden","mj":"体温調節の乱れ → 自律神経負荷","w":0.72},
"84":{"qe":"Experience dizziness when standing up","qj":"立ちくらみがある","cat":"lifestyle","rf":["欠食型（朝食抜き）","肉食べない"],"me":"Reduced cerebral blood flow → oxygen supply deficiency","mj":"脳血流低下 → 酸素供給不足","w":0.78},
"85":{"qe":"Sometimes experience numbness in hands or feet","qj":"手足がしびれることがある","cat":"lifestyle","rf":["魚介類食べない","水分摂取少ない"],"me":"Reduced peripheral nerve metabolism → sensory abnormalities","mj":"末梢神経の代謝低下 → 感覚異常","w":0.8},
"86":{"qe":"Yawn frequently","qj":"よくあくびが出る","cat":"lifestyle","rf":["野菜少ない","欠食型（朝食抜き）"],"me":"Reduced brain metabolism → increased oxygen demand","mj":"脳代謝低下 → 酸素要求増大","w":0.65},
"87":{"qe":"Neck and shoulders become stiff when concentrating","qj":"集中すると肩や首がこる","cat":"lifestyle","rf":["脂肪"],"me":"Reduced local blood flow → lactic acid accumulation","mj":"局所血流低下 → 乳酸蓄積","w":0.7},
"88":{"qe":"Wake up sweating at night","qj":"寝汗をかくことがある","cat":"lifestyle","rf":["不規則型"],"me":"Abnormal thermoregulation → poor sleep quality","mj":"体温調節異常 → 睡眠質低下","w":0.75},
"89":{"qe":"Frequently sigh","qj":"よくため息をつく","cat":"lifestyle","rf":["野菜少ない","刺激物"],"me":"Insufficient oxygen supply → reduced metabolic efficiency","mj":"酸素供給不足 → 代謝効率低下","w":0.68},
"90":{"qe":"Still tired even after sleeping","qj":"寝ても疲れが取れない","cat":"lifestyle","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced recovery metabolism → chronic fatigue","mj":"回復代謝低下 → 慢性疲労","w":0.92},
"91":{"qe":"Often feel hot or feverish","qj":"体がほてりやすい","cat":"lifestyle","rf":["不規則型"],"me":"Abnormal thermoregulation → disrupted metabolic rhythm","mj":"体温調節異常 → 代謝リズムの乱れ","w":0.75},
"92":{"qe":"Hands and feet often feel heavy/sluggish","qj":"手足がだるく感じることが多い","cat":"lifestyle","rf":["大豆製品(植物性たんぱく質)少ない","水分摂取少ない"],"me":"Reduced peripheral metabolism → fatigue accumulation","mj":"末梢代謝低下 → 疲労蓄積","w":0.72},
"93":{"qe":"Easily develop bruises","qj":"よくあざができる","cat":"lifestyle","rf":["野菜少ない"],"me":"Reduced vascular metabolism → capillary damage","mj":"血管代謝低下 → 毛細血管損傷","w":0.7},
"94":{"qe":"Sometimes feel short of breath","qj":"息苦しさを感じることがある","cat":"lifestyle","rf":["野菜少ない","刺激物"],"me":"Insufficient oxygen supply → reduced energy metabolism","mj":"酸素供給不足 → エネルギー代謝低下","w":0.78},
"95":{"qe":"Often feel thirsty","qj":"喉が乾きやすい","cat":"lifestyle","rf":["塩分","水分摂取少ない"],"me":"Disrupted fluid balance → circulatory burden","mj":"体液バランスの乱れ → 循環負荷","w":0.68},
"96":{"qe":"Sweat easily","qj":"汗をかきやすい","cat":"lifestyle","rf":["カフェイン"],"me":"Excessive thermoregulation → electrolyte depletion","mj":"体温調節過剰 → 電解質消耗","w":0.7},
"97":{"qe":"Body tends to swell","qj":"体がむくみやすい","cat":"lifestyle","rf":["塩分","水分摂取少ない"],"me":"Poor fluid regulation → edema","mj":"体液調節不良 → 浮腫","w":0.85},
"98":{"qe":"Feel unwell with changes in barometric pressure","qj":"気圧の変化で体調が悪くなる","cat":"lifestyle","rf":["不規則型"],"me":"Barometric pressure stress → poor blood flow regulation","mj":"気圧変動ストレス → 血流調節不良","w":0.78},
"99":{"qe":"Often get sick with seasonal changes","qj":"季節の変わり目に体調を崩しやすい","cat":"lifestyle","rf":["野菜少ない","不規則型"],"me":"Environmental change stress → poor metabolic adaptation","mj":"環境変化ストレス → 代謝調整不良","w":0.8},
"100":{"qe":"Low body temperature (hypothermia tendency)","qj":"体温が低い（低体温）","cat":"lifestyle","rf":["暴飲・暴食型"],"me":"Reduced enzyme activity → systemic metabolic decline","mj":"酵素活性低下 → 全身代謝低下","w":0.9},
"101":{"qe":"Head feels heavy","qj":"頭が重い感じがする","cat":"symptoms","rf":["欠食型（朝食抜き）","水分摂取少ない"],"me":"Reduced cerebral blood flow → oxygen deficiency","mj":"脳血流低下 → 酸素供給不足","w":0.78},
"102":{"qe":"Sometimes experience dizziness","qj":"めまいを感じることがある","cat":"symptoms","rf":["欠食型（朝食抜き）","肉食べない","不規則型"],"me":"Abrupt change in cerebral blood flow → oxygen deficiency","mj":"脳血流の急変 → 酸素不足","w":0.85},
"103":{"qe":"Experience tinnitus","qj":"耳鳴りがする","cat":"symptoms","rf":["刺激物","水分摂取少ない"],"me":"Reduced inner ear metabolism → sensory abnormalities","mj":"内耳代謝低下 → 感覚異常","w":0.72},
"104":{"qe":"Vision sometimes becomes blurry","qj":"目がかすむことがある","cat":"symptoms","rf":["野菜少ない","水分摂取少ない"],"me":"Reduced ocular metabolism → visual function decline","mj":"眼球代謝低下 → 視覚機能低下","w":0.7},
"105":{"qe":"Sensation of chest tightness","qj":"胸がつかえる感じがする","cat":"symptoms","rf":["刺激物","不規則型"],"me":"Chest muscle tension → reduced respiratory metabolism","mj":"胸部筋緊張 → 呼吸代謝低下","w":0.75},
"106":{"qe":"Sometimes experience chest pain","qj":"胸が痛むことがある","cat":"symptoms","rf":["脂肪","刺激物"],"me":"Reduced chest blood flow → oxygen deficiency","mj":"胸部血流低下 → 酸素不足","w":0.8},
"107":{"qe":"Feel difficulty breathing","qj":"息がしづらいと感じる","cat":"symptoms","rf":["野菜少ない","刺激物"],"me":"Insufficient oxygen supply → reduced energy metabolism","mj":"酸素供給不足 → エネルギー代謝低下","w":0.82},
"108":{"qe":"Stomach feels heavy or sluggish","qj":"胃が重い・もたれる","cat":"symptoms","rf":["暴飲・暴食型","不規則型"],"me":"Reduced digestive metabolism → poor nutrient absorption","mj":"消化代謝低下 → 栄養吸収不良","w":0.88},
"109":{"qe":"Experience heartburn","qj":"胸やけがする","cat":"symptoms","rf":["刺激物","夜食方(寝る前の食事）"],"me":"Esophageal mucosal irritation → inflammation","mj":"食道粘膜刺激 → 炎症","w":0.85},
"110":{"qe":"Abdomen easily becomes bloated","qj":"お腹が張りやすい","cat":"symptoms","rf":["加工食品やインスタント食品をよく食べる"],"me":"Reduced intestinal metabolism → fermentation disorder","mj":"腸代謝低下 → 発酵異常","w":0.8},
"111":{"qe":"Gas accumulates easily","qj":"ガスが溜まりやすい","cat":"symptoms","rf":["加工食品やインスタント食品をよく食べる","野菜少ない"],"me":"Disrupted intestinal metabolism → increased gas production","mj":"腸内代謝の乱れ → ガス産生増加","w":0.8},
"112":{"qe":"Stool is hard or difficult to pass","qj":"便が硬い・出にくい","cat":"symptoms","rf":["野菜少ない","水分摂取少ない"],"me":"Reduced intestinal metabolism → difficult defecation","mj":"腸代謝低下 → 排便困難","w":0.88},
"113":{"qe":"Stool is loose or diarrhea-prone","qj":"便がゆるい・下痢しやすい","cat":"symptoms","rf":["早食い型","刺激物"],"me":"Malabsorption → reduced nutritional metabolism","mj":"吸収不良 → 栄養代謝低下","w":0.82},
"114":{"qe":"Feel sleepy after eating","qj":"食後に眠くなる","cat":"symptoms","rf":["甘物"],"me":"Blood glucose fluctuations → unstable energy metabolism","mj":"血糖変動 → エネルギー代謝不安定","w":0.9},
"115":{"qe":"Experience palpitations after eating","qj":"食後に動悸がする","cat":"symptoms","rf":["甘物","不規則型"],"me":"Sympathetic nervous system stimulation → elevated heart rate","mj":"交感神経刺激 → 心拍数上昇","w":0.78},
"116":{"qe":"Stomach swells after eating","qj":"食後に胃が張る","cat":"symptoms","rf":["早食い型","不規則型"],"me":"Reduced gastric metabolism → digestive stagnation","mj":"胃代謝低下 → 消化停滞","w":0.85},
"117":{"qe":"Experience heartburn after eating","qj":"食後に胸やけがする","cat":"symptoms","rf":["刺激物","夜食方(寝る前の食事）"],"me":"Esophageal mucosal irritation → inflammation","mj":"食道粘膜刺激 → 炎症","w":0.88},
"118":{"qe":"Stomach makes gurgling sounds after eating","qj":"食後にお腹がゴロゴロ鳴る","cat":"symptoms","rf":["加工食品やインスタント食品をよく食べる","早食い型"],"me":"Disrupted intestinal metabolism → increased gas production","mj":"腸代謝の乱れ → ガス産生増加","w":0.72},
"119":{"qe":"Body becomes sluggish after eating","qj":"食後に体がだるくなる","cat":"symptoms","rf":["欠食型（朝食抜き）","甘物"],"me":"Reduced energy metabolism → fatigue","mj":"エネルギー代謝低下 → 倦怠感","w":0.82},
"120":{"qe":"Concentration drops after eating","qj":"食後に集中力が落ちる","cat":"symptoms","rf":["欠食型（朝食抜き）","甘物"],"me":"Brain energy deficiency → cognitive decline","mj":"脳エネルギー不足 → 認知機能低下","w":0.78},
"121":{"qe":"Often lack appetite","qj":"食欲がないことが多い","cat":"symptoms","rf":["刺激物","不規則型"],"me":"Reduced digestive metabolism → insufficient nutrient absorption","mj":"消化代謝低下 → 栄養吸収不足","w":0.82},
"122":{"qe":"Sometimes have abnormally increased appetite","qj":"食欲が異常に増えることがある","cat":"symptoms","rf":["甘物","間食多い"],"me":"Excessive insulin response → fat accumulation","mj":"インスリン過剰反応 → 脂肪蓄積","w":0.88},
"123":{"qe":"Mouth dries out easily","qj":"口が乾きやすい","cat":"symptoms","rf":["塩分","水分摂取少ない"],"me":"Disrupted fluid balance → circulatory burden","mj":"体液バランスの乱れ → 循環負荷","w":0.75},
"124":{"qe":"Mouth tastes bitter or feels sticky","qj":"口の中が苦い・ねばつく","cat":"symptoms","rf":["早食い型","飲酒"],"me":"Disrupted bile metabolism → reduced digestive function","mj":"胆汁代謝の乱れ → 消化機能低下","w":0.78},
"125":{"qe":"Tongue easily develops white coating (tongue fur)","qj":"舌が白くなりやすい（舌苔）","cat":"symptoms","rf":["加工食品やインスタント食品をよく食べる","不規則型"],"me":"Reduced digestive metabolism → change in oral bacterial balance","mj":"消化代謝低下 → 口腔細菌バランス変化","w":0.82},
"126":{"qe":"Concerned about bad breath","qj":"口臭が気になる","cat":"symptoms","rf":["加工食品やインスタント食品をよく食べる"],"me":"Abnormal intestinal metabolism → increased volatile substances","mj":"腸代謝異常 → 揮発性物質の増加","w":0.8},
"127":{"qe":"Heart pounds/races sometimes","qj":"胸がドキドキすることがある","cat":"symptoms","rf":["刺激物","甘物"],"me":"Sympathetic nervous system stimulation → elevated heart rate","mj":"交感神経刺激 → 心拍数上昇","w":0.78},
"128":{"qe":"Hands sometimes tremble","qj":"手が震えることがある","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Blood glucose deficiency → reduced neural metabolism","mj":"血糖不足 → 神経代謝低下","w":0.85},
"129":{"qe":"Body feels hot or has hot flashes","qj":"体がほてる・のぼせる","cat":"symptoms","rf":["不規則型"],"me":"Abnormal thermoregulation → disrupted metabolic rhythm","mj":"体温調節異常 → 代謝リズムの乱れ","w":0.75},
"130":{"qe":"Body gets cold easily","qj":"体が冷えやすい","cat":"symptoms","rf":["暴飲・暴食型","水分摂取少ない"],"me":"Reduced enzyme activity → systemic metabolic decline","mj":"酵素活性低下 → 全身代謝低下","w":0.88},
"131":{"qe":"Difficulty falling asleep","qj":"寝つきが悪い","cat":"symptoms","rf":["刺激物","不規則型"],"me":"Sympathetic dominance → reduced sleep metabolism","mj":"交感神経優位 → 睡眠代謝低下","w":0.85},
"132":{"qe":"Wake up multiple times during the night","qj":"夜中に何度も目が覚める","cat":"symptoms","rf":["不規則型"],"me":"Fragmented sleep → reduced recovery metabolism","mj":"睡眠分断 → 回復代謝低下","w":0.88},
"133":{"qe":"Feel tired even after waking up in the morning","qj":"朝起きても疲れが取れていない","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced recovery metabolism → chronic fatigue","mj":"回復代謝低下 → 慢性疲労","w":0.92},
"134":{"qe":"Dream frequently or have nightmares","qj":"夢をよく見る・悪夢が多い","cat":"symptoms","rf":["刺激物","不規則型"],"me":"Poor sleep quality → unstable brain metabolism","mj":"睡眠の質低下 → 脳代謝不安定","w":0.7},
"135":{"qe":"Night sweating","qj":"寝汗をかく","cat":"symptoms","rf":["不規則型"],"me":"Abnormal thermoregulation → poor sleep quality","mj":"体温調節異常 → 睡眠質低下","w":0.75},
"136":{"qe":"Grind teeth during sleep","qj":"寝ている間に歯ぎしりをする","cat":"symptoms","rf":["刺激物"],"me":"Muscle tension → temporomandibular joint burden","mj":"筋緊張 → 顎関節負荷","w":0.78},
"137":{"qe":"Have headache in the morning","qj":"朝に頭痛がある","cat":"symptoms","rf":["刺激物","不規則型"],"me":"Reduced cerebral blood flow → oxygen deficiency","mj":"脳血流低下 → 酸素不足","w":0.82},
"138":{"qe":"Body stiffens in the morning","qj":"朝に体がこわばる","cat":"symptoms","rf":["水分摂取少ない","不規則型"],"me":"Reduced muscle metabolism → stiffness","mj":"筋代謝低下 → こわばり","w":0.75},
"139":{"qe":"Stomach feels heavy in the morning","qj":"朝に胃が重い","cat":"symptoms","rf":["早食い型","夜食方(寝る前の食事）"],"me":"Reduced gastric metabolism → digestive stagnation","mj":"胃代謝低下 → 消化停滞","w":0.8},
"140":{"qe":"Edema appears in the morning","qj":"朝にむくみが出る","cat":"symptoms","rf":["塩分","水分摂取少ない"],"me":"Poor fluid regulation → edema","mj":"体液調節不良 → 浮腫","w":0.85},
"141":{"qe":"Body is too sluggish to want to move","qj":"体がだるくて動きたくない","cat":"symptoms","rf":["暴飲・暴食型","欠食型（朝食抜き）"],"me":"Reduced ATP production → decreased activity level","mj":"ATP産生低下 → 活動量低下","w":0.88},
"142":{"qe":"Body feels heavy","qj":"体が重く感じる","cat":"symptoms","rf":["水分摂取少ない","不規則型"],"me":"Reduced muscle metabolism → fatigue","mj":"筋代謝低下 → 倦怠感","w":0.8},
"143":{"qe":"Body often feels stiff","qj":"体がこわばることが多い","cat":"symptoms","rf":["脂肪","水分摂取少ない"],"me":"Reduced muscle metabolism → stiffness","mj":"筋代謝低下 → こわばり","w":0.75},
"144":{"qe":"Hands and feet feel heavy","qj":"手足がだるい","cat":"symptoms","rf":["水分摂取少ない","大豆製品(植物性たんぱく質)少ない"],"me":"Reduced peripheral metabolism → fatigue accumulation","mj":"末梢代謝低下 → 疲労蓄積","w":0.78},
"145":{"qe":"Body tends to swell","qj":"体がむくみやすい","cat":"symptoms","rf":["塩分","水分摂取少ない"],"me":"Poor fluid regulation → edema","mj":"体液調節不良 → 浮腫","w":0.85},
"146":{"qe":"Body gets cold easily (from extremities)","qj":"体が冷えやすい（手足から）","cat":"symptoms","rf":["暴飲・暴食型","水分摂取少ない"],"me":"Reduced enzyme activity → systemic metabolic decline","mj":"酵素活性低下 → 全身代謝低下","w":0.88},
"147":{"qe":"Body often feels feverish","qj":"体がほてりやすい","cat":"symptoms","rf":["不規則型"],"me":"Abnormal thermoregulation → disrupted metabolic rhythm","mj":"体温調節異常 → 代謝リズムの乱れ","w":0.75},
"148":{"qe":"Sometimes experience numbness","qj":"体がしびれることがある","cat":"symptoms","rf":["魚介類食べない","水分摂取少ない"],"me":"Reduced neural metabolism → sensory abnormalities","mj":"神経代謝低下 → 感覚異常","w":0.82},
"149":{"qe":"Sometimes experience trembling","qj":"体が震えることがある","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Blood glucose deficiency → reduced neural metabolism","mj":"血糖不足 → 神経代謝低下","w":0.85},
"150":{"qe":"Body feels feverish","qj":"体が熱っぽい","cat":"symptoms","rf":["野菜少ない","脂肪"],"me":"Immune metabolism activation → elevated body temperature","mj":"免疫代謝亢進 → 体温上昇","w":0.8},
"151":{"qe":"Too sluggish to concentrate","qj":"体がだるくて集中できない","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Brain energy deficiency → cognitive decline","mj":"脳エネルギー不足 → 認知機能低下","w":0.88},
"152":{"qe":"Body feels heavy and movements are sluggish","qj":"体が重くて動きが鈍い","cat":"symptoms","rf":["暴飲・暴食型","大豆製品(植物性たんぱく質)少ない"],"me":"Reduced ATP production → decreased physical activity","mj":"ATP産生低下 → 身体活動量低下","w":0.82},
"153":{"qe":"Too fatigued to do anything but lie down","qj":"体がしんどくて横になりたい","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced recovery metabolism → increased fatigue","mj":"回復代謝低下 → 倦怠感増大","w":0.85},
"154":{"qe":"Too fatigued to get up in the morning","qj":"体がだるくて朝起きられない","cat":"symptoms","rf":["不規則型"],"me":"Reduced recovery metabolism → morning fatigue","mj":"回復代謝低下 → 朝の倦怠感","w":0.9},
"155":{"qe":"Too fatigued to work","qj":"体がだるくて仕事に集中できない","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced brain metabolism → cognitive decline","mj":"脳代謝低下 → 認知機能低下","w":0.88},
"156":{"qe":"Too fatigued to feel motivated","qj":"体がだるくてやる気が出ない","cat":"symptoms","rf":["欠食型（朝食抜き）","魚介類食べない"],"me":"Reduced neural metabolism → decreased motivation","mj":"神経代謝低下 → 意欲低下","w":0.82},
"157":{"qe":"Too fatigued to stand for long","qj":"体がだるくて立っているのがつらい","cat":"symptoms","rf":["大豆製品(植物性たんぱく質)少ない","水分摂取少ない"],"me":"Reduced peripheral metabolism → fatigue accumulation","mj":"末梢代謝低下 → 疲労蓄積","w":0.8},
"158":{"qe":"Fatigue with palpitations","qj":"体がだるくて動悸がする","cat":"symptoms","rf":["甘物","不規則型"],"me":"Sympathetic nervous stimulation → elevated heart rate","mj":"交感神経刺激 → 心拍数上昇","w":0.85},
"159":{"qe":"Fatigue with shortness of breath","qj":"体がだるくて息苦しい","cat":"symptoms","rf":["野菜少ない","刺激物"],"me":"Insufficient oxygen supply → reduced energy metabolism","mj":"酸素供給不足 → エネルギー代謝低下","w":0.82},
"160":{"qe":"Fatigue with poor appetite","qj":"体がだるくて食欲がない","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced digestive metabolism → insufficient nutrient absorption","mj":"消化代謝低下 → 栄養吸収不足","w":0.85},
"161":{"qe":"Fatigue with foggy thinking","qj":"体がだるくて頭がぼーっとする","cat":"symptoms","rf":["野菜少ない","欠食型（朝食抜き）"],"me":"Brain energy deficiency → cognitive decline","mj":"脳エネルギー不足 → 認知機能低下","w":0.88},
"162":{"qe":"Fatigue and irritability","qj":"体がだるくてイライラする","cat":"symptoms","rf":["甘物","刺激物"],"me":"Unstable neural metabolism → emotional instability","mj":"神経代謝不安定 → 情動不安定","w":0.82},
"163":{"qe":"Fatigue and feeling depressed","qj":"体がだるくて気分が落ち込む","cat":"symptoms","rf":["欠食型（朝食抜き）","魚介類食べない"],"me":"Insufficient neurotransmitters → decreased motivation","mj":"神経伝達物質不足 → 意欲低下","w":0.85},
"164":{"qe":"Fatigue with heart pounding","qj":"体がだるくて動悸がする","cat":"symptoms","rf":["甘物","不規則型"],"me":"Sympathetic nervous stimulation → elevated heart rate","mj":"交感神経刺激 → 心拍数上昇","w":0.85},
"165":{"qe":"Fatigue with difficulty breathing","qj":"体がだるくて息苦しい","cat":"symptoms","rf":["野菜少ない","刺激物"],"me":"Insufficient oxygen supply → reduced energy metabolism","mj":"酸素供給不足 → エネルギー代謝低下","w":0.82},
"166":{"qe":"Fatigue with cold extremities","qj":"体がだるくて手足が冷える","cat":"symptoms","rf":["暴飲・暴食型","水分摂取少ない"],"me":"Reduced enzyme activity → systemic metabolic decline","mj":"酵素活性低下 → 全身代謝低下","w":0.88},
"167":{"qe":"Fatigue with numbness in hands/feet","qj":"体がだるくて手足がしびれる","cat":"symptoms","rf":["魚介類食べない","水分摂取少ない"],"me":"Reduced neural metabolism → sensory abnormalities","mj":"神経代謝低下 → 感覚異常","w":0.82},
"168":{"qe":"Fatigue with nausea","qj":"体がだるくて吐き気がする","cat":"symptoms","rf":["不規則型","刺激物"],"me":"Reduced digestive metabolism → gastrointestinal discomfort","mj":"消化代謝低下 → 胃腸不調","w":0.8},
"169":{"qe":"Fatigue with dizziness","qj":"体がだるくてめまいがする","cat":"symptoms","rf":["欠食型（朝食抜き）","肉食べない"],"me":"Reduced cerebral blood flow → oxygen deficiency","mj":"脳血流低下 → 酸素不足","w":0.85},
"170":{"qe":"Fatigue with orthostatic dizziness","qj":"体がだるくて立ちくらみがする","cat":"symptoms","rf":["欠食型（朝食抜き）","水分摂取少ない"],"me":"Abrupt change in cerebral blood flow → oxygen deficiency","mj":"脳血流の急変 → 酸素不足","w":0.85},
"171":{"qe":"Fatigue with headache","qj":"体がだるくて頭痛がする","cat":"symptoms","rf":["脂肪","水分摂取少ない"],"me":"Reduced brain metabolism → oxygen deficiency","mj":"脳代謝低下 → 酸素不足","w":0.82},
"172":{"qe":"Fatigue with shoulder stiffness","qj":"体がだるくて肩がこる","cat":"symptoms","rf":["脂肪","水分摂取少ない"],"me":"Reduced local metabolism → lactic acid accumulation","mj":"局所代謝低下 → 乳酸蓄積","w":0.78},
"173":{"qe":"Fatigue with heavy lower back","qj":"体がだるくて腰が重い","cat":"symptoms","rf":["大豆製品(植物性たんぱく質)少ない","水分摂取少ない"],"me":"Reduced muscle metabolism → fatigue accumulation","mj":"筋代謝低下 → 疲労蓄積","w":0.75},
"174":{"qe":"Fatigue with joint pain","qj":"体がだるくて関節が痛い","cat":"symptoms","rf":["野菜少ない","脂肪"],"me":"Inflammatory metabolic activation → pain","mj":"炎症性代謝亢進 → 痛み","w":0.8},
"175":{"qe":"Fatigue with eye strain","qj":"体がだるくて目が疲れる","cat":"symptoms","rf":["野菜少ない","水分摂取少ない"],"me":"Reduced ocular metabolism → visual burden","mj":"眼球代謝低下 → 視覚負荷","w":0.72},
"176":{"qe":"Fatigue with tinnitus","qj":"体がだるくて耳鳴りがする","cat":"symptoms","rf":["水分摂取少ない","不規則型"],"me":"Reduced inner ear metabolism → sensory abnormalities","mj":"内耳代謝低下 → 感覚異常","w":0.75},
"177":{"qe":"Fatigue with sensation of throat tightening","qj":"体がだるくて喉がつまる感じがする","cat":"symptoms","rf":["刺激物","不規則型"],"me":"Pharyngeal muscle tension → reduced respiratory metabolism","mj":"咽頭筋緊張 → 呼吸代謝低下","w":0.78},
"178":{"qe":"Fatigue with stomach nausea","qj":"体がだるくて胃がムカムカする","cat":"symptoms","rf":["不規則型","刺激物"],"me":"Reduced digestive metabolism → gastric discomfort","mj":"消化代謝低下 → 胃不快感","w":0.82},
"179":{"qe":"Fatigue and feel sleepy after eating","qj":"体がだるくて食後に眠くなる","cat":"symptoms","rf":["甘物"],"me":"Blood glucose fluctuations → unstable brain metabolism","mj":"血糖変動 → 脳代謝不安定","w":0.9},
"180":{"qe":"Fatigue with decreased concentration","qj":"体がだるくて集中力が落ちる","cat":"symptoms","rf":["欠食型（朝食抜き）","甘物"],"me":"Brain energy deficiency → cognitive decline","mj":"脳エネルギー不足 → 認知機能低下","w":0.88},
"181":{"qe":"Fatigue with lack of willpower","qj":"体がだるくて気力が出ない","cat":"symptoms","rf":["欠食型（朝食抜き）","魚介類食べない"],"me":"Reduced neural metabolism → decreased motivation","mj":"神経代謝低下 → 意欲低下","w":0.85},
"182":{"qe":"Fatigue makes work impossible","qj":"体がだるくて仕事が手につかない","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Brain energy deficiency → cognitive decline","mj":"脳エネルギー不足 → 認知機能低下","w":0.88},
"183":{"qe":"Fatigue makes you want to lie down","qj":"体がだるくて横になりたくなる","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced recovery metabolism → increased fatigue","mj":"回復代謝低下 → 倦怠感増大","w":0.85},
"184":{"qe":"Get out of breath when moving","qj":"体がだるくて動くと息切れする","cat":"symptoms","rf":["暴飲・暴食型","肉食べない"],"me":"Insufficient oxygen supply → reduced energy metabolism","mj":"酸素供給不足 → エネルギー代謝低下","w":0.82},
"185":{"qe":"Get dizzy when moving","qj":"体がだるくて動くとめまいがする","cat":"symptoms","rf":["欠食型（朝食抜き）","水分摂取少ない"],"me":"Reduced cerebral blood flow → oxygen deficiency","mj":"脳血流低下 → 酸素不足","w":0.85},
"186":{"qe":"Heart pounds when moving","qj":"体がだるくて動くと動悸がする","cat":"symptoms","rf":["甘物","不規則型"],"me":"Sympathetic nervous stimulation → elevated heart rate","mj":"交感神経刺激 → 心拍数上昇","w":0.85},
"187":{"qe":"Feel nauseous when moving","qj":"体がだるくて動くと吐き気がする","cat":"symptoms","rf":["不規則型","刺激物"],"me":"Reduced digestive metabolism → gastrointestinal discomfort","mj":"消化代謝低下 → 胃腸不調","w":0.8},
"188":{"qe":"Headache when moving","qj":"体がだるくて動くと頭痛がする","cat":"symptoms","rf":["脂肪","水分摂取少ない"],"me":"Reduced brain metabolism → oxygen deficiency","mj":"脳代謝低下 → 酸素不足","w":0.82},
"189":{"qe":"Joints hurt when moving","qj":"体がだるくて動くと関節が痛む","cat":"symptoms","rf":["野菜少ない","脂肪"],"me":"Inflammatory metabolic activation → pain","mj":"炎症性代謝亢進 → 痛み","w":0.8},
"190":{"qe":"Moving increases fatigue","qj":"体がだるくて動くと疲れが増す","cat":"symptoms","rf":["欠食型（朝食抜き）","大豆製品(植物性たんぱく質)少ない"],"me":"Reduced ATP production → increased fatigue","mj":"ATP産生低下 → 疲労増大","w":0.88},
"191":{"qe":"Don't want to do anything","qj":"体がだるくて何もしたくない","cat":"symptoms","rf":["欠食型（朝食抜き）","魚介類食べない"],"me":"Insufficient neurotransmitters → decreased motivation","mj":"神経伝達物質不足 → 意欲低下","w":0.88},
"192":{"qe":"Become emotionally unstable when fatigued","qj":"体がだるくて気分が不安定になる","cat":"symptoms","rf":["甘物","刺激物"],"me":"Unstable neural metabolism → emotional fluctuations","mj":"神経代謝不安定 → 情動変動","w":0.82},
"193":{"qe":"Intense sleepiness when fatigued","qj":"体がだるくて眠気が強い","cat":"symptoms","rf":["欠食型（朝食抜き）","甘物"],"me":"Reduced brain metabolism → difficulty maintaining alertness","mj":"脳代謝低下 → 覚醒維持困難","w":0.85},
"194":{"qe":"Can't sustain concentration when fatigued","qj":"体がだるくて集中力が続かない","cat":"symptoms","rf":["欠食型（朝食抜き）","甘物"],"me":"Brain energy deficiency → cognitive decline","mj":"脳エネルギー不足 → 認知機能低下","w":0.88},
"195":{"qe":"Difficult to stand when fatigued","qj":"体がだるくて立っているのがつらい","cat":"symptoms","rf":["大豆製品(植物性たんぱく質)少ない","水分摂取少ない"],"me":"Reduced peripheral metabolism → fatigue accumulation","mj":"末梢代謝低下 → 疲労蓄積","w":0.8},
"196":{"qe":"Difficult to walk when fatigued","qj":"体がだるくて歩くのがつらい","cat":"symptoms","rf":["大豆製品(植物性たんぱく質)少ない","暴飲・暴食型"],"me":"Insufficient oxygen supply → reduced energy metabolism","mj":"酸素供給不足 → エネルギー代謝低下","w":0.82},
"197":{"qe":"Can't do housework when fatigued","qj":"体がだるくて家事ができない","cat":"symptoms","rf":["欠食型（朝食抜き）","不規則型"],"me":"Reduced recovery metabolism → decreased activity level","mj":"回復代謝低下 → 活動量低下","w":0.85},
"198":{"qe":"Don't want to go out when fatigued","qj":"体がだるくて外出したくない","cat":"symptoms","rf":["欠食型（朝食抜き）","魚介類食べない"],"me":"Insufficient neurotransmitters → decreased behavior","mj":"神経伝達物質不足 → 行動低下","w":0.82},
"199":{"qe":"Recently, overall health feels poor","qj":"最近、体調が全体的に優れないと感じる","cat":"comprehensive","rf":["暴飲・暴食型","欠食型（朝食抜き）"],"me":"Systemic metabolic decline → multi-system impact","mj":"全身代謝低下 → 多系統に影響","w":0.92},
"200":{"qe":"Feel like improving health condition","qj":"健康状態を改善したいと感じている","cat":"comprehensive","rf":["欠食型（朝食抜き）","不規則型"],"me":"Motivation for improvement → starting point for behavioral change","mj":"改善意欲 → 行動変容の起点","w":1.0}
};

// ============================================================
// 統合疾病マトリックス（v4と同一 — 135疾患×食生活RF×漢方）
// ============================================================
const DM = {
"アトピー性皮膚炎":{"did":"D009","ev":"B","rf":["欠食型（朝食抜き）","偏食型","脂肪","甘物","空腹時の清涼飲料水","魚介類食べない","青魚を食べない","野菜少ない","乳製品多い","卵を毎日2個以上食べる","加工食品やインスタント食品をよく食べる","間食多い"],"km":[{"id":"F013","n":"乙字湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F024","n":"啓脾湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F082","n":"大黄牡丹皮湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"アレルギー性鼻炎・花粉症":{"did":"D038","ev":"B","rf":["欠食型（朝食抜き）","偏食型","刺激物","脂肪","魚介類食べない","青魚を食べない","野菜少ない","乳製品多い","卵を毎日2個以上食べる","加工食品やインスタント食品をよく食べる"],"km":[{"id":"F023","n":"駆風解毒湯","p":["PATH_04"],"m":["MBT55-001"]},{"id":"F038","n":"香蘇散","p":["PATH_04"],"m":["MBT55-003"]}]},
"急性胃炎":{"did":"D012","ev":"B","rf":["不規則型","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","飲酒時少食型","塩分","刺激物","飲酒(10年以上の大酒）","熱物","カフェイン","空腹時の清涼飲料水","肉多い"],"km":[{"id":"F035","n":"桂枝茯苓丸","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F161","n":"三黄瀉心湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F251","n":"茯苓飲","p":["PATH_04"],"m":["MBT55-003"]}]},
"胃・十二指腸潰瘍":{"did":"D003","ev":"A","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","暴飲・暴食型","飲酒時少食型","塩分","刺激物","飲酒","飲酒(10年以上の大酒）","熱物","空腹時の清涼飲料水","肉多い","洋食好み"],"km":[{"id":"F035","n":"桂枝茯苓丸","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F161","n":"三黄瀉心湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F163","n":"十全大補湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"高血圧":{"did":"D005","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","塩分","飲酒","野菜少ない","果物少ない","海草少ない","間食多い"],"km":[{"id":"F012","n":"十全大補湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F015","n":"加味逍遙散","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F249","n":"釣藤散","p":["PATH_01"],"m":["MBT55-001"]}]},
"高脂血症":{"did":"D075","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","外食多い型","脂肪","飲酒","甘物","肉多い","青魚を食べない","洋食好み","野菜少ない","乳製品多い","卵を毎日2個以上食べる","海草少ない","大豆製品(植物性たんぱく質)少ない","加工食品やインスタント食品をよく食べる","間食多い"],"km":[{"id":"F018","n":"瓜呂根湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F026","n":"鶏鳴散","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F249","n":"釣藤散","p":["PATH_01"],"m":["MBT55-001"]}]},
"糖尿病":{"did":"D006","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","暴飲・暴食型","外食多い型","脂肪","飲酒","甘物","空腹時の清涼飲料水","洋食好み","野菜少ない","乳製品多い","果物多い","間食多い"],"km":[{"id":"F018","n":"瓜呂根湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F251","n":"茯苓飲","p":["PATH_04"],"m":["MBT55-003"]},{"id":"F086","n":"大承気湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"肥満症":{"did":"D017","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","外食多い型","脂肪","飲酒","甘物","カフェイン","肉多い","洋食好み","乳製品多い","果物多い","加工食品やインスタント食品をよく食べる","間食多い"],"km":[{"id":"F062","n":"七物降下湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F256","n":"大柴胡湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F076","n":"防風通聖散","p":["PATH_03"],"m":["MBT55-002"]}]},
"動脈硬化":{"did":"D075","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","塩分","脂肪","飲酒","甘物","焦げ目(肉＆魚）","カフェイン","肉多い","青魚を食べない","洋食好み","野菜少ない","乳製品多い","果物少ない","海草少ない","大豆製品(植物性たんぱく質)少ない","加工食品やインスタント食品をよく食べる","水分摂取少ない","間食多い"],"km":[{"id":"F018","n":"瓜呂根湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F026","n":"鶏鳴散","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F249","n":"釣藤散","p":["PATH_01"],"m":["MBT55-001"]}]},
"脳梗塞":{"did":"D026","ev":"C","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","塩分","脂肪","飲酒","甘物","カフェイン","肉多い","魚介類食べない","青魚を食べない","洋食好み","野菜少ない","乳製品多い","果物少ない","海草少ない","大豆製品(植物性たんぱく質)少ない","水分摂取少ない","間食多い"],"km":[{"id":"F051","n":"柴苓湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F256","n":"大柴胡湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F249","n":"釣藤散","p":["PATH_01"],"m":["MBT55-001"]}]},
"心筋梗塞":{"did":"D005","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","塩分","脂肪","飲酒","甘物","肉多い","魚介類食べない","青魚を食べない","洋食好み","野菜少ない","乳製品多い","果物少ない","海草少ない","大豆製品(植物性たんぱく質)少ない","水分摂取少ない","間食多い"],"km":[{"id":"F012","n":"十全大補湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F015","n":"加味逍遙散","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F249","n":"釣藤散","p":["PATH_01"],"m":["MBT55-001"]}]},
"脂肪肝":{"did":"D090","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","外食多い型","飲酒時少食型","脂肪","飲酒","飲酒(10年以上の大酒）","甘物","カフェイン","肉多い","洋食好み","乳製品多い","卵を毎日2個以上食べる","加工食品やインスタント食品をよく食べる","間食多い"],"km":[{"id":"F018","n":"瓜呂根湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F026","n":"鶏鳴散","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F251","n":"茯苓飲","p":["PATH_04"],"m":["MBT55-003"]}]},
"慢性胃炎":{"did":"D012","ev":"B","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","塩分","刺激物","飲酒","飲酒(10年以上の大酒）","熱物","カフェイン","肉多い","加工食品やインスタント食品をよく食べる"],"km":[{"id":"F035","n":"桂枝茯苓丸","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F161","n":"三黄瀉心湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F251","n":"茯苓飲","p":["PATH_04"],"m":["MBT55-003"]}]},
"過敏性腸症候群":{"did":"D004","ev":"A","rf":["早食い型","暴飲・暴食型","刺激物","飲酒","甘物","カフェイン","空腹時の清涼飲料水"],"km":[{"id":"F057","n":"滋陰至宝湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F161","n":"三黄瀉心湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F217","n":"苓桂朮甘湯","p":["PATH_01"],"m":["MBT55-003"]}]},
"便秘":{"did":"D013","ev":"A","rf":["欠食型（朝食抜き）","早食い型","外食多い型","野菜少ない","乳製品少ない","果物少ない","海草少ない","大豆製品(植物性たんぱく質)少ない","水分摂取少ない"],"km":[{"id":"F028","n":"桂枝加葛根湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F070","n":"十味敗毒湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F161","n":"三黄瀉心湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"骨粗鬆症":{"did":"D029","ev":"C","rf":["偏食型","飲酒(10年以上の大酒）","肉食べない","魚介類食べない","野菜少ない","乳製品少ない","果物少ない","大豆製品(植物性たんぱく質)少ない"],"km":[{"id":"F043","n":"五淋散","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F108","n":"二朮湯","p":["PATH_04"],"m":["MBT55-001"]},{"id":"F256","n":"大柴胡湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"貧血":{"did":"D016","ev":"C","rf":["欠食型（朝食抜き）","偏食型","飲酒時少食型","肉食べない","魚介類食べない","野菜少ない","果物少ない","海草少ない","大豆製品(植物性たんぱく質)少ない"],"km":[{"id":"F020","n":"帰脾湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F068","n":"十全大補湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F163","n":"人参養栄湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"大腸がん":{"did":"D124","ev":"C","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","暴飲・暴食型","脂肪","飲酒","焦げ目(肉＆魚）","甘物","肉多い","魚介類食べない","青魚を食べない","洋食好み","野菜少ない","乳製品多い","果物少ない","海草少ない","大豆製品(植物性たんぱく質)少ない","加工食品やインスタント食品をよく食べる","間食多い"],"km":[{"id":"F068","n":"十全大補湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F163","n":"人参養栄湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F265","n":"桃核承気湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"胃がん":{"did":"D124","ev":"C","rf":["不規則型","欠食型（朝食抜き）","夜食方(寝る前の食事）","早食い型","暴飲・暴食型","塩分","刺激物","飲酒","焦げ目(肉＆魚）","熱物","肉多い","魚介類食べない","洋食好み","野菜少ない","果物少ない","大豆製品(植物性たんぱく質)少ない","加工食品やインスタント食品をよく食べる"],"km":[{"id":"F068","n":"十全大補湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F163","n":"人参養栄湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F259","n":"当帰建中湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"老人性認知症":{"did":"D026","ev":"C","rf":["欠食型（朝食抜き）","偏食型","脂肪","飲酒(10年以上の大酒）","魚介類食べない","青魚を食べない","野菜少ない","果物少ない"],"km":[{"id":"F051","n":"柴苓湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F249","n":"釣藤散","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F256","n":"大柴胡湯","p":["PATH_01"],"m":["MBT55-001"]}]},
"腰痛":{"did":"D008","ev":"A","rf":["暴飲・暴食型","脂肪","飲酒","甘物","肉多い","乳製品少ない","大豆製品(植物性たんぱく質)少ない"],"km":[{"id":"F021","n":"響声破笛丸","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F068","n":"十全大補湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F239","n":"五積散","p":["PATH_01"],"m":["MBT55-001"]}]},
"月経困難症":{"did":"D010","ev":"A","rf":["欠食型（朝食抜き）","偏食型","肉食べない","魚介類食べない","大豆製品(植物性たんぱく質)少ない","加工食品やインスタント食品をよく食べる"],"km":[{"id":"F023","n":"駆風解毒湯","p":["PATH_04"],"m":["MBT55-001"]},{"id":"F053","n":"三黄瀉心湯","p":["PATH_01"],"m":["MBT55-001"]},{"id":"F106","n":"独活葛根湯","p":["PATH_04"],"m":["MBT55-001"]}]}
};

// MBT55経路
const MBT55 = {
  PATH_01:{name:"Actinobacteria / Deglycosylation / Sulfur Metabolism",nameJ:"放線菌・脱糖・硫黄代謝",color:"#38bdf8",fn:["Deglycosylation of glycosides","Sulfur compound metabolism","Alkaloid activation"]},
  PATH_02:{name:"Mineral Reduction / Reduction Metabolism",nameJ:"ミネラル還元・還元代謝",color:"#34d399",fn:["Iron absorption promotion","Antioxidant regeneration","Mineral activation"]},
  PATH_03:{name:"Lipid Metabolism / Micelle Formation",nameJ:"脂質代謝・ミセル化",color:"#f97316",fn:["Micellization of fat-soluble components","Enhanced carotenoid absorption","Improved lipid metabolism"]},
  PATH_04:{name:"Yeast / Aromatic Compound Degradation",nameJ:"酵母・芳香族分解",color:"#a78bfa",fn:["Essential oil component activation","Terpene metabolism","Neurotransmitter precursor generation"]},
  PATH_05:{name:"Polysaccharide Degradation / Prebiotics",nameJ:"多糖類分解・プレバイオティクス",color:"#fbbf24",fn:["Dietary fiber fermentation","Short-chain fatty acid production","Immune regulation"]},
};

const D2P = {"糖尿病":["PATH_03","PATH_05"],"高血圧":["PATH_01","PATH_02"],"高脂血症":["PATH_03","PATH_05"],"心筋梗塞":["PATH_03","PATH_01"],"脳梗塞":["PATH_03","PATH_01"],"動脈硬化":["PATH_03","PATH_01"],"肥満症":["PATH_03","PATH_05"],"脂肪肝":["PATH_03","PATH_04"],"大腸がん":["PATH_05","PATH_01"],"慢性胃炎":["PATH_04","PATH_02"],"過敏性腸症候群":["PATH_05","PATH_04"],"アトピー性皮膚炎":["PATH_01","PATH_05"],"骨粗鬆症":["PATH_02"],"貧血":["PATH_02"],"老人性認知症":["PATH_03","PATH_04"]};

const DCAT_MAP = {"胃がん":"cancer","大腸がん":"cancer","肺がん":"cancer","肝臓がん":"cancer","膵臓がん":"cancer","乳がん":"cancer","子宮がん":"cancer","高血圧":"cardiovascular","高脂血症":"cardiovascular","狭心症":"cardiovascular","心筋梗塞":"cardiovascular","心不全":"cardiovascular","脳梗塞":"cardiovascular","脳出血":"cardiovascular","動脈硬化":"cardiovascular","糖尿病":"metabolic","肥満症":"metabolic","脂肪肝":"metabolic","痛風・高尿酸血症":"metabolic","慢性胃炎":"digestive","急性胃炎":"digestive","胃・十二指腸潰瘍":"digestive","過敏性腸症候群":"digestive","便秘":"digestive","下痢":"digestive","肝炎":"digestive","肝硬変":"digestive","アトピー性皮膚炎":"immune","アレルギー性鼻炎・花粉症":"immune","食物アレルギー":"immune","貧血":"blood","骨粗鬆症":"bone"};
const DCAT_COLOR = {"cancer":"#ef4444","cardiovascular":"#f97316","metabolic":"#eab308","digestive":"#22c55e","immune":"#8b5cf6","blood":"#ec4899","bone":"#64748b"};
const getDColor = d => DCAT_COLOR[DCAT_MAP[d]] || "#475569";
const getDCatLabel = (d, lang) => {
  const cat = DCAT_MAP[d] || "other";
  const labels = {en:{cancer:"Cancer",cardiovascular:"Cardiovascular",metabolic:"Metabolic",digestive:"Digestive",immune:"Immune",blood:"Blood",bone:"Bone",other:"Other"},ja:{cancer:"がん",cardiovascular:"心血管",metabolic:"代謝",digestive:"消化器",immune:"免疫",blood:"血液",bone:"骨",other:"その他"}};
  return labels[lang][cat] || cat;
};
const EV_COLOR = {"A":"#22c55e","B":"#38bdf8","C":"#94a3b8"};

// ============================================================
// 推論エンジン
// ============================================================
function runEngine(answers) {
  const activeRFs = {};
  const impacts = [];
  Object.entries(answers).forEach(([qid, ans]) => {
    if (!ans || ans === "なし" || ans === "No") return;
    const q = Q[qid]; if (!q) return;
    const intensity = (ans === "よくある" || ans === "Often") ? 1.0 : 0.6;
    q.rf.forEach(rf => { activeRFs[rf] = Math.max(activeRFs[rf]||0, intensity * q.w); });
    impacts.push({ qe: q.qe, qj: q.qj, me: q.me, mj: q.mj, cat: q.cat, sev: ans, w: q.w });
  });

  const scores = {};
  Object.entries(DM).forEach(([d, v]) => {
    if (!v.rf.length) return;
    let s = 0;
    v.rf.forEach(rf => { if (activeRFs[rf]) s += activeRFs[rf]; });
    s /= v.rf.length;
    if (s > 0.05) scores[d] = { score: Math.min(s, 1.0), ev: v.ev };
  });
  const sorted = Object.entries(scores).sort((a,b) => b[1].score - a[1].score);

  const pAct = {PATH_01:0,PATH_02:0,PATH_03:0,PATH_04:0,PATH_05:0};
  sorted.slice(0,10).forEach(([d]) => {
    (DM[d]?.km||[]).forEach(k => {
      (k.p||[]).forEach(p => { pAct[p] = (pAct[p]||0) + 0.15; });
    });
  });
  const maxAct = Math.max(...Object.values(pAct), 0.1);
  Object.keys(pAct).forEach(p => { pAct[p] = Math.min(pAct[p]/maxAct, 1.0); });

  const kampoMap = {};
  sorted.slice(0,8).forEach(([d, {score}]) => {
    (DM[d]?.km||[]).forEach(k => {
      if (!kampoMap[k.id]) kampoMap[k.id] = { ...k, forDisease: d, diseaseScore: score };
    });
  });
  const kampoRecs = Object.values(kampoMap).sort((a,b) => b.diseaseScore - a.diseaseScore).slice(0, 6);
  const avgRisk = sorted.slice(0,10).reduce((s,[,v]) => s+v.score, 0) / Math.max(sorted.slice(0,10).length, 1);
  const score = Math.round((1 - avgRisk) * 100);
  return { sorted, activeRFs, impacts, pAct, kampoRecs, score };
}

// ============================================================
// UI
// ============================================================
const C = {
  app:{minHeight:"100vh",background:"#060c18",fontFamily:"'Noto Sans JP','Segoe UI',sans-serif",color:"#e2e8f0"},
  wrap:{maxWidth:"880px",margin:"0 auto",padding:"18px 14px"},
  card:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",padding:"18px",marginBottom:"12px"},
  lbl:{fontSize:"10px",letterSpacing:"0.15em",textTransform:"uppercase",color:"#38bdf8",fontWeight:600,marginBottom:"12px",display:"block"},
  btn:{padding:"9px 18px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:600,transition:"all 0.15s"},
  btnP:{background:"linear-gradient(135deg,#0ea5e9,#6366f1)",color:"white"},
  btnG:{background:"rgba(255,255,255,0.06)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.1)"},
  badge:{display:"inline-block",padding:"2px 7px",borderRadius:"100px",fontSize:"10px",fontWeight:600},
  tag:{display:"inline-block",padding:"3px 7px",background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:"5px",fontSize:"10px",color:"#38bdf8",margin:"2px"},
};
const RC = s => s>0.55?"#ef4444":s>0.3?"#f97316":s>0.15?"#eab308":"#22c55e";
const getRLabel = (s, lang) => {
  const t = T[lang];
  return s>0.55?t.highRisk:s>0.3?t.midHighRisk:s>0.15?t.midRisk:t.lowRisk;
};

const CATS_ORDER = ["eating_habits","lifestyle","symptoms","comprehensive"];
const PER_PAGE = 10;

export default function HealthBookV5() {
  const [lang, setLang] = useState("ja");
  const [screen, setScreen] = useState("intro");
  const [answers, setAnswers] = useState({});
  const [catIdx, setCatIdx] = useState(0);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState(null);
  const [tab, setTab] = useState("risk");
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [expandedDisease, setExpandedDisease] = useState(null);

  const t = T[lang];

  const qByCat = useMemo(() => {
    const out = { eating_habits:[], lifestyle:[], symptoms:[], comprehensive:[] };
    Object.entries(Q).forEach(([id, q]) => {
      if (out[q.cat]) out[q.cat].push({id, ...q});
    });
    return out;
  }, []);

  const currentCat = CATS_ORDER[catIdx];
  const currentQs = qByCat[currentCat] || [];
  const totalPages = Math.ceil(currentQs.length / PER_PAGE);
  const pageQs = currentQs.slice(page * PER_PAGE, (page+1) * PER_PAGE);
  const totalQ = Object.keys(Q).length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(answeredCount / totalQ * 100);

  const startAnalysis = useCallback(() => {
    setScreen("analyzing"); setAnalyzeStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++; setAnalyzeStep(s);
      if (s >= t.steps.length) {
        clearInterval(iv);
        setTimeout(() => { setResults(runEngine(answers)); setScreen("results"); }, 400);
      }
    }, 380);
  }, [answers, lang]);

  const demoFill = () => {
    const d = {};
    ["1","3","4","5","8","9","10","11","13","16","17","21","24","25","32","33","34","35","37","41","45","47","50","55","56","60","68","71","75","90","100","108","109","112","114","119","128","129","130","135","199"].forEach(id => {
      d[id] = Math.random() > 0.4 ? (lang==="ja"?"よくある":"Often") : (lang==="ja"?"ときどき":"Sometimes");
    });
    setAnswers(d);
  };

  const goNext = () => {
    if (page < totalPages - 1) { setPage(p=>p+1); return; }
    if (catIdx < CATS_ORDER.length - 1) { setCatIdx(i=>i+1); setPage(0); return; }
    startAnalysis();
  };
  const goPrev = () => {
    if (page > 0) { setPage(p=>p-1); return; }
    if (catIdx > 0) { setCatIdx(i=>i-1); setPage(Math.ceil((qByCat[CATS_ORDER[catIdx-1]]||[]).length/PER_PAGE)-1); }
  };
  const isFirst = catIdx === 0 && page === 0;
  const isLast = catIdx === CATS_ORDER.length - 1 && page === totalPages - 1;

  const LangToggle = () => (
    <div style={{display:"flex",gap:"5px",marginBottom:"14px",justifyContent:"flex-end"}}>
      {["ja","en"].map(l=>(
        <button key={l} style={{...C.btn,padding:"5px 12px",
          background:lang===l?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.05)",
          border:`1px solid ${lang===l?"#38bdf8":"rgba(255,255,255,0.1)"}`,
          color:lang===l?"#38bdf8":"#64748b",fontSize:"11px"
        }} onClick={()=>setLang(l)}>{l==="ja"?"🇯🇵 日本語":"🇺🇸 English"}</button>
      ))}
    </div>
  );

  // ── INTRO ──
  if (screen === "intro") return (
    <div style={C.app}>
      <div style={C.wrap}>
        <LangToggle/>
        <div style={{textAlign:"center",padding:"20px 0 16px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.35em",color:"#38bdf8",marginBottom:"8px"}}>HEALTHBOOK PLATFORM v5.0</div>
          <h1 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:700,background:"linear-gradient(90deg,#38bdf8,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 6px",lineHeight:1.3}}>
            {t.version}
          </h1>
          <p style={{fontSize:"11px",color:"#475569",margin:0}}>{t.subtitle}</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px",marginBottom:"14px"}}>
          {[
            {icon:"📋",n:"200",label:lang==="ja"?"問診問（完全版）":"Questions (Full)",sub:lang==="ja"?"食習慣50+生活習慣50+症状98+総合2":"Eating 50 + Lifestyle 50 + Symptoms 98 + General 2"},
            {icon:"🔬",n:"21+",label:lang==="ja"?"統合疾病マトリックス":"Integrated Disease Matrix",sub:lang==="ja"?"ICD-11対応 食生活×疾患":"ICD-11 Diet × Disease"},
            {icon:"⚗️",n:"293",label:lang==="ja"?"漢方処方ライブラリー":"Kampo Formula Library",sub:lang==="ja"?"disease_matrix_137_kampo.json":"disease_matrix_137_kampo.json"},
            {icon:"🦠",n:"5",label:lang==="ja"?"MBT55代謝経路":"MBT55 Metabolic Pathways",sub:"PATH_01 – PATH_05"},
          ].map(m=>(
            <div key={m.n} style={{...C.card,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:"22px",marginBottom:"4px"}}>{m.icon}</div>
              <div style={{fontSize:"22px",fontWeight:700,color:"#38bdf8"}}>{m.n}</div>
              <div style={{fontSize:"11px",fontWeight:600,marginBottom:"2px"}}>{m.label}</div>
              <div style={{fontSize:"10px",color:"#475569"}}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{...C.card,borderColor:"rgba(129,140,248,0.3)",background:"rgba(99,102,241,0.06)",marginBottom:"12px"}}>
          <div style={C.lbl}>{lang==="ja"?"v5.0 新機能":"v5.0 New Features"}</div>
          {(lang==="ja"?[
            "questionnaire_200_jp_new.json × questionnaire_200_en_new.json 完全統合（全200問）",
            "日本語 / English リアルタイム切り替え（ボタン一つで全UI翻訳）",
            "問診・代謝解析・漢方推奨・APIレスポンス すべて日英対応",
            "症状カテゴリ98問を含む完全問診セット実装",
          ]:[
            "Full integration of questionnaire_200_jp_new.json × questionnaire_200_en_new.json (all 200 items)",
            "Real-time Japanese / English toggle (one button translates entire UI)",
            "Questionnaire, metabolic analysis, Kampo recommendations, and API — all bilingual",
            "Complete symptom questionnaire (98 items) fully implemented",
          ]).map((f,i)=>(
            <div key={i} style={{fontSize:"11px",color:"#94a3b8",display:"flex",gap:"6px",marginBottom:"4px"}}>
              <span style={{color:"#34d399",flexShrink:0}}>✓</span>{f}
            </div>
          ))}
        </div>

        <div style={{...C.card,background:"rgba(239,68,68,0.05)",borderColor:"rgba(239,68,68,0.12)",marginBottom:"14px"}}>
          <p style={{fontSize:"11px",color:"#fca5a5",margin:0,lineHeight:1.6}}>⚠️ {t.disclaimer}</p>
        </div>

        <button style={{...C.btn,...C.btnP,width:"100%",padding:"13px",fontSize:"14px"}} onClick={()=>setScreen("questionnaire")}>{t.startBtn}</button>
        <div style={{textAlign:"center",marginTop:"10px"}}>
          <button style={{background:"none",border:"none",color:"#475569",fontSize:"11px",cursor:"pointer"}} onClick={()=>{demoFill();startAnalysis();}}>{t.demoBtn}</button>
        </div>
      </div>
    </div>
  );

  // ── QUESTIONNAIRE ──
  if (screen === "questionnaire") return (
    <div style={C.app}>
      <div style={C.wrap}>
        <LangToggle/>
        <div style={{marginBottom:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#64748b",marginBottom:"5px"}}>
            <span>{answeredCount}/{totalQ} {t.answeredOf} ({progress}%)</span>
            <span style={{color:"#38bdf8"}}>{t.catLabel[currentCat]} — {t.page} {page+1}/{totalPages}</span>
          </div>
          <div style={{height:"3px",background:"rgba(255,255,255,0.08)",borderRadius:"2px"}}>
            <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#0ea5e9,#6366f1)",transition:"width 0.3s"}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:"5px",marginBottom:"12px"}}>
          {CATS_ORDER.map((cat,i)=>{
            const catAns = (qByCat[cat]||[]).filter(q=>answers[q.id]).length;
            const catTotal = (qByCat[cat]||[]).length;
            return (
              <button key={cat} style={{...C.btn,flex:1,padding:"7px 3px",
                background:catIdx===i?"rgba(56,189,248,0.15)":"rgba(255,255,255,0.04)",
                border:`1px solid ${catIdx===i?"#38bdf8":"rgba(255,255,255,0.08)"}`,
                color:catIdx===i?"#38bdf8":"#64748b",fontSize:"10px",lineHeight:1.3
              }} onClick={()=>{setCatIdx(i);setPage(0);}}>
                {t.catLabel[cat]}<br/><span style={{fontSize:"9px",opacity:0.7}}>{catAns}/{catTotal}</span>
              </button>
            );
          })}
        </div>

        {pageQs.map(q => {
          const ans = answers[q.id];
          const qText = lang==="ja" ? q.qj : q.qe;
          const mText = lang==="ja" ? q.mj : q.me;
          return (
            <div key={q.id} style={{...C.card,marginBottom:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                <span style={{fontSize:"12px",fontWeight:500,lineHeight:1.5,flex:1}}>{qText}</span>
                <span style={{fontSize:"9px",color:"#334155",marginLeft:"8px",flexShrink:0}}>Q{q.id}</span>
              </div>
              <div style={{display:"flex",gap:"6px"}}>
                {t.ansOpts.map(opt=>{
                  const isYes = opt===t.ansOpts[0];
                  const isMid = opt===t.ansOpts[1];
                  const isNo = opt===t.ansOpts[2];
                  const isSelected = ans===opt;
                  const selColor = isYes?"#ef4444":isMid?"#eab308":"#22c55e";
                  return (
                    <button key={opt} style={{...C.btn,flex:1,padding:"7px 4px",
                      background:isSelected?`${selColor}18`:"rgba(255,255,255,0.04)",
                      border:`1.5px solid ${isSelected?selColor:"rgba(255,255,255,0.08)"}`,
                      color:isSelected?selColor:"#64748b",fontSize:"11px"
                    }} onClick={()=>setAnswers(prev=>({...prev,[q.id]:opt}))}>{opt}</button>
                  );
                })}
              </div>
              {ans && ans!==t.ansOpts[2] && (
                <div style={{fontSize:"10px",color:"#38bdf8",marginTop:"6px",padding:"4px 8px",background:"rgba(56,189,248,0.05)",borderRadius:"5px",borderLeft:"2px solid #38bdf8"}}>
                  {mText}
                </div>
              )}
            </div>
          );
        })}

        <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
          <button style={{...C.btn,...C.btnG,flex:"0 0 auto"}} onClick={goPrev} disabled={isFirst}>{t.prev}</button>
          <button style={{...C.btn,...C.btnP,flex:1}} onClick={goNext}>
            {isLast ? t.analyze : t.next}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:"8px"}}>
          <button style={{background:"none",border:"none",color:"#334155",fontSize:"10px",cursor:"pointer"}} onClick={startAnalysis}>{t.skip}</button>
        </div>
      </div>
    </div>
  );

  // ── ANALYZING ──
  if (screen === "analyzing") return (
    <div style={C.app}>
      <div style={C.wrap}>
        <div style={{textAlign:"center",paddingTop:"60px"}}>
          <div style={{fontSize:"36px",marginBottom:"16px"}}>🧬</div>
          <h2 style={{fontSize:"16px",fontWeight:600,marginBottom:"22px"}}>{t.analyzing}</h2>
          <div style={C.card}>
            {t.steps.map((step,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:i<t.steps.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                <div style={{width:"16px",height:"16px",borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",
                  background:i<analyzeStep?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${i<analyzeStep?"#38bdf8":"rgba(255,255,255,0.08)"}`,color:"#38bdf8"}}>
                  {i<analyzeStep?"✓":""}
                </div>
                <span style={{fontSize:"11px",color:i<analyzeStep?"#e2e8f0":"#334155"}}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULTS ──
  if (screen === "results" && results) {
    const {sorted,activeRFs,impacts,pAct,kampoRecs,score} = results;
    const top10 = sorted.slice(0,10);
    const rfList = Object.entries(activeRFs).sort((a,b)=>b[1]-a[1]).slice(0,16);

    return (
      <div style={C.app}>
        <div style={C.wrap}>
          <LangToggle/>
          {/* Score */}
          <div style={{...C.card,background:"linear-gradient(135deg,rgba(14,165,233,0.1),rgba(99,102,241,0.1))",borderColor:"rgba(56,189,248,0.25)",textAlign:"center",marginBottom:"14px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#38bdf8",marginBottom:"4px"}}>HealthBook v5.0 — {t.score}</div>
            <div style={{fontSize:"58px",fontWeight:700,lineHeight:1,background:"linear-gradient(90deg,#38bdf8,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{score}</div>
            <div style={{fontSize:"11px",color:"#64748b",marginTop:"3px"}}>{t.scoreDesc}</div>
            <div style={{marginTop:"8px",fontSize:"11px",color:"#94a3b8"}}>
              {lang==="ja"?"回答":"Answered"} <strong style={{color:"#38bdf8"}}>{answeredCount}</strong>　
              {lang==="ja"?"リスク因子":"Risk factors"} <strong style={{color:"#f97316"}}>{rfList.length}</strong>　
              {lang==="ja"?"ハイリスク":"High risk"} <strong style={{color:"#ef4444"}}>{top10.filter(([,v])=>v.score>0.4).length}</strong>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:"5px",marginBottom:"12px",overflowX:"auto",paddingBottom:"3px"}}>
            {t.tabs.map((tb,i)=>{
              const tid = ["risk","kampo","pathway","metabolic","api"][i];
              return (
                <button key={tid} style={{...C.btn,padding:"7px 10px",whiteSpace:"nowrap",
                  background:tab===tid?"rgba(56,189,248,0.15)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${tab===tid?"#38bdf8":"rgba(255,255,255,0.08)"}`,
                  color:tab===tid?"#38bdf8":"#64748b"
                }} onClick={()=>setTab(tid)}>{tb}</button>
              );
            })}
          </div>

          {/* TAB: 疾病リスク */}
          {tab==="risk" && (
            <div>
              <div style={C.card}>
                <div style={C.lbl}>🔬 {t.riskTitle}</div>
                {top10.length===0 ? <p style={{color:"#64748b",fontSize:"12px"}}>{t.noRisk}</p>
                : top10.map(([d,{score:s}],i)=>{
                  const cc = getDColor(d);
                  const dm = DM[d];
                  const isExpanded = expandedDisease === d;
                  return (
                    <div key={d} style={{marginBottom:"12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",cursor:"pointer"}}
                        onClick={()=>setExpandedDisease(isExpanded?null:d)}>
                        <div style={{display:"flex",alignItems:"center",gap:"5px",flexWrap:"wrap",flex:1}}>
                          <span style={{fontSize:"10px",color:"#475569",width:"16px"}}>{i+1}</span>
                          <span style={{fontSize:"13px",fontWeight:500}}>{d}</span>
                          <span style={{...C.badge,background:`${cc}20`,color:cc,border:`1px solid ${cc}40`,fontSize:"9px"}}>{getDCatLabel(d,lang)}</span>
                          {dm?.ev && <span style={{...C.badge,background:`${EV_COLOR[dm.ev]||'#64748b'}18`,color:EV_COLOR[dm.ev]||'#64748b',border:`1px solid ${EV_COLOR[dm.ev]||'#64748b'}30`,fontSize:"9px"}}>{t.evLabel}.{dm.ev}</span>}
                          {dm?.did && <span style={{...C.badge,background:"rgba(255,255,255,0.04)",color:"#475569",fontSize:"9px"}}>{dm.did}</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                          <span style={{...C.badge,background:`${RC(s)}20`,color:RC(s),border:`1px solid ${RC(s)}40`}}>{getRLabel(s,lang)} {Math.round(s*100)}%</span>
                          <span style={{color:"#64748b",fontSize:"11px"}}>{isExpanded?"▲":"▼"}</span>
                        </div>
                      </div>
                      <div style={{height:"5px",background:"rgba(255,255,255,0.06)",borderRadius:"3px",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.round(s*100)}%`,background:RC(s),transition:"width 1s ease"}}/>
                      </div>
                      {isExpanded && dm?.km && dm.km.length > 0 && (
                        <div style={{marginTop:"8px",padding:"10px",background:"rgba(129,140,248,0.06)",borderRadius:"8px",border:"1px solid rgba(129,140,248,0.15)"}}>
                          <div style={{fontSize:"10px",color:"#818cf8",marginBottom:"7px"}}>⚗️ {lang==="ja"?"推奨漢方処方":"Recommended Kampo"}</div>
                          {dm.km.map(k=>{
                            const pc = MBT55[k.p?.[0]]?.color||"#64748b";
                            return (
                              <div key={k.id} style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"5px",flexWrap:"wrap"}}>
                                <span style={{...C.badge,background:"rgba(255,255,255,0.05)",color:"#475569",fontSize:"9px"}}>{k.id}</span>
                                <span style={{fontSize:"12px",fontWeight:600,color:"#818cf8"}}>{k.n}</span>
                                <span style={{...C.badge,background:`${pc}20`,color:pc,border:`1px solid ${pc}40`,fontSize:"9px"}}>{k.p?.[0]}</span>
                                <span style={{...C.badge,background:"rgba(251,191,36,0.1)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.2)",fontSize:"9px"}}>{k.m?.[0]}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={C.card}>
                <div style={C.lbl}>⚠️ {t.rfTitle}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                  {rfList.map(([rf,v])=>(
                    <span key={rf} style={{...C.badge,background:"rgba(239,68,68,0.1)",color:"#fca5a5",border:"1px solid rgba(239,68,68,0.18)",fontSize:"10px"}}>
                      {rf} <span style={{opacity:0.6}}>{Math.round(v*100)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: 漢方処方 */}
          {tab==="kampo" && (
            <div style={C.card}>
              <div style={C.lbl}>⚗️ {t.kampoTitle}</div>
              {kampoRecs.length===0 ? <p style={{color:"#64748b",fontSize:"12px"}}>{lang==="ja"?"問診をより多く回答してください。":"Please answer more questionnaire items."}</p>
              : kampoRecs.map((k,i)=>{
                const pc = MBT55[k.p?.[0]]?.color||"#64748b";
                const pname = lang==="ja" ? (MBT55[k.p?.[0]]?.nameJ||"") : (MBT55[k.p?.[0]]?.name||"");
                return (
                  <div key={k.id} style={{padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"5px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"10px",color:"#475569"}}>{i+1}</span>
                        <span style={{fontSize:"14px",fontWeight:700,color:"#818cf8"}}>{k.n}</span>
                        <span style={{fontSize:"10px",color:"#475569"}}>{k.id}</span>
                      </div>
                      <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                        <span style={{...C.badge,background:`${pc}20`,color:pc,border:`1px solid ${pc}40`,fontSize:"9px"}}>{k.p?.[0]}</span>
                        <span style={{...C.badge,background:"rgba(251,191,36,0.1)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.2)",fontSize:"9px"}}>{k.m?.[0]}</span>
                      </div>
                    </div>
                    <div style={{fontSize:"10px",color:"#64748b",marginBottom:"3px"}}>
                      {lang==="ja"?"適応疾患":"For disease"}: <strong style={{color:"#94a3b8"}}>{k.forDisease}</strong>
                    </div>
                    {pname && <div style={{fontSize:"10px",color:"#475569"}}>{lang==="ja"?"代謝経路":"Pathway"}: {pname}</div>}
                  </div>
                );
              })}
              <p style={{fontSize:"10px",color:"#475569",marginTop:"10px",marginBottom:0}}>{t.kampoNote}</p>
            </div>
          )}

          {/* TAB: MBT55経路 */}
          {tab==="pathway" && (
            <div style={C.card}>
              <div style={C.lbl}>🦠 {t.pathwayTitle}</div>
              {Object.entries(MBT55).map(([pid,p])=>{
                const act = pAct[pid]||0;
                const pname = lang==="ja" ? p.nameJ : p.name;
                return (
                  <div key={pid} style={{marginBottom:"14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                        <span style={{...C.badge,background:`${p.color}20`,color:p.color,border:`1px solid ${p.color}40`}}>{pid}</span>
                        <span style={{fontSize:"12px",fontWeight:500}}>{pname}</span>
                      </div>
                      <span style={{fontSize:"10px",color:act>0.6?"#ef4444":act>0.35?"#f97316":"#22c55e",fontWeight:600}}>
                        {act>0.6?t.need:act>0.35?t.caution:t.good} {Math.round(act*100)}%
                      </span>
                    </div>
                    <div style={{height:"7px",background:"rgba(255,255,255,0.06)",borderRadius:"4px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.round(act*100)}%`,background:p.color,opacity:0.85,transition:"width 1s ease"}}/>
                    </div>
                    <div style={{marginTop:"5px",display:"flex",flexWrap:"wrap",gap:"3px"}}>
                      {p.fn.slice(0,2).map(f=><span key={f} style={C.tag}>{f}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: 代謝解析 */}
          {tab==="metabolic" && (
            <div style={C.card}>
              <div style={C.lbl}>🔄 {t.metabolicTitle}</div>
              {impacts.length===0 ? <p style={{color:"#64748b",fontSize:"12px"}}>{t.noMetabolic}</p>
              : impacts.sort((a,b)=>b.w-a.w).slice(0,15).map((m,i)=>{
                const qText = lang==="ja" ? m.qj : m.qe;
                const mText = lang==="ja" ? m.mj : m.me;
                const catLabel = t.catLabel[m.cat] || m.cat;
                return (
                  <div key={i} style={{padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    <div style={{display:"flex",gap:"6px",marginBottom:"4px",alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{...C.badge,background:["Often","よくある"].includes(m.sev)?"rgba(239,68,68,0.15)":"rgba(234,179,8,0.15)",
                        color:["Often","よくある"].includes(m.sev)?"#ef4444":"#eab308",fontSize:"9px"}}>{m.sev}</span>
                      <span style={{...C.badge,background:"rgba(255,255,255,0.06)",color:"#64748b",fontSize:"9px"}}>{catLabel}</span>
                      <span style={{fontSize:"11px",color:"#94a3b8"}}>{qText}</span>
                    </div>
                    <div style={{fontSize:"10px",color:"#38bdf8",paddingLeft:"4px",borderLeft:"2px solid #38bdf8"}}>→ {mText}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: API */}
          {tab==="api" && (
            <div style={C.card}>
              <div style={C.lbl}>🔌 {t.apiTitle}</div>
              <pre style={{fontSize:"10px",color:"#64748b",overflow:"auto",background:"rgba(0,0,0,0.4)",padding:"12px",borderRadius:"7px",margin:0,lineHeight:1.7,maxHeight:"400px"}}>
{JSON.stringify({
  engine:"HealthBook-v5.0-Bilingual",
  repository:"github.com/shimojok/HealthBook-Integrated",
  language: lang,
  data_sources:{
    questionnaire:`questionnaire_200_${lang}_new.json (200 items)`,
    diet_matrix:"病気と食生活の関係シート.xlsx (Hamada Method)",
    kampo_matrix:"disease_matrix_137_kampo.json (ICD-11)",
    kampo_library:"kampo_metabolic_library.json (293 formulas)",
    mbt55:"Five metabolic pathways (PATH_01-05)"
  },
  metabolic_health_score: score,
  answered_questions: answeredCount,
  top_disease_risks: top10.slice(0,5).map(([d,{score:s,ev}])=>({
    disease_ja: d,
    icd11_id: DM[d]?.did||"",
    score: Math.round(s*100),
    category: getDCatLabel(d,"en"),
    evidence_level: ev||DM[d]?.ev||"",
    recommended_kampo: (DM[d]?.km||[]).map(k=>k.n)
  })),
  mbt55_pathway_activity: Object.fromEntries(Object.entries(pAct).map(([k,v])=>[k,Math.round(v*100)])),
  kampo_recommendations: kampoRecs.slice(0,4).map(k=>({
    formula_id:k.id, name_ja:k.n, pathway:k.p?.[0], mbt55:k.m?.[0], for_disease:k.forDisease
  })),
  active_risk_factors: rfList.slice(0,8).map(([rf])=>rf),
  disclaimer:"Metabolic pathway analysis only. Not for medical diagnosis or treatment."
},null,2)}
              </pre>
            </div>
          )}

          <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
            <button style={{...C.btn,...C.btnG,flex:1}} onClick={()=>setScreen("questionnaire")}>{t.backToQ}</button>
            <button style={{...C.btn,...C.btnG,flex:1}} onClick={()=>{setScreen("intro");setAnswers({});setResults(null);setExpandedDisease(null);}}>{t.restart}</button>
          </div>
          <p style={{textAlign:"center",fontSize:"10px",color:"#1e293b",marginTop:"12px",lineHeight:1.6}}>
            HealthBook v5.0 | shimojok/HealthBook-Integrated<br/>
            {lang==="ja"?"浜田式200問×疾病マトリックス×293漢方×MBT55五経路 日英完全統合":"Hamada 200Q × Disease Matrix × 293 Kampo × MBT55 Pathways — Bilingual"}
          </p>
        </div>
      </div>
    );
  }
  return null;
}
