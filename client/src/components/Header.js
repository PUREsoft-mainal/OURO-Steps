import React, { useState } from 'react';
import StatsBar from './StatsBar';

const Header = ({ activeUsers, totalUsers, user, onOpenDiscovery }) => {
  const [showCS, setShowCS] = useState(false);

  return (
    <header className="ouro-header">
      {/* 1. جهة اليمين: الإحصائيات + الخدمات */}
      <div className="header-right">
        <StatsBar activeCount={activeUsers} totalCount={totalUsers} />
        
        <div className="header-actions-group" style={{ display: 'flex', gap: '10px' }}>
          <button className="discovery-trigger-btn" onClick={onOpenDiscovery}>
            🌐 أصدقاء جدد & السوق
          </button>

          <div className="customer-service-container">
            <button className="cs-btn" onClick={() => setShowCS(!showCS)}>
              🎧 خدمة العملاء
            </button>
            
            {showCS && (
              <div className="cs-dropdown">
                <p>📞 <strong>واتساب:</strong> 01080166413</p>
                <p>💸 <strong>فودافون كاش:</strong> 01080166413</p>
                <p>📧 <strong>البريد:</strong> mostafadesha953@gmail.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. المنتصف: جملة الترحيب فقط */}
      <div className="header-center">
        <div className="welcome-msg">مرحباً بكم فى عالمكم الجديد</div>
      </div>

      {/* 3. جهة اليسار: المستخدم والخروج */}
      <div className="user-profile-section">
        <span className="user-info-text">👤 {user.username}</span>
        <button onClick={() => window.location.reload()} className="logout-btn">خروج</button>
      </div>

      {/* 👑 اللوجو الملكي: تم وضعه هنا ليكون حراً خارج تقسيمات الـ flex */}
      <img 
        src="/assets/logo.png" 
        className="royal-floating-logo" 
        alt="logo" 
      />
    </header>
  );
};

export default Header;
