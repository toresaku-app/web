# Batch 9: イラスト2枚化 — 開始姿勢フレーム（第2弾・35種）

> 2026-08-01 作成。Batch 8（頻用30種、完了）に続く第2弾。
> **既存イラストを「動作フレーム」として流用**し、開始姿勢のみ新規生成する方式は同じ。
>
> 選定基準: 残り70種のうち **可動域が大きく、2枚に分けると動きが伝わる運動**を優先した。
> 逆に等尺性・保持系（プランク、サイドプランク、片脚立位の保持など）や、
> 開始と動作の絵がほぼ同じになる運動は Batch 10 以降に回している（→ 末尾の「今回除外」）。

---

## 生成ルート（Batch 8 と同じ）

Codex にこのファイルを読ませて依頼する:

1. **各運動の既存イラストを入力（参照画像）にして**、「共通スタイル指示 + 個別プロンプト」で開始姿勢を生成
   - 参照元: `assets/illustrations/originals/{id}.png`（無ければ `assets/illustrations/{id}.webp`）
   - **参照画像なしのテキストだけで生成しない**こと（人物・視点がバラつき、動作フレームと並べたとき別人になる）
2. 出力: `assets/illustrations/originals/{id}-start.png`
3. **出力サイズは参照画像と同じピクセル寸法に揃える**
   （Batch 8 では 4:3 と 3:2 が混在し、7件を後から補正する手間が発生した）
4. 途中で失敗しても、生成済みファイルはスキップして再開できるようにする

Batch 8 は初回1枚で検収したが、方式は実証済みなので今回は **5枚生成 → まとめて確認 → 残り30枚** の進め方でよい。

---

## 共通スタイル指示（毎回最初に入れる）

```
添付の運動イラストと同一シリーズの「開始姿勢」のイラストを1枚作成してください。

【最重要】
- 添付画像と同一人物・同一の服装・同一の視点（カメラアングル）・同一の構図で描く
- 添付画像は「動作中」、今回作るのは「動作を始める前の開始姿勢」
- 出力サイズは添付画像と同じピクセル寸法にする

【スタイル】
- セミリアリスティックなフラットイラスト
- 白背景、影なし
- 人物: 中年男性、短髪黒髪、白い半袖Tシャツ、紺のハーフパンツ、白い靴下
- 輪郭線: 細い黒線
- 色数: 最小限（肌色、白、紺、青）
- 補助具（椅子・タオル・杖・棒・台など）は添付画像と同じ位置・同じ色で描く
- 医療的に正確な関節角度と体の向き
- 矢印は入れない（開始姿勢のため）
- 余計なテキストや文字は入れない
```

---

## 個別プロンプト（35種）

### 上肢・肩（10種）

**1. wall-pushup — ウォールプッシュアップ** → `wall-pushup-start.png`
```
壁から腕一本分離れて立ち、両手を肩幅で壁についた状態。肘はまっすぐ伸びており、
体はまだ壁に近づいていない（肘を曲げる前）。体は頭から踵まで一直線。
視点: 添付と同じ横から（側面図）。
```

**2. shoulder-abduction — 肩関節外転挙上** → `shoulder-abduction-start.png`
```
椅子に背筋を伸ばして座り、両腕を体側に自然に下ろした状態（横に上げる前）。
視点: 添付と同じ正面から。
```

**3. shoulder-external-rotation — 肩外旋運動** → `shoulder-external-rotation-start.png`
```
椅子に座り、肘を体側につけて90度に曲げ、前腕を体の正面（内側）に向けた状態
（外側に開く前）。
視点: 添付と同じ。
```

**4. shoulder-internal-rotation — 肩関節内旋運動** → `shoulder-internal-rotation-start.png`
```
椅子に座り、肘を体側につけて90度に曲げ、前腕を外側に開いた状態
（内側に閉じる前）。※ 外旋運動とは逆の開始位置になる
視点: 添付と同じ。
```

**5. scapular-elevation — 肩甲骨挙上運動** → `scapular-elevation-start.png`
```
椅子に背筋を伸ばして座り、両肩を自然に下ろした状態（すくめる前）。
視点: 添付と同じ（後方または正面、添付に合わせる）。
```

