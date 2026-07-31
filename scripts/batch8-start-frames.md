# Batch 8: イラスト2枚化 — 開始姿勢フレーム生成プロンプト（頻用30種）

> 2026-08-01 作成。イラスト2枚化（開始姿勢→動作中）の第1弾。
> **既存イラストを「動作フレーム」として流用**し、ここでは**開始姿勢の30枚のみ新規生成**する。
> 30種の選定は臨床使用頻度ベースの草案。入れ替え・削除は自由（利用者判断が最終）。

---

## 生成ルート（どちらでも本ファイルを使う）

### ルートA: OpenAI API 一括生成（推奨・$10チャージで足りる）

1. OpenAI Platform で $10 チャージ（**Auto recharge は OFF のまま**）
2. Codex に依頼:
   - `scripts/generate-illustrations.py` を改修し、**images.edit（画像参照）**で生成する
   - 入力画像: `assets/illustrations/originals/{id}.png`（無ければ `assets/illustrations/{id}.webp` をPNG変換して使用）
   - プロンプト: 本ファイルの「共通スタイル」+ 各運動の個別プロンプト
   - 出力: `assets/illustrations/originals/{id}-start.png`（1536×1024）
   - `--skip-existing` 相当の再開機能を維持
3. 生成後: `cwebp -q 80` で `assets/illustrations/{id}-start.webp` に変換（登録作業は実装側で対応）

### ルートB: ChatGPT 手動生成

1. ChatGPT に**既存イラスト（`{id}.webp` または originals のPNG）を添付**
2. 「共通スタイル指示」+ 該当運動の「個別プロンプト」を続けてコピペ
3. 生成画像を `assets/illustrations/originals/` に保存（ファイル名: `{id}-start.png`）
4. 30枚たまったら報告（リネーム・WebP変換・登録は実装側で対応）

---

## 共通スタイル指示（毎回最初に入れる）

```
添付の運動イラストと同一シリーズの「開始姿勢」のイラストを1枚作成してください。

【最重要】
- 添付画像と同一人物・同一の服装・同一の視点（カメラアングル）・同一の構図で描く
- 添付画像は「動作中」、今回作るのは「動作を始める前の開始姿勢」

【スタイル】
- セミリアリスティックなフラットイラスト
- 白背景、影なし
- 人物: 中年男性、短髪黒髪、白い半袖Tシャツ、紺のハーフパンツ、白い靴下
- 輪郭線: 細い黒線
- 色数: 最小限（肌色、白、紺、青）
- 補助具（椅子・タオル・枕・踏み台など）は添付画像と同じ位置・同じ色で描く
- 医療的に正確な関節角度と体の向き
- 矢印は入れない（開始姿勢のため）
- 余計なテキストや文字は入れない
- 横長の構図（アスペクト比 4:3）
```

---

## 個別プロンプト（30種）

### 1. patella-setting — パテラセッティング
保存名: `patella-setting-start.png`
```
【運動】パテラセッティング（Quad Sets）の開始姿勢
仰向けに寝た状態。膝の裏に青い丸めたタオルを置いている。
脚はリラックスしており、まだ力を入れていない。太ももに力こぶは見えない。
視点: 添付と同じ横から（側面図）。
```

### 2. slr — SLR（下肢伸展挙上）
保存名: `slr-start.png`
```
【運動】SLR（Straight Leg Raise）の開始姿勢
仰向けに寝た状態。反対側の膝は曲げて足底を床につけている。
運動側の脚は膝を伸ばしたまま、まだ床の上に置かれている（持ち上げる前）。
視点: 添付と同じ横から（側面図）。
```

### 3. bridge — ブリッジ（ヒップリフト）
保存名: `bridge-start.png`
```
【運動】ブリッジ（Hip Lift / Bridge）の開始姿勢
仰向けに寝た状態。両膝を曲げて両足底を床につけている。
お尻はまだ床についている（持ち上げる前）。頭の下に青い枕。
視点: 添付と同じ横から（側面図）。
```

### 4. clamshell — クラムシェル
保存名: `clamshell-start.png`
```
【運動】クラムシェル（Clamshell）の開始姿勢
横向き（側臥位）に寝た状態。股関節約45度、膝約90度に曲げている。
両膝はぴったり閉じて重なっている（開く前）。骨盤は安定している。
視点: 添付と同じ（横向きの体を前方から見る）。
```

