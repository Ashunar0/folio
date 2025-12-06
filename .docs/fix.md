## パフォーマンス改善のメモ

### フォントのローカル化・軽量化
- `next/font/google` 依存を解消し、`next/font/local`でローカルバンドルに変更。
- `public/fonts/` に Geists (sans/mono) woff2、Inter 可変 ttf、Noto Sans JP は 400 ウェイト単一 ttf（約5MB）を配置し、ビルド時に外部取得不要に。
- オフライン/CIでもビルドが通り、フォント転送サイズが軽量化。

### ビルド構成
- Turbopack rootを `next.config.ts` で明示し、ビルド警告を解消。
- バンドル解析: `@next/bundle-analyzer` を導入し、`ANALYZE=true npx next build --webpack` で `.next/analyze/client.html` などを生成。
- `build` スクリプトを webpack に固定（Turbopack が `next/font/local` で落ちるため）。

### グラフの遅延読み込み
- ダッシュボードの `MonthlyChart` / `CategoryPie` を `next/dynamic` + `ssr:false` にし、Rechartsを初期バンドルから分離。ローディング中はスケルトンを表示。
- ダッシュボード以外の画面の初期ロードが軽量化、ダッシュボードでもハイドレーション後に必要なときだけ読込。

### アイコンライブラリ統一
- Tablerアイコンを廃止し、lucideに統一。`lib/icons.ts` で既存のIcon名前をlucideにマップし、全コンポーネントのimportを置換。
- `@tabler/icons-react` 依存を削除し、クライアントJSの重複を削減。

### プロバイダーのチャンク分離
- `app/layout.tsx` から Supabase/Auth/Team の各Providerを外し、`(app)` / `(auth)` / `me` の各レイアウトで `AppShellProviders` を噛ませる構造へ分離。
- 認証・アプリ画面のみが Supabase クライアントの巨大チャンク（`static/chunks/9920-...`）を読むようになり、LP（`/`）の初期JSから除外。
- `(auth)` レイアウトも TeamProvider を含め直し、`/create-team` などでの `useTeam` エラーを防止。

### 現状の確認コマンド
- ビルド: `npm run build`（webpack）
- バンドル解析: `ANALYZE=true npx next build --webpack` → `.next/analyze/client.html`

### 今後の追加アイデア（優先度高め）
- アイコン/大きなUIチャンクの動的インポート追加など、`.next/analyze/client.html` を見ながらさらに分割。
- React Query の `staleTime/select` チューニングと Supabase クエリのフィールド削減でデータ転送・再レンダーを抑制。
