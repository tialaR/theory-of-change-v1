export function parseBiteNumber(value) {
  const match = /^SO-(\d{3})\b/.exec(value || '');
  return match ? Number(match[1]) : null;
}

export function assertRegisteredProgression({ state, ledger, minimumBite, completedBites = [] }) {
  const activeNumber = parseBiteNumber(state.activeBite);
  if (activeNumber === null || activeNumber < minimumBite) return false;

  const activeId = `SO-${String(activeNumber).padStart(3, '0')}`;
  const activeEntry = ledger.bites.find((item) => item.id === activeId);
  if (!activeEntry) return false;
  if (!['ACTIVE', 'COMPLETE'].includes(state.activeBiteStatus)) return false;
  if (activeEntry.status !== state.activeBiteStatus) return false;
  if (!state.lastBite?.startsWith(`${activeId} |`)) return false;

  for (const biteId of completedBites) {
    const entry = ledger.bites.find((item) => item.id === biteId);
    if (!entry || entry.status !== 'COMPLETE' || !entry.completedAt) return false;
  }

  for (let number = minimumBite; number < activeNumber; number += 1) {
    const biteId = `SO-${String(number).padStart(3, '0')}`;
    const entry = ledger.bites.find((item) => item.id === biteId);
    if (!entry || entry.status !== 'COMPLETE' || !entry.completedAt) return false;
  }

  return true;
}