### 5. squat — スクワット
保存名: `squat-start.png`
```
【運動】スクワット（Squat）の開始姿勢
椅子の背もたれに両手を軽く添えて、まっすぐ立っている状態（腰を落とす前）。
足は肩幅に開いている。膝・股関節は伸びている。
椅子は添付と同じシンプルなパイプ椅子。
視点: 添付と同じ横から（側面図）。
```

### 6. calf-raise — カーフレイズ
保存名: `calf-raise-start.png`
```
【運動】カーフレイズ（Calf Raise）の開始姿勢
壁に両手を軽く添えて、まっすぐ立っている状態。
両足の踵はしっかり床についている（つま先立ちする前）。
視点: 添付と同じ横から（側面図）。
```

### 7. seated-knee-ext — 座位での膝伸展
保存名: `seated-knee-ext-start.png`
```
【運動】座位での膝伸展（Seated Knee Extension）の開始姿勢
パイプ椅子に背筋を伸ばして座った状態。
両膝は約90度に曲がり、両足底が床についている（脚を伸ばす前）。
視点: 添付と同じ横から（側面図）。
```

### 8. hip-abduction — ヒップアブダクション（側臥位）
保存名: `hip-abduction-start.png`
```
【運動】ヒップアブダクション側臥位（Hip Abduction）の開始姿勢
横向き（側臥位）に寝た状態。下側の膝は軽く曲げて支持し、
上側の脚はまっすぐ伸ばして下側の脚の上に重ねている（持ち上げる前）。
視点: 添付と同じ。
```

### 9. hip-abduction-training — 股関節外転訓練（立位）
保存名: `hip-abduction-training-start.png`
```
【運動】立位股関節外転（Hip Abduction Training）の開始姿勢
椅子の背もたれに片手を添えて、両脚を揃えてまっすぐ立っている状態（脚を横に開く前）。
体幹は垂直で傾いていない。
視点: 添付と同じ（正面または添付に合わせる）。
```

### 10. hip-extension — 股関節伸展運動
保存名: `hip-extension-start.png`
```
【運動】立位股関節伸展（Hip Extension）の開始姿勢
椅子の背もたれに両手を添えて、両脚を揃えてまっすぐ立っている状態（脚を後ろに上げる前）。
体幹は前傾していない。
視点: 添付と同じ横から（側面図）。
```

### 11. seated-march — 座位での足踏み
保存名: `seated-march-start.png`
```
【運動】座位での足踏み（Seated March）の開始姿勢
パイプ椅子に背筋を伸ばして座り、両足底が床についている状態（もも上げする前）。
両手は太ももの上か椅子の座面に軽く置く。
視点: 添付と同じ横から（側面図）。
```

### 12. ankle-dorsiflexion — 足関節背屈運動
保存名: `ankle-dorsiflexion-start.png`
```
【運動】足関節背屈（Ankle Dorsiflexion）の開始姿勢
椅子に座り、両足底が床にぴったりついている状態（つま先を上げる前）。
視点: 添付と同じ（足元が分かるアングル）。
```

### 13. towel-gather — タオルギャザー
保存名: `towel-gather-start.png`
```
【運動】タオルギャザー（Towel Gather）の開始姿勢
椅子に座り、足元に青いタオルを縦長に広げ、裸足（白い靴下を脱いだ素足でも可、添付に合わせる）の
足をタオルの手前端に乗せた状態（足趾でたぐり寄せる前）。タオルはまだ平らに伸びている。
視点: 添付と同じ。
```

### 14. toe-raise — つま先上げ運動
保存名: `toe-raise-start.png`
```
【運動】つま先上げ（Toe Raise）の開始姿勢
まっすぐ立ち、両足底が床に完全についている状態（つま先を上げる前）。
支持（壁や椅子）は添付と同じ配置。
視点: 添付と同じ横から（側面図）。
```

