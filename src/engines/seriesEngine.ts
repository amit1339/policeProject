import type { SeriesQuestion, DifficultyTier } from '../types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface RawSeriesItem {
  seq: number[];
  explanation: string;
}

export const SeriesEngine = {
  validate(seq: number[]): boolean {
    return (
      seq.length >= 7 &&
      seq.every((n) => Number.isInteger(n) && n > 0 && n < 100000) &&
      new Set(seq.slice(0, 6)).size >= 3
    );
  },

  generate(difficulty: DifficultyTier = 'easy'): SeriesQuestion {
    const easy = [
      this.arithmetic,
      this.geometric,
      this.alternatingAdd,
      this.squares,
      this.fibonacci,
    ];
    const medium = [
      ...easy,
      this.increasingDiff,
      this.decreasingArithmetic,
      this.compositeOps,
      this.offsetFibonacci,
    ];
    const hard = [...medium, this.multiTiered, this.interleaved];
    const pool = difficulty === 'hard' ? hard : difficulty === 'medium' ? medium : easy;

    let result: RawSeriesItem | null = null;
    let attempts = 0;
    while (!result && attempts < 40) {
      attempts++;
      try {
        const item = randChoice(pool).call(this);
        if (item && item.seq && this.validate(item.seq)) {
          result = item;
        }
      } catch {
        result = null;
      }
    }

    if (!result) result = this.arithmetic();

    const seq = result.seq;
    const visibleCount = seq.length - 1;
    const visible = seq.slice(0, visibleCount);
    const answer = seq[visibleCount];
    const distractors = this.generateDistractors(answer, seq);
    const options = shuffle([answer, ...distractors]);
    const correctIndex = options.indexOf(answer);

    return {
      visible,
      answer,
      options,
      correctIndex,
      explanation: result.explanation,
    };
  },

  // --- EASY PATTERNS ---
  arithmetic(): RawSeriesItem {
    const d = randInt(2, 15);
    const start = randInt(1, 30);
    return {
      seq: Array.from({ length: 7 }, (_, i) => start + d * i),
      explanation: `כלל: סדרה חשבונית — הוספת ${d} בכל שלב (+${d})`,
    };
  },

  geometric(): RawSeriesItem | null {
    const r = randChoice([2, 3, 4]);
    const start = randChoice([1, 2, 3, 4]);
    const seq = [start];
    for (let i = 1; i < 7; i++) seq.push(seq[i - 1] * r);
    return seq[6] < 80000
      ? {
          seq,
          explanation: `כלל: סדרה הנדסית — הכפלה ב-${r} בכל שלב (×${r})`,
        }
      : null;
  },

  alternatingAdd(): RawSeriesItem {
    const d1 = randInt(1, 8);
    let d2 = randInt(1, 8);
    while (d2 === d1) d2 = randInt(1, 8);
    const start = randInt(1, 20);
    const seq = [start];
    for (let i = 1; i < 7; i++) seq.push(seq[i - 1] + (i % 2 === 1 ? d1 : d2));
    return {
      seq,
      explanation: `כלל: חיבור לסירוגין — הוספת +${d1} ו-+${d2} לסירוגין`,
    };
  },

  squares(): RawSeriesItem {
    const off = randInt(1, 8);
    return {
      seq: Array.from({ length: 7 }, (_, i) => (off + i) ** 2),
      explanation: `כלל: סדרת ריבועים עוקבים — (${off}², ${off + 1}², ${off + 2}²...)`,
    };
  },

  fibonacci(): RawSeriesItem {
    const a = randInt(1, 6);
    const b = randInt(1, 6);
    const seq = [a, b];
    for (let i = 2; i < 7; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return {
      seq,
      explanation: "כלל: סדרת פיבונאצ'י — כל איבר הוא סכום שני המספרים הקודמים לו",
    };
  },

  // --- MEDIUM PATTERNS ---
  increasingDiff(): RawSeriesItem {
    const start = randInt(1, 10);
    const base = randInt(1, 4);
    const seq = [start];
    for (let i = 1; i < 7; i++) seq.push(seq[i - 1] + base * i);
    return {
      seq,
      explanation: `כלל: הפרשים עולים — ההפרש גדל בהדרגה (+${base}, +${base * 2}, +${base * 3}...)`,
    };
  },

  decreasingArithmetic(): RawSeriesItem | null {
    const d = randInt(2, 9);
    const start = d * 8 + randInt(5, 20);
    const seq = Array.from({ length: 7 }, (_, i) => start - d * i);
    return seq[6] > 0
      ? {
          seq,
          explanation: `כלל: סדרה חשבונית יורדת — חיסור ${d} בכל שלב (-${d})`,
        }
      : null;
  },

  compositeOps(): RawSeriesItem | null {
    const m = randChoice([2, 3]);
    const a = randChoice([1, -1, 2, -2, 3, 5]);
    const start = randInt(1, 6);
    const seq = [start];
    for (let i = 1; i < 7; i++) seq.push(seq[i - 1] * m + a);
    return seq.every((n) => n > 0 && n < 80000)
      ? {
          seq,
          explanation: `כלל: פעולה משולבת — כפל ב-${m} ולאחר מכן ${a >= 0 ? '+' : ''}${a}`,
        }
      : null;
  },

  offsetFibonacci(): RawSeriesItem | null {
    const d = randInt(2, 5);
    const start = randInt(1, 5);
    const seq = [start, start + d, start + 2 * d];
    for (let i = 3; i < 7; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return seq.every((n) => n > 0 && n < 100000)
      ? {
          seq,
          explanation: "כלל: פיבונאצ'י מוזז — התחלה חשבונית ולאחריה סכום שני המספרים הקודמים",
        }
      : null;
  },

  // --- HARD PATTERNS ---
  multiTiered(): RawSeriesItem | null {
    const d2 = randChoice([1, 2, 3]);
    const d1Start = randInt(1, 5);
    const start = randInt(1, 10);
    const diffs1 = [d1Start];
    for (let i = 1; i < 6; i++) diffs1.push(diffs1[i - 1] + d2);
    const seq = [start];
    for (let i = 0; i < 6; i++) seq.push(seq[i] + diffs1[i]);
    return seq.every((n) => n > 0 && n < 100000)
      ? {
          seq,
          explanation: `כלל: הפרשים רב-שלביים — הפרשי הדרגה השנייה קבועים (+${d2})`,
        }
      : null;
  },

  interleaved(): RawSeriesItem | null {
    const dA = randInt(2, 8);
    const startA = randInt(1, 15);
    let dB = randInt(2, 8);
    while (dB === dA) dB = randInt(2, 8);
    let startB = randInt(1, 20);
    while (startB === startA) startB = randInt(1, 20);

    const serA = Array.from({ length: 5 }, (_, i) => startA + dA * i);
    const serB = Array.from({ length: 4 }, (_, i) => startB + dB * i);
    const seq: number[] = [];
    for (let i = 0; i < 4; i++) {
      seq.push(serA[i]);
      seq.push(serB[i]);
    }
    seq.push(serA[4]);
    return seq.every((n) => n > 0 && n < 100000)
      ? {
          seq,
          explanation: `כלל: סדרות משולבות — שתי סדרות נפרדות שזורות זו בזו (+${dA} ו-+${dB})`,
        }
      : null;
  },

  generateDistractors(correct: number, sequence: number[]): number[] {
    const dSet = new Set<number>();
    const lastDiff = sequence[sequence.length - 2] - sequence[sequence.length - 3];
    dSet.add(correct + randInt(1, 6));
    dSet.add(correct - randInt(1, 6));
    dSet.add(sequence[sequence.length - 2] + lastDiff + randChoice([-3, -2, -1, 1, 2, 3]));
    dSet.add(sequence[sequence.length - 2] + lastDiff * 2);
    dSet.add(sequence[randInt(2, sequence.length - 2)]);
    if (correct > 10) dSet.add(Math.round(correct / 2));
    dSet.add(correct * 2);
    dSet.add(correct + lastDiff);

    dSet.delete(correct);
    const seqSet = new Set(sequence);
    let arr = [...dSet].filter((n) => n > 0 && Number.isInteger(n) && !seqSet.has(n));
    arr = [...new Set(arr)];
    arr = shuffle(arr);

    while (arr.length < 4) {
      const v = correct + randInt(-25, 25);
      if (v > 0 && v !== correct && !arr.includes(v) && !seqSet.has(v)) {
        arr.push(v);
      }
    }
    return arr.slice(0, 4);
  },
};
