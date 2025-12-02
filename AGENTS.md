# Repository Guidelines

# AGENT README (Folio)

このファイルを読めば、チャットを切り替えても Folio プロジェクトの現状が把握できます。

## プロジェクト概要

- プロダクト名: **Folio**（複数チーム対応の軽量会計 SaaS）
- スタック: Next.js(App Router) + TypeScript + shadcn/ui + React Query / Supabase Auth + Postgres + Storage (receipts) / Vercel。
- マルチチーム: `team_users` で所属・ロールを管理。サイドバー上部に TeamSwitcher。
- 現行ブランチ: `main`（feature/next-task を FF merge 済み）。

## 環境・キー

- `.env.local` 例:
  - `SUPABASE_URL / SUPABASE_ANON_KEY`（anon = NEXT_PUBLIC と同値）
  - `SUPABASE_PROJECT_ID=rnatvptcbafxeznvqzcg`
  - `NEXT_PUBLIC_SUPABASE_DEFAULT_TEAM_ID=a7ec413d-4e38-4d6e-8063-86f818569738`
- テストログイン: `/test/login` （Supabase email/password でサインイン）。トップからリンクあり。

## DB/RLS/Storage

- テーブル: profiles / teams / team_users / categories / events / expenses / transactions / invites。
- RLS: team_id スコープ、role で UPDATE/DELETE 制限。approved は編集不可（サーバー側）。
- Storage: バケット `receipts`。UI は `team_id/authUid/uuid.ext` + metadata `team_id` でアップロード。
- Storage RLS: receipts は team_id メタデータ必須。パス prefix を `team_id/auth.uid()/...` に強制（admin/manager は全パス可、それ以外は自分のパスのみ）。
- フォーム: ExpenseForm/ExpenseSheet は Supabase へ保存・更新を実行（カテゴリ/イベントは名称から ID 解決して挿入、権限チェックあり）。UserSheet はロール変更を Supabase に反映、失敗時はメッセージ表示。
- 承認 UX: approve/reject 後に approvals/expenses/transactions を invalidate し、トーストでフィードバック。
- エラー表示: 一覧エラーは `DestructiveAlert` に統一。承認トーストは alert-toast UI で単一表示。
- スキーマ方針: lib/schemas.ts は UI で使うフィールドに限定（team_id などの追加カラムは API 層で扱う）。DB との差分は docs/database.md / query.md を参照。
- シード: `supabase/seeds/dev.sql` を `npm run seed` で投入可（project_ref=rnatvptcbafxeznvqzcg 前提）。Team Alpha/Beta + サンプル経費/取引を初期化。
- RPC: `approve_expense`, `reject_expense` 実装済み（承認で transactions へ複製）。
- 追加 DDL: `profiles.email` カラム追加 & auth.users からバックフィル、サインアップトリガーで同期。

## フロント実装状況

- React Query 導入済み。Supabase/Auth/Team Provider あり。
- TeamSwitcher: NavSecondary を next/link 化し SPA 遷移、チラつき低減。TeamProvider はキャッシュ優先（staleTime 5 分、refetchOnMount/Focus=false, Reconnect=true）。
- 権限ガード: `lib/permissions.ts` に admin/manager 判定や created_by ベースの編集/削除可否を集約。Approve/Reject は currentTeamRole と team 選択をチェックしてから RPC を実行。
- データ接続: Expenses/Transactions/Users/Approvals を Supabase 直クエリで実データ化。Approval ボタンは admin/manager のみ有効。
- RBAC UI: Users/Expenses/Transactions の編集/削除は admin/manager か本人の draft/rejected のみ。権限外はメニュー/ボタン無効。
- 表示名: Expenses/Approvals で category/event/createdBy を名称表示。Users は profiles.email を表示。
- Auth: `/login` は Supabase Email/Password で動作。`lib/auth/api.ts` + `hooks/use-auth-service.ts` に接続ロジックを集約（バックエンド差し替え時にここだけ触ればよい）。QA 用に `/test/login` も残存（Home からサブリンクあり）。

