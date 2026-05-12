import React, { useState } from 'react';
import StatsBar from './StatsBar';

const Header = ({ activeUsers, totalUsers, user, onOpenDiscovery }) => {
  const [showCS, setShowCS] = useState(false);

  return (
    <header className="ouro-header">
      
      <div className="header-right">
        <StatsBar activeCount={activeUsers} totalCount={totalUsers} />
        
        <div className="header-actions-group">
          <button className="discovery-trigger-btn" onClick={onOpenDiscovery}>
            🌐 أصدقاء جدد & السوق
          </button>

          <div className="customer-service-container">
            <button className="cs-btn" onClick={() => setShowCS(!showCS)}>
              🎧 خدمة العملاء
            </button>
            
            {showCS && (
              <div className="cs-dropdown">
                <p>واتساب: 01080166413</p>
                <p>فودافون كاش: 01080166413</p>
                <p>mostafadesha953@gmail.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="welcome-msg">مرحباً بكم فى عالمكم الجديد</div>
      </div>

      <div className="user-profile-section">
        <span className="user-info-text">👤 {user.username}</span>
        <button onClick={() => window.location.reload()} className="logout-btn">خروج</button>
      </div>

      {/* اللوجو يتبع كلاس royal-floating-logo المسجل في App.css فقط */}
      <img 
        src="/assets/logo.png" 
        className="royal-floating-logo" 
        alt="logo" 
      />
      
    </header>
  );
};

export default Header;
