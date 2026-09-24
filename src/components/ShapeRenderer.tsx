import React, { useId } from 'react';
import type { ShapeConfig } from '../types';

export const COMPOUND_ELEMENTS: Record<string, (c: string, sw: number) => React.ReactNode> = {
  'hline': (c, sw) => (
    <line key="hline" x1="15" y1="50" x2="85" y2="50" stroke={c} strokeWidth={sw} strokeLinecap="round" />
  ),
  'vline': (c, sw) => (
    <line key="vline" x1="50" y1="15" x2="50" y2="85" stroke={c} strokeWidth={sw} strokeLinecap="round" />
  ),
  'fdiag': (c, sw) => (
    <line key="fdiag" x1="20" y1="80" x2="80" y2="20" stroke={c} strokeWidth={sw} strokeLinecap="round" />
  ),
  'bdiag': (c, sw) => (
    <line key="bdiag" x1="20" y1="20" x2="80" y2="80" stroke={c} strokeWidth={sw} strokeLinecap="round" />
  ),
  'sm_circle': (c, sw) => (
    <circle key="sm_circle" cx="50" cy="50" r="16" fill="none" stroke={c} strokeWidth={sw} />
  ),
  'dot': (c) => (
    <circle key="dot" cx="50" cy="50" r="7" fill={c} />
  ),
  'sm_square': (c, sw) => (
    <rect key="sm_square" x="33" y="33" width="34" height="34" fill="none" stroke={c} strokeWidth={sw} />
  ),
  'sm_tri': (c, sw) => (
    <polygon key="sm_tri" points="50,28 72,72 28,72" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
  ),
  'arc_top': (c, sw) => (
    <path key="arc_top" d="M 22 55 Q 50 18 78 55" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
  ),
  'arc_bot': (c, sw) => (
    <path key="arc_bot" d="M 22 45 Q 50 82 78 45" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
  ),
};

export const COMPOUND_KEYS = Object.keys(COMPOUND_ELEMENTS);

