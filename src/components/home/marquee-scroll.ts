/** Keep scrollLeft inside the first copy of a duplicated marquee track. */
export function wrapLoopScroll(scrollLeft: number, half: number): number {
  if (half <= 0) return scrollLeft;
  let x = scrollLeft;
  while (x < 0) x += half;
  while (x >= half) x -= half;
  return x;
}