**6. scapular-depression — 肩甲骨下制運動** → `scapular-depression-start.png`
```
椅子に座り、両肩がやや上がったニュートラル位の状態（下に押し下げる前）。
視点: 添付と同じ。
```

**7. elbow-flexion — 肘関節屈曲運動** → `elbow-flexion-start.png`
```
椅子に座り、腕を体側に下ろして肘をまっすぐ伸ばした状態（曲げる前）。
おもり等の補助具があれば添付と同じものを持つ。
視点: 添付と同じ横から（側面図）。
```

**8. elbow-extension — 肘関節伸展運動** → `elbow-extension-start.png`
```
椅子に座り、肘を深く曲げた状態（伸ばす前）。※ 屈曲運動とは逆の開始位置
視点: 添付と同じ横から（側面図）。
```

**9. wall-climbing — 壁登り運動** → `wall-climbing-start.png`
```
壁に向かって立ち、指先を壁の低い位置（腰〜胸の高さ）に置いた状態
（壁を登らせていく前）。
視点: 添付と同じ。
```

**10. codman-exercise — コッドマン体操** → `codman-exercise-start.png`
```
前傾姿勢で片手を台や椅子について体を支え、もう一方の腕を真下に垂らして
静止した状態（振り子運動を始める前）。
視点: 添付と同じ横から（側面図）。
```

### 手・前腕（6種）

**11. wrist-extension — 手関節背屈運動** → `wrist-extension-start.png`
```
椅子に座り、前腕を机や太ももに置いて手首をまっすぐ（中間位）にした状態
（手の甲側に反らす前）。
視点: 添付と同じ横から。
```

**12. wrist-flexion — 手関節掌屈運動** → `wrist-flexion-start.png`
```
椅子に座り、前腕を置いて手首をまっすぐ（中間位）にした状態（手のひら側に曲げる前）。
視点: 添付と同じ横から。
```

**13. forearm-pronation-supination — 前腕回内・回外運動** → `forearm-pronation-supination-start.png`
```
椅子に座り、肘を90度に曲げて前腕を中間位（親指が上を向く）にした状態
（回す前）。
視点: 添付と同じ。
```

**14. hand-grip — グーパー運動** → `hand-grip-start.png`
```
椅子に座り、手を開いて指をまっすぐ伸ばした「パー」の状態（握る前）。
視点: 添付と同じ（手が大きく見えるアングル）。
```

**15. finger-opposition — 手指対立運動** → `finger-opposition-start.png`
```
手を開いて指をまっすぐ伸ばし、母指と他指がまだ触れていない状態
（対立させる前）。
視点: 添付と同じ。
```

**16. finger-extension — 手指伸展運動** → `finger-extension-start.png`
```
指を軽く曲げた状態（伸ばす前）。輪ゴム等の補助具があれば添付と同じものを装着。
視点: 添付と同じ。
```

### 体幹（6種）

**17. sit-up — シットアップ（腹筋）** → `sit-up-start.png`
```
仰向けに寝て両膝を曲げ、足底を床につけた状態。上体は床についている（起こす前）。
手の位置は添付と同じ。
視点: 添付と同じ横から（側面図）。
```

**18. trunk-rotation — トランクローテーション** → `trunk-rotation-start.png`
```
椅子に背筋を伸ばして座り、体幹を正面に向けた状態（ひねる前）。
腕の組み方は添付と同じ。
視点: 添付と同じ（上から見下ろす、または正面。添付に合わせる）。
```

**19. dead-bug — デッドバグ** → `dead-bug-start.png`
```
仰向けに寝て、両腕を天井に向けて伸ばし、両股関節・膝を90度に曲げた開始肢位
（手脚を伸ばして下ろす前）。腰は床につけている。
視点: 添付と同じ横から（側面図）。
```

**20. lateral-trunk-stretch — 体側ストレッチ** → `lateral-trunk-stretch-start.png`
```
椅子に背筋を伸ばして座り、片腕を頭上に上げて体幹はまっすぐ垂直の状態
（横に倒す前）。
視点: 添付と同じ正面から。
```

