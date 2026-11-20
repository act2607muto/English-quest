/**
 * 音（BGM と効果音）。Web Audio で、その場で合成する（音のファイルは使わない。2026-11-20）。
 * 昔のゲーム機のような、矩形波・三角波・ノイズの音。メロディはすべてこのアプリのためのオリジナル。
 *
 * - 音を鳴らす処理はこのファイルにまとめる。あとで音のファイルに差し替えるときは、ここだけ直す。
 * - iPhone では、画面に最初にさわるまで音を出せない。installAudio が、最初のタップで音を使えるようにする。
 * - マナーモードのときは鳴らない（iPhone の決まり）。
 * - リスニングの読み上げ中と録音中は BGM を消す（holdBgm）。英文が聞こえにくくならないように、また録音に入らないように。
 * - BGM と効果音のオン・オフは設定で選ぶ（preferences.ts。端末ごとに覚える）。
 */
import { getBgmOn, getSfxOn } from './preferences';

export type BgmName = 'town' | 'field' | 'battle' | 'boss';
export type SfxName = 'select' | 'encounter' | 'hit' | 'hurt' | 'defeat' | 'win' | 'lose' | 'levelup' | 'coin' | 'warp';

/** [音の高さ（例：C5、F#4、Bb3。ドラムは kick・snare・hat。null は休み）, 拍の数] */
type Note = [string | null, number];
type Voice = { wave: OscillatorType | 'drums'; gain: number; notes: Note[]; /** 音を鳴らす長さの割合（短いと歯切れがよい） */ length?: number };
type Track = { bpm: number; voices: Voice[] };

/** 音量（0〜1） */
const MASTER_VOLUME = 0.9;
const BGM_VOLUME = 0.55;
const SFX_VOLUME = 0.8;

// ---------------------------------------------------------------- BGM（どれもオリジナルのメロディ。1曲 8小節をくり返す）

const bar = (...notes: Note[]) => notes;
const pattern = (notes: Note[], times: number) => Array.from({ length: times }, () => notes).flat();
/** 1小節に、根音とその1オクターブ上を8分音符で4回ずつ */
const octaves = (low: string, high: string): Note[] => pattern([[low, 0.5], [high, 0.5]], 4);

