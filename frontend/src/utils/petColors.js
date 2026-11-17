// Kolory kafelka zwierzęcia – zależne od id, żeby były stałe między widokami.
// Wartości są zmiennymi CSS (--pet-N-bg / --pet-N-fg w index.css), więc działają w obu motywach.
const PALETTE_SIZE = 5;

export function petColors(id) {
  const index = (Number(id) || 0) % PALETTE_SIZE;
  return [`var(--pet-${index}-bg)`, `var(--pet-${index}-fg)`];
}