**21. williams-exercise — ウィリアムス体操** → `williams-exercise-start.png`
```
仰向けに寝て両膝を曲げ、足底を床につけた状態（膝を胸に引き寄せる前）。
視点: 添付と同じ横から（側面図）。
```

**22. mckenzie-exercise — マッケンジー体操** → `mckenzie-exercise-start.png`
```
うつ伏せに寝て、両肘を床につき前腕で軽く支えた状態、または上体を床につけた状態
（上体を反らせる前）。添付の動作フレームより低い姿勢にする。
視点: 添付と同じ横から（側面図）。
```

### 下肢（6種）

**23. hamstring-curl — ハムストリングスカール** → `hamstring-curl-start.png`
```
うつ伏せに寝て、両脚をまっすぐ伸ばした状態（膝を曲げて踵をお尻に近づける前）。
視点: 添付と同じ横から（側面図）。
```

**24. prone-hip-extension — 腹臥位股関節伸展運動** → `prone-hip-extension-start.png`
```
うつ伏せに寝て、両脚をまっすぐ伸ばして床につけた状態（脚を持ち上げる前）。
視点: 添付と同じ横から（側面図）。
```

**25. hip-flexion-training — 股関節屈曲訓練（立位）** → `hip-flexion-training-start.png`
```
椅子の背もたれに手を添えて両脚を揃えてまっすぐ立った状態（もも上げする前）。
視点: 添付と同じ横から（側面図）。
```

**26. single-leg-calf-raise — 片脚カーフレイズ** → `single-leg-calf-raise-start.png`
```
壁や椅子に手を添え、片脚立ちで踵を床につけた状態（つま先立ちする前）。
反対脚は軽く浮かせている。
視点: 添付と同じ横から（側面図）。
```

**27. ankle-plantarflexion — 足関節底屈運動** → `ankle-plantarflexion-start.png`
```
椅子に座り、足関節を中間位にした状態（つま先を下に押し下げる前）。
視点: 添付と同じ（足元が分かるアングル）。
```

**28. knee-flexion-rom — 膝関節屈曲ROM訓練** → `knee-flexion-rom-start.png`
```
椅子に座り、膝を伸ばした状態、または軽く曲げた状態（さらに深く曲げる前）。
添付の動作フレームより膝が伸びている位置にする。
視点: 添付と同じ横から（側面図）。
```

### バランス・ADL（7種）

**29. weight-shift-ap — 重心移動訓練（前後）** → `weight-shift-ap-start.png`
```
足を前後または肩幅に開き、体重が中央にあるまっすぐな立位（前後に移動する前）。
視点: 添付と同じ横から（側面図）。
```

**30. dynamic-reach — 動的バランス（リーチ訓練）** → `dynamic-reach-start.png`
```
まっすぐ立ち、腕を体側に下ろした状態（手を伸ばす前）。
視点: 添付と同じ。
```

**31. turning — 方向転換訓練** → `turning-start.png`
```
まっすぐ前を向いて立った状態（振り向く前）。足は揃っている。
視点: 添付と同じ。
```

**32. step-up-advanced — 段差昇降（応用）** → `step-up-advanced-start.png`
```
段差の手前にまっすぐ立ち、両足が床についている状態（昇る前）。
段差・手すりは添付と同じ形・同じ色。
視点: 添付と同じ横から（側面図）。
```

**33. chair-stand — 椅子からの立ち座り** → `chair-stand-start.png`
```
椅子に浅く腰掛け、両足を手前に引いた状態（立ち上がる前）。両手は太ももの上。
視点: 添付と同じ横から（側面図）。
```

**34. reach-training — リーチ動作訓練** → `reach-training-start.png`
```
椅子に背筋を伸ばして座り、腕を体側に下ろした状態（手を伸ばす前）。
対象物があれば添付と同じ位置に置く。
視点: 添付と同じ。
```

**35. upper-reach — 上肢リーチ訓練** → `upper-reach-start.png`
```
椅子に座り、両腕を体側に下ろした状態（上方や前方に伸ばす前）。
視点: 添付と同じ。
```

---

## 生成後のチェックリスト（1枚ごと）

