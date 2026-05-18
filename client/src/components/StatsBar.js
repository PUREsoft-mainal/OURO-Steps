import React from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً


const StatsBar = ({ activeCount, totalCount }) => {
  return (
    <div className="stats-bar-wrapper">
      <div className="stat-item active-users-glow">
        <span className="green-pulse-dot">●</span> المتصلون الآن: <strong className="gold-text-highlight">{activeCount}</strong>
      </div>
      <div className="stat-item registered-users-box">
        👑 الأعضاء المسجلون: <strong className="gold-text-highlight">{totalCount}</strong>
      </div>
    </div>
  );
};

export default StatsBar;

