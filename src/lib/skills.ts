/** 6つの能力値。並びは六角形の頂点の順 */
export const SKILLS = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'speaking',
  'writing',
] as const;

export type Skill = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<Skill, string> = {
  vocabulary: '語彙',
  grammar: '文法',
  listening: 'リスニング',
  reading: 'リーディング',
  speaking: 'スピーキング',
  writing: 'ライティング',
};