- [ ] 添付（動作フレーム）と同一人物・同一視点・同一構図か？
- [ ] 「動作前」になっているか（動作中と見分けがつくか）？
- [ ] **出力サイズが参照画像と同じピクセル寸法か？**
- [ ] 矢印・テキストが入っていないか？
- [ ] 補助具の位置・色が動作フレームと一致しているか？
- [ ] 保存ファイル名: `{exercise-id}-start.png`

## 今回除外した35種（Batch 10 以降 / または2枚化しない）

**2枚化の効果が薄い（等尺性・保持系・開始と動作がほぼ同じ絵）**
plank, side-plank, pelvic-floor, quad-setting-advanced, weight-bearing,
shoulder-shrug, unstable-balance, step-balance, step-reaction, gait-forward,
gait-backward, fine-motor, object-transfer, dressing-training, floor-to-stand

**ストレッチ（保持が主で、開始＝ほぼ立位/座位のため差が出にくい）**
hip-flexor-stretch, piriformis-stretch, itb-stretch, shoulder-flexion-stretch,
shoulder-er-stretch, shoulder-ha-stretch, chest-stretch, neck-lateral-stretch,
neck-rotation-stretch, cat-stretch, forearm-stretch, cat-cow, hip-ir-stretch,
knee-extension-rom, supine-hip-flexion, wand-exercise

**呼吸（4種すべて。吸気/呼気の差は絵にしづらい）**
abdominal-breathing, pursed-lip-breathing, thoracic-expansion, deep-breathing

## 機械可読リスト

```csv
id,input,output
wall-pushup,wall-pushup.png,wall-pushup-start.png
shoulder-abduction,shoulder-abduction.png,shoulder-abduction-start.png
shoulder-external-rotation,shoulder-external-rotation.png,shoulder-external-rotation-start.png
shoulder-internal-rotation,shoulder-internal-rotation.png,shoulder-internal-rotation-start.png
scapular-elevation,scapular-elevation.png,scapular-elevation-start.png
scapular-depression,scapular-depression.png,scapular-depression-start.png
elbow-flexion,elbow-flexion.png,elbow-flexion-start.png
elbow-extension,elbow-extension.png,elbow-extension-start.png
wall-climbing,wall-climbing.png,wall-climbing-start.png
codman-exercise,codman-exercise.png,codman-exercise-start.png
wrist-extension,wrist-extension.png,wrist-extension-start.png
wrist-flexion,wrist-flexion.png,wrist-flexion-start.png
forearm-pronation-supination,forearm-pronation-supination.png,forearm-pronation-supination-start.png
hand-grip,hand-grip.png,hand-grip-start.png
finger-opposition,finger-opposition.png,finger-opposition-start.png
finger-extension,finger-extension.png,finger-extension-start.png
sit-up,sit-up.png,sit-up-start.png
trunk-rotation,trunk-rotation.png,trunk-rotation-start.png
dead-bug,dead-bug.png,dead-bug-start.png
lateral-trunk-stretch,lateral-trunk-stretch.png,lateral-trunk-stretch-start.png
williams-exercise,williams-exercise.png,williams-exercise-start.png
mckenzie-exercise,mckenzie-exercise.png,mckenzie-exercise-start.png
hamstring-curl,hamstring-curl.png,hamstring-curl-start.png
prone-hip-extension,prone-hip-extension.png,prone-hip-extension-start.png
hip-flexion-training,hip-flexion-training.png,hip-flexion-training-start.png
single-leg-calf-raise,single-leg-calf-raise.png,single-leg-calf-raise-start.png
ankle-plantarflexion,ankle-plantarflexion.png,ankle-plantarflexion-start.png
knee-flexion-rom,knee-flexion-rom.png,knee-flexion-rom-start.png
weight-shift-ap,weight-shift-ap.png,weight-shift-ap-start.png
dynamic-reach,dynamic-reach.png,dynamic-reach-start.png
turning,turning.png,turning-start.png
step-up-advanced,step-up-advanced.png,step-up-advanced-start.png
chair-stand,chair-stand.png,chair-stand-start.png
reach-training,reach-training.png,reach-training-start.png
upper-reach,upper-reach.png,upper-reach-start.png
```
