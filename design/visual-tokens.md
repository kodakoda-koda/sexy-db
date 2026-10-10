# セクシー女優図鑑 Visual Tokens(プロダクト共通の視覚値)

## Step 1: テックスタック識別
- フレームワーク：React 19 + Vite(`package.json:13-26`)
- UI ライブラリ：なし(素の HTML 要素)
- スタイリング：単一のグローバル CSS + CSS 変数(`src/styles.css`)。ダークモードは `prefers-color-scheme` で変数を差し替え(`styles.css:19-34`)

## Step 2: テーマトークン(source 行番号引用)
| トークン | ライト | ダーク | 出典 |
|---|---|---|---|
| --bg(地) | `#faf7f8` | `#141013` | `styles.css:3,21` |
| --surface(面) | `#ffffff` | `#201a1e` | `styles.css:4,22` |
| --border | `#ebe3e7` | `#332a30` | `styles.css:5,23` |
| --ink(本文) | `#1b1419` | `#f5eef2` | `styles.css:6,24` |
| --muted(補助文字) | `#7a6d74` | `#a89aa2` | `styles.css:7,25` |
| --axis(軸線・トラック) | `#d8ccd2` | `#4a3e45` | `styles.css:8,26` |
| --primary | `#c2185b` | `#f06292` | `styles.css:9,27` |
| --on-primary | `#ffffff` | `#1b1419` | `styles.css:10,28` |
| --accent(選択中の点) | `#f2a900` | `#ffc94d` | `styles.css:11,29` |
| --secondary(他人のアバター) | `#6b4e78` | `#9c7fab` | `styles.css:12,30` |
| --danger | `#c62828` | `#ef5350` | `styles.css:14,32` |

配色の意図(ローズ × プラム)と「文字に primary / accent を使わない」規則は `SPEC.md` 10 章。

## Step 3: グローバルレイアウト要素
- 本文フォント：system-ui / Hiragino Sans / Noto Sans JP、16px、line-height 1.5(`styles.css:39-41`)
- ヘッダー(.topbar)：背景 `--bg`、下罫線 `--border`、見出し 18px/700(`styles.css:51-57`)
- 下部タブ(.tabbar)：高さ 56px、背景 `--surface`、上罫線、文字 11px(`styles.css:15,72-82`)
- コンテンツ幅：中央 720px、左右 16px(`styles.css:59-63`)。散布図画面のみ 1000px(`styles.css:181`)

## Step 4: 部品の style 引用
- カード(.card)：`--surface` 面、1px `--border`、角丸 14px、padding 10px 12px(`styles.css:85-89`)
- アバター(.avatar)：円形、`--secondary` 面に `--on-secondary` の頭文字(`styles.css:92-96`)
- ボタン(.btn)：角丸 12px、padding 12px 16px、700、`--primary` 塗り、幅 100%(`styles.css:98-102`)。outline＝透明面 + primary 枠(`:104`)、ghost＝透明面 + muted 文字(`:105`)、danger＝透明面 + danger 枠(`:106`)、small＝padding 8px 12px、14px(`:107`)
- 入力(.field input/select)：`--surface` 面、1px `--border`、角丸 10px、padding 12px、16px(`styles.css:111-114`)。focus は 2px primary アウトライン(`:115`)
- ラベル：13px / 600 / muted(`styles.css:110`)。hint 12px muted(`:116`)、warn 12px accent(`:117`)
- 相対スライダー(.rslider)：カード状(面 + 枠 + 角丸 14px)。トラック 4px `--axis`、既存登録者 24px アバター、つまみ 36px primary 円(`styles.css:131-150`)
- 散布図(.plot)：面 + 枠 + 角丸 14px、文字 10px muted、点 primary、固定中は accent 塗り + primary 枠(`styles.css:159-167`)
- 詳細の stat ボックス：面 + 枠 + 角丸 12px、見出し 12px muted、値 18px/700(`styles.css:197-203`)

## Step 5: global override
- `button, input, select { font: inherit; color: inherit }`(`styles.css:46`)、`-webkit-tap-highlight-color: transparent`(`:43`)。ライブラリの上書きはなし

## Step 6: atom のデフォルト挙動
- atom 化なし。`.btn` が常に幅 100%(`styles.css:101`)で、横に並べるときは `.small` で幅 auto に戻す(`:107`)
