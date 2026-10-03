# sexy-db

自分用の女優 DB。6 軸(身長・年齢・胸・肉付き・骨格・顔)から 2 軸を選んだ散布図で眺める。
仕様は [SPEC.md](./SPEC.md)。

## 開発

```
npm install
cp .env.example .env   # 値を埋める
npm run dev
```

`.env` に `VITE_REPO=local` を書くと Supabase なしで localStorage に保存して試せる(ログイン不要)。

## Supabase の準備

1. プロジェクトを作成し、`supabase/schema.sql` を SQL Editor で実行する。
2. Authentication > Sign In / Providers > Google を有効にし、Google Cloud Console の OAuth クライアント ID / Secret を貼る。
3. Authentication > URL Configuration の Site URL と Redirect URLs に本番 URL と `http://localhost:5173/**` を登録する。
4. Project Settings > API の URL と anon key を `.env` の `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` に書く。

## デプロイ

GitHub Pages。`main` に push すると `.github/workflows/deploy.yml` がビルドして公開する。
公開 URL: https://kodakoda-koda.github.io/sexy-db/
リポジトリの Secrets に `SUPABASE_URL` と `SUPABASE_ANON_KEY` が必要。

### keep-alive

Supabase 無料枠は 7 日間アクセスがないと停止するため、`.github/workflows/keepalive.yml` が 3 日ごとに軽いクエリを投げる。
リポジトリの Secrets に `SUPABASE_URL` と `SUPABASE_ANON_KEY` を登録しておく。

## 構成

- `src/domain` 型、カップ換算、年齢計算、相対値の正規化、軸定義
- `src/repo` 保存先の抽象(`Repository`)と実装(Supabase / localStorage)
- `src/auth` Google ログイン
- `src/state` 登録データの読み込みと CRUD、正規化関数
- `src/components` 相対指定スライダー、散布図(SVG)、カードなど
- `src/pages` 一覧・散布図・追加/編集・詳細・ログイン
