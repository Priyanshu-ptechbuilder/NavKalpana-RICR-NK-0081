import React from 'react';

/**
 * Grid-based attendance heatmap.
 * rows: e.g. student names or week labels, cols: e.g. days or weeks, getValue(rowIndex, colIndex) => 0-100 or 'present'|'absent'
 */
export default function AttendanceHeatmap({
  rows = [],
  cols = [],
  getValue = () => 0,
  rowLabel = (r, i) => r?.name ?? `Row ${i + 1}`,
  colLabel = (c, i) => c ?? `Col ${i + 1}`,
  title = 'Attendance Heatmap',
}) {
  const getColor = (val) => {
    if (val === 'present' || val === 100) return 'heatmap-present';
    if (val === 'absent' || val === 0) return 'heatmap-absent';
    if (typeof val === 'number') {
      if (val >= 70) return 'heatmap-present';
      if (val >= 40) return 'heatmap-moderate';
      return 'heatmap-absent';
    }
    return 'heatmap-moderate';
  };

  return (
    <div className="analytics-heatmap-wrap">
      {title && <h3 className="analytics-heatmap-title">{title}</h3>}
      <div className="analytics-heatmap-grid">
        <div className="analytics-heatmap-corner" />
        {cols.map((c, j) => (
          <div key={j} className="analytics-heatmap-col-header">
            {colLabel(c, j)}
          </div>
        ))}
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <div className="analytics-heatmap-row-header">{rowLabel(r, i)}</div>
            {cols.map((c, j) => {
              const val = getValue(i, j);
              return (
                <div
                  key={j}
                  className={`analytics-heatmap-cell ${getColor(val)}`}
                  title={`${rowLabel(r, i)} - ${colLabel(c, j)}: ${typeof val === 'number' ? val + '%' : val}`}
                >
                  {typeof val === 'number' && val != null ? `${val}%` : val === 'present' ? 'P' : val === 'absent' ? 'A' : '—'}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
