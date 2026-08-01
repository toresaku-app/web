# イラスト品質レビュー（2026-08-02）

Claude（全165枚を目視 + 原寸確認）と Codex（同じコンタクトシートを独立レビュー）の
両方でレビューし、双方の指摘を実物で突き合わせた結果。

対象: 基本イラスト100枚 + 開始姿勢フレーム65枚 = 165枚。
判定基準は「患者がこの絵だけを見て、正しい運動を実行できるか」。

---

## 結論

**全面的な作り直しは不要。ただし Tier A の9枚は学会前に再生成したい。**

大半のイラストは伝達力が高く、`towel-gather` / `sit-to-stand` / `bridge` / `slr` /
`floor-to-stand` / `mckenzie-exercise` / `seated-march` などは基準にできる水準。

一方で、**患者が違う運動を実行しかねない絵が9枚**あり、これらは指導書の信頼性を直接損なう。
さらに、2枚化の副作用として**ペアが対象関節以外の変化を主に見せてしまう**構造的な問題が11種にある。

---

## 構造的な問題（個別の絵ではなく作り方の問題）

### 1. 開始フレームの後付け生成で「対象関節以外」が動いてしまう

開始姿勢を image-to-image で後から生成したため、**対象関節だけが変化した2枚**になっていない。
結果としてペアが示す主変化が別の運動になる。

- `ankle-dorsiflexion` / `ankle-plantarflexion`: 足関節ではなく**膝が伸展**して脚全体が前へ出る
- `wrist-extension`: 手関節ではなく**肩が屈曲**する
- `elbow-extension`: 肘ではなく**上腕全体が頭上へ移動**する
- `wall-pushup`: 肘屈曲ではなく**足の位置が後退**する
- `prone-hip-extension`: 股関節伸展に**膝屈曲が加わり** `hamstring-curl` と区別できない
- `knee-flexion-rom`: 開始でタオルが椅子の下にあり、動作で**足の下へ瞬間移動**する
- `elbow-flexion`: 開始に**ダンベルがなく**、動作で出現する

**再生成時のルール**: 開始と動作は「対象関節の角度だけが違う同一構図」にする。
支持物・足位置・道具・視点・人物サイズを固定する。

### 2. 真横視点では「対側」が読み取れない

`bird-dog` と `dead-bug` はどちらも keyPoints に「対側の手と脚」と明記しているが、
真横からの構図のため右手＋左脚なのか同側なのか判別できない。斜め後方視点が必要。

### 3. 人物の同一性が保たれていない（顔・年齢）

服装・線の太さ・配色は統一されているが、**顔と年齢が2群に分かれる**。

- 若い・面長・平坦な陰影: `hip-flexor-stretch` / `itb-stretch` / `step-reaction` / `unstable-balance`
- 高齢寄り・法令線あり・細密な陰影: `deep-breathing` / `fine-motor` / `shoulder-shrug` / `quad-setting-advanced`

並べると別人に見える。1つの指導書に両群が混ざると、既製品の寄せ集めのような印象になる。

### 4. 小道具の不統一

- 椅子が4種類以上: 青いパイプ椅子（多数）/ 茶色の木製椅子（`tandem-stance`）/
  濃紺の背もたれ椅子（`knee-flexion-rom`）/ 淡い水色の椅子（`thoracic-expansion`）/
  灰色の椅子（`pursed-lip-breathing`）
- 足元が靴下と運動靴で混在（`gait-backward` `sit-to-stand` `squat` は靴、多数は靴下）
- 壁・支持物が青いバー / 灰色のポール / 白い面 / 平行棒でばらつく

---

## Tier A: 誤実施につながる（学会前に再生成したい・9枚）

| ID | 問題 | 直し方 |
|---|---|---|
| `ankle-dorsiflexion` | 開始=足底接地・膝90度 → 動作=**膝ほぼ伸展・足が床から離れる**。膝伸展運動として実行されうる | 下腿・膝・踵を固定し、足関節角度だけを変える |
| `ankle-plantarflexion` | 同型。底屈より脚全体の伸展・前方移動が目立つ | 同上 |
| `hip-flexor-stretch` | 人物は左向きなのに**骨盤の矢印が右＝後方**。伸ばす方向と逆 | 骨盤を前脚方向（前方）へ動かす矢印にする |
| `gait-backward` | 顔・体幹・矢印がすべて右向きで、**完全に前進歩行に見える** | 視線は前方のまま、足を後方へ運ぶ矢印と後方接地を描く |
| `knee-extension-rom` | 矢印が膝ではなく**下腿遠位部**。KPは「膝裏を床に押しつける」 | 矢印を膝・膝裏付近へ移す |
| `side-plank` | **側臥位で寝ているだけ**。前腕支持なし、腰が床についたまま。KPの「肘は肩の真下」「腰が落ちないように」と正反対。青い破線もシリーズ唯一の表現 | 前腕支持で腰を持ち上げた姿勢に。破線は削除 |
| `tandem-stance` | **継ぎ足になっていない**。踵-つま先を接地させず、ただ一歩前に出しただけ | 前足の踵と後足のつま先が接する足元を大きく描く |
| `chest-stretch` | **地面から浮いている**（片脚が高く上がり走って見える）。前腕がドア枠に接していない。手は握り拳 | 両前腕接触・両足接地のスプリットスタンス・前方への踏み込みを明示 |
| `forearm-stretch` | 説明の「**反対の手で指先を手前に引いて**」の手が描かれていない。矢印も指先を戻す向き | 反対の手で指先を引く形に。矢印は手前・下向きへ |

