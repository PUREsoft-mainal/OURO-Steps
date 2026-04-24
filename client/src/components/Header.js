import React, { useState } from 'react';
import StatsBar from './StatsBar';

const Header = ({ activeUsers, totalUsers, user }) => {
  const [showCS, setShowCS] = useState(false);

  return (
    <header className="ouro-header">
      {/* جهة اليمين: الإحصائيات + خدمة العملاء */}
      <div className="header-right">
        <StatsBar activeCount={activeUsers} totalCount={totalUsers} />
        
        <div className="customer-service-container">
          <button className="cs-btn" onClick={() => setShowCS(!showCS)}>
            🎧 خدمة العملاء
          </button>
          
          {showCS && (
            <div className="cs-dropdown">
              <p>📞 <strong>واتساب:</strong> 01080166413</p>
              <p>💸 <strong>فودافون كاش:</strong> 01080166413</p>
              <p>📧 <strong>البريد:</strong> mostafadesha953@gmail.com</p>
              <p style={{fontSize: '10px', color: 'var(--gold-primary)'}}>نحن هنا لخدمتك دائماً</p>
            </div>
          )}
        </div>
      </div>

      {/* المنتصف: جملة الترحيب + اللوجو */}
      <div className="header-center">
        <div className="welcome-msg">مرحباً بكم فى عالمكم الجديد</div>
        {/* تم حذف الـ style المباشر هنا ليعود التحكم لملف CSS */}
        <img 
          src="/assets/logo.png" 
          className="mini-logo" 
          alt="logo" 
        />
      </div>

      {/* جهة اليسار: اسم المستخدم + الخروج */}
      <div className="user-profile-section">
        <span className="user-info-text">👤 {user.username}</span>
        <button onClick={() => window.location.reload()} className="logout-btn">خروج</button>
      </div>
    </header>
  );
};

export default Header;

