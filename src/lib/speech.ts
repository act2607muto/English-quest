/**
 * 英文の読み上げ（リスニングの出題）。ブラウザ標準の読み上げ機能を使う。
 * 声で答える側の音声認識は使わない（録音して文字起こしに送る。recorder.ts）。
 *
 * 声は、端末とブラウザにある英語の声から、いちばん自然なものを選ぶ（2026-11-21）。
 *   Windows の Edge：Microsoft Aria Online (Natural) など（インターネット経由の自然な声）
 *   Windows の Chrome：Google US English
 *   iPhone・Mac：Samantha など（拡張版・高品質版があればそれ）
 * Windows に最初から入っている「Microsoft Zira Desktop」などは機械っぽいので、ほかにないときだけ使う。
 */
import { holdBgm } from './sound';

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** iPhone・Mac にある、おもしろ声（鐘の音・ささやき声など）。英語の練習には使わない */
const NOVELTY_VOICES =
  /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley)\b/i;

/** 声の自然さの点数（大きいほど自然）。英語でなければ使わない */
function voiceScore(v: SpeechSynthesisVoice): number {
  const lang = v.lang.replace('_', '-').toLowerCase();
  if (!lang.startsWith('en')) return -Infinity;
  const name = v.name;
  let score = 0;
  if (/natural|neural/i.test(name)) score += 100; // Edge のインターネット経由の自然な声
  else if (/online/i.test(name)) score += 80;
  if (/^google/i.test(name)) score += 70; // Chrome の声
  if (/premium|enhanced|siri/i.test(name)) score += 60; // Mac・iPhone の高品質な声
  if (/desktop/i.test(name) || /^microsoft (zira|david|mark|hazel|george|susan)\b/i.test(name)) score -= 50; // Windows の古い声
  if (NOVELTY_VOICES.test(name)) score -= 200;
  if (lang === 'en-us') score += 10;
  else if (/^en-(gb|au|ca|ie|nz)/.test(lang)) score += 5;
  if (v.default) score += 2;
  if (v.localService) score += 1;
  return score;
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function englishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null; // まだ読み込み中。次の呼び出しで探し直す
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;
  for (const v of voices) {
    const s = voiceScore(v);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  cachedVoice = bestScore === -Infinity ? null : best;
  return cachedVoice;
}

// 声の一覧はあとから届く（Chrome・Edge）。届いたら選び直す
if (canSpeak) {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined;
  });
}

/** 今の読み上げの声の名前（設定の画面に出す）。まだ分からなければ null */
export function englishVoiceName(): string | null {
  if (!canSpeak) return null;
  return englishVoice()?.name ?? null;
}

/**
 * 読み上げ機能が英語の単語として読めない名前を、読み上げるときだけ近い音のつづりに変える
 * （画面に出す英文は変えない）。例：Emi を「イー・エム・アイ」と読んでしまうので Emmy にする。
 * 読みまちがいを見つけたら、ここに足す。
 */
const SPOKEN_AS: Record<string, string> = {
  Emi: 'Emmy',
};

function forSpeech(text: string): string {
  return text.replace(/[A-Za-z]+/g, (word) => SPOKEN_AS[word] ?? word);
}

/** 読み上げの終わりが知らされないことがあるので、この時間がたったら BGM をもどす */
let releaseTimer: number | undefined;

/** 英文を読み上げる。iPhone では、最初の1回はボタンを押した処理の中から呼ぶ必要がある */
export function speakEnglish(text: string, rate = 0.9): void {
  if (!canSpeak) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(forSpeech(text));
    const voice = englishVoice();
    u.lang = voice?.lang ?? 'en-US';
    u.rate = rate;
    if (voice) u.voice = voice;
    // 読み上げている間は BGM を消す（英文が聞こえにくくならないように）
    holdBgm('speech', true);
    const release = () => {
      window.clearTimeout(releaseTimer);
      holdBgm('speech', false);
    };
    u.onend = release;
    u.onerror = release;
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(release, 4000 + text.length * 150);
    speechSynthesis.speak(u);
  } catch {
    // 読み上げられない端末では何もしない（画面の「聞く」ボタンでやり直せる）
  }
}

export function stopSpeaking(): void {
  window.clearTimeout(releaseTimer);
  holdBgm('speech', false);
  if (canSpeak) speechSynthesis.cancel();
}
