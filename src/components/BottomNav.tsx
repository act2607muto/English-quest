/**
 * 画面の下に固定する行き先のボタン（街・スキルダンジョン・ステータス・図鑑・工房の画面に出す）。
 * いま開いている画面のボタンは金色にする。アイコンは public/ui/icon-*.png。
 */
export type NavTab = 'map' | 'dungeon' | 'status' | 'bestiary' | 'shop';

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'map', label: '街の外へ', icon: 'map' },
  { id: 'dungeon', label: 'ダンジョン', icon: 'dungeon' },
  { id: 'status', label: 'ステータス', icon: 'status' },
  { id: 'bestiary', label: '図鑑', icon: 'book' },
  { id: 'shop', label: '工房', icon: 'workshop' },
];

export function BottomNav({ active, onSelect }: { active: NavTab | null; onSelect: (tab: NavTab) => void }) {
  return (
    <nav className="town-tabbar" aria-label="行き先">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`town-tabbar__button${active === t.id ? ' town-tabbar__button--on' : ''}`}
          type="button"
          onClick={() => onSelect(t.id)}
          aria-label={t.label}
          aria-current={active === t.id ? 'page' : undefined}
        >
          <img src={`/ui/icon-${t.icon}.png`} alt="" width={40} height={40} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
