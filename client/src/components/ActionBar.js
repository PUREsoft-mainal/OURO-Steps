import React from 'react';
import '../App.css';

// 👑 استقبال معطيات الدوال وتوجيه النقرات الفاخرة لـ OURO Steps
const ActionBar = ({ setShowDiscovery, setDiscoveryTab, setShowPrayerModal, setShowMarket, friendRequestsCount, setShowApiKeyModal }) => {    
  // 👑 [تم التفعيل والتوظيف الحركي] دالة ذكية معقمة لتفتيت التنبيهات وإطلاق النوافذ الموجهة فوراً
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
        onClick={() => handleButtonClick('friends')} // يفتح التبويب friends للاستكشاف
      >
        🔍 البحث عن صديق
      </button>
      
      {/* 👑 [إضافة التطوير الرقمي] حشر طبقة الدائرة النيونية اللامعة حول زر الأصدقاء الحركي دون مساس بجيناته */}
      <div className="badge-container" style={{ position: 'relative', display: 'inline-block' }}>
        {/* 🤝 زر الأصدقاء المطور لتوجيه واستدعاء ملف الأصدقاء والطلبات المعزولة */}
        <button 
          className="action-bar-btn gold-glow-btn" 
          onClick={() => handleButtonClick('my_friends_list')} // 👑 [تم الحسم] توجيه النقر للتبويب المحدث المأمن
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
            setShowMarket(true); // إطلاق واستدعاء الصندوق العائم للمتجر على الشاشة فوراً
          }
        }}
      >
        🛍️ المتجر الملكي
      </button>

      {/* ⚙️ [الكمبلة البرمجية المضافة] زر فتح واستدعاء بوابة الـ API واستخراج مفاتيح المطورين للموبايل */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        style={{ borderColor: '#27ae60' }} // تمييز مذهب مأمن للمطورين
        onClick={() => {
          if (typeof setShowApiKeyModal === 'function') {
            setShowApiKeyModal(true); // إطلاق نافذة استخراج المفاتيح والخصائص سحابياً
          }
        }}
      >
        ⚙️ مفاتيح API
      </button>
    </div>
  );
};

export default ActionBar;
import React from 'react';
import '../App.css';

// 👑 استقبال معطيات الدوال وتوجيه النقرات الفاخرة لـ OURO Steps
const ActionBar = ({ setShowDiscovery, setDiscoveryTab, setShowPrayerModal, setShowMarket, friendRequestsCount }) => {    
  // 👑 [تم التفعيل والتوظيف الحركي] دالة ذكية معقمة لتفتيت التنبيهات وإطلاق النوافذ الموجهة فوراً
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
        onClick={() => handleButtonClick('friends')} // يفتح التبويب friends للاستكشاف
      >
        🔍 البحث عن صديق
      </button>
      
      {/* 👑 [إضافة التطوير الرقمي] حشر طبقة الدائرة النيونية اللامعة حول زر الأصدقاء الحركي دون مساس بجيناته */}
      <div className="badge-container" style={{ position: 'relative', display: 'inline-block' }}>
        {/* 🤝 زر الأصدقاء المطور لتوجيه واستدعاء ملف الأصدقاء والطلبات المعزولة */}
        <button 
          className="action-bar-btn gold-glow-btn" 
          onClick={() => handleButtonClick('my_friends_list')} // 👑 [تم الحسم] توجيه النقر للتبويب المحدث المأمن
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

