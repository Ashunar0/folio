# ✔ 全体方針（まず前提）

### 1. チームは “複数所属が前提”

→ Slack と同じ。「アカウントは1つ」「チームは複数所属OK」。

### 2. 招待リンクの役割

* `inviteId` が付いている
* 開くと **`teamId` + そのユーザーの role** を一時的に保持する
* ユーザーがログイン・登録したあとに **join confirmation** を表示する

### 3. 初回登録時は必ず「チームに入る or 作る」のどちらかが必要。

→ チームに所属していない状態で `/app/[teamId]` に入れないため。

---

# ✔ 全パターンのユーザーフロー（決定版）

---

# ① **初めて使う & 招待リンクなし**

```
新規登録 → チーム作成 → ダッシュボード
```

### 画面フロー

1. `/register`
2. 「アカウント作成完了」
3. **Team Create Page**

   * team name
   * theme color（任意）
4. `/app/[teamId]/dashboard`

完全に自然でOK。

---

# ② **初めて使う & 招待リンクあり**

Slack と同じ挙動になるべき。

```
招待リンク → 新規登録 → チーム参加確認 → ダッシュボード
```

### フロー詳細

1. ユーザーが招待リンクを開く
   → 一時的に `inviteToken` を保持（URL or cookie）

2. まだログインしていない
   → `/register` にリダイレクト（inviteToken を維持）

3. アカウント作成完了後
   → **「〇〇チームに参加しますか？」確認画面**

4. OK → `team_members` にINSERT
   → `/app/[teamId]/dashboard`

---

# ③ **アカウントはあるが LocalStorage にログイン情報がない**

```
ログイン → 所属チーム選択 → ダッシュボード
```

### ポイント

* 所属チームが複数ある可能性がある
* 1つしかなければ自動でそのチームへ

### フロー

1. `/login`
2. `auth.user.id` をもとに `team_members` から所属チームを取得
3. チームが複数 → チーム選択画面 `/select-team`
4. `/app/[teamId]/dashboard`

普通にこのままでOK。

---

# ④ **アカウントがあり、新しいチームを作りたい**

これは Slack の「Create Workspace」と同じ。

```
Team Switcher → “Add Team” → チーム作成 → 新チームのダッシュボード
```

### 理屈

* ログイン済みなので本人確認は不要
* team name 入れて team 作成すればOK

---

# ⑤ **アカウントがあり、招待リンクがある（新しいチームに参加したい）**

これで詰まってたよね。
正解は **Slack と Notion の方式**で、以下のようにする。

---

## 【A】招待リンク → ログイン済みだった場合

```
招待リンク → join 確認画面 → OK → team_members insert → ダッシュボード
```

### 画面遷移

1. `/invite/[token]`
2. ログインしている = user.id あり
3. 「〇〇チームに参加しますか？」画面
4. OK で `/app/[teamId]/dashboard`

これは **Team Switcher を経由しない**。
→ 招待リンクから直接誘導が最も自然。

---

## 【B】招待リンク → 未ログインの場合

```
招待リンク → ログイン or 新規登録 → join確認 → ダッシュボード
```

### つまりこうなる

1. `/invite/[token]`
2. 未ログイン → `/login?redirect=/invite/[token]`
3. ログイン成功後 → join確認画面
4. OK → dashboard

Slack と同じ流れ。

---

## 【C】Team Switcher の “Add Team” から招待を適用するケース？

→ **基本的には発生しない**
招待リンクは URL 経由で行う方が UX が正しい。

Team Switcher は **自分が作るときだけ使う**。

---

# ✔ 見落としているパターンはある？

実はあと2つだけある。

---

## ⑥ **所属チームが 0 件になった場合（全チームから外された）**

```
「チームに所属していません → 新規作成 or 招待リンク利用」
```

UI案：

* 「新しいチームを作成」
* 「招待リンクを持っていますか？」

これは Notion / Slack と同じ。

---

## ⑦ **ユーザーがログアウトしたい（チームではなくアカウント単位で）**

チームからログアウトではなく、
"アプリ全体からログアウト" を想定する。

```
global menu → logout → /login
```

チーム単位でのログアウトは存在しない。
（Slack も各 Workspace から離脱するだけで「ログアウト」という概念はない）

---

# ✔ まとめ：最終フロー図

### **新規登録**

* 招待なし：`register → create team`
* 招待あり：`register → join team`

### **ログイン**

* 所属チーム複数：`login → select-team`
* 所属チーム1つ：`login → dashboard`

### **新しいチーム作成**

* `TeamSwitcher → Add Team → create`

### **招待リンク**

* ログイン中：`invite → join`
* 未ログイン：`invite → login → join`

---

# ✔ 設計方針（確定版）

以下の方針で実装を進める:

1. **招待リンクURL**: `/invite/[token]` (動的ルート)
2. **招待リンク再利用**: 複数人使用可能（有効期限まで）
3. **既存メンバーが招待リンクを開いた場合**: 自動的にダッシュボードへリダイレクト + トースト通知
4. **ロール重複時**: 既存ロールを維持（招待を無視）
5. **所属チーム0件のユーザー**: `/onboarding` ページへリダイレクト
6. **存在しないteamId**: 賢いリダイレクト（所属チーム数に応じて適切な画面へ）
7. **招待リンク有効期限**: 無期限（`expires_at = null`）をデフォルトとする
8. **チーム作成後**: 即座に新チームのダッシュボードへリダイレクト

