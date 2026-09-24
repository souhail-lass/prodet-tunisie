import { describe, expect, it } from 'vitest';
import { wrapLoopScroll } from './marquee-scroll';

describe('wrapLoopScroll', () => {
  it('keeps position inside [0, half)', () => {
    expect(wrapLoopScroll(100, 400)).toBe(100);
    expect(wrapLoopScroll(400, 400)).toBe(0);
    expect(wrapLoopScroll(450, 400)).toBe(50);
    expect(wrapLoopScroll(-20, 400)).toBe(380);
  });

  it('is a no-op when half is not ready yet', () => {
    expect(wrapLoopScroll(0, 0)).toBe(0);
    expect(wrapLoopScroll(12, -1)).toBe(12);
  });
});
