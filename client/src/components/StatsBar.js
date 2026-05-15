import React from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

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