### 15. sit-to-stand — 立ち上がり訓練
保存名: `sit-to-stand-start.png`
```
【運動】立ち上がり訓練（Sit to Stand）の開始姿勢
パイプ椅子にやや浅く腰掛け、両足を軽く手前に引いた状態（立ち上がる前）。
体幹はわずかに前傾を始める直前。両手は太ももの上。
視点: 添付と同じ横から（側面図）。
```

### 16. step-up — ステップ運動（踏み台昇降）
保存名: `step-up-start.png`
```
【運動】ステップ運動（Step-Up）の開始姿勢
踏み台の手前にまっすぐ立ち、両足が床についている状態（昇る前）。
踏み台は添付と同じ形・同じ色。
視点: 添付と同じ横から（側面図）。
```

### 17. single-leg-stand — 片脚立位
保存名: `single-leg-stand-start.png`
```
【運動】片脚立位（Single Leg Stand）の開始姿勢
椅子の背もたれ（または添付と同じ支持物）に片手を添えて、両脚でまっすぐ立っている状態
（片脚を上げる前）。
視点: 添付と同じ。
```

### 18. tandem-stance — タンデム立位（継ぎ足）
保存名: `tandem-stance-start.png`
```
【運動】タンデム立位（Tandem Stance）の開始姿勢
両足を肩幅程度に開いた通常の立位（継ぎ足にする前）。
支持物は添付と同じ配置。
視点: 添付と同じ。
```

### 19. weight-shift-lr — 重心移動訓練（左右）
保存名: `weight-shift-lr-start.png`
```
【運動】重心移動・左右（Weight Shift Lateral）の開始姿勢
足を肩幅に開き、体が正中（真ん中）にあるまっすぐな立位（左右に移動する前）。
視点: 添付と同じ正面から。
```

### 20. draw-in — ドローイン
保存名: `draw-in-start.png`
```
【運動】ドローイン（Abdominal Drawing-in）の開始姿勢
仰向けに寝て両膝を曲げ、足底を床につけた状態。
お腹はニュートラルで、まだ凹ませていない（自然な腹部の高さ）。
視点: 添付と同じ横から（側面図）。
```

### 21. pelvic-tilt — ペルビックティルト
保存名: `pelvic-tilt-start.png`
```
【運動】ペルビックティルト（Pelvic Tilt）の開始姿勢
仰向けに寝て両膝を曲げ、足底を床につけた状態。
骨盤はニュートラルで、腰と床の間に自然な隙間がある（骨盤を傾ける前）。
視点: 添付と同じ横から（側面図）。
```

### 22. bird-dog — ダイアゴナル（バードドッグ）
保存名: `bird-dog-start.png`
```
【運動】バードドッグ（Bird Dog）の開始姿勢
四つ這いの状態。両手は肩の真下、両膝は股関節の真下にあり、
背中はまっすぐ（手脚を上げる前）。
視点: 添付と同じ横から（側面図）。
```

### 23. back-extension — 背筋運動
保存名: `back-extension-start.png`
```
【運動】バックエクステンション（Back Extension）の開始姿勢
うつ伏せに寝た状態。上体は床についており、顔は下向きまたはやや前方
（上体を起こす前）。両手の位置は添付と同じ。
視点: 添付と同じ横から（側面図）。
```

### 24. hamstring-stretch — ハムストリングスストレッチ
保存名: `hamstring-stretch-start.png`
```
【運動】ハムストリングスストレッチ（Hamstring Stretch）の開始姿勢
添付と同じセッティング（椅子または床）で、ストレッチ側の脚を前に伸ばし、
背筋を伸ばして直立した座位（前屈する前）。
視点: 添付と同じ横から（側面図）。
```

### 25. calf-stretch — 下腿三頭筋ストレッチ
保存名: `calf-stretch-start.png`
```
【運動】カーフストレッチ（Calf Stretch）の開始姿勢
壁に両手をつき、両足を前後に開いて立った状態。
体重はまだ前に移しておらず、体幹は垂直（前傾する前）。後ろ足の踵は床についている。
視点: 添付と同じ横から（側面図）。
```

### 26. quad-stretch — 大腿四頭筋ストレッチ
保存名: `quad-stretch-start.png`
```
【運動】大腿四頭筋ストレッチ（Quadriceps Stretch）の開始姿勢
椅子の背もたれ（または添付と同じ支持物）に片手を添えて、両脚でまっすぐ立った状態
（足首をつかんで曲げる前）。
視点: 添付と同じ横から（側面図）。
```