const TRACKS: Record<BgmName, Track> = {
  // 街：のんびりしたハ長調
  town: {
    bpm: 96,
    voices: [
      {
        wave: 'square',
        gain: 0.05,
        length: 0.85,
        notes: [
          ...bar(['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1]),
          ...bar(['F5', 1], ['A5', 1], ['G5', 2]),
          ...bar(['E5', 1], ['G5', 1], ['C6', 1], ['B5', 1]),
          ...bar(['A5', 1], ['G5', 1], ['E5', 2]),
          ...bar(['D5', 1], ['F5', 1], ['A5', 1], ['F5', 1]),
          ...bar(['G5', 1], ['E5', 1], ['C5', 1], ['D5', 1]),
          ...bar(['E5', 1.5], ['D5', 0.5], ['C5', 1], ['B4', 1]),
          ...bar(['C5', 3], [null, 1]),
        ],
      },
      {
        wave: 'triangle',
        gain: 0.13,
        length: 0.9,
        notes: [
          ...bar(['C3', 2], ['G2', 2]),
          ...bar(['F2', 2], ['C3', 2]),
          ...bar(['C3', 2], ['E3', 2]),
          ...bar(['A2', 2], ['C3', 2]),
          ...bar(['D3', 2], ['F2', 2]),
          ...bar(['G2', 2], ['C3', 2]),
          ...bar(['F2', 2], ['G2', 2]),
          ...bar(['C3', 2], ['G2', 2]),
        ],
      },
    ],
  },
  // 街の外：歩きたくなるト長調
  field: {
    bpm: 120,
    voices: [
      {
        wave: 'square',
        gain: 0.05,
        length: 0.8,
        notes: [
          ...bar(['G4', 1], ['B4', 1], ['D5', 1], ['G5', 1]),
          ...bar(['F#5', 1], ['D5', 1], ['E5', 2]),
          ...bar(['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1]),
          ...bar(['D5', 1], ['B4', 1], ['A4', 2]),
          ...bar(['G4', 1], ['B4', 1], ['D5', 1], ['B4', 1]),
          ...bar(['C5', 1], ['E5', 1], ['A5', 1], ['G5', 1]),
          ...bar(['F#5', 1], ['D5', 1], ['E5', 0.5], ['F#5', 0.5], ['G5', 1]),
          ...bar(['G5', 3], [null, 1]),
        ],
      },
      {
        wave: 'triangle',
        gain: 0.13,
        length: 0.8,
        notes: [
          ...pattern([['G2', 1], ['D3', 1]], 2),
          ...pattern([['D2', 1], ['A2', 1]], 2),
          ...pattern([['C3', 1], ['G2', 1]], 2),
          ...pattern([['D2', 1], ['A2', 1]], 2),
          ...pattern([['G2', 1], ['D3', 1]], 2),
          ...pattern([['A2', 1], ['E3', 1]], 2),
          ...pattern([['D2', 1], ['A2', 1]], 2),
          ...pattern([['G2', 1], ['D3', 1]], 2),
        ],
      },
      { wave: 'drums', gain: 0.05, notes: pattern([['hat', 0.5], [null, 0.5]], 32) },
    ],
  },
  // 戦闘：かけ足のイ短調
  battle: {
    bpm: 152,
    voices: [
      {
        wave: 'square',
        gain: 0.05,
        length: 0.8,
        notes: [
          ...bar(['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5]),
          ...bar(['F5', 1], ['E5', 0.5], ['D5', 0.5], ['E5', 2]),
          ...bar(['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['D6', 0.5], ['C6', 0.5], ['A5', 0.5], ['F5', 0.5], ['A5', 0.5]),
          ...bar(['G#5', 1], ['A5', 0.5], ['B5', 0.5], ['E5', 2]),
          ...bar(['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['B5', 0.5], ['C6', 0.5], ['B5', 0.5], ['A5', 0.5]),
          ...bar(['G5', 1], ['F5', 0.5], ['E5', 0.5], ['F5', 2]),
          ...bar(['E5', 0.5], ['F5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['E5', 0.5], ['D5', 0.5]),
          ...bar(['E5', 2], ['G#5', 1], ['B5', 1]),
        ],
      },
      {
        wave: 'triangle',
        gain: 0.14,
        length: 0.7,
        notes: [
          ...octaves('A2', 'A3'),
          ...octaves('F2', 'F3'),
          ...octaves('D2', 'D3'),
          ...octaves('E2', 'E3'),
          ...octaves('A2', 'A3'),
          ...octaves('F2', 'F3'),
          ...octaves('C3', 'C4'),
          ...octaves('E2', 'E3'),
        ],
      },
      { wave: 'drums', gain: 0.07, notes: pattern([['kick', 0.5], ['hat', 0.5], ['snare', 0.5], ['hat', 0.5]], 16) },
    ],
  },
  // ボス：重たいニ短調
  boss: {
    bpm: 138,
    voices: [
      {
        wave: 'square',
        gain: 0.05,
        length: 0.85,
        notes: [
          ...bar(['D5', 1], ['F5', 1], ['A5', 1], ['G#5', 1]),
          ...bar(['A5', 2], ['F5', 1], ['D5', 1]),
          ...bar(['Bb4', 1], ['D5', 1], ['F5', 1], ['E5', 1]),
          ...bar(['C#5', 2], ['A4', 2]),
          ...bar(['D5', 0.5], ['E5', 0.5], ['F5', 0.5], ['G5', 0.5], ['A5', 1], ['Bb5', 1]),
          ...bar(['A5', 1], ['G5', 1], ['F5', 1], ['E5', 1]),
          ...bar(['F5', 1], ['E5', 1], ['D5', 1], ['C#5', 1]),
          ...bar(['D5', 3], [null, 1]),
        ],
      },
      {
        wave: 'triangle',
        gain: 0.15,
        length: 0.7,
        notes: [
          ...octaves('D2', 'D3'),
          ...octaves('D2', 'D3'),
          ...octaves('Bb1', 'Bb2'),
          ...octaves('A1', 'A2'),
          ...octaves('D2', 'D3'),
          ...octaves('C2', 'C3'),
          ...octaves('Bb1', 'Bb2'),
          ...octaves('A1', 'A2'),
        ],
      },
      { wave: 'drums', gain: 0.08, notes: pattern([['kick', 0.5], ['kick', 0.5], ['snare', 0.5], ['hat', 0.5]], 16) },
    ],
  },
};

// ---------------------------------------------------------------- 音の土台

let ctx: AudioContext | null = null;
let bgmBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    return null;
  }
  const master = ctx.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(ctx.destination);
  bgmBus = ctx.createGain();
  bgmBus.gain.value = BGM_VOLUME;
  bgmBus.connect(master);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = SFX_VOLUME;
  sfxBus.connect(master);
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

/** 使える状態か（最初のタップのあとで、止まっていない） */
function running(): AudioContext | null {
  return ctx && ctx.state === 'running' ? ctx : null;
}

/** 音の高さ（C5、F#4、Bb3）を周波数に */
function freq(pitch: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(pitch);
  if (!m) return 440;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const semitone = base[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = (Number(m[3]) + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** 1つの音（波の形・高さ・始まる時刻・長さ・音量）。to があれば、その高さへすべらせる */
function tone(
  bus: AudioNode,
  wave: OscillatorType,
  hz: number,
  at: number,
  duration: number,
  volume: number,
  to?: number,
): void {
  const c = ctx!;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(hz, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + duration);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(volume, at + 0.006);
  g.gain.setValueAtTime(volume, at + Math.max(0.006, duration - 0.03));
  g.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(g).connect(bus);
  osc.start(at);
  osc.stop(at + duration + 0.02);
}

/** ノイズ（シャッ・ザッという音）。type と hz でこもり方を変える */
function noise(bus: AudioNode, at: number, duration: number, volume: number, type: BiquadFilterType, hz: number): void {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = hz;
  const g = c.createGain();
  g.gain.setValueAtTime(volume, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  src.connect(filter).connect(g).connect(bus);
  src.start(at);
  src.stop(at + duration + 0.02);
}

function drum(bus: AudioNode, kind: string, at: number, volume: number): void {
  if (kind === 'kick') tone(bus, 'sine', 150, at, 0.12, volume * 3, 45);
  else if (kind === 'snare') noise(bus, at, 0.1, volume * 1.6, 'bandpass', 1800);
  else noise(bus, at, 0.04, volume, 'highpass', 7000);
}

// ---------------------------------------------------------------- BGM の再生

/** 流したい曲（画面が決める）。音が使えるようになったら、これを流す */
let wantedBgm: BgmName | null = null;
let playing: { name: BgmName; gain: GainNode; timer: number; voices: { index: number; time: number }[] } | null = null;
/** BGM を消している理由（読み上げ中・録音中）。1つでもあれば消す */
const holds = new Set<string>();

function stopBgm(): void {
  if (!playing || !ctx) return;
  const { gain, timer } = playing;
  window.clearInterval(timer);
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.25);
  window.setTimeout(() => gain.disconnect(), 400);
  playing = null;
}

function startBgm(name: BgmName): void {
  const c = running();
  if (!c || !bgmBus) return;
  stopBgm();
  const track = TRACKS[name];
  const gain = c.createGain();
  gain.gain.value = holds.size > 0 ? 0 : 1;
  gain.connect(bgmBus);
  const beat = 60 / track.bpm;
  const voices = track.voices.map(() => ({ index: 0, time: c.currentTime + 0.15 }));
  const tick = () => {
    const now = c.currentTime;
    const ahead = now + 0.25;
    track.voices.forEach((v, vi) => {
      const st = voices[vi];
      // 画面を離れていた間の音は、まとめて鳴らさずに飛ばす
      if (st.time < now - 0.1) st.time = now + 0.05;
      while (st.time < ahead) {
        const [pitch, beats] = v.notes[st.index];
        const duration = beats * beat;
        if (pitch) {
          if (v.wave === 'drums') drum(gain, pitch, st.time, v.gain);
          else tone(gain, v.wave, freq(pitch), st.time, duration * (v.length ?? 0.9), v.gain);
        }
        st.time += duration;
        st.index = (st.index + 1) % v.notes.length;
      }
    });
  };
  tick();
  playing = { name, gain, timer: window.setInterval(tick, 60), voices };
}

/** 今の状態（流したい曲・設定・消す理由）に合わせて、BGM を流す・止める */
function refreshBgm(): void {
  if (!wantedBgm || !getBgmOn() || !running()) {
    stopBgm();
    return;
  }
  if (playing?.name !== wantedBgm) startBgm(wantedBgm);
}

/** 画面ごとの BGM を決める（null なら止める） */
export function setBgm(name: BgmName | null): void {
  wantedBgm = name;
  refreshBgm();
}

/** 設定で BGM のオン・オフを変えたあとに呼ぶ */
export function bgmSettingChanged(): void {
  refreshBgm();
}

/** 読み上げ中・録音中は BGM を消す（reason ごとに、on で消して off でもどす） */
export function holdBgm(reason: string, on: boolean): void {
  if (on) holds.add(reason);
  else holds.delete(reason);
  if (!playing || !ctx) return;
  const now = ctx.currentTime;
  const g = playing.gain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(holds.size > 0 ? 0 : 1, now + 0.2);
}

// ---------------------------------------------------------------- 効果音

/** 効果音を鳴らす（設定でオフなら鳴らさない） */
export function playSfx(name: SfxName): void {
  if (!getSfxOn()) return;
  const c = running();
  if (!c || !sfxBus) return;
  const t = c.currentTime + 0.01;
  const bus = sfxBus;
  const seq = (wave: OscillatorType, pitches: string[], step: number, len: number, volume: number) =>
    pitches.forEach((p, i) => tone(bus, wave, freq(p), t + i * step, len, volume));
  switch (name) {
    case 'select':
      tone(bus, 'square', freq('A5'), t, 0.05, 0.08);
      break;
    case 'encounter':
      seq('square', ['E5', 'G5', 'B5', 'E6', 'B5', 'G5', 'E6'], 0.05, 0.06, 0.09);
      noise(bus, t, 0.35, 0.12, 'bandpass', 3000);
      break;
    case 'hit':
      noise(bus, t, 0.14, 0.35, 'highpass', 2500);
      tone(bus, 'square', freq('E6'), t, 0.14, 0.1, freq('E5'));
      break;
    case 'hurt':
      tone(bus, 'square', 260, t, 0.28, 0.13, 70);
      noise(bus, t, 0.2, 0.25, 'lowpass', 900);
      break;
    case 'defeat':
      seq('square', ['G5', 'D5', 'B4', 'G4', 'D4'], 0.06, 0.08, 0.1);
      noise(bus, t + 0.05, 0.45, 0.18, 'lowpass', 1500);
      break;
    case 'win':
      seq('square', ['G4', 'C5', 'E5', 'G5'], 0.09, 0.1, 0.1);
      tone(bus, 'square', freq('E5'), t + 0.4, 0.14, 0.1);
      tone(bus, 'square', freq('G5'), t + 0.55, 0.14, 0.1);
      tone(bus, 'square', freq('C6'), t + 0.7, 0.6, 0.11);
      tone(bus, 'triangle', freq('C4'), t + 0.7, 0.6, 0.2);
      break;
    case 'lose':
      seq('triangle', ['E4', 'D#4', 'D4', 'C#4'], 0.28, 0.32, 0.22);
      break;
    case 'levelup':
      seq('square', ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.07, 0.09, 0.09);
      tone(bus, 'triangle', freq('C6'), t + 0.45, 0.5, 0.12);
      break;
    case 'coin':
      tone(bus, 'triangle', freq('A6'), t, 0.07, 0.18);
      tone(bus, 'triangle', freq('C#7'), t + 0.07, 0.22, 0.16);
      break;
    case 'warp':
      tone(bus, 'sine', 300, t, 0.5, 0.18, 1400);
      tone(bus, 'square', 600, t + 0.05, 0.45, 0.04, 2400);
      break;
  }
}

// ---------------------------------------------------------------- はじめの準備

/** ボタンを押したときの「ピッ」を鳴らさないもの（答え・十字ボタン・聞く・録音は、それぞれの音や読み上げがある） */
const NO_CLICK_SOUND = '.choice, .dpad__button, .command--listen, .command--record, .command--recording, .record-chart';

/**
 * アプリの起動時に1回呼ぶ。画面にさわるたびに音が止まっていれば動かし直し（iPhone は最初のタップまで音を出せない）、
 * ボタンを押したら「ピッ」と鳴らす。アプリを裏にまわしたら止め、もどってきたら動かす。
 */
let installed = false;

export function installAudio(): void {
  if (installed) return;
  installed = true;
  const wake = () => {
    const c = audio();
    if (!c) return;
    if (c.state !== 'running') {
      void c.resume().then(refreshBgm);
      // iPhone：さわった処理の中で一度だけ無音を鳴らすと、音が使えるようになる
      const silent = c.createBufferSource();
      silent.buffer = c.createBuffer(1, 1, 22050);
      silent.connect(c.destination);
      silent.start(0);
    }
  };
  window.addEventListener('pointerdown', wake, true);
  window.addEventListener('keydown', wake, true);
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as Element | null;
      const button = target?.closest('button');
      if (button && !button.disabled && !button.closest(NO_CLICK_SOUND)) playSfx('select');
    },
    true,
  );
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.visibilityState === 'hidden') void ctx.suspend();
    else void ctx.resume().then(refreshBgm);
  });
}