## シード/確認用データ

- ユーザー `d9b79ea3-6c4b-462c-a35b-d857f956aab7` に Team Alpha(admin) / Team Beta(manager) などサンプルデータ挿入済み（Alpha submitted/draft, Beta submitted）。

## ドキュメント

- 設計書: `docs/architecture.md`, `docs/database.md`, `docs/query.md`, `docs/requirements.md`
- 進捗: `docs/outline.md`（実装済みメモあり）
- タスク: `docs/tasks.json`（チェックリスト）

## タスク運用ルール

- `docs/tasks.json` に沿ってタスクを進める。完了したら該当タスクの `status` を `true` に更新すること。
- 新しいタスクを追加する場合も同ファイルに id/title/description/status を追記して管理する。

## 直近の未着手/未完了タスク例（tasks.json より）

- Storage パス/RLS の最終決定とフロントの揃え込み
- フォーム保存 API の接続（Expense/Transaction/User）
- Lint/型エラー解消、シードスクリプト化、サーバー側権限ガード追加 など

## 注意事項

- UI を崩さないことが優先（既存デザインを尊重）。
- データ/RLS/Storage はサーバー側で厳格に。UI ガードだけに依存しないこと。
- Supabase anon で扱えない情報（auth.users の email など）は profiles に複製する方針。

## Project Structure & Module Organization

- `app/`: Next.js App Router entry points, layouts, and route groups (e.g., `(app)`, `(auth)`, `me/`). Prefer placing page-level data loading and metadata here.
- `components/`: Reusable UI (Radix-based) and shared widgets such as data tables, sidebar, auth blocks, and primitives under `components/ui/`.
- `hooks/` and `lib/`: Custom hooks, utilities, and service helpers; keep side-effectful logic (API, Supabase) in `lib/` and UI helpers in `hooks/`.
- `providers/`, `theme/`, `styles/`: Cross-cutting context, theming, and Tailwind/PostCSS setup. Static assets live in `public/`. Supabase client/configuration resides in `supabase/`.

## Build, Test, and Development Commands

- `npm run dev`: Start the local dev server at `http://localhost:3000` with hot reload.
- `npm run build`: Production build (Next.js). Fails on type errors by default.
- `npm run start`: Serve the built app locally; use to verify production behavior.
- `npm run lint`: Run ESLint with Next.js Core Web Vitals rules.

## Coding Style & Naming Conventions

- Language: TypeScript-first; 2-space indentation; keep files in ASCII.
- Components/hooks: `PascalCase` for React components, `camelCase` for helpers; colocate styles or variants alongside the component when practical.
- Styling: Tailwind CSS v4; prefer utility classes over ad-hoc CSS. Reuse shared primitives in `components/ui/` before adding new ones.
- Linting: ESLint config extends `eslint-config-next` with Core Web Vitals; fix or justify disables inline and keep them scoped.

## Testing Guidelines

- No automated test suite is present yet; add tests near the related feature (`app/feature/__tests__/` or `components/__tests__/`) using React Testing Library + Jest/Vitest if introduced.
- At minimum, run `npm run lint` before pushing; for UI changes, smoke-test key flows locally (auth, navigation, data tables).

## Commit & Pull Request Guidelines

- Commits: Keep messages short, imperative, and descriptive (e.g., `Add sidebar navigation`, `Fix Supabase auth redirect`). Squash small fixes before review.
- Pull Requests: Include a brief summary of scope, linked issue/Task ID, and screenshots or GIFs for UI changes. Call out env variables, migrations, or Supabase schema changes in the description and provide rollout steps.

## Security & Configuration Tips

- Secrets: Use `.env.local` for Supabase keys and any API tokens; never commit secrets. Reference via `process.env` and document new variables in the PR.
- Dependencies: Prefer existing stacks (Next.js 16, Radix UI, Tailwind). Audit third-party additions and justify them in the PR.
- Data handling: Validate inputs with `zod`/form resolvers where applicable, especially for auth or form submissions.
