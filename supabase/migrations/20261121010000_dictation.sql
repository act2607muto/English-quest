-- 書き取り（format "dictation"）を問題に使えるようにする（2026-11-21、4つ目の街から）。
-- audio_text に読み上げる英文、model_answers に正解とする英文を入れる。
-- Supabase の SQL Editor に貼って Run する。何度動かしても同じ結果になる。

-- 出題形式の決まりに dictation を足す
alter table public.questions
  drop constraint if exists questions_format_check;
alter table public.questions
  add constraint questions_format_check
  check (format in ('choice4', 'translate', 'respond', 'order', 'dictation'));

-- 書き取りなら、読み上げる英文と正解の英文1つ以上が必要
alter table public.questions
  drop constraint if exists questions_dictation_check;
alter table public.questions
  add constraint questions_dictation_check check (
    format <> 'dictation' or coalesce(
      audio_text is not null
      and jsonb_typeof(model_answers) = 'array'
      and jsonb_array_length(model_answers) >= 1,
      false
    )
  );
