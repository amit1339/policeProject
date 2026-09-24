export type ShapeType =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'cross'
  | 'x_cross'
  | 'trapezoid'
  | 'triangle'
  | 'hexagon'
  | 'concentric'
  | 'nested_lines'
  | 'wireframe'
  | 'bowtie_overlay'
  | 'quadrant_arrow'
  | 'arrow';

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
  // Extended properties for advanced police exam patterns:
  subType?: 'step_arrow' | 'step' | 'corner' | 'diag_arrow';
  parallelCount?: number;
  flipX?: boolean;
  flipY?: boolean;
  wireframeId?:
    | 'square'
    | 'trident'
    | 'c_shape'
    | 'h_shape'
    | 'three_lines'
    | 'fork'
    | 'arch'
    | 'two_lines'
    | 'l_shape'
    | 'inv_t';
  hasBowtie?: boolean;
  hasDiamond?: boolean;
  bowtieAngle?: number;
  diamondAngle?: number;
  dotLocation?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'bottom_left' | 'bottom_right';
  quadrantPos?: 'top' | 'right' | 'bottom' | 'left';
  arrowDirection?: 'up' | 'right' | 'down' | 'left';
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
