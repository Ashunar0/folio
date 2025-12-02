# Folio 完成までのアウトライン

## ゴール
- UI プロトタイプを本番運用できる SaaS に仕上げる。
- Supabase を本番用に安全設定（Auth/RLS/Storage）、Vercel へデプロイ、最低限の運用体制を整備。

## フェーズ別タスクリスト

### 1) データ＆RLS確定（Supabase）
- テーブル作成とマイグレーション整備（DDL 9テーブル + 必要なら audit_logs など拡張候補）。
- RLS ポリシー実装：team_id スコープ + role 別 UPDATE/DELETE 制限、Storage バケットの権限制御。
- サンプルデータ seed（teams, team_users, categories, events, expenses, transactions）。

### 2) 認証・マルチチーム
- Supabase Auth 接続（Email/Password + invite）。
- team switcher と current_team_id の取得/保持（context or React Query）。
- 招待フロー（token 発行/受理）を Edge Function or API で接続。

### 3) API/クエリ実装
- PostgREST/ RPC/ Edge Functions を使った API 呼び出し層を実装（/lib/api*）。
- 主要クエリ：users, teams, invites, categories, events, expenses, approvals, transactions。
- キャッシュ戦略（React Query の key 設計、無効化フロー、楽観的更新）。

### 4) UI 接続＆権限制御
- 既存 UI を Supabase データと接続（一覧/フィルタ/詳細/保存）。
- RBAC による操作制御（ボタン表示・サーバー側チェックの両方）。
- スライドパネル系フォームの read/edit 切り替えをデータ連動させる。

### 5) ストレージ＆レシート
- 画像アップロード UI を Storage と接続、署名付き URL 取得。
- 画像のプレビュー/削除、アップロード失敗時のリトライ UX。

### 6) 承認ワークフロー
- approve/reject RPC（approve_expense など）実装とフロント接続。
- 承認後に transactions 複製を確認する結合テスト。
- approved データの編集不可を UI/RLS 両面で保証。

### 7) バリデーション＆エラーUX
- zod スキーマ連動のフォームバリデーション統一。
- API エラーのトースト/インライン表示、再試行ボタン。
- ローディング/empty/permission denied 状態を全ページに実装。

### 8) 品質保証
- 型安全: Supabase 型生成（`supabase gen types typescript --local`）を導入。
- テスト: 単体（ユーティリティ）、コンポーネント（critical UI）、結合/E2E（招待→申請→承認までのハッピーパス）。
- Lint/format/ci: ESLint, prettier, typecheck, playwright/cypress を CI に追加。

### 9) パフォーマンス・アクセシビリティ
- テーブルのページネーション/無限スクロール、クエリ最適化（必要なら index）。
- 画像/静的アセットの最適化、CLS/LCP 確認。
- A11y: フォーカス管理、ARIA、キーボード操作確認。

### 10) 運用・セキュリティ
- Supabase 環境変数/鍵管理、サービスロールキーの保護。
- バックアップ/復元手順の確認、ログ/監査（Supabase Logs + optional audit_logs）。
- 環境分離（開発/本番プロジェクト）、デプロイ先 Vercel 設定。

### 11) リリース準備
- シードデータを本番初期化手順にまとめる（README or Runbook）。
- アナリティクス/エラートラッキング（PostHog/Sentry など）を組み込むか判断。
- ドキュメント更新（README、操作ガイド、権限表、API 仕様の最終確認）。

## 直近の着手順序（提案）
1. Supabase DDL/RLS を確定し、型生成を導入。
2. Auth + team switcher + React Query でデータ接続の土台を作る。
3. Expenses/Approvals/Transactions のハッピーパスを API 接続して end-to-end で通す。
4. RBAC/バリデーション/エラーUXを固め、Storage アップロードを接続。
5. テストと CI、リリース手順を整備してデプロイ。

