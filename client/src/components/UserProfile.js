import React from 'react';
import './UserProfile.css';

// 👑 [نسخة التصفية المطهّرة] كارت بروفايل العضو الصافي والمأمن 100% من أي شوائب أو أشرطة زائدة
const UserProfile = ({ username, onLogout }) => {
  return (
    <div className="royal-user-card">
      <div className="user-icon">👤</div>
      <div className="user-details">
        <span className="username-label">المستخدم الملكي</span>
        <span className="username-value">{username}</span>
      </div>
      <button className="royal-logout-btn" onClick={onLogout} style={{ marginTop: '10px' }}>خروج</button>
    </div>
  );
};

export default UserProfile;
