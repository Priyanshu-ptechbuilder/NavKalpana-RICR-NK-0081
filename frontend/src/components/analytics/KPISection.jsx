import React from 'react';

/**
 * Clean KPI cards for class-level metrics.
 * Color coding: green = high, yellow = moderate, red = needs attention (via optional variant).
 */
export default function KPISection({ items = [] }) {
  return (
    <div className="analytics-kpi-section">
      <div className="analytics-kpi-cards">
        {items.map((item) => (
          <div
            key={item.id || item.title}
            className={`analytics-kpi-card ${item.variant ? `kpi-${item.variant}` : ''}`}
          >
            <span className="analytics-kpi-value">{item.value}</span>
            <span className="analytics-kpi-title">{item.title}</span>
            {item.sub && <span className="analytics-kpi-sub">{item.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
