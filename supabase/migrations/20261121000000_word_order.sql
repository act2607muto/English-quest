-- 単語の並べかえ（format "order"）を問題に使えるようにする（2026-11-21、3つ目の街から）。
-- choices に並べる単語のカード、model_answers に正しい英文を入れる。
-- Supabase の SQL Editor に貼って Run する。何度動かしても同じ結果になる。

-- 出題形式の決まりに order を足す（最初の決まりは列に書いたので、名前は questions_format_check）
alter table public.questions
  drop constraint if exists questions_format_check;
alter table public.questions
  add constraint questions_format_check
  check (format in ('choice4', 'translate', 'respond', 'order'));

-- 並べかえなら、カード2枚以上と正しい英文1つ以上が必要
alter table public.questions
  drop constraint if exists questions_order_check;
alter table public.questions
  add constraint questions_order_check check (
    format <> 'order' or coalesce(
      jsonb_typeof(choices) = 'array'
      and jsonb_array_length(choices) >= 2
      and jsonb_typeof(model_answers) = 'array'
      and jsonb_array_length(model_answers) >= 1,
      false
    )
  );