## 最新の実装メモ（簡易）
- Auth/RSC ガード: middleware でダッシュボード配下を保護。`/login` で Supabase auth。
- チーム: TeamProvider が last-team を保存・復元。TeamSwitcher で切替。
- データ接続: Expenses/Approvals/Transactions/Users は Supabase 直クエリ + React Query。Transactions は category/event/createdBy 名称で表示。
- 承認UX: approve/reject 後に関連クエリ invalidate、トーストは alert-toast UI。
- ストレージ: receipts バケット `team_id/authUid/uuid` + metadata team_id。RLS で team prefix 強制。
- シード: `npm run seed` で開発用データ投入（Team Alpha/Beta）。
- Lint: 主要エラー解消済み（未使用の警告は一部残し）。

## 実装済みメモ（進捗スナップショット）
- Supabase 初期スキーマ + RLS + receipts バケットポリシー適用。RPC `approve_expense` / `reject_expense` 実装済み。
- 型生成: `supabase/types.ts` 追加。
- フロント接続: Supabase/Auth/Team Provider 導入、React Query で Expenses/Transactions/Users/Approval を実データ化。
- TeamSwitcher: サイドバー上部で team_users に基づき Alpha/Beta 切替可、role 表示あり。
- Approval: submitted の経費を表示し、admin/manager のみ承認/差戻しボタンが有効。承認で transactions に複製。
- Storage: Expense Form で receipts バケットに `team_id/authUid/uuid.ext` + metadata `team_id` 付きでアップロード。
- Auth: `/login` に本番用 Supabase email/password ログインを実装。接続ロジックは `lib/auth/api.ts` + `hooks/use-auth-service.ts` に集約。QA 用 `/test/login` は引き続き利用可（Home のサブリンク）。
- Authガード/RSC: `middleware.ts` でダッシュボード配下をサーバー段階で保護（Supabase Cookie セッションを利用）。セキュリティ強化とクライアント側のチラつき防止のため、RSC でリダイレクトを判断。
- シードデータ: user `d9b79ea3-6c4b-462c-a35b-d857f956aab7` に Team Alpha(admin)/Team Beta(manager)、submitted/draftの expenses を挿入済み（承認/切替確認用）。
- RBAC UI: Users/Expenses/Transactions の編集/削除は admin/manager または本人のドラフト系に限定し、権限外はメニュー/ボタンを無効化。
- Usersページ: profiles に email カラムを追加・バックフィルし、`auth.users` を同期するトリガーを実装。メールを正しく表示。
- 表示名: Expenses/Approvals で category/event/createdBy を名前表示に修正。
- TeamSwitcher安定化: NavSecondary を `next/link` に統一してフルリロードを防止。TeamProvider は React Query キャッシュ優先（staleTime 5分、refetchOnMount/Focus false、Reconnect true、placeholderData=prev、intervalなし）に整理。
- Team選択の永続化: TeamProvider が user ごとに直近 team_id を localStorage に保存・復元し、defaultTeamId/取得済みチームのいずれかにフォールバックして初回ロード時の選択を安定化。
- 権限ガード強化: `lib/permissions.ts` で admin/manager 判定や created_by を考慮した編集/削除可否ロジックを追加し、Approve/Reject API で currentTeamRole & team 選択チェックを挟んでサーバー側に流す前に弾く。
- Storage/RLS 固定: receipts バケットは `team_id/authUid/uuid.ext` + metadata.team_id でアップロード。RLS で team_users 参加 + パス prefix を強制（admin/manager は全パス許可、その他は自分のパスのみ）。フロントの uploadReceipt も同設計に合わせている。
- フォーム接続: ExpenseForm は Supabase に submit し、ExpenseSheet は update を Supabase に反映（権限制御とカテゴリ/Event 名から ID 解決）。UserSheet はロール変更を Supabase に反映。失敗時はメッセージ表示、成功時に React Query を invalidate。
- 承認UX: approve/reject 後に approvals/expenses/transactions を invalidate。成否トーストを追加してフィードバックを改善。
- スキーマ整合: フロントスキーマ（lib/schemas.ts）は現行 UI のフィールドのみを保持し、DB 追加カラム（team_id など）はクエリ層で扱う方針を明示。
- シード: `supabase/seeds/dev.sql` を追加。`npm run seed` で Team Alpha/Beta + サンプルデータを再現可能に。
- エラー表示: 一覧の読み込み失敗は `DestructiveAlert` で表示。承認トーストは alert-toast UI で単一表示。
