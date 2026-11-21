/**
 * 端末ごとの好み（十字ボタンの位置など）。記録ではないので、データベースではなくブラウザに覚えておく。
 * ブラウザが覚えられないとき（プライベートブラウズなど）は、決まった値で動く。
 */

export type DpadSide = 'left' | 'right';

const DPAD_SIDE_KEY = 'english-quest:dpad-side';

/** 十字のボタンをマップの左右どちらに出すか（決めていなければ右） */
export function getDpadSide(): DpadSide {
  try {
    return localStorage.getItem(DPAD_SIDE_KEY) === 'left' ? 'left' : 'right';
  } catch {
    return 'right';
  }
}

export function setDpadSide(side: DpadSide): void {
  try {
    localStorage.setItem(DPAD_SIDE_KEY, side);
  } catch {
    // 覚えられなくても、この画面の間は選んだ側で動く
  }
}

const NO_ENCOUNTERS_KEY = 'english-quest:no-encounters';

/** デバッグ用：街の外のマップでモンスターに出会わないようにするか（管理者の設定にだけ出す。決めていなければ出会う） */
export function getNoEncounters(): boolean {
  try {
    return localStorage.getItem(NO_ENCOUNTERS_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setNoEncounters(on: boolean): void {
  try {
    if (on) localStorage.setItem(NO_ENCOUNTERS_KEY, 'on');
    else localStorage.removeItem(NO_ENCOUNTERS_KEY);
  } catch {
    // 覚えられなくても、この画面の間は選んだとおりに動く
  }
}

const WORLD_MAP_DEBUG_KEY = 'english-quest:world-map-debug';

/** デバッグ用：3つ目の街に着く前でも、旅の地図を使えるようにするか（管理者の設定にだけ出す） */
export function getWorldMapDebug(): boolean {
  try {
    return localStorage.getItem(WORLD_MAP_DEBUG_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setWorldMapDebug(on: boolean): void {
  try {
    if (on) localStorage.setItem(WORLD_MAP_DEBUG_KEY, 'on');
    else localStorage.removeItem(WORLD_MAP_DEBUG_KEY);
  } catch {
    // 覚えられなくても、この画面の間は選んだとおりに動く
  }
}

const BGM_KEY = 'english-quest:bgm';
const SFX_KEY = 'english-quest:sfx';

/** BGM を流すか（決めていなければ流す） */
export function getBgmOn(): boolean {
  try {
    return localStorage.getItem(BGM_KEY) !== 'off';
  } catch {
    return bgmFallback;
  }
}

export function setBgmOn(on: boolean): void {
  try {
    if (on) localStorage.removeItem(BGM_KEY);
    else localStorage.setItem(BGM_KEY, 'off');
  } catch {
    // 覚えられなくても、アプリを開いている間は選んだとおりに動く（下の値を使う）
  }
  bgmFallback = on;
}

/** 効果音を鳴らすか（決めていなければ鳴らす） */
export function getSfxOn(): boolean {
  try {
    return localStorage.getItem(SFX_KEY) !== 'off';
  } catch {
    return sfxFallback;
  }
}

export function setSfxOn(on: boolean): void {
  try {
    if (on) localStorage.removeItem(SFX_KEY);
    else localStorage.setItem(SFX_KEY, 'off');
  } catch {
    // 覚えられなくても、アプリを開いている間は選んだとおりに動く
  }
  sfxFallback = on;
}

/** ブラウザが覚えられないときに使う、今回の値 */
let bgmFallback = true;
let sfxFallback = true;
