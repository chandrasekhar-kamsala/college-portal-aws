import React from 'react';

export default function StatsCard({ title, value, subtext, icon: Icon, colorClass = 'icon-purple' }) {
  return (
    <div className="metric-card">
      <div className="metric-info">
        <h3>{title}</h3>
        <div className="metric-value">{value}</div>
        <div className="metric-subtext">{subtext}</div>
      </div>
      <div className={`metric-icon-box ${colorClass}`}>
        <Icon size={24} aria-hidden="true" />
      </div>
    </div>
  );
}
