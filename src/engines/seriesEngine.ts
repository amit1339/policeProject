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

  generate(difficulty: DifficultyTier = 'easy', advancedPoliceOnly: boolean = false): SeriesQuestion {
    if (advancedPoliceOnly) {
      return Math.random() > 0.5
        ? this.interleavedMiddleMissing()
        : this.compoundVariableOps();
    }

    // In 'hard' tier, give a 45% chance to feature these advanced police patterns:
    if (difficulty === 'hard' && Math.random() < 0.45) {
      return Math.random() > 0.5
        ? this.interleavedMiddleMissing()
        : this.compoundVariableOps();
    }

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
      items: [...visible, null],
      missingIndex: visibleCount,
      answer,
      options,
      correctIndex,
      explanation: result.explanation,
      patternType: 'standard',
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

  // --- POLICE EXAM ADVANCED PATTERNS (NEW) ---

  // Pattern 1: Interleaved Series with missing number in the middle (Police Exam Example 1)
  interleavedMiddleMissing(): SeriesQuestion {
    const ruleType = randChoice(['inc_diff', 'inc_diff', 'dec_diff', 'alternating']);
    let diffs: number[] = [];
    let ruleDesc = '';

    if (ruleType === 'inc_diff') {
      const d0 = randChoice([2, 3, 4, 5]);
      const step = randChoice([1, 2, 3]);
      diffs = [d0, d0 + step, d0 + step * 2]; // e.g., +4, +6, +8
      ruleDesc = `ההפרש גדל ב-${step} בכל פעם (+${diffs.join(', +')})`;
    } else if (ruleType === 'dec_diff') {
      const d0 = randChoice([8, 10, 12]);
      const step = randChoice([1, 2]);
      diffs = [-d0, -(d0 - step), -(d0 - step * 2)];
      ruleDesc = `ההפרש קטן בהדרגה (${diffs.join(', ')})`;
    } else {
      const d1 = randChoice([3, 4, 5, 6]);
      const d2 = randChoice([1, 2, 7]);
      diffs = [d1, d2, d1];
      ruleDesc = `הפרשים חוזרים לסירוגין (+${d1}, +${d2}, +${d1})`;
    }

    let startA = randInt(12, 35);
    let startB = randInt(10, 35);
    while (Math.abs(startA - startB) < 3) {
      startB = randInt(10, 35);
    }

    const serA = [startA];
    for (let i = 0; i < 3; i++) {
      serA.push(serA[i] + diffs[i]);
    }

    const serB = [startB];
    for (let i = 0; i < 3; i++) {
      serB.push(serB[i] + diffs[i]);
    }

    // Interleave: [a0, b0, a1, b1, a2, b2, a3, b3]
    const fullSeq = [
      serA[0], serB[0],
      serA[1], serB[1],
      serA[2], serB[2],
      serA[3], serB[3],
    ];

    // Missing is in the middle (5th element, index 4):
    const missingIndex = 4;
    const answer = serA[2];

    const items: (number | null)[] = [...fullSeq];
    items[missingIndex] = null;
    const visible = fullSeq.filter((_, idx) => idx !== missingIndex);

    const dSet = new Set<number>();
    // High-yield test-taker distractors:
    dSet.add(serA[1] + diffs[0]); // applied previous diff
    dSet.add(serA[1] + diffs[2]); // applied next diff
    dSet.add(serB[2]); // corresponding element from parallel series
    dSet.add(serA[1] + (diffs[1] + 2));
    dSet.add(serA[1] + (diffs[1] - 2));
    dSet.delete(answer);

    const baseDist = this.generateDistractors(answer, fullSeq);
    for (const d of baseDist) dSet.add(d);
    dSet.delete(answer);

    let distArr = [...dSet].filter((n) => n > 0 && Number.isInteger(n) && !fullSeq.includes(n));
    distArr = shuffle(distArr).slice(0, 4);

    while (distArr.length < 4) {
      const v = answer + randChoice([-10, 10, -5, 5, -8, 8, -12, 12]);
      if (v > 0 && v !== answer && !distArr.includes(v) && !fullSeq.includes(v)) {
        distArr.push(v);
      }
    }

    const options = shuffle([answer, ...distArr]);
    const correctIndex = options.indexOf(answer);

    const sign1 = diffs[0] >= 0 ? `+${diffs[0]}` : `${diffs[0]}`;
    const sign2 = diffs[1] >= 0 ? `+${diffs[1]}` : `${diffs[1]}`;
    const sign3 = diffs[2] >= 0 ? `+${diffs[2]}` : `${diffs[2]}`;

    const explanation = `שתי סדרות שזורות עם נעלם באמצע (מבחן המשטרה):
הסדרה מורכבת משתי תת-סדרות נפרדות השזורות זו בזו:
• סדרה א' (במקומות הזוגיים: ${serB[0]}, ${serB[1]}, ${serB[2]}, ${serB[3]} — סדרה מלאה):
  ${serB[0]} ⟶ ${serB[1]} (${sign1}), ${serB[1]} ⟶ ${serB[2]} (${sign2}), ${serB[2]} ⟶ ${serB[3]} (${sign3})
  החוקיות המשותפת הנלמדת: ${ruleDesc}.
• סדרה ב' (במקומות האי-זוגיים: ${serA[0]}, ${serA[1]}, [___], ${serA[3]}):
  מיישמים את אותה החוקיות על האיבר הקודם בסדרה (${serA[1]}):
  ${serA[1]} ${sign2} = ${answer}
  (בדיקה מול האיבר העוקב: ${answer} ${sign3} = ${serA[3]}).`;

    return {
      visible,
      items,
      missingIndex,
      answer,
      options,
      correctIndex,
      explanation,
      patternType: 'interleaved_middle',
    };
  },

  // Pattern 2: Two Operations Changing Together (Police Exam Example 2)
  compoundVariableOps(): SeriesQuestion {
    const patternStyle = randChoice(['mult_inc_add_const', 'mult_inc_sub_const', 'mult_const_add_inc']);
    let seq: number[] = [];
    let stepsDesc: string[] = [];
    let answer = 0;

    if (patternStyle === 'mult_inc_add_const') {
      const start = randChoice([2, 3, 4]);
      const kStart = randChoice([2, 3]);
      const c = randChoice([1, 2]);

      seq = [start];
      stepsDesc = [];
      for (let i = 0; i < 4; i++) {
        const k = kStart + i;
        stepsDesc.push(`(×${k} + ${c})`);
        const nextVal = seq[i] * k + c;
        if (i < 3) {
          seq.push(nextVal);
        } else {
          answer = nextVal;
        }
      }
    } else if (patternStyle === 'mult_inc_sub_const') {
      const start = randChoice([3, 4, 5]);
      const kStart = 2;
      const c = randChoice([1, 2]);

      seq = [start];
      stepsDesc = [];
      for (let i = 0; i < 4; i++) {
        const k = kStart + i;
        stepsDesc.push(`(×${k} - ${c})`);
        const nextVal = seq[i] * k - c;
        if (i < 3) {
          seq.push(nextVal);
        } else {
          answer = nextVal;
        }
      }
    } else {
      // mult_const_add_inc
      const start = randChoice([2, 3, 4, 5]);
      const mult = randChoice([2, 3]);
      const addStart = randChoice([1, 2]);

      seq = [start];
      stepsDesc = [];
      for (let i = 0; i < 4; i++) {
        const adder = addStart + i;
        stepsDesc.push(`(×${mult} + ${adder})`);
        const nextVal = seq[i] * mult + adder;
        if (i < 3) {
          seq.push(nextVal);
        } else {
          answer = nextVal;
        }
      }
    }

    const items: (number | null)[] = [...seq, null];
    const missingIndex = seq.length;
    const visible = [...seq];

    const lastNum = seq[seq.length - 1];
    const dSet = new Set<number>();
    dSet.add(answer - 1);
    dSet.add(answer + 1);
    dSet.add(Math.round(answer * 0.8));
    dSet.add(Math.round(answer * 1.2));
    dSet.add(lastNum * 2);
    dSet.add(lastNum * 5);
    dSet.delete(answer);

    const baseDist = this.generateDistractors(answer, [...seq, answer]);
    for (const d of baseDist) dSet.add(d);
    dSet.delete(answer);

    let distArr = [...dSet].filter((n) => n > 0 && Number.isInteger(n) && !seq.includes(n));
    distArr = shuffle(distArr).slice(0, 4);

    while (distArr.length < 4) {
      const v = answer + randChoice([-15, 15, -30, 30, -50, 50, -100, 100]);
      if (v > 0 && v !== answer && !distArr.includes(v) && !seq.includes(v)) {
        distArr.push(v);
      }
    }

    const options = shuffle([answer, ...distArr]);
    const correctIndex = options.indexOf(answer);

    const explanation = `שתי פעולות משתנות ביחד (מבחן המשטרה):
חוקיות הפעולות לאורך הסדרה: ${stepsDesc.join(', ')}
• שלב 1: ${seq[0]} ⟶ ${seq[1]} לפי ${stepsDesc[0]}
• שלב 2: ${seq[1]} ⟶ ${seq[2]} לפי ${stepsDesc[1]}
• שלב 3: ${seq[2]} ⟶ ${seq[3]} לפי ${stepsDesc[2]}
• שלב 4 (האיבר החסר): מפעילים את הפעולה הבאה ${stepsDesc[3]} על ${seq[3]}:
  התוצאה: ${answer}`;

    return {
      visible,
      items,
      missingIndex,
      answer,
      options,
      correctIndex,
      explanation,
      patternType: 'compound_variable_ops',
    };
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