interface ShapeRendererProps {
  config: ShapeConfig | null | undefined;
  className?: string;
  isQuestionMark?: boolean;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  config,
  className = '',
  isQuestionMark = false,
}) => {
  const patternId = useId().replace(/:/g, '_');
  const crosshatchId = `ch_${patternId}`;
  const hatchId = `h_${patternId}`;

  if (!config || isQuestionMark) {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
        <text
          x="50"
          y="64"
          textAnchor="middle"
          fontSize="50"
          fontWeight="800"
          fill="#3b82f6"
          fontFamily="'Rubik', sans-serif"
          opacity="0.8"
        >
          ?
        </text>
      </svg>
    );
  }

  const c = config.color || '#c8d6e5';
  const sw = 2.5;
  const sizeMap: Record<string, number> = {
    small: 0.52,
    medium: 0.78,
    large: 0.98,
    xlarge: 1.24,
  };
  const s = sizeMap[config.size || 'medium'] || 0.78;
  const cx = 50, cy = 50;

  let fillValue = 'none';
  if (config.fill === 'filled') fillValue = c;
  else if (config.fill === 'crosshatch') fillValue = `url(#${crosshatchId})`;
  else if (config.fill === 'hatch') fillValue = `url(#${hatchId})`;

  const strokeDash = config.lineStyle === 'dashed' ? '8 4' : config.lineStyle === 'dotted' ? '3 3' : undefined;

  // Compound set operation
  if (config.type === 'compound' && config.elements) {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
        {config.elements.map((el) => COMPOUND_ELEMENTS[el]?.(c, sw))}
      </svg>
    );
  }

  // Draw base geometric shape
  const renderBaseShape = () => {
    switch (config.shape) {
      case 'circle': {
        const r = 28 * s;
        return <circle cx={cx} cy={cy} r={r} fill={fillValue} stroke={c} strokeWidth={sw} strokeDasharray={strokeDash} />;
      }
      case 'square': {
        const h = 27 * s;
        return <rect x={cx - h} y={cy - h} width={h * 2} height={h * 2} fill={fillValue} stroke={c} strokeWidth={sw} strokeDasharray={strokeDash} />;
      }
      case 'diamond': {
        const r = 30 * s;
        return (
          <polygon
            points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
            fill={fillValue}
            stroke={c}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={strokeDash}
          />
        );
      }
      case 'cross': {
        // Notched Cross (Police Test Q1)
        const a = 30 * s, t = 11 * s;
        const pts = [
          `${cx - t},${cy - a}`, `${cx + t},${cy - a}`, `${cx + t},${cy - t}`,
          `${cx + a},${cy - t}`, `${cx + a},${cy + t}`, `${cx + t},${cy + t}`,
          `${cx + t},${cy + a}`, `${cx - t},${cy + a}`, `${cx - t},${cy + t}`,
          `${cx - a},${cy + t}`, `${cx - a},${cy - t}`, `${cx - t},${cy - t}`,
        ].join(' ');
        return (
          <polygon
            points={pts}
            fill={fillValue}
            stroke={c}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={strokeDash}
          />
        );
      }
      case 'x_cross': {
        // Diagonal X-Cross (Police Test Q3)
        const arm = 26 * s;
        return (
          <g strokeDasharray={strokeDash}>
            <line x1={cx - arm} y1={cy - arm} x2={cx + arm} y2={cy + arm} stroke={c} strokeWidth={sw * 1.6} strokeLinecap="round" />
            <line x1={cx - arm} y1={cy + arm} x2={cx + arm} y2={cy - arm} stroke={c} strokeWidth={sw * 1.6} strokeLinecap="round" />
          </g>
        );
      }
      case 'trapezoid': {
        // Inverted Trapezoid / Bucket Shape (Police Test Q4)
        const topW = 27 * s, botW = 15 * s, h = 26 * s;
        const pts = [
          `${cx - topW},${cy - h}`,
          `${cx + topW},${cy - h}`,
          `${cx + botW},${cy + h}`,
          `${cx - botW},${cy + h}`
        ].join(' ');
        return (
          <polygon
            points={pts}
            fill={fillValue}
            stroke={c}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={strokeDash}
          />
        );
      }
      case 'concentric': {
        // Concentric Circles with outer bold line (Police Test Q2)
        const count = config.ringCount || 2;
        const maxR = 34 * s;
        const circles = [];
        for (let i = 0; i < count; i++) {
          const r = maxR * ((count - i) / count);
          const isOuter = i === 0;
          const thisSw = isOuter && config.outerThick !== false ? sw * 2.3 : sw;
          circles.push(
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={c}
              strokeWidth={thisSw}
              strokeDasharray={strokeDash}
            />
          );
        }
        return <g>{circles}</g>;
      }
      case 'triangle': {
        const r = 30 * s;
        return (
          <polygon
            points={`${cx},${cy - r} ${cx + r * 1.05},${cy + r * 0.75} ${cx - r * 1.05},${cy + r * 0.75}`}
            fill={fillValue}
            stroke={c}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={strokeDash}
          />
        );
      }
      case 'hexagon': {
        const r = 28 * s;
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        return (
          <polygon
            points={pts.join(' ')}
            fill={fillValue}
            stroke={c}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={strokeDash}
          />
        );
      }
      default:
        return null;
    }
  };

  // Internal decorations
  const renderDecorations = () => {
    if (config.fill !== 'decorated') return null;
    const decSw = 1.8;
    const r = 28 * s;
    switch (config.shape) {
      case 'circle': {
        const len = r * 0.7;
        return (
          <>
            <line x1={cx} y1={cy - len} x2={cx} y2={cy + len} stroke={c} strokeWidth={decSw} />
            <line x1={cx - len} y1={cy} x2={cx + len} y2={cy} stroke={c} strokeWidth={decSw} />
          </>
        );
      }
      case 'square': {
        const h = 27 * s;
        return (
          <>
            <line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={c} strokeWidth={decSw} />
            <line x1={cx - h} y1={cy} x2={cx + h} y2={cy} stroke={c} strokeWidth={decSw} />
          </>
        );
      }
      case 'diamond': {
        const ri = 30 * s * 0.5;
        return (
          <>
            <line x1={cx - ri} y1={cy - ri} x2={cx + ri} y2={cy + ri} stroke={c} strokeWidth={decSw} />
            <line x1={cx + ri} y1={cy - ri} x2={cx - ri} y2={cy + ri} stroke={c} strokeWidth={decSw} />
          </>
        );
      }
      case 'cross':
        return <circle cx={cx} cy={cy} r={4 * s} fill={c} />;
      case 'triangle': {
        const r2 = 30 * s * 0.45, yOff = 4 * s;
        return (
          <polygon
            points={`${cx},${cy - r2 + yOff} ${cx + r2 * 0.95},${cy + r2 * 0.65 + yOff} ${cx - r2 * 0.95},${cy + r2 * 0.65 + yOff}`}
            fill="none"
            stroke={c}
            strokeWidth={decSw}
            strokeLinejoin="round"
          />
        );
      }
      case 'hexagon': {
        const ri = 28 * s * 0.5, pts = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          pts.push(`${cx + ri * Math.cos(angle)},${cy + ri * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} fill="none" stroke={c} strokeWidth={decSw} strokeLinejoin="round" />;
      }
      default:
        return null;
    }
  };

  // Internal lines
  const renderInternalLines = () => {
    if (!config.lineCount) return null;
    const r = 28 * s * 0.72;
    const lineSw = sw * 0.7;
    return (
      <>
        {config.lineCount >= 1 && <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={c} strokeWidth={lineSw} strokeLinecap="round" />}
        {config.lineCount >= 2 && <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={c} strokeWidth={lineSw} strokeLinecap="round" />}
        {config.lineCount >= 3 && <line x1={cx - r * 0.71} y1={cy - r * 0.71} x2={cx + r * 0.71} y2={cy + r * 0.71} stroke={c} strokeWidth={lineSw} strokeLinecap="round" />}
      </>
    );
  };

  // Internal dots
  const renderDots = () => {
    if (!config.dotCount) return null;
    const r = 4.2 * s;
    const off = 13 * s;
    const positions: Record<number, [number, number][]> = {
      1: [[cx, cy]],
      2: [[cx - off, cy], [cx + off, cy]],
      3: [[cx - off, cy], [cx, cy], [cx + off, cy]],
      4: [[cx - off, cy - off], [cx + off, cy - off], [cx - off, cy + off], [cx + off, cy + off]],
      5: [[cx - off, cy - off], [cx + off, cy - off], [cx, cy], [cx - off, cy + off], [cx + off, cy + off]],
      6: [
        [cx - off, cy - off * 1.1], [cx - off, cy], [cx - off, cy + off * 1.1],
        [cx + off, cy - off * 1.1], [cx + off, cy], [cx + off, cy + off * 1.1]
      ]
    };
    const pts = positions[config.dotCount] || [[cx, cy]];
    return pts.map(([x, y], idx) => <circle key={idx} cx={x} cy={y} r={r} fill={c} />);
  };

  // Rotating group if rotation specified
  let shapeContent = (
    <>
      {renderBaseShape()}
      {renderDecorations()}
      {renderInternalLines()}
      {renderDots()}
      {config.marker && <circle cx={50} cy={50 - 28 * s - 7} r={4.5} fill={c} />}
    </>
  );

  if (config.rotation) {
    shapeContent = <g transform={`rotate(${config.rotation}, 50, 50)`}>{shapeContent}</g>;
  }

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Fine crosshatch mesh pattern */}
        <pattern id={crosshatchId} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 8 8 M 8 0 L 0 8" fill="none" stroke={c} strokeWidth="1.2" />
        </pattern>
        {/* Diagonal hatch pattern */}
        <pattern id={hatchId} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={c} strokeWidth="1.5" />
        </pattern>
      </defs>

      {config.hasBox && <rect x="6" y="6" width="88" height="88" fill="none" stroke={c} strokeWidth="2" rx="3" />}
      {shapeContent}
    </svg>
  );
};
