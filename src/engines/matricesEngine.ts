import type {
  ShapeConfig,
  ShapeType,
  FillType,
  MatrixQuestion,
  DifficultyTier,
} from '../types';
import { COMPOUND_KEYS } from '../components/ShapeRenderer';

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

const ALL_SHAPES: ShapeType[] = [
  'circle',
  'square',
  'diamond',
  'cross',
  'x_cross',
  'trapezoid',
  'triangle',
  'hexagon',
];

const ALL_FILLS: FillType[] = [
  'outline',
  'decorated',
  'filled',
  'crosshatch',
  'hatch',
];

const COLORS = ['#c8d6e5', '#ff6b6b', '#2ecc71', '#f1c40f', '#3498db'];

export const MatricesEngine = {
  pickShapes(n: number): ShapeType[] {
    return shuffle(ALL_SHAPES.filter((s) => s !== 'x_cross' && s !== 'trapezoid')).slice(0, n);
  },

  configKey(o: ShapeConfig | null | undefined): string {
    if (!o) return 'null';
    if (o.type === 'compound' && o.elements) {
      return 'C:' + [...new Set(o.elements)].sort().join(',');
    }

    const shape = o.shape || '';
    // VISUAL NORMALIZATION:
    // 1. For x_cross: SVG renderer draws only 2 stroke lines. 'fill' has zero visual effect.
    // 2. For concentric: SVG renderer draws concentric circles. 'fill' has zero visual effect.
    let fill: string = o.fill || 'outline';
    if (shape === 'x_cross' || shape === 'concentric') {
      fill = 'none';
    }

    const size = o.size || 'medium';
    const rotation = o.rotation || 0;
    const lineCount = o.lineCount || 0;
    const dotCount = o.dotCount || 0;
    const color = o.color || '';
    const lineStyle = o.lineStyle || 'solid';
    const ringCount = o.ringCount || 0;
    const outerThick = o.outerThick ? 'OT' : 'OF';
    const marker = o.marker ? 'M' : '';
    const doubleContour = o.doubleContour || o.fill === 'double' ? 'D' : '';

    return [
      shape,
      fill,
      size,
      doubleContour,
      rotation,
      lineCount,
      dotCount,
      color,
      lineStyle,
      ringCount,
      outerThick,
      marker,
    ].join('|');
  },

  buildResult(
    grid: (ShapeConfig | null)[][],
    answer: ShapeConfig,
    distractors: ShapeConfig[],
    explanation: string,
    layout: '3x3' | '3x2' = '3x3',
    promptSubtitle?: string
  ): MatrixQuestion {
    const ak = this.configKey(answer);
    const seen = new Set<string>([ak]);
    const unique: ShapeConfig[] = [];

    for (const d of distractors) {
      const k = this.configKey(d);
      if (!seen.has(k)) {
        seen.add(k);
        unique.push({ ...d, hasBox: answer.hasBox });
      }
    }

    let fbAttempts = 0;
    const pool = ALL_SHAPES.filter((s) => s !== 'x_cross');
    while (unique.length < 4 && fbAttempts < 60) {
      fbAttempts++;
      const fb: ShapeConfig = { ...answer };
      if (fb.type === 'compound') {
        const cPool = shuffle([...COMPOUND_KEYS]);
        fb.elements = cPool.slice(0, randInt(1, 4));
      } else if (fb.shape === 'concentric') {
        fb.ringCount = randChoice([1, 2, 4, 5]);
      } else {
        fb.shape = randChoice(pool);
        fb.fill = randChoice(ALL_FILLS);
        if (fb.dotCount !== undefined) fb.dotCount = randInt(1, 6);
        if (fb.rotation !== undefined) fb.rotation = randChoice([0, 90, 180, 270]);
      }
      fb.hasBox = answer.hasBox;
      const k = this.configKey(fb);
      if (!seen.has(k)) {
        seen.add(k);
        unique.push(fb);
      }
    }

    const options = shuffle([answer, ...unique.slice(0, 4)]);
    const answerKey = this.configKey(answer);
    const correctIndex = options.findIndex((o) => this.configKey(o) === answerKey);

    return {
      grid,
      layout,
      answer,
      options,
      correctIndex,
      explanation,
      promptSubtitle,
    };
  },

  // ============ POLICE SIMULATION TEST INSPIRED PATTERNS ============

  // Question 1: 3x2 Shape Analogy Matrix
  analogyFillPattern(): MatrixQuestion {
    const pool: ShapeType[] = ['diamond', 'circle', 'cross', 'square', 'hexagon', 'triangle'];
    const shapes = shuffle(pool).slice(0, 3);
    const invert = Math.random() > 0.5;
    const fillCol1: FillType = invert ? 'outline' : 'filled';
    const fillCol2: FillType = invert ? 'filled' : 'outline';

    const grid: (ShapeConfig | null)[][] = [];
    for (let r = 0; r < 3; r++) {
      grid.push([
        { shape: shapes[r], fill: fillCol1, size: 'medium' },
        r === 2 ? null : { shape: shapes[r], fill: fillCol2, size: 'medium' },
      ]);
    }

    const answer: ShapeConfig = { shape: shapes[2], fill: fillCol2, size: 'medium' };
    const unused = ALL_SHAPES.filter((s) => !shapes.includes(s));
    const dist: ShapeConfig[] = [
      { shape: shapes[2], fill: fillCol1, size: 'medium' }, // Shape 3 unmodified (Solid diamond)
      { shape: shapes[1], fill: fillCol2, size: 'medium' }, // Shape 2 target fill (Hollow cross)
      { shape: shapes[1], fill: fillCol1, size: 'medium' }, // Shape 2 source fill (Solid cross)
      { shape: shapes[0], fill: fillCol1, size: 'medium' }, // Shape 1 source fill (Solid circle)
      { shape: randChoice(unused), fill: fillCol2, size: 'medium' }, // Foreign shape (Hollow square)
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      `כלל: אנלוגיה צורנית (3×2) — מעבר מוגדר מצורה ב${fillCol1 === 'filled' ? 'מילוי מלא' : 'קו מתאר'} לצורת ${fillCol2 === 'filled' ? 'מילוי מלא' : 'קו מתאר'} זהה`,
      '3x2',
      'אנלוגיה צורנית (3×2) — השלימו את הזוג'
    );
  },

  // Question 2: Concentric Rings Progression (1 -> 2 -> 3)
  concentricProgressionPattern(): MatrixQuestion {
    const outerThick = true;
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        const ringCount = c + 1;
        if (r === 2 && c === 2) {
          row.push(null);
        } else {
          row.push({
            shape: 'concentric',
            ringCount,
            outerThick,
            size: 'medium',
          });
        }
      }
      grid.push(row);
    }

    const answer: ShapeConfig = { shape: 'concentric', ringCount: 3, outerThick, size: 'medium' };
    const dist: ShapeConfig[] = [
      { shape: 'concentric', ringCount: 4, outerThick, size: 'medium' }, // 4 rings (+1 overshoot distractor)
      { shape: 'concentric', ringCount: 2, outerThick, size: 'medium' }, // 2 rings (column 2 repeat)
      { shape: 'concentric', ringCount: 1, outerThick, size: 'medium' }, // 1 ring (column 1 repeat)
      { shape: 'concentric', ringCount: 3, outerThick: false, size: 'medium' }, // 3 rings with uniform thin line
      { shape: 'circle', fill: 'filled', size: 'medium' },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: טבעות קונצנטריות — מספר הטבעות גדל בהדרגה מ-1 ל-2 ול-3 עם הדגשת הטבעת החיצונית',
      '3x3',
      'מטריצה 3×3 — ספירת מעגלים קונצנטריים'
    );
  },

  // Question 3: Column Invariance / Identity
  columnInvariancePattern(): MatrixQuestion {
    const pool: ShapeType[] = ['circle', 'hexagon', 'diamond', 'square', 'triangle'];
    const chosen = shuffle(pool).slice(0, 2);
    const colShapes: ShapeType[] = [chosen[0], chosen[1], 'x_cross'];
    const fills: FillType[] = [randChoice(['filled', 'crosshatch']), 'outline', 'outline'];

    const grid: (ShapeConfig | null)[][] = [];
    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        if (r === 2 && c === 2) {
          row.push(null);
        } else {
          row.push({
            shape: colShapes[c],
            fill: fills[c],
            size: 'medium',
          });
        }
      }
      grid.push(row);
    }

    const answer: ShapeConfig = { shape: colShapes[2], fill: fills[2], size: 'medium' };
    const unused = shuffle(ALL_SHAPES.filter((s) => !colShapes.includes(s) && s !== 'x_cross'));
    const dist: ShapeConfig[] = [
      { shape: colShapes[1], fill: fills[1], size: 'medium' }, // Shape from middle column
      { shape: colShapes[0], fill: fills[0], size: 'medium' }, // Shape from first column
      { shape: unused[0], fill: 'outline', size: 'medium' },   // Neutral shape 1
      { shape: 'cross', fill: 'outline', size: 'medium' },     // Plus cross '+' distractor vs diagonal 'X'
      { shape: unused[1], fill: 'filled', size: 'medium' },    // Neutral shape 2
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: קביעות עמודות — כל הצורות באותה עמודה זהות לחלוטין בכל השורות',
      '3x3',
      'מטריצה 3×3 — עקביות עמודות'
    );
  },

  // Question 4: Dual-Attribute Matrix (Texture Rows x Size Columns)
  dualAttributeMatrixPattern(): MatrixQuestion {
    const baseShape: ShapeType = randChoice(['trapezoid', 'triangle', 'square', 'circle']);
    const rowFills: FillType[] = ['outline', 'filled', 'crosshatch'];
    const colSizes = ['large', 'small', 'large'] as const;

    const grid: (ShapeConfig | null)[][] = [];
    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        if (r === 2 && c === 2) {
          row.push(null);
        } else {
          row.push({
            shape: baseShape,
            fill: rowFills[r],
            size: colSizes[c],
          });
        }
      }
      grid.push(row);
    }

    const answer: ShapeConfig = { shape: baseShape, fill: 'crosshatch', size: 'large' };
    const dist: ShapeConfig[] = [
      { shape: baseShape, fill: 'crosshatch', size: 'xlarge' }, // Extra-large distractor (Ans 1 in Police Q4)
      { shape: baseShape, fill: 'crosshatch', size: 'small' }, // Small distractor (Ans 6 in Police Q4)
      { shape: baseShape, fill: 'outline', size: 'large' }, // Large hollow (Ans 2 in Police Q4)
      { shape: baseShape, fill: 'filled', size: 'large' }, // Large solid (Ans 3 in Police Q4)
      { shape: baseShape, fill: 'outline', size: 'small' }, // Small hollow (Ans 5 in Police Q4)
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: שילוב תכונות דו-ממדי — השורות מכתיבות סוג מילוי (קו מתאר ← מלא ← רשת), והעמודות מכתיבות גודל (גדול ← קטן ← גדול)',
      '3x3',
      'מטריצה 3×3 — שילוב מילוי וגודל'
    );
  },

  // Question 5 (Police Test): Contour -> Internal Division -> Solid Fill
  contourDivisionSolidPattern(): MatrixQuestion {
    // 3 distinct shapes (Circle, Diamond, Square as in Police Exam)
    // Row 1: circle outline -> circle decorated (cross) -> circle filled
    // Row 2: diamond outline -> diamond decorated (crossed diagonals) -> diamond filled
    // Row 3: square double contour -> square decorated (4 quadrants) -> ? (square filled!)
    const grid: (ShapeConfig | null)[][] = [
      [
        { shape: 'circle', fill: 'outline', size: 'medium', hasBox: true },
        { shape: 'circle', fill: 'decorated', size: 'medium', hasBox: true },
        { shape: 'circle', fill: 'filled', size: 'medium', hasBox: true },
      ],
      [
        { shape: 'diamond', fill: 'outline', size: 'medium', hasBox: true },
        { shape: 'diamond', fill: 'decorated', size: 'medium', hasBox: true },
        { shape: 'diamond', fill: 'filled', size: 'medium', hasBox: true },
      ],
      [
        { shape: 'square', fill: 'double', size: 'medium', hasBox: true },
        { shape: 'square', fill: 'decorated', size: 'medium', hasBox: true },
        null,
      ],
    ];

    const answer: ShapeConfig = { shape: 'square', fill: 'filled', size: 'medium', hasBox: true };
    const dist: ShapeConfig[] = [
      { shape: 'circle', fill: 'outline', size: 'medium', hasBox: true },      // Ans 1 in Police Image 2
      { shape: 'diamond', fill: 'filled', size: 'medium', hasBox: true },     // Ans 2 in Police Image 2
      { shape: 'diamond', fill: 'decorated', size: 'medium', hasBox: true },  // Ans 4 in Police Image 2
      { shape: 'square', fill: 'double', size: 'medium', hasBox: true },      // Ans 5 in Police Image 2
      { shape: 'square', fill: 'decorated', size: 'medium', hasBox: true },   // Ans 6 in Police Image 2
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: התקדמות תלת-שלבית (מבחן המשטרה) — בכל שורה מופיעה אותה צורה בשלושה שלבים קבועים: מתווה קו (פשוט או כפול) ← חלוקה פנימית (צלב או אלכסונים) ← צורה מלאה בצבע כהה. בשורה השלישית התשובה החסרה היא ריבוע מלא בצבע כהה.',
      '3x3',
      'מטריצה 3×3 — מתווה ← חלוקה ← צורה מלאה'
    );
  },

  // ============ CLASSIC MATRICES PATTERNS ============

  shapeFillPattern(): MatrixQuestion {
    const shapes = this.pickShapes(3);
    const fills: FillType[] = ['outline', 'decorated', 'filled'];
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({ shape: shapes[r], fill: fills[c], size: 'medium', hasBox: false });
      }
      grid.push(row);
    }

    const answer = { ...grid[2][2]! };
    grid[2][2] = null;
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const otherF = fills.filter((f) => f !== answer.fill);

    const dist: ShapeConfig[] = [
      { ...answer, fill: otherF[0] },
      { ...answer, fill: otherF[1] },
      { ...answer, shape: otherS[0] },
      { ...answer, shape: otherS[1], fill: otherF[0] },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: שורות בעלות אותה צורה, עמודות מתקדמות בסוג המילוי (קו מתאר ← מעוטר ← מלא)'
    );
  },

  fillShapePattern(): MatrixQuestion {
    const shapes = this.pickShapes(3);
    const fills: FillType[] = ['outline', 'decorated', 'filled'];
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({ shape: shapes[c], fill: fills[r], size: 'medium', hasBox: false });
      }
      grid.push(row);
    }

    const answer = { ...grid[2][2]! };
    grid[2][2] = null;
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const otherF = fills.filter((f) => f !== answer.fill);

    const dist: ShapeConfig[] = [
      { ...answer, shape: otherS[0] },
      { ...answer, shape: otherS[1] },
      { ...answer, fill: otherF[0] },
      { ...answer, shape: otherS[0], fill: otherF[0] },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: שורות בעלות אותו סוג מילוי, עמודות מחליפות סוגי צורות'
    );
  },

  sizePattern(): MatrixQuestion {
    const shapes = this.pickShapes(3);
    const sizes = ['small', 'medium', 'large'] as const;
    const fillType = randChoice<FillType>(['outline', 'filled']);
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({ shape: shapes[r], fill: fillType, size: sizes[c], hasBox: false });
      }
      grid.push(row);
    }

    const answer = { ...grid[2][2]! };
    grid[2][2] = null;
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const otherSz = sizes.filter((s) => s !== answer.size);

    const dist: ShapeConfig[] = [
      { ...answer, size: otherSz[0] },
      { ...answer, size: otherSz[1] },
      { ...answer, shape: otherS[0] },
      { ...answer, shape: otherS[1], size: otherSz[0] },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: שורות בעלות אותה צורה, עמודות משנות גודל (קטן ← בינוני ← גדול)'
    );
  },

  rotationPattern(): MatrixQuestion {
    const shapes = this.pickShapes(3);
    const rotations = [0, 90, 180];
    const fillType = randChoice<FillType>(['outline', 'filled']);
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({
          shape: shapes[r],
          fill: fillType,
          size: 'medium',
          rotation: rotations[c],
          marker: true,
          hasBox: false,
        });
      }
      grid.push(row);
    }

    const answer = { ...grid[2][2]! };
    grid[2][2] = null;
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const otherR = [0, 90, 180, 270].filter((r) => r !== answer.rotation);

    const dist: ShapeConfig[] = [
      { ...answer, rotation: otherR[0] },
      { ...answer, rotation: otherR[1] },
      { ...answer, shape: otherS[0] },
      { ...answer, shape: otherS[1], rotation: otherR[0] },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: סיבוב — הצורות מסתובבות ב-90° עם כיוון השעון לאורך העמודות'
    );
  },

  additionPattern(): MatrixQuestion {
    return this._lineCountPattern(true);
  },

  deletionPattern(): MatrixQuestion {
    return this._lineCountPattern(false);
  },

  _lineCountPattern(ascending: boolean): MatrixQuestion {
    const shapes = this.pickShapes(3);
    const counts = ascending ? [0, 1, 2] : [2, 1, 0];
    // Always outline so internal counting lines are 100% visible and distinct
    const fillType: FillType = 'outline';
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({ shape: shapes[r], fill: fillType, size: 'medium', lineCount: counts[c], hasBox: true });
      }
      grid.push(row);
    }

    const answer = { ...grid[2][2]! };
    grid[2][2] = null;
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const otherC = [0, 1, 2, 3].filter((c) => c !== answer.lineCount);

    const dist: ShapeConfig[] = [
      { ...answer, lineCount: otherC[0] },
      { ...answer, lineCount: otherC[1] },
      { ...answer, shape: otherS[0], lineCount: answer.lineCount },
      { ...answer, shape: otherS[1], lineCount: otherC[0] },
      { ...answer, fill: 'filled', lineCount: 0 },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      ascending
        ? 'כלל: הוספה — הוספה הדרגתית של קווים פנימיים (0 ← 1 ← 2)'
        : 'כלל: גריעה — הפחתה הדרגתית של קווים פנימיים (2 ← 1 ← 0)'
    );
  },

  transformationPattern(): MatrixQuestion {
    const shapes = this.pickShapes(3);
    const styles = ['solid', 'dashed', 'dotted'] as const;
    const fillType: FillType = 'outline';
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({ shape: shapes[r], fill: fillType, size: 'medium', lineStyle: styles[c], hasBox: true });
      }
      grid.push(row);
    }

    const answer = { ...grid[2][2]! };
    grid[2][2] = null;
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const otherSt = styles.filter((s) => s !== answer.lineStyle);

    const dist: ShapeConfig[] = [
      { ...answer, lineStyle: otherSt[0] },
      { ...answer, lineStyle: otherSt[1] },
      { ...answer, shape: otherS[0] },
      { ...answer, shape: otherS[1], lineStyle: otherSt[0] },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      'כלל: התמרה — סגנון הקו משתנה מרציף למקווקו ולמנוקד'
    );
  },

  colorPattern(): MatrixQuestion {
    const shapes = this.pickShapes(3);
    const colors = shuffle([...COLORS]).slice(0, 3);
    const fillType = randChoice<FillType>(['outline', 'filled']);
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const row: (ShapeConfig | null)[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({ shape: shapes[r], fill: fillType, size: 'medium', color: colors[c], hasBox: true });
      }
      grid.push(row);
    }

    const answer = { ...grid[2][2]! };
    grid[2][2] = null;
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const otherCl = COLORS.filter((c) => c !== answer.color);

    const dist: ShapeConfig[] = [
      { ...answer, color: otherCl[0] },
      { ...answer, color: otherCl[1] },
      { ...answer, shape: otherS[0] },
      { ...answer, shape: otherS[1], color: otherCl[0] },
    ];

    return this.buildResult(grid, answer, dist, 'כלל: התקדמות צבעים — צבע ייחודי בכל עמודה');
  },

  arithmeticPattern(): MatrixQuestion {
    const shapes = this.pickShapes(3);
    // Always outline so counting dots are clearly visible
    const fillType: FillType = 'outline';
    const pairs = [
      [1, 1], [1, 2], [2, 1], [1, 3], [2, 2], [3, 1],
      [1, 4], [2, 3], [3, 2], [4, 1], [2, 4], [3, 3],
    ];
    const chosenPairs = shuffle(pairs).slice(0, 3);
    const grid: (ShapeConfig | null)[][] = [];

    for (let r = 0; r < 3; r++) {
      const [a, b] = chosenPairs[r];
      const sum = a + b;
      const row: (ShapeConfig | null)[] = [
        { shape: shapes[r], fill: fillType, size: 'medium', dotCount: a, hasBox: true },
        { shape: shapes[r], fill: fillType, size: 'medium', dotCount: b, hasBox: true },
        r === 2 ? null : { shape: shapes[r], fill: fillType, size: 'medium', dotCount: sum, hasBox: true },
      ];
      grid.push(row);
    }

    const [a, b] = chosenPairs[2];
    const answer: ShapeConfig = { shape: shapes[2], fill: fillType, size: 'medium', dotCount: a + b, hasBox: true };
    const otherS = ALL_SHAPES.filter((s) => s !== answer.shape);
    const diffDots = [1, 2, 3, 4, 5, 6].filter((d) => d !== answer.dotCount);

    const dist: ShapeConfig[] = [
      { ...answer, dotCount: a },
      { ...answer, dotCount: b },
      { ...answer, dotCount: randChoice(diffDots) },
      { ...answer, shape: otherS[0] },
      { ...answer, shape: otherS[1], dotCount: answer.dotCount },
    ];

    return this.buildResult(
      grid,
      answer,
      dist,
      `כלל: ייצוג חשבוני — עמודה 1 (${a} נקודות) + עמודה 2 (${b} נקודות) = עמודה 3 (${a + b} נקודות)`
    );
  },

  // Compound Set Patterns
  unionPattern(): MatrixQuestion {
    return this._setOpPattern('union');
  },

  subtractionPattern(): MatrixQuestion {
    return this._setOpPattern('subtraction');
  },

  xorPattern(): MatrixQuestion {
    return this._setOpPattern('xor');
  },

  _setOpPattern(op: 'union' | 'subtraction' | 'xor'): MatrixQuestion {
    const grid: (ShapeConfig | null)[][] = [];
    let answerEls: string[] = [];

    for (let r = 0; r < 3; r++) {
      const pool = shuffle([...COMPOUND_KEYS]);
      let a: string[], b: string[], c: string[];

      if (op === 'union') {
        a = pool.slice(0, randInt(2, 3));
        const overlap = pool.slice(0, randInt(0, 1));
        const bNew = pool.filter((e) => !a.includes(e)).slice(0, randInt(1, 3));
        b = shuffle([...overlap, ...bNew]);
        c = [...new Set([...a, ...b])];
      } else if (op === 'subtraction') {
        a = pool.slice(0, randInt(3, 5));
        b = shuffle([...a]).slice(0, randInt(1, 2));
        const bSet = new Set(b);
        c = a.filter((e) => !bSet.has(e));
      } else {
        const shared = pool.slice(0, randInt(1, 2));
        const aOnly = pool.slice(2, 2 + randInt(1, 2));
        const bOnly = pool.filter((e) => !shared.includes(e) && !aOnly.includes(e)).slice(0, randInt(1, 2));
        a = shuffle([...shared, ...aOnly]);
        b = shuffle([...shared, ...bOnly]);
        const aSet = new Set(a), bSet = new Set(b);
        c = [...a.filter((e) => !bSet.has(e)), ...b.filter((e) => !aSet.has(e))];
      }

      if (c.length === 0) c = [randChoice(pool)];

      if (r === 2) {
        answerEls = c;
        grid.push([
          { type: 'compound', elements: [...a] },
          { type: 'compound', elements: [...b] },
          null,
        ]);
      } else {
        grid.push([
          { type: 'compound', elements: [...a] },
          { type: 'compound', elements: [...b] },
          { type: 'compound', elements: [...c] },
        ]);
      }
    }

    const answer: ShapeConfig = { type: 'compound', elements: answerEls };
    const distractors = this._compoundDistractors(answer, grid);
    const ruleNames = {
      union: 'כלל: איחוד קבוצות (A ∪ B = C) — שילוב האלמנטים מתא 1 ותא 2 יוצר את תא 3',
      subtraction: 'כלל: חיסור קבוצות (A − B = C) — האלמנטים שבתא 2 מוחסרים מתא 1',
      xor: 'כלל: הפרש סימטרי / XOR — אלמנטים משותפים מתבטלים, אלמנטים ייחודיים מתחברים',
    };

    return this.buildResult(grid, answer, distractors, ruleNames[op]);
  },

  _compoundDistractors(answer: ShapeConfig, grid: (ShapeConfig | null)[][]): ShapeConfig[] {
    const elements = answer.elements || [];
    const answerSet = new Set(elements);
    const distractors: ShapeConfig[] = [];

    if (elements.length > 1) {
      const d = [...elements];
      d.splice(randInt(0, d.length - 1), 1);
      distractors.push({ type: 'compound', elements: d });
    }

    const extras = COMPOUND_KEYS.filter((e) => !answerSet.has(e));
    if (extras.length > 0) {
      distractors.push({ type: 'compound', elements: [...elements, randChoice(extras)] });
    }

    if (elements.length > 0 && extras.length > 0) {
      const d = [...elements];
      d[randInt(0, d.length - 1)] = randChoice(extras);
      distractors.push({ type: 'compound', elements: d });
    }

    if (grid[2] && grid[2][0]?.elements) {
      distractors.push({ type: 'compound', elements: [...grid[2][0].elements] });
    }

    return distractors;
  },

  generate(difficulty: DifficultyTier = 'easy'): MatrixQuestion {
    const easy = [
      this.contourDivisionSolidPattern,
      this.analogyFillPattern,
      this.concentricProgressionPattern,
      this.columnInvariancePattern,
      this.shapeFillPattern,
      this.fillShapePattern,
      this.sizePattern,
    ];

    const medium = [
      ...easy,
      this.contourDivisionSolidPattern,
      this.dualAttributeMatrixPattern,
      this.rotationPattern,
      this.additionPattern,
      this.deletionPattern,
      this.transformationPattern,
      this.colorPattern,
      this.arithmeticPattern,
    ];

    const hard = [
      ...medium,
      this.contourDivisionSolidPattern,
      this.dualAttributeMatrixPattern,
      this.unionPattern,
      this.subtractionPattern,
      this.xorPattern,
    ];

    const pool = difficulty === 'hard' ? hard : difficulty === 'medium' ? medium : easy;

    let result: MatrixQuestion | null = null;
    let attempts = 0;
    while (!result && attempts < 30) {
      attempts++;
      try {
        result = randChoice(pool).call(this);
      } catch {
        result = null;
      }
    }

    return result || this.analogyFillPattern();
  },
};
