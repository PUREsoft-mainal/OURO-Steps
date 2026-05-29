import React from 'react';
import './UserProfile.css'; // ربط الجمال بالوظيفة هنا فقط

// 👑 [تحديث الترويسة] استقبال مصفوفة كائن المستخدم الكلي user لقراءة وصب عنوان محفظة ال-ID الفريدة
const UserProfile = ({ username, onLogout, user }) => {
  return (
    <div className="royal-user-card">
      <div className="user-icon">👤</div>
      <div className="user-details">
        <span className="username-label">المستخدم الملكي</span>
        <span className="username-value">{username}</span>
      </div>

      {/* 🪙 [البصمة الختامية البصرية] حقن وعرض عنوان محفظة الـ ID الفريد للمستخدم داخل كارت البروفايل لمنع الأسود */}
      <div className="user-wallet-card-gold" style={{ marginTop: '10px', padding: '6px 10px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', border: '1px solid var(--gold-primary, #d4af37)', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
        <span style={{ color: 'var(--gold-primary, #d4af37)', fontSize: '10px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
          🪙 محفظة OURO (مشتقة من الـ ID الفريد):
        </span>
        <code style={{ display: 'block', color: '#27ae60', fontSize: '9px', wordBreak: 'break-all', userSelect: 'all', fontFamily: 'monospace', fontWeight: '6px' }}>
          {user?.ouroWalletAddress || `0x7627OUROamek11619917627h38j4l5G84P8354...جاري السحب`}
        </code>
      </div>

      <button className="royal-logout-btn" onClick={onLogout} style={{ marginTop: '10px' }}>خروج</button>
    </div>
  );
};

export default UserProfile;
