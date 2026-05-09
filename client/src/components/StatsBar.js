import React from 'react';

const StatsBar = ({ activeCount, totalCount }) => {
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="green-dot">●</span> النشطون الآن: <strong>{activeCount}</strong>
      </div>
      <div className="stat-item">
        المسجلون: <strong>{totalCount}</strong>
      </div>
    </div>
  );
};

export default StatsBar;

