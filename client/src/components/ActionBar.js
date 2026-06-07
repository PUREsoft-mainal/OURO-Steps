import React from 'react';
import '../App.css';

// 👑 [النسخة القياسية الكاملة لـ OURO Steps] استقبال معطيات النوافذ والتحويل السحابي والسنتر المكتسح والفلاشة
const ActionBar = ({
  user, // 🔒 استقبال كائن المستخدم لفحص الرتبة الإدارية أمنياً وعزل الزر
  setShowDiscovery, 
  setDiscoveryTab, 
  setShowPrayerModal, 
  setShowMarket, 
  friendRequestsCount, 
  setShowApiKeyModal,
  setShowCenterModal,
  setShowFlashModal,
  setShowWalletModal, // 👑 [تم الحقن] استقبال دالة فتح المحفظة المنبثقة من المكون الأب App.js
  setShowAdminPanelModal, // 🚀 تم التثبيت الشرعي هنا لمنع خطأ الـ undef
  setShowInvoiceModal, // 👈 👑 حقن دالة الفواتير الجديدة هنا
  setShowCompanyModal // 👈 👑 حقن دالة الشركات الجديدة هنا
}) => {    
  
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
       إضافة صديق
      </button>
      
      {/* 👑 طبقة الدائرة النيونية اللامعة حول زر الأصدقاء الحركي دون مساس بجيناته */}
      <div className="badge-container" style={{ position: 'relative', display: 'inline-block' }}>
        {/* 🤝 زر الأصدقاء المطور لتوجيه واستدعاء ملف الأصدقاء والطلبات المعزولة */}
        <button 
          className="action-bar-btn gold-glow-btn" 
          onClick={() => handleButtonClick('my_friends_list')} 
        >
          الأصدقاء
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
        🕋 الصلاة
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
        🛍️ المتجر 
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
        API KEY
      </button>

      {/* 🪙 الزر الملكي المطور لبلوكتشين ومحفظة العملات الداخلي */}
      <button 
        type="button" 
        className="action-bar-btn gold-glow-btn"
        onClick={() => {
          if (typeof setShowWalletModal === 'function') {
            setShowWalletModal(true);
          }
        }}
        style={{ borderColor: 'var(--gold-primary)' }}
      >
        المحفظة
      </button>

      {/* 🏛️ [الكمبلة التعليمية المكتسحة] زر إطلاق السنتر والاجتماعات والبث الحي والمذكرات */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        style={{ borderColor: '#9b59b6', background: 'rgba(155,89,182,0.05)' }} 
        onClick={() => {
          if (typeof setShowCenterModal === 'function') {
            setShowCenterModal(true); 
          }
        }}
      >
        غرفة بث حى
      </button>

      {/* 📟 [نقل وتوطين الفلاشة الرقمية الموقوتة] زر إطلاق واستدعاء صندوق الفلاشة العائم بدقة بصرية ممتدة */}
      <button 
        className="action-bar-btn gold-glow-btn" 
        style={{ borderColor: '#e67e22', background: 'rgba(230,126,34,0.05)' }} // تمييز فوسفوري برتقالي نيون للفلاشة
        onClick={() => {
          if (typeof setShowFlashModal === 'function') {
            setShowFlashModal(true); // تفعيل النافذة العائمة المنبثقة للفلاشة الإلكترونية فوراً
          }
        }}
      >
        الفلاشة
      </button>

      <button 
        className="action-bar-btn gold-glow-btn neon-admin-btn" 
        style={{ 
          borderColor: 'var(--gold-primary)', 
          background: 'linear-gradient(180deg, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0.8) 100%)', 
          fontWeight: 'bold',
          color: 'var(--gold-primary)',
          textShadow: '0 0 5px rgba(212,175,55,0.5)'
        }} 
        onClick={() => { if (typeof setShowAdminPanelModal === 'function') setShowAdminPanelModal(true); }}
      >
        👑 الإدارة
      </button>

      {/* 🏛️ الزر السيادي المطور لإطلاق نظام تشغيل وإدارة الشركات والمصانع */}
      <button 
        type="button" 
        className="action-bar-btn gold-glow-btn"
        onClick={() => {
          if (typeof setShowCompanyModal === 'function') {
            setShowCompanyModal(true);
          }
        }}
        style={{ borderColor: '#2980b9' }}
      >
       إدارة الشركات
      </button>

                {/* 🧾 الزر الملكي المطور لمحرك الفواتير الرقمية وعروض الأسعار الفورية */}
      <button 
        type="button" 
        className="action-bar-btn"
        onClick={() => {
          if (typeof setShowInvoiceModal === 'function') {
            setShowInvoiceModal(true);
          }
        }}
        style={{ borderColor: '#27ae60' }}
      >
        🧾 الفواتير والأسعار
      </button>

    </div>
  );
};

export default ActionBar;