## Tier B: ペアが機能していない（余裕があれば再生成・11種）

`wall-pushup` / `elbow-flexion` / `elbow-extension` / `wrist-extension` / `knee-flexion-rom` /
`prone-hip-extension` / `chair-stand`（時系列が逆・座位開始なのに下向き動作）/
`bird-dog` / `dead-bug` / `turning`（1コマに2人ずつ描かれ計4人になる）/
`dynamic-reach`（両脚立位から水平の片脚立位へ飛躍。開始は靴、動作は靴下）

## Tier C: 2枚化をやめて1枚に戻す判断（**生成コストゼロ**・12種）

矢印以外に変化がなく、枠を2分割する分だけ1枚あたりが小さくなる。
`illustrations.ts` の `START_ILLUSTRATIONS` から該当エントリを外すだけで1枚表示に戻る。

`patella-setting` / `draw-in` / `pelvic-tilt` / `scapular-retraction` / `scapular-elevation` /
`scapular-depression` / `codman-exercise` / `chin-tuck` / `toe-raise` /
`forearm-pronation-supination` / `weight-shift-lr` / `single-leg-calf-raise`

いずれも等尺性・保持系、または変化が数ピクセルに収まるもの。

## 逆に2枚化の価値が高い（現在1枚・生成が必要）

`cat-cow`（丸める/反らすの2相が定義そのもの。今は片方のみ）/ `step-reaction` /
`abdominal-breathing`・`pursed-lip-breathing`・`deep-breathing`（吸気/呼気）/
`object-transfer`（移動先がない）/ `dressing-training`

`floor-to-stand` は2枚でも不足で、3〜4コマが必要（Codex指摘）。

---

## 印刷実寸（本番Webで実測）

| | 2枚時（1枚あたり） | 1枚時 |
|---|---|---|
| 縦向き | 64 × 48 mm | 71 × 53 mm |
| 横向き | 41 × 31 mm | 49 × 37 mm |

枠が高さ律速のため、**2枚化による縮小は約10%**（面積で約2割）にとどまる。
横に2枚並べても各画像はさほど小さくならない。

ただし**横向きは元々41×31mm**と小さく、高齢患者には厳しい。
`toe-raise` `single-leg-calf-raise` `chin-tuck` のように変化が小さい運動は
横向き印刷では判別限界に近い。

---

## 検証の過程で否定した仮説（記録）

- **「2枚化組と1枚組でスタイルが違う」→ 誤り**。コンタクトシートの表示サイズ差による錯覚。
  等倍で並べると線の太さ・彩色・服装は統一されている（ただし顔・年齢は上記のとおり不統一）
- **`hand-grip` がグー/パーを描けていない → 誤り**。原寸ではグーとパーの両方が描かれている。
  ただし開始=両手パー、動作=片手パー+片手グー で左右の対応は崩れている
- **`williams-exercise` が片膝に見える → 誤り**。両膝を抱えており説明どおり
- **`quad-setting-advanced` の絵が名前と違う → 誤り**。説明「足首に重錘・座位で膝伸展」と一致
  （ただしIDから等尺性収縮を想起させる点は残る）
- **Codex `thoracic-expansion` に赤い三角形の残像がある → 未確認**。原寸で確認できず
- **Codex `elbow-flexion` は良い例 → 不同意**。開始フレームにダンベルがない
- **Claude `gait-backward` は手すりに手を添えていない → 誤り**。後方の手は手すりに接している。
  ただし手すりが体幹を横切って見える点は残る

## 良い例（再生成時の基準）

`bridge`（接地点固定・シルエット変化が大きい）/ `slr` / `seated-knee-ext` / `squat` /
`hamstring-curl` / `towel-gather`（色が抜けても形の変化で伝わる）/ `sit-to-stand` /
`floor-to-stand` / `mckenzie-exercise` / `seated-march` / `hip-flexion-training` /
`finger-extension`（対象部位を大胆に拡大）/ `wand-exercise` / `weight-bearing` /
`supine-hip-flexion` / `shoulder-ha-stretch` / `gait-forward`
