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
  theme?: 'police' | 'dark';
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  config,
  className = '',
  isQuestionMark = false,
  theme = 'police',
}) => {
  const patternId = useId().replace(/:/g, '_');
  const crosshatchId = `ch_${patternId}`;
  const hatchId = `h_${patternId}`;

  // Question mark rendering with high legibility
  if (!config || isQuestionMark) {
    const qColor = theme === 'dark' ? '#38bdf8' : '#102a45';
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fontSize="56"
          fontWeight="800"
          fill={qColor}
          fontFamily="'Rubik', sans-serif"
          opacity="0.9"
        >
          ?
        </text>
      </svg>
    );
  }

  // Base theme colors
  const defaultColor = theme === 'dark' ? '#c8d6e5' : '#102a45';
  const c = config.color || defaultColor;
  const contrastColor = theme === 'dark' ? '#06091a' : '#ffffff';
  // If shape is solid filled, inner lines/dots MUST be contrasting so they never blend in!
  const innerItemColor = config.fill === 'filled' ? contrastColor : c;

  const sw = 2.4;
  const sizeMap: Record<string, number> = {
    small: 0.52,
    medium: 0.78,
    large: 0.98,
    xlarge: 1.22,
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
      case 'arrow': {
        const aw = 13 * s, ah = 26 * s;
        return (
          <g>
            <line x1={cx} y1={cy + ah * 0.7} x2={cx} y2={cy - ah * 0.6} stroke={c} strokeWidth={sw * 1.5} strokeLinecap="round" />
            <polygon
              points={`${cx},${cy - ah * 0.8} ${cx - aw},${cy - ah * 0.1} ${cx + aw},${cy - ah * 0.1}`}
              fill={c}
              stroke={c}
              strokeWidth={sw * 0.5}
            />
          </g>
        );
      }
      case 'nested_lines': {
        const count = config.parallelCount || 1;
        const sub = config.subType || 'corner';
        const spacing = 7 * s;
        const lines = [];

        if (sub === 'corner') {
          for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * spacing;
            const xBase = config.flipX ? cx + 22 * s + offset : cx - 22 * s - offset;
            const yBase = cy + 22 * s + offset;
            const xMid = config.flipX ? cx - 18 * s + offset : cx + 18 * s - offset;
            const yTop = cy - 22 * s - offset;
            lines.push(
              <polyline
                key={i}
                points={`${xBase},${yBase} ${xMid},${yBase} ${xMid},${yTop}`}
                fill="none"
                stroke={c}
                strokeWidth={sw * 1.2}
                strokeLinecap="round"
                strokeLinejoin="miter"
              />
            );
          }
        } else if (sub === 'step' || sub === 'step_arrow') {
          for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * spacing;
            const y1 = cy - 18 * s + offset;
            const y2 = cy + 18 * s + offset;
            const x1 = cx - 22 * s;
            const x2 = cx;
            const x3 = cx + 22 * s;
            lines.push(
              <g key={i}>
                <polyline
                  points={`${x1},${y1} ${x2},${y1} ${x2},${y2} ${x3},${y2}`}
                  fill="none"
                  stroke={c}
                  strokeWidth={sw * 1.2}
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                />
                {sub === 'step_arrow' && (
                  <polygon
                    points={`${x3 + 5 * s},${y2} ${x3 - 2 * s},${y2 - 4 * s} ${x3 - 2 * s},${y2 + 4 * s}`}
                    fill={c}
                  />
                )}
              </g>
            );
          }
        }
        return <g>{lines}</g>;
      }
      case 'wireframe': {
        const id = config.wireframeId || 'square';
        const wSw = sw * 1.25;
        const b = 24 * s;
        switch (id) {
          case 'square':
            return <rect x={cx - b} y={cy - b} width={b * 2} height={b * 2} fill="none" stroke={c} strokeWidth={wSw} />;
          case 'trident':
            return (
              <g>
                <line x1={cx - b} y1={cy + b} x2={cx + b} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx - b} y1={cy + b} x2={cx - b} y2={cy - b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx} y1={cy + b} x2={cx} y2={cy - b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx + b} y1={cy + b} x2={cx + b} y2={cy - b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
              </g>
            );
          case 'c_shape':
            return (
              <polyline
                points={`${cx + b},${cy - b} ${cx - b},${cy - b} ${cx - b},${cy + b} ${cx + b},${cy + b}`}
                fill="none"
                stroke={c}
                strokeWidth={wSw}
                strokeLinecap="round"
              />
            );
          case 'h_shape':
            return (
              <g>
                <line x1={cx - b} y1={cy - b} x2={cx + b} y2={cy - b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx - b} y1={cy + b} x2={cx + b} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx} y1={cy - b} x2={cx} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
              </g>
            );
          case 'three_lines':
            return (
              <g>
                <line x1={cx - 16 * s} y1={cy - b} x2={cx - 16 * s} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx} y1={cy - b} x2={cx} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx + 16 * s} y1={cy - b} x2={cx + 16 * s} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
              </g>
            );
          case 'fork':
            return (
              <g>
                <line x1={cx - b} y1={cy - b} x2={cx - b} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx - b} y1={cy + b} x2={cx + b} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx} y1={cy + b} x2={cx} y2={cy - b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
              </g>
            );
          case 'arch':
            return (
              <polyline
                points={`${cx - b},${cy + b} ${cx - b},${cy - b} ${cx + b},${cy - b} ${cx + b},${cy + b}`}
                fill="none"
                stroke={c}
                strokeWidth={wSw}
                strokeLinecap="round"
              />
            );
          case 'two_lines':
            return (
              <g>
                <line x1={cx - 11 * s} y1={cy - b} x2={cx - 11 * s} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx + 11 * s} y1={cy - b} x2={cx + 11 * s} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
              </g>
            );
          case 'l_shape':
            return (
              <polyline
                points={`${cx - b},${cy - b} ${cx - b},${cy + b} ${cx + b},${cy + b}`}
                fill="none"
                stroke={c}
                strokeWidth={wSw}
                strokeLinecap="round"
              />
            );
          case 'inv_t':
            return (
              <g>
                <line x1={cx - b} y1={cy + b} x2={cx + b} y2={cy + b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
                <line x1={cx} y1={cy + b} x2={cx} y2={cy - b} stroke={c} strokeWidth={wSw} strokeLinecap="round" />
              </g>
            );
          default:
            return null;
        }
      }
      case 'bowtie_overlay': {
        const bwAngle = config.bowtieAngle || 0;
        const dmAngle = config.diamondAngle || 0;
        const bw = 24 * s, bh = 24 * s;
        const parts = [];

        if (config.hasBowtie) {
          parts.push(
            <g key="bowtie" transform={`rotate(${bwAngle}, ${cx}, ${cy})`}>
              <polygon points={`${cx - bw},${cy - bh} ${cx + bw},${cy - bh} ${cx},${cy}`} fill="none" stroke={c} strokeWidth={sw} />
              <polygon points={`${cx - bw},${cy + bh} ${cx + bw},${cy + bh} ${cx},${cy}`} fill="none" stroke={c} strokeWidth={sw} />
            </g>
          );
        }

        if (config.hasDiamond) {
          parts.push(
            <g key="diamond" transform={`rotate(${dmAngle}, ${cx}, ${cy})`}>
              <polygon points={`${cx},${cy - bh} ${cx + bw * 0.75},${cy} ${cx},${cy + bh} ${cx - bw * 0.75},${cy}`} fill="none" stroke={c} strokeWidth={sw} />
              <line x1={cx} y1={cy - bh} x2={cx} y2={cy + bh} stroke={c} strokeWidth={sw * 0.8} />
            </g>
          );
        }

        // Dot position
        if (config.dotLocation) {
          let dx = cx, dy = cy;
          const off = 13 * s;
          if (config.dotLocation === 'top') dy = cy - off;
          else if (config.dotLocation === 'bottom') dy = cy + off;
          else if (config.dotLocation === 'left') dx = cx - off;
          else if (config.dotLocation === 'right') dx = cx + off;
          else if (config.dotLocation === 'bottom_left') { dx = cx - off * 0.8; dy = cy + off * 0.8; }
          else if (config.dotLocation === 'bottom_right') { dx = cx + off * 0.8; dy = cy + off * 0.8; }
          parts.push(<circle key="dot" cx={dx} cy={dy} r={4.5 * s} fill={innerItemColor} />);
        }

        return <g>{parts}</g>;
      }
      case 'quadrant_arrow': {
        const r = 30 * s;
        const qPos = config.quadrantPos || 'top';
        const aDir = config.arrowDirection || 'up';

        const posMap: Record<string, [number, number]> = {
          top: [cx, cy - 14 * s],
          right: [cx + 14 * s, cy],
          bottom: [cx, cy + 14 * s],
          left: [cx - 14 * s, cy],
        };
        const [ax, ay] = posMap[qPos] || [cx, cy];

        const rotMap: Record<string, number> = {
          up: 0,
          right: 90,
          down: 180,
          left: 270,
        };
        const aRot = rotMap[aDir] || 0;

        return (
          <g>
            <polygon
              points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
              fill="none"
              stroke={c}
              strokeWidth={sw}
            />
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={c} strokeWidth={sw * 0.8} />
            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={c} strokeWidth={sw * 0.8} />
            <g transform={`translate(${ax}, ${ay}) rotate(${aRot})`}>
              <line x1={0} y1={6 * s} x2={0} y2={-5 * s} stroke={c} strokeWidth={sw * 1.3} strokeLinecap="round" />
              <polygon points={`0,${-8 * s} ${-4 * s},${-2 * s} ${4 * s},${-2 * s}`} fill="none" stroke={c} strokeWidth={sw} />
            </g>
          </g>
        );
      }
      default:
        return null;
    }
  };

  // Double contour for shapes (Police Exam Question 5/Row 3)
  const renderDoubleContour = () => {
    if (config.fill !== 'double' && !config.doubleContour) return null;
    const isw = sw * 0.9;
    switch (config.shape) {
      case 'circle': {
        const r2 = 21 * s;
        return <circle cx={cx} cy={cy} r={r2} fill="none" stroke={c} strokeWidth={isw} />;
      }
      case 'square': {
        const h2 = 20 * s;
        return <rect x={cx - h2} y={cy - h2} width={h2 * 2} height={h2 * 2} fill="none" stroke={c} strokeWidth={isw} />;
      }
      case 'diamond': {
        const r2 = 22 * s;
        return (
          <polygon
            points={`${cx},${cy - r2} ${cx + r2},${cy} ${cx},${cy + r2} ${cx - r2},${cy}`}
            fill="none"
            stroke={c}
            strokeWidth={isw}
          />
        );
      }
      case 'triangle': {
        const r2 = 21 * s;
        return (
          <polygon
            points={`${cx},${cy - r2} ${cx + r2 * 1.05},${cy + r2 * 0.75} ${cx - r2 * 1.05},${cy + r2 * 0.75}`}
            fill="none"
            stroke={c}
            strokeWidth={isw}
          />
        );
      }
      case 'hexagon': {
        const r2 = 20 * s;
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          pts.push(`${cx + r2 * Math.cos(angle)},${cy + r2 * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} fill="none" stroke={c} strokeWidth={isw} />;
      }
      default:
        return null;
    }
  };

  // Internal divisions & decorations (Police Test Q5/Q6: Cross, 4 Quadrants, Crossed Diagonals)
  const renderDecorations = () => {
    if (config.fill !== 'decorated') return null;
    const decSw = 2.0;
    switch (config.shape) {
      case 'circle': {
        // Circle with dividing cross (Police Exam Row 1 Col 2)
        const r = 28 * s;
        return (
          <g>
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={innerItemColor} strokeWidth={decSw} />
            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={innerItemColor} strokeWidth={decSw} />
          </g>
        );
      }
      case 'square': {
        // Square divided into 4 quadrants (Police Exam Row 3 Col 2)
        const h = 27 * s;
        return (
          <g>
            <line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={innerItemColor} strokeWidth={decSw} />
            <line x1={cx - h} y1={cy} x2={cx + h} y2={cy} stroke={innerItemColor} strokeWidth={decSw} />
          </g>
        );
      }
      case 'diamond': {
        // Diamond with crossed diagonals connecting vertices (Police Exam Row 2 Col 2)
        const r = 30 * s;
        return (
          <g>
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={innerItemColor} strokeWidth={decSw} />
            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={innerItemColor} strokeWidth={decSw} />
          </g>
        );
      }
      case 'cross':
        return <circle cx={cx} cy={cy} r={4.5 * s} fill={innerItemColor} />;
      case 'triangle': {
        // Triangle with vertical bisector and horizontal line
        const r = 30 * s;
        return (
          <g>
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r * 0.75} stroke={innerItemColor} strokeWidth={decSw} />
            <line x1={cx - r * 0.55} y1={cy} x2={cx + r * 0.55} y2={cy} stroke={innerItemColor} strokeWidth={decSw} />
          </g>
        );
      }
      case 'hexagon': {
        // Hexagon with lines connecting opposite vertices
        const r = 28 * s;
        return (
          <g>
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={innerItemColor} strokeWidth={decSw} />
            <line x1={cx - r * 0.866} y1={cy - r * 0.5} x2={cx + r * 0.866} y2={cy + r * 0.5} stroke={innerItemColor} strokeWidth={decSw} />
            <line x1={cx - r * 0.866} y1={cy + r * 0.5} x2={cx + r * 0.866} y2={cy - r * 0.5} stroke={innerItemColor} strokeWidth={decSw} />
          </g>
        );
      }
      default:
        return null;
    }
  };

  // Internal lines (Line counting patterns: 0, 1, 2, 3 lines)
  const renderInternalLines = () => {
    if (!config.lineCount) return null;
    const r = 26 * s;
    const lineSw = sw * 0.85;
    return (
      <g>
        {config.lineCount >= 1 && (
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={innerItemColor} strokeWidth={lineSw} strokeLinecap="round" />
        )}
        {config.lineCount >= 2 && (
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={innerItemColor} strokeWidth={lineSw} strokeLinecap="round" />
        )}
        {config.lineCount >= 3 && (
          <line x1={cx - r * 0.71} y1={cy - r * 0.71} x2={cx + r * 0.71} y2={cy + r * 0.71} stroke={innerItemColor} strokeWidth={lineSw} strokeLinecap="round" />
        )}
      </g>
    );
  };

  // Internal dots (Arithmetic patterns)
  const renderDots = () => {
    if (!config.dotCount) return null;
    const r = 4.4 * s;
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
    return (
      <g>
        {pts.map(([x, y], idx) => (
          <circle key={idx} cx={x} cy={y} r={r} fill={innerItemColor} />
        ))}
      </g>
    );
  };

  // Rotating group if rotation specified
  let shapeContent = (
    <>
      {renderBaseShape()}
      {renderDoubleContour()}
      {renderDecorations()}
      {renderInternalLines()}
      {renderDots()}
      {config.marker && <circle cx={50} cy={50 - 28 * s - 7} r={4.5} fill={innerItemColor} />}
    </>
  );

  if (config.rotation) {
    shapeContent = <g transform={`rotate(${config.rotation}, 50, 50)`}>{shapeContent}</g>;
  }

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Fine crosshatch mesh pattern (Police Exam Q4) */}
        <pattern id={crosshatchId} width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 7 7 M 7 0 L 0 7" fill="none" stroke={c} strokeWidth="1.2" />
        </pattern>
        {/* Diagonal hatch pattern */}
        <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={c} strokeWidth="1.4" />
        </pattern>
      </defs>

      {/* Police Test outer bounding box if specified */}
      {config.hasBox && <rect x="5" y="5" width="90" height="90" fill="none" stroke={c} strokeWidth="2.2" />}
      {shapeContent}
    </svg>
  );
};
