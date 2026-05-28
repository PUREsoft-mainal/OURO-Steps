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
        onClick={() => { setDiscoveryTab('friends'); setShowDiscovery(true); }} // 🔥 [تعديل الحسم] فتح الاستكشاف فورا 
      >
        🔍 البحث عن صديق
      </button>
      
      {/* 🤝 زر الأصدقاء المطور لتوجيه واستدعاء ملف الأصدقاء الحصري تلقائياً */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => {
          if (typeof setShowDiscovery === 'function' && typeof setDiscoveryTab === 'function') {
            setDiscoveryTab('friends'); // تحويل التبويب لملف الأصدقاء
            setShowDiscovery(true);    // إطلاق واستدعاء الصندوق العائم على الشاشة فوراً
          }
        }}
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
        onClick={() => {
          if (typeof setShowMarket === 'function') {
            setShowMarket(true); // إطلاق واستدعاء الصندوق العائم للمتجر على الشاشة فوراً
          }
        }}
      >
        🛍️ المتجر الملكي
      </button>
    </div>
  );
};

export default ActionBar;
