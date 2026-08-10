import { QuickShortcutsCard } from '../../quick-shortcuts-card';

export function SidebarShortcutsPanel({ canRestoreTheory, onRestoreTheory }: { canRestoreTheory: boolean; onRestoreTheory: () => void }) {
  return <QuickShortcutsCard canRestoreTheory={canRestoreTheory} onRestoreTheory={onRestoreTheory} />;
}
