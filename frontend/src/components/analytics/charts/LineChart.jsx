import React, { useMemo, useId } from 'react';

/**
 * SVG line chart for trends (e.g. weekly activity, OGI over time).
 * data: array of { x, y } or use xKey/yKey for object items.
 * width/height optional; responsive container.
 */
export default function LineChart({
  data = [],
  xKey = 'x',
  yKey = 'y',
  width = 400,
  height = 200,
  color = '#2563eb',
  strokeWidth = 2,
  showDots = true,
  labelX = (v) => v,
  labelY = (v) => v,
}) {
  const { pathD, minY, maxY, points } = useMemo(() => {
    if (!data.length) return { pathD: '', minY: 0, maxY: 100, points: [] };
    const values = data.map((d) => (typeof d[yKey] === 'number' ? d[yKey] : Number(d[yKey]) || 0));
    const minY = Math.min(...values, 0);
    const maxY = Math.max(...values, 1);
    const pad = 24;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const points = data.map((d, i) => {
      const x = pad + (data.length <= 1 ? 0 : (i / (data.length - 1)) * w);
      const v = typeof d[yKey] === 'number' ? d[yKey] : Number(d[yKey]) || 0;
      const y = pad + h - ((v - minY) / (maxY - minY || 1)) * h;
      return { x, y, v, raw: d };
    });
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return { pathD, minY, maxY, points };
  }, [data, yKey, width, height]);

  const gradientId = useId().replace(/:/g, '-');
  if (!data.length) {
    return (
      <div className="analytics-line-chart" style={{ width, height }}>
        <span className="analytics-chart-empty">No data</span>
      </div>
    );
  }

  return (
    <div className="analytics-line-chart" style={{ width: '100%', maxWidth: width }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="analytics-line-svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Area under line */}
        {points.length > 0 && (
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - 24} L 24 ${height - 24} Z`}
            fill={`url(#${gradientId})`}
          />
        )}
        <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {showDots && points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} className="analytics-line-dot" />
        ))}
        {/* X labels */}
        {data.map((d, i) => {
          const p = points[i];
          if (!p) return null;
          return (
            <text key={i} x={p.x} y={height - 6} textAnchor="middle" className="analytics-line-label">
              {labelX(d[xKey])}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
