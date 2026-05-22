import React from 'react';
import '../App.css';

// 👑 استقبال setShowPrayerModal لتوجيه نقرة زر الكعبة المشرفة نافذياً
const ActionBar = ({ setShowDiscovery, setDiscoveryTab, setShowPrayerModal }) => {
  
  // دالة ذكية للتحكم في فتح النافذة وتوجيه التبويب في نفس اللحظة
  const handleButtonClick = (tabName) => {
    setDiscoveryTab(tabName);
    setShowDiscovery(true);
  };

  return (
    <div className="ouro-action-bar">
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('friends')}
      >
        🔍 إضافة أصدقاء
      </button>
      
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('friends')}
      >
        🤝 الأصدقاء
      </button>

      {/* 👑 زرع منظومة مواقيت الصلاة والأذان المنبثقة الفاخرة متمركزة في قلب شريط الأزرار */}
      <button 
        className="action-bar-btn gold-glow-btn prayer-zone-trigger-btn" 
        onClick={() => setShowPrayerModal(true)}
      >
        🕋 مواقيت الصلاة
      </button>
      
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('market')}
      >
        🛍️ السوق الملكي
      </button>
    </div>
  );
};

export default ActionBar;