---


### FB

## ✅ 良い点

1. **フロー設計が非常に明確**
   - Slack/Notion のベストプラクティスを正しく踏襲
   - 複数チーム所属を前提とした設計で将来性が高い
   - エッジケース（所属チーム0件、ログアウト）も考慮済み

2. **招待リンクの扱いが適切**
   - URL経由での招待を基本とし、自然なUX
   - Team Switcherは「作成」のみに絞り、役割が明確

## ⚠️ 修正・要検討事項

### 1. **用語の統一**
- ❌ `team_members` → ✅ `team_users` (実際のテーブル名)
- ❌ `inviteId` → ✅ `token` (実際のカラム名は `invites.token`)

### 2. **招待リンクの実装詳細が必要**
現在 `/app/(auth)/invite/page.tsx` は空実装。以下の仕様を決める必要あり:

**URL設計**
- `/invite/[token]` (動的ルート)
- または `/invite?token=xxx` (クエリパラメータ)

**inviteToken の保持方法**
- ✅ **推奨**: URL → sessionStorage (ログイン/登録後も維持)
- ❌ Cookie: CSRF やサードパーティCookie制限の問題
- ❌ localStorage: セキュリティリスク

**バリデーション**
- 招待リンクの有効期限チェック (`invites.expires_at`)
- すでに参加済みのチームかチェック
- トークンの存在確認

### 3. **登録後のリダイレクト優先度**
`/register` 完了後の処理:

```
1. inviteToken あり → `/invite/[token]` (join confirmation)
2. inviteToken なし & 所属チーム 0件 → `/create-team`
3. inviteToken なし & 所属チーム 1件 → `/app/[teamId]/dashboard`
4. inviteToken なし & 所属チーム 複数 → `/select-team`
```

現在の `RegisterForm` がこのロジックを持っているか確認が必要。

### 4. **所属チーム0件の扱い**
`TeamProvider` は所属チーム0件でも動作するが、middleware/auth guardでの扱いを決める:

**option A**: `/create-team` または `/no-team` ページに強制リダイレクト
**option B**: `/app/[teamId]` 以外はアクセス可能にする

→ **推奨**: option A（常にチーム所属を強制）

### 5. **エッジケースの追加**
以下も考慮が必要:

**a) 招待リンクが既に使用済み**
- `invites` テーブルに `used_at` カラムを追加？
- または使用後に削除？

**b) ロールの重複**
- すでに admin だが、member として招待された場合
- → 既存ロールを維持 or アップグレード/ダウングレード？

**c) チーム削除**
- 所属していたチームが削除された場合
- → 次回ログイン時に所属チーム0件として処理

**d) teamId の妥当性チェック**
- URLに存在しない `teamId` が指定された場合
- → 404 or 所属チーム選択画面にリダイレクト

## 📋 実装タスク（優先順位順）

### Phase 1: 招待フロー基盤
- [ ] `/app/(auth)/invite/[token]/page.tsx` 実装
  - トークン検証
  - チーム情報表示
  - join confirmation UI
  - `team_users` への INSERT
- [ ] `RegisterForm` にリダイレクトロジック追加
- [ ] `LoginForm` にリダイレクトロジック追加
- [ ] sessionStorage での inviteToken 管理

### Phase 2: 所属チーム0件対応
- [ ] middleware での所属チーム0件チェック
- [ ] `/no-team` または `/onboarding` ページ
  - 「チームを作成」ボタン
  - 「招待リンクを持っていますか？」入力欄
- [ ] `TeamProvider` での0件時の挙動確認

### Phase 3: Team Switcher
- [ ] "Add Team" ボタンから `/create-team` への導線
- [ ] チーム作成後の自動切り替え

### Phase 4: エッジケース対応
- [ ] 招待リンク期限切れ UI
- [ ] 既に参加済みの場合の処理
- [ ] 存在しない teamId へのアクセス処理
- [ ] ロール重複時の処理

### Phase 5: Settings での招待管理
- [ ] 招待リンク生成 UI (`/app/[teamId]/settings`)
- [ ] 招待リンク一覧・削除機能
- [ ] 有効期限設定

## 🔧 DB/RPC 追加の検討

### 推奨: `accept_invite` RPC
```sql
create or replace function accept_invite(p_token uuid)
returns uuid  -- 返り値は team_id
language plpgsql
security definer
as $$
declare
  v_invite record;
  v_team_id uuid;
begin
  -- 招待情報を取得
  select * into v_invite from invites
  where token = p_token
    and (expires_at is null or expires_at > now());
  
  if not found then
    raise exception 'Invalid or expired invite token';
  end if;
  
  -- 既に参加済みかチェック
  if exists (
    select 1 from team_users
    where team_id = v_invite.team_id
      and user_id = auth.uid()
  ) then
    -- 既に参加済み → team_id を返す
    return v_invite.team_id;
  end if;
  
  -- team_users に追加
  insert into team_users (team_id, user_id, role)
  values (v_invite.team_id, auth.uid(), v_invite.role);
  
  -- 使用済みマーク（optional）
  -- update invites set used_at = now() where token = p_token;
  
  return v_invite.team_id;
end;
$$;
```

## 📝 ドキュメント更新が必要

- [ ] `AGENTS.md` にフロー概要を追加
- [ ] `.docs/database.md` に招待テーブル詳細追加
- [ ] API 仕様（`accept_invite` RPC など）

