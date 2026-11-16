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
