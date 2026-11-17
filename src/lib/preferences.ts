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
