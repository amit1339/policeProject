export type ShapeType =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'cross'
  | 'x_cross'
  | 'trapezoid'
  | 'triangle'
  | 'hexagon'
  | 'concentric';

export type FillType =
  | 'outline'
  | 'decorated'
  | 'filled'
  | 'crosshatch'
  | 'hatch'
  | 'double';

export type Size = 'small' | 'medium' | 'large' | 'xlarge';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface ShapeConfig {
  shape?: ShapeType;
  fill?: FillType;
  size?: Size;
  color?: string;
  hasBox?: boolean;
  doubleContour?: boolean;
  rotation?: number;
  lineCount?: number;
  dotCount?: number;
  ringCount?: number;
  outerThick?: boolean;
  marker?: boolean;
  lineStyle?: LineStyle;
  type?: 'compound';
  elements?: string[];
}

export type MatrixLayout = '3x3' | '3x2';

export interface MatrixQuestion {
  grid: (ShapeConfig | null)[][];
  layout: MatrixLayout;
  answer: ShapeConfig;
  options: ShapeConfig[];
  correctIndex: number;
  explanation: string;
  promptSubtitle?: string;
}

export interface SeriesQuestion {
  visible: number[];
  answer: number;
  options: number[];
  correctIndex: number;
  explanation: string;
}

export type DifficultyTier = 'easy' | 'medium' | 'hard';
export type QuizType = 'series' | 'matrices';

export interface QuizState {
  currentScreen: 'home' | 'quiz';
  quizType: QuizType | null;
  score: number;
  total: number;
  answered: boolean;
  selectedAnswer: number | null;
  currentMatrixData: MatrixQuestion | null;
  currentSeriesData: SeriesQuestion | null;
}
