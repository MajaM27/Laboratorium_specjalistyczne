// Kolory kafelka zwierzęcia – zależne od id, żeby były stałe między widokami
const palette = [
  ['#dceae0', '#285f4e'],
  ['#ede5d6', '#876a35'],
  ['#e2e8d9', '#4f6b3a'],
  ['#e4eeee', '#4c7474'],
  ['#efe1dc', '#8a5444'],
];

export function petColors(id) {
  return palette[(Number(id) || 0) % palette.length];
}
