# **Folio REST API / クエリ設計書**

## 1. 設計方針

- **Supabase の PostgREST + RPC + Edge Functions を併用**
- **RLS を最大限活用**し、API 側では team_id チェックのみ
- 認証は Supabase Auth の Access Token
- JSON 統一のレスポンス
- `team_id` をほぼ全 API に必須パラメータとして持たせる

---

# **2. リソース別 API 設計**

---

# **A. Users（ユーザー管理）**

## **1. GET /api/users**

現在のチームに所属するユーザー一覧を取得

### 認証

Required (member 以上)

### Query

`/api/users?team_id=xxxx`

### Supabase クエリ

```ts
supabase
  .from("team_users")
  .select("role, profiles(id, name, avatar_url)")
  .eq("team_id", teamId);
```

### レスポンス

```json
[
  {
    "id": "uuid",
    "name": "Asahi",
    "avatar_url": "https://...",
    "role": "manager"
  }
]
```

---

## **2. PATCH /api/users/:id/role**

チーム内のロール変更

### 認証

admin / manager

### Body

```json
{
  "team_id": "uuid",
  "role": "member"
}
```

### Supabase クエリ

```ts
supabase
  .from("team_users")
  .update({ role })
  .eq("team_id", teamId)
  .eq("user_id", userId);
```

---

# **B. Teams（チーム関連）**

## **1. GET /api/teams**

所属しているチーム一覧

### Supabase クエリ

```ts
supabase
  .from("team_users")
  .select("team_id, teams(id, name, icon)")
  .eq("user_id", authUserId);
```

---

## **2. POST /api/teams**

新規チーム作成
→ team_users に creator を admin で登録

---

# **C. Invites（招待）**

## **1. POST /api/invites**

招待リンク作成（token 発行）

### Body

```json
{
  "team_id": "uuid",
  "role": "member",
  "expires_at": "2025-07-01"
}
```

### Supabase

```ts
supabase.from("invites").insert({
  team_id,
  role,
  expires_at,
  created_by: authUserId,
});
```

---

## **2. POST /api/invites/accept**

招待を受け取って team_users に追加

---

# **D. Categories（カテゴリ管理）**

## **1. GET /api/categories?team_id=xxx**

プリセット + チーム独自カテゴリをまとめて返す。

```ts
supabase.from("categories").select("*").in("team_id", [null, teamId]);
```

---

## **2. POST /api/categories**

チーム独自カテゴリを追加

---

# **E. Events（イベント管理）**

## GET /api/events?team_id=xxx

## POST /api/events

## PATCH /api/events/:id

## DELETE /api/events/:id

全部わかりやすい CRUD なので省略。

---

# **F. Expenses（申請）**

## **1. GET /api/expenses**

（expense-list）

### Query

`/api/expenses?team_id=xxxx&status=submitted&from=2025-01-01&to=2025-02-01`

### Supabase クエリ

```ts
let q = supabase
  .from("expenses")
  .select(
    `
    *,
    category:categories(name),
    event:events(name),
    created_by_user:profiles(name, avatar_url)
  `
  )
  .eq("team_id", teamId);

if (status) q.eq("status", status);
if (from) q.gte("date", from);
if (to) q.lte("date", to);
```

---

## **2. POST /api/expenses**

新規申請

---

## **3. PATCH /api/expenses/:id**

編集（ただし status=approved は編集不可）

---

## **4. DELETE /api/expenses/:id**

削除
admin/manager のみ

---

# **G. Approvals（承認フロー）**

### **POST /api/approvals/:expense_id/approve**

承認する → transactions にコピーする

```ts
await supabase.rpc("approve_expense", {
  expense_id,
  approved_by: authUserId,
});
```

※ Supabase RPC（SQL Function）で実装すると完璧

---

### **POST /api/approvals/:expense_id/reject**

差戻し

---

# **H. Transactions（確定取引）**

## **GET /api/transactions**

（集計ページなどで利用）

### Query

`/api/transactions?team_id=xxxx&from=…&to=…&category_id=…`

### Supabase クエリ

```ts
supabase
  .from("transactions")
  .select("*")
  .eq("team_id", teamId)
  .gte("date", from)
  .lte("date", to);
```

---

# **3. 共通エラーフォーマット**

```json
{
  "error": {
    "status": 403,
    "message": "Forbidden",
    "details": "manager role required"
  }
}
```

---

# **4. 今後の拡張**

- Edge Functions を使った **Slack 通知**
- **予算管理 API**（budget テーブル）
- SQL Function による集計

  - 月別支出合計
  - カテゴリ別 breakdown

- **複数レシート対応（attachments）**
