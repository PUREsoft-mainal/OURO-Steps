import React from 'react';
import '../App.css';

// 👑 استقبال معطيات الدوال وتوجيه النقرات الفاخرة لـ OURO Steps
const ActionBar = ({ setShowDiscovery, setDiscoveryTab, setShowPrayerModal, setShowMarket }) => {  
  
  // 👑 [تم التفعيل والتوظيف الحركي] دالة ذكية معقمة لتفتيت التنبيهات وإطلاق النوافذ الموجهة فوراً
  const handleButtonClick = (tabName) => {
    if (typeof setDiscoveryTab === 'function' && typeof setShowDiscovery === 'function') {
      setDiscoveryTab(tabName);
      setShowDiscovery(true);
    }
  };

  return (
    <div className="ouro-action-bar">
      
      {/* 🔍 زر البحث عن صديق الموصول بالدالة الذكية لإنهاء الـ no-unused-vars */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('friends')} 
      >
        🔍 البحث عن صديق
      </button>
      
      {/* 🤝 زر الأصدقاء المطور الموصول بالدالة الذكية بنقاء معماري كامل */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('friends')}
      >
        🤝 الأصدقاء
      </button>

      {/* 🕋 زرع منظومة مواقيت الصلاة والأذان المنبثقة الفاخرة متمركزة في قلب شريط الأزرار */}
      <button 
        className="action-bar-btn gold-glow-btn prayer-zone-trigger-btn" 
        onClick={() => {
          if (typeof setShowPrayerModal === 'function') {
            setShowPrayerModal(true);
          }
        }}
      >
        🕋 مواقيت الصلاة
      </button>
      
      {/* 🛍️ زر المتجر الملكي المستقل لاستدعاء ملف الـ Market المطور */}
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
