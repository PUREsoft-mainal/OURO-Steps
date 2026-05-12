import React from 'react';
import './UserProfile.css'; // ربط الجمال بالوظيفة هنا فقط

const UserProfile = ({ username, onLogout }) => {
  return (
    <div className="royal-user-card">
      <div className="user-icon">👤</div>
      <div className="user-details">
        <span className="username-label">المستخدم الملكي</span>
        <span className="username-value">{username}</span>
      </div>
      <button className="royal-logout-btn" onClick={onLogout}>خروج</button>
    </div>
  );
};

export default UserProfile;
