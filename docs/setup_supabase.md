# Supabase の準備手順

第1段階の手順1。Supabase のプロジェクトを作り、テーブルとアクセス制限を入れ、自分のアカウントを1つだけ作る。

所要時間は15分ほど。Supabase の画面の文言は変わることがあるので、見当たらないときは近い名前の項目を探す。

## 1. プロジェクトを作る

1. https://supabase.com を開き、「Start your project」からアカウントを作る（GitHub かメールアドレス）。
2. 「New project」を押す。
3. 次のように入れる。
   - **Name**：わかる名前なら何でもよい（例：`english-status`）
   - **Database Password**：「Generate a password」で作り、パスワード管理アプリに保存する。アプリからは使わないが、あとでデータベースに直接つなぐときに要る
   - **Region**：`Northeast Asia (Tokyo)`。iPhone からの通信が速くなる
   - **Plan**：Free
   - **Security**：
     - **Enable Data API**：オン（画面からデータを読み書きするのに要る）
     - **Automatically expose new tables**：オフ（手順2のSQLで、使う権限を1つずつ与えている）
     - **Enable automatic RLS**：オン（RLS の付け忘れを防ぐ保険）
4. 「Create new project」を押し、準備が終わるまで1〜2分待つ。

## 2. テーブルとアクセス制限を作る

1. 左のメニューの「SQL Editor」を開く。
2. 「New query」を押す。
3. `supabase/migrations/20261115000000_initial_schema.sql` の中身を全部貼り付ける。
4. 「Run」を押す。「Success. No rows returned」と出れば成功。
5. 左のメニューの「Table Editor」で、次の9つのテーブルがあることを確かめる。

| テーブル | 中身 |
| --- | --- |
| `towns` | 街 |
| `monsters` | モンスター |
| `equipment` | 装備品 |
| `questions` | 問題 |
| `question_progress` | 問題ごとの学習状態 |
| `skill_stats` | 能力値 |
| `adventure_state` | 冒険の状態 |
| `battle_logs` | 戦闘の履歴 |
| `app_admins` | 教材を書き換えられる人（自分） |

どのテーブルにも「RLS enabled」の表示が出ていればよい。

## 3. 新規登録を閉じる

自分専用なので、他の人がアカウントを作れないようにする。

1. 左のメニューの「Authentication」→「Sign In / Providers」を開く。
2. **Allow new users to sign up** をオフにして保存する。
3. 同じ画面で **Email** のログインが有効になっていることを確かめる。

新規登録を閉じても、管理画面からは自分のアカウントを作れる。

## 4. 自分のアカウントを作る

1. 「Authentication」→「Users」を開く。
2. 「Add user」→「Create new user」を押す。
3. メールアドレスとパスワードを入れる。パスワードはパスワード管理アプリで作る。
4. **Auto Confirm User** にチェックを入れて作る。

アカウントを作ると、能力値6つと冒険の状態が自動で用意される（手順2のSQLに入れた仕組み）。

### ログインはパスワードで行う

メールに届くリンクでログインする方式（マジックリンク）は使わない。iPhone でホーム画面から開いたアプリは Safari とは保存場所が別なので、メールのリンクを押すと Safari の側でログインしてしまい、ホーム画面のアプリはログインしないままになる。

## 5. 自分を管理者にする

教材（問題・街・モンスター・装備品）を取り込めるのは管理者だけにしてある。自分を管理者に登録する。

1. 「SQL Editor」→「New query」を開く。
2. 次を貼り付け、`you@example.com` を手順4のメールアドレスに直して「Run」を押す。

```sql
insert into public.app_admins (user_id)
select id from auth.users where email = 'you@example.com';
```

3. 続けて次を実行し、結果を確かめる。

```sql
select u.email,
       (select count(*) from public.app_admins a where a.user_id = u.id) as is_admin,
       (select count(*) from public.skill_stats s where s.user_id = u.id) as skills,
       (select count(*) from public.adventure_state s where s.user_id = u.id) as adventure
from auth.users u;
```

`is_admin` が 1、`skills` が 6、`adventure` が 1 なら完了。

`skills` が 0 のときは、SQL を流す前にアカウントを作っていた場合。次を実行すれば用意される。

```sql
select public.init_user_records(id) from auth.users where email = 'you@example.com';
```

## 6. 画面側で使う値を控える

次の手順（React の土台）で使う。

1. 左下の「Project Settings」を開く。
2. 「Data API」（または「API」）で **Project URL** を控える。`https://xxxx.supabase.co` の形で、後ろの `/rest/v1/` は要らない。
3. 「API Keys」で **publishable key**（`sb_publishable_...`）を控える。古い画面では **anon public** と書かれたキー。

この2つは画面側に置いてよい値。アクセスは手順2の RLS で絞ってある。

**secret key（`sb_secret_...`）と service_role key は画面側に絶対に置かない。** RLS を素通りしてすべてのデータを読み書きできる。

## 補足

- 無料プランは、7日間操作がないとプロジェクトが一時停止される。アプリで練習していれば止まらない。止まっても管理画面から再開でき、データは消えない。
- 後でテーブルを変えるときは、`supabase/migrations/` に新しいSQLファイルを足して同じように実行する。最初のファイルは書き換えない。
