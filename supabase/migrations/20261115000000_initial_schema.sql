-- 英語ステータス育成アプリ 初期スキーマ
-- docs/spec.md「データ設計」の8種類のデータを作る。
--
-- 3つのまとまりに分ける。
--   教材        : questions
--   ゲームの設定 : towns, monsters, equipment
--   自分の記録   : question_progress, skill_stats, adventure_state, battle_logs
--
-- 記録のテーブルから教材・設定のテーブルへは外部キーを張らない。
-- 教材や設定を入れ替えたり消したりしても、記録が壊れないようにするため。
--
-- Supabase の SQL Editor に全文を貼り付けて1回実行する。

-- ============================================================
-- 共通
-- ============================================================

-- updated_at を自動で更新する
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 教材・設定を書き換えられる利用者（管理者）
-- 自分専用の間は自分1人を登録する。公開後も一般の利用者は教材を書き換えられない。
create table public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

create policy "管理者は自分の行を見られる"
  on public.app_admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ログイン中の利用者が管理者かどうか
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_admins where user_id = (select auth.uid())
  );
$$;

-- ============================================================
-- ゲームの設定
-- ============================================================

-- 街
create table public.towns (
  id               text primary key,                 -- 例: town01
  name             text,                             -- 街の名前（未決のため空でよい）
  scene            text not null,                    -- 会話の場面。例: あいさつと自己紹介
  difficulty       smallint not null default 1
                   check (difficulty between 1 and 3), -- 1=基本 2=標準 3=目標
  sort_order       integer not null,                 -- 進む順番
  background_image text,                             -- 背景の絵のパス
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index towns_sort_order_key on public.towns (sort_order);

-- モンスター
create table public.monsters (
  id         text primary key,                       -- 例: town01-mon-voc
  name       text not null,
  town_id    text not null references public.towns (id) on update cascade on delete cascade,
  skill      text check (skill in ('vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing')),
  hp         smallint not null check (hp > 0),
  gold       integer not null default 0 check (gold >= 0), -- 倒したときにもらえるお金
  is_boss    boolean not null default false,
  image      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- ボスは能力値の混合で出題するので skill を持たない。通常のモンスターは必ず持つ
  check (is_boss or skill is not null)
);

create index monsters_town_id_idx on public.monsters (town_id);

-- 装備品
-- effect の例:
--   {"type": "exp_bonus",   "skill": "vocabulary", "rate": 0.1}  語彙の経験値が10%増える
--   {"type": "max_hp",      "amount": 1}                          自分のHPが1増える
--   {"type": "decay_grace", "days": 1}                            低下が始まるまでの猶予が1日延びる
-- 英語の正誤を変える効果（ヒント、選択肢を減らす等）は入れない。
create table public.equipment (
  id         text primary key,                       -- 例: town01-wpn-voc
  name       text not null,
  slot       text not null check (slot in ('weapon', 'armor')),
  effect     jsonb not null default '{}'::jsonb
             check (jsonb_typeof(effect) = 'object'),
  price      integer not null check (price >= 0),
  town_id    text not null references public.towns (id) on update cascade on delete cascade,
  image      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index equipment_town_id_idx on public.equipment (town_id);

-- ============================================================
-- 教材
-- ============================================================

-- 問題
-- 項目は data/town01_questions.json の形式に合わせる。
create table public.questions (
  id            text primary key,                    -- 例: town01-voc-001
  town_id       text not null references public.towns (id) on update cascade on delete cascade,
  skill         text not null
                check (skill in ('vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing')),
  format        text not null
                check (format in ('choice4', 'translate', 'respond')),
  prompt        text not null,                       -- 画面に出す指示文
  sentence      text,                                -- 出題する文
  sentence_ja   text,                                -- respond の質問の日本語訳
  audio_text    text,                                -- リスニングで読み上げる英文（画面には出さない）
  choices       jsonb,                               -- 4択の選択肢（文字列の配列）
  answer        smallint,                            -- 正解の位置（0から数える）
  model_answers jsonb,                               -- AI採点に渡す模範解答（文字列の配列）
  explanation   text,                                -- 答えたあとに見せる解説
  difficulty    smallint not null default 1 check (difficulty between 1 and 3),
  tags          text[] not null default '{}',
  needs_fix     boolean not null default false,      -- 要修正の印
  fix_note      text,                                -- 印をつけたときのメモ
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- 4択なら選択肢4つと正解の位置が必要
  -- （NULL だと check が素通りするので coalesce で false にする）
  constraint questions_choice4_check check (
    format <> 'choice4' or coalesce(
      jsonb_typeof(choices) = 'array'
      and jsonb_array_length(choices) = 4
      and answer between 0 and 3,
      false
    )
  ),
  -- AI採点の問題なら模範解答が1つ以上必要
  constraint questions_model_answers_check check (
    format not in ('translate', 'respond') or coalesce(
      jsonb_typeof(model_answers) = 'array'
      and jsonb_array_length(model_answers) >= 1,
      false
    )
  )
);

create index questions_town_skill_idx on public.questions (town_id, skill);
create index questions_needs_fix_idx on public.questions (needs_fix) where needs_fix;

-- ============================================================
-- 自分の記録（すべて user_id を持つ）
-- ============================================================

-- 問題ごとの学習状態
-- stage: 0=まだ正解していない、1〜5=復習間隔 1日・3日・7日・14日・30日 の段階
create table public.question_progress (
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id      text not null,                    -- questions.id（外部キーは張らない）
  stage            smallint not null default 0 check (stage between 0 and 5),
  next_review_on   date,                             -- 次の復習日
  correct_count    integer not null default 0 check (correct_count >= 0),
  wrong_count      integer not null default 0 check (wrong_count >= 0),
  last_answered_at timestamptz,
  last_answer      text,                             -- 直近の答え
  last_feedback    jsonb,                            -- 直近のAIの評価と助言
  updated_at       timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index question_progress_review_idx on public.question_progress (user_id, next_review_on);

-- 能力値
-- exp は「last_practiced_at の時点の経験値」。低下はここに書き戻さず、
-- アプリを開いたときに last_practiced_at からの日数で計算して表示する。
-- 練習したときに「低下後の値 + 獲得した経験値」を書き込み、last_practiced_at を更新する。
create table public.skill_stats (
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill             text not null
                    check (skill in ('vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing')),
  exp               integer not null default 0 check (exp >= 0),
  max_exp           integer not null default 0 check (max_exp >= 0), -- 過去最高の経験値
  last_practiced_at timestamptz,
  unlocked          boolean not null default false,
  updated_at        timestamptz not null default now(),
  primary key (user_id, skill),
  check (exp <= max_exp)
);

-- 冒険の状態（利用者ごとに1行）
create table public.adventure_state (
  user_id            uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  current_town_id    text not null default 'town01',
  gold               integer not null default 0 check (gold >= 0),
  owned_equipment    text[] not null default '{}',   -- 持っている装備の equipment.id
  equipped_weapon_id text,
  equipped_armor_id  text,
  defeated_bosses    text[] not null default '{}',   -- 倒したボスの monsters.id
  updated_at         timestamptz not null default now()
);

-- 戦闘の履歴
create table public.battle_logs (
  id             bigint generated always as identity primary key,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fought_at      timestamptz not null default now(),
  town_id        text not null,
  monster_id     text not null,
  question_count smallint not null check (question_count >= 0),
  correct_count  smallint not null check (correct_count >= 0),
  won            boolean not null,
  exp_gained     integer not null default 0 check (exp_gained >= 0),
  exp_by_skill   jsonb not null default '{}'::jsonb, -- 例: {"vocabulary": 50}。ボス戦は複数の能力値に入る
  gold_gained    integer not null default 0 check (gold_gained >= 0)
);

create index battle_logs_user_fought_idx on public.battle_logs (user_id, fought_at desc);

-- ============================================================
-- updated_at のトリガー
-- ============================================================

create trigger towns_set_updated_at before update on public.towns
  for each row execute function public.set_updated_at();
create trigger monsters_set_updated_at before update on public.monsters
  for each row execute function public.set_updated_at();
create trigger equipment_set_updated_at before update on public.equipment
  for each row execute function public.set_updated_at();
create trigger questions_set_updated_at before update on public.questions
  for each row execute function public.set_updated_at();
create trigger question_progress_set_updated_at before update on public.question_progress
  for each row execute function public.set_updated_at();
create trigger skill_stats_set_updated_at before update on public.skill_stats
  for each row execute function public.set_updated_at();
create trigger adventure_state_set_updated_at before update on public.adventure_state
  for each row execute function public.set_updated_at();

-- ============================================================
-- 利用者の記録の初期化
-- ============================================================

-- 指定した利用者の能力値6行と冒険の状態1行を作る（すでにあれば何もしない）。
-- リーディングは第2段階で解放するので、最初は未解放にする。
create or replace function public.init_user_records(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.skill_stats (user_id, skill, unlocked)
  values
    (target_user_id, 'vocabulary', true),
    (target_user_id, 'grammar',    true),
    (target_user_id, 'listening',  true),
    (target_user_id, 'reading',    false),
    (target_user_id, 'speaking',   true),
    (target_user_id, 'writing',    true)
  on conflict (user_id, skill) do nothing;

  insert into public.adventure_state (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

-- 利用者が作られたら自動で記録を用意する
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.init_user_records(new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- init_user_records は画面から直接呼ばせない（トリガーとSQL Editorからだけ使う）
revoke execute on function public.init_user_records(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.towns             enable row level security;
alter table public.monsters          enable row level security;
alter table public.equipment         enable row level security;
alter table public.questions         enable row level security;
alter table public.question_progress enable row level security;
alter table public.skill_stats       enable row level security;
alter table public.adventure_state   enable row level security;
alter table public.battle_logs       enable row level security;

-- 教材・設定: ログインしていれば読める。書き換えは管理者だけ
create policy "ログイン中は街を読める" on public.towns
  for select to authenticated using (true);
create policy "管理者は街を追加できる" on public.towns
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者は街を更新できる" on public.towns
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者は街を削除できる" on public.towns
  for delete to authenticated using ((select public.is_admin()));

create policy "ログイン中はモンスターを読める" on public.monsters
  for select to authenticated using (true);
create policy "管理者はモンスターを追加できる" on public.monsters
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者はモンスターを更新できる" on public.monsters
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者はモンスターを削除できる" on public.monsters
  for delete to authenticated using ((select public.is_admin()));

create policy "ログイン中は装備品を読める" on public.equipment
  for select to authenticated using (true);
create policy "管理者は装備品を追加できる" on public.equipment
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者は装備品を更新できる" on public.equipment
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者は装備品を削除できる" on public.equipment
  for delete to authenticated using ((select public.is_admin()));

create policy "ログイン中は問題を読める" on public.questions
  for select to authenticated using (true);
create policy "管理者は問題を追加できる" on public.questions
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者は問題を更新できる" on public.questions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者は問題を削除できる" on public.questions
  for delete to authenticated using ((select public.is_admin()));

-- 自分の記録: 本人の行だけ読み書きできる
create policy "本人は学習状態を読める" on public.question_progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy "本人は学習状態を追加できる" on public.question_progress
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "本人は学習状態を更新できる" on public.question_progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "本人は学習状態を削除できる" on public.question_progress
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "本人は能力値を読める" on public.skill_stats
  for select to authenticated using (user_id = (select auth.uid()));
create policy "本人は能力値を追加できる" on public.skill_stats
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "本人は能力値を更新できる" on public.skill_stats
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "本人は冒険の状態を読める" on public.adventure_state
  for select to authenticated using (user_id = (select auth.uid()));
create policy "本人は冒険の状態を追加できる" on public.adventure_state
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "本人は冒険の状態を更新できる" on public.adventure_state
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- 戦闘の履歴は追記だけ（書き換え・削除はしない）
create policy "本人は戦闘の履歴を読める" on public.battle_logs
  for select to authenticated using (user_id = (select auth.uid()));
create policy "本人は戦闘の履歴を追加できる" on public.battle_logs
  for insert to authenticated with check (user_id = (select auth.uid()));

-- ============================================================
-- 権限
-- ============================================================
-- ログインしていない状態（anon）からは何も触らせない。
-- ログイン中（authenticated）でも、実際に触れる行は上の RLS で絞られる。

revoke all on
  public.app_admins, public.towns, public.monsters, public.equipment, public.questions,
  public.question_progress, public.skill_stats, public.adventure_state, public.battle_logs
from anon;

grant select on public.app_admins to authenticated;
grant select, insert, update, delete on
  public.towns, public.monsters, public.equipment, public.questions,
  public.question_progress
to authenticated;
grant select, insert, update on public.skill_stats, public.adventure_state to authenticated;
grant select, insert on public.battle_logs to authenticated;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
