function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SeededRandom {
  private random: () => number;

  constructor(seedInput: string) {
    this.random = mulberry32(hashString(seedInput));
  }

  next(): number {
    return this.random();
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(items: T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  dateBetween(start: string, end: string): string {
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const lo = Math.min(startMs, endMs);
    const hi = Math.max(startMs, endMs);
    const ms = lo + this.next() * Math.max(hi - lo, 0);
    return new Date(ms).toISOString();
  }
}