### 27. adductor-stretch — 内転筋ストレッチ
保存名: `adductor-stretch-start.png`
```
【運動】内転筋ストレッチ（Adductor Stretch）の開始姿勢
添付と同じセッティングで開脚して座り、背筋を伸ばして直立した座位（前屈・側方に倒す前）。
視点: 添付と同じ。
```

### 28. shoulder-flexion — 肩関節屈曲挙上
保存名: `shoulder-flexion-start.png`
```
【運動】肩関節屈曲挙上（Shoulder Flexion）の開始姿勢
椅子に背筋を伸ばして座り、両腕（または運動側の腕、添付に合わせる）を体側に自然に下ろした状態
（腕を前方に上げる前）。
視点: 添付と同じ横から（側面図）。
```

### 29. scapular-retraction — 肩甲骨内転運動
保存名: `scapular-retraction-start.png`
```
【運動】肩甲骨内転（Scapular Retraction）の開始姿勢
椅子に背筋を伸ばして座り、顎を引いた良い姿勢。両肘を軽く曲げ、
肩甲骨はニュートラルの位置（まだ寄せていない）。
視点: 添付と同じ後方から（背面図）。
```

### 30. chin-tuck — 顎引き運動
保存名: `chin-tuck-start.png`
```
【運動】顎引き（Chin Tuck）の開始姿勢
椅子に背筋を伸ばして座った状態。頭部はニュートラルで、顎はまだ引いていない
（自然な頭の位置。やや前方に出た頭部でもよい、添付に合わせる）。
視点: 添付と同じ横から（側面図）。
```

---

## 生成後のチェックリスト（1枚ごと）

- [ ] 添付（動作フレーム）と同一人物・同一視点・同一構図か？
- [ ] 「動作前」になっているか（動作中と見分けがつくか）？
- [ ] 矢印・テキストが入っていないか？
- [ ] 補助具の位置・色が動作フレームと一致しているか？
- [ ] 背景は白か？
- [ ] 保存ファイル名: `{exercise-id}-start.png`

## 機械可読リスト（スクリプト改修用）

```csv
id,input,output
patella-setting,patella-setting.png,patella-setting-start.png
slr,slr.png,slr-start.png
bridge,bridge.png,bridge-start.png
clamshell,clamshell.png,clamshell-start.png
squat,squat.png,squat-start.png
calf-raise,calf-raise.png,calf-raise-start.png
seated-knee-ext,seated-knee-ext.png,seated-knee-ext-start.png
hip-abduction,hip-abduction.png,hip-abduction-start.png
hip-abduction-training,hip-abduction-training.png,hip-abduction-training-start.png
hip-extension,hip-extension.png,hip-extension-start.png
seated-march,seated-march.png,seated-march-start.png
ankle-dorsiflexion,ankle-dorsiflexion.png,ankle-dorsiflexion-start.png
towel-gather,towel-gather.png,towel-gather-start.png
toe-raise,toe-raise.png,toe-raise-start.png
sit-to-stand,sit-to-stand.png,sit-to-stand-start.png
step-up,step-up.png,step-up-start.png
single-leg-stand,single-leg-stand.png,single-leg-stand-start.png
tandem-stance,tandem-stance.png,tandem-stance-start.png
weight-shift-lr,weight-shift-lr.png,weight-shift-lr-start.png
draw-in,draw-in.png,draw-in-start.png
pelvic-tilt,pelvic-tilt.png,pelvic-tilt-start.png
bird-dog,bird-dog.png,bird-dog-start.png
back-extension,back-extension.png,back-extension-start.png
hamstring-stretch,hamstring-stretch.png,hamstring-stretch-start.png
calf-stretch,calf-stretch.png,calf-stretch-start.png
quad-stretch,quad-stretch.png,quad-stretch-start.png
adductor-stretch,adductor-stretch.png,adductor-stretch-start.png
shoulder-flexion,shoulder-flexion.png,shoulder-flexion-start.png
scapular-retraction,scapular-retraction.png,scapular-retraction-start.png
chin-tuck,chin-tuck.png,chin-tuck-start.png
```
