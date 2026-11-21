/**
 * 会話のリスニング（3つ目の街から。2026-11-21）：audio_text を「A: …」「B: …」のように1行ずつ書くと、
 * 話す人ごとに声を変えて、順に読み上げる（話す人の名前は読まない）。2行以上で、どの行も「名前: 英文」のときだけ会話とみなす。
 */
const DIALOGUE_LINE = /^([A-Za-z][A-Za-z .']{0,20}):\s*(.+)$/;

export function dialogueLines(text: string): { speaker: string; text: string }[] | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  const parsed = lines.map((l) => l.match(DIALOGUE_LINE));
  if (parsed.some((m) => !m)) return null;
  return parsed.map((m) => ({ speaker: m![1].trim(), text: m![2].trim() }));
}
