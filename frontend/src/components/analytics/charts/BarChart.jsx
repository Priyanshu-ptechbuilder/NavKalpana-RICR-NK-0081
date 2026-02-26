import React from 'react';

/**
 * Horizontal bar chart. Responsive and interactive (hover).
 * valueKey: key for bar length, labelKey: key for label, maxValue: optional cap.
 */
export default function BarChart({ data = [], valueKey, labelKey, maxValue, color = '#2563eb', height = 24 }) {
  const max = maxValue != null ? maxValue : Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="analytics-bar-chart">
      {data.map((item, i) => (
        <div key={i} className="analytics-bar-row">
          <span className="analytics-bar-label">{item[labelKey]}</span>
          <div className="analytics-bar-track" style={{ height: `${height}px` }}>
            <div
              className="analytics-bar-fill"
              style={{
                width: `${(item[valueKey] / max) * 100}%`,
                background: color,
              }}
            />
          </div>
          <span className="analytics-bar-value">{item[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}
