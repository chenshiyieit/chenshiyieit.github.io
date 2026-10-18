/**
 * @param {{ data: { order: number, last?: boolean } }} a
 * @param {{ data: { order: number, last?: boolean } }} b
 */
export function comparePeople(a, b) {
  return Number(a.data.last ?? false) - Number(b.data.last ?? false) || a.data.order - b.data.order;
}
