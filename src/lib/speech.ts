/**
 * 英文の読み上げ（リスニングの出題）。ブラウザ標準の読み上げ機能を使う。
 * 声で答える側の音声認識は使わない（録音して文字起こしに送る。recorder.ts）。
 */

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function englishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null; // まだ読み込み中。次の呼び出しで探し直す
  cachedVoice =
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
  return cachedVoice;
}

import { holdBgm } from './sound';

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

/** 英文を読み上げる。iPhone では、最初の1回はボタンを押した処理の中から呼ぶ必要がある */
export function speakEnglish(text: string, rate = 0.9): void {
  if (!canSpeak) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(forSpeech(text));
    u.lang = 'en-US';
    u.rate = rate;
    const voice = englishVoice();
    if (voice) u.voice = voice;
    // 読み上げている間は BGM を消す（英文が聞こえにくくならないように）
    holdBgm('speech', true);
    u.onend = () => holdBgm('speech', false);
    u.onerror = () => holdBgm('speech', false);
    speechSynthesis.speak(u);
  } catch {
    // 読み上げられない端末では何もしない（画面の「聞く」ボタンでやり直せる）
  }
}

export function stopSpeaking(): void {
  holdBgm('speech', false);
  if (canSpeak) speechSynthesis.cancel();
}
