import React from 'react';
import '../App.css';

// 👑 [النسخة القياسية المعقمة والمكتملة] استقبال معطيات الدوال وتوجيه النقرات الفاخرة لـ OURO Steps
const ActionBar = ({ setShowDiscovery, setDiscoveryTab, setShowPrayerModal, setShowMarket, friendRequestsCount, setShowApiKeyModal }) => {    
  
  // 👑 دالة ذكية معقمة لتفتيت التنبيهات وإطلاق النوافذ الموجهة فوراً دون تضارب
  const handleButtonClick = (tabName) => {
    if (typeof setDiscoveryTab === 'function' && typeof setShowDiscovery === 'function') {
      setDiscoveryTab(tabName);
      setShowDiscovery(true);
    }
  };

  return (
    <div className="ouro-action-bar">
      
      {/* 🔍 زر البحث عن صديق المطور لتوجيه لوحة الاستكشاف الصافية */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('friends')} 
      >
        🔍 البحث عن صديق
      </button>
      
      {/* 👑 طبقة الدائرة النيونية اللامعة حول زر الأصدقاء الحركي دون مساس بجيناته */}
      <div className="badge-container" style={{ position: 'relative', display: 'inline-block' }}>
        {/* 🤝 زر الأصدقاء المطور لتوجيه واستدعاء ملف الأصدقاء والطلبات المعزولة */}
        <button 
          className="action-bar-btn gold-glow-btn" 
          onClick={() => handleButtonClick('my_friends_list')} 
        >
          🤝 الأصدقاء
        </button>
        
        {/* 🔴 تنبثق الدائرة الحمراء النيونية النابضة بالحياة تلقائياً إذا كان هناك طلبات واردة معلقة أكبر من صفر */}
        {friendRequestsCount > 0 && (
          <span className="notification-badge-neon">{friendRequestsCount}</span>
        )}
      </div>

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
            setShowMarket(true); 
          }
        }}
      >
        🛍️ المتجر الملكي
      </button>

      {/* ⚙️ زر فتح واستدعاء بوابة الـ API واستخراج مفاتيح المطورين للموبايل والتطبيقات المأمن */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        style={{ borderColor: '#27ae60' }} 
        onClick={() => {
          if (typeof setShowApiKeyModal === 'function') {
            setShowApiKeyModal(true); 
          }
        }}
      >
        ⚙️ مفاتيح API
      </button>
    </div>
  );
};

export default ActionBar;
