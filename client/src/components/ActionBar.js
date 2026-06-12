/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useRef } from 'react';

const ActionBar = ({ 
  user, 
  setShowDiscovery, 
  setDiscoveryTab, 
  setShowPrayerModal, 
  setShowMarket, 
  friendRequestsCount, 
  setShowApiKeyModal, 
  setShowCenterModal, 
  setShowAdminPanelModal, 
  setShowFlashModal,
  setShowWalletModal,
  setShowInvoiceModal,
  setShowCompanyModal,
  setShowDocEngineModal, // 👑 استقبال شريان تفعيل محرك المستندات
  setShowAiModal // 👈 👑 حقن دالة الـ AI الجديدة هنا
}) => {

  // 👑 مراجع ومحركات التحريك والتمرير الأفقي لشريط الأزرار الملكي بسلاسة
  const ouroScrollRef = useRef(null);

  const scrollOuroBar = (direction) => {
    if (ouroScrollRef.current) {
      const scrollAmount = 180; // المسافة الفيزيائية الحرة للتحريك بالبيكسل مع كل نقرة
      ouroScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  return (
    <div className="action-bar-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', background: 'rgba(0,0,0,0.2)', padding: '5px 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', margin: '10px 0' }}>
      
      {/* ⬅️ السهم الملكي الأيسر للتحريك والتمرير بنقاء */}
      <button 
        type="button" 
        onClick={() => scrollOuroBar('left')} 
        style={{ background: '#000', color: 'var(--gold-primary)', border: '1px solid var(--gold-primary)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, fontSize: '14px', fontWeight: 'bold', boxShadow: '0 0 8px rgba(212,175,55,0.3)', marginRight: '5px' }}
      >
        ‹
      </button>

      {/* 🎰 الحاوية الرئيسية العائمة والمرنة ذات التمرير الأفقي الحر للأزرار */}
      <div 
        ref={ouroScrollRef} 
        className="action-bar-scroll-wrapper" 
        style={{ flex: 1, display: 'flex', gap: '8px', overflowX: 'auto', scrollBehavior: 'smooth', padding: '5px 10px', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}
      >
        
        {/* 👑 رص الأزرار بمساحتهم الحرة دون نزول في الأسطر */}
        <button type="button" className="action-bar-btn" onClick={() => setShowWalletModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap' }}>🪙 المحفظة الرقمية</button>
        <button type="button" className="action-bar-btn" onClick={() => setShowInvoiceModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap', borderColor: '#27ae60' }}>🧾 محرك الفواتير</button>
        <button type="button" className="action-bar-btn" onClick={() => setShowCompanyModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap', borderColor: '#2980b9' }}>🏛️ إدارة الشركات</button>
        <button type="button" className="action-bar-btn" onClick={() => setShowDocEngineModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap', borderColor: '#e67e22' }}>📝 منشئ المستندات</button>
        <button type="button" className="action-bar-btn" onClick={() => setShowCenterModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap', borderColor: 'var(--gold-primary)' }}>🏫 قاعة السنتر</button>
        {/* 🕋 👑 [إضافة وحقن زر مواقيت الصلاة المستقل والشرعي] لفتح ملف PrayerWidget.js */}
        <button 
          type="button" 
          className="action-bar-btn" 
          onClick={() => { if (typeof setShowPrayerModal === 'function') setShowPrayerModal(true); }} 
          style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap', borderColor: '#9b59b6' }}
        >
          🕋 مواقيت الصلاة
        </button>

        {/* 🤖 الزر السيادي المطور لإطلاق المساعد الذكي المدفوع لـ جوجل Gemini */}
        <button 
          type="button" 
          className="action-bar-btn"
          onClick={() => { if (typeof setShowAiModal === 'function') setShowAiModal(true); }}
          style={{ borderColor: '#9b59b6', color: '#fff' }}
        >
          AI
        </button>


        {/* أزرار الخدمات التفاعلية المدمجة مسبقاً بمنصتك */}
        <button type="button" className="action-bar-btn" onClick={() => { setShowDiscovery(true); setDiscoveryTab('prayer'); }} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap' }}>الأصدقاء</button>
        <button type="button" className="action-bar-btn" onClick={() => setShowMarket(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap' }}>🛒 المتجر المفتوح</button>
        <button type="button" className="action-bar-btn" onClick={() => setShowFlashModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap' }}> الفلاشة </button>
        <button type="button" className="action-bar-btn" onClick={() => setShowApiKeyModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap' }}>🔑 API Key</button>
        
        {/* زر لوحة تحكم الأدمن لسيادتك Mostafa لرصد الموافقات */}
        {isAdmin && (
          <button type="button" className="action-bar-btn" onClick={() => setShowAdminPanelModal(true)} style={{ flex: '0 0 auto', minWidth: '130px', whiteSpace: 'nowrap', borderColor: '#c0392b', color: '#c0392b', fontWeight: 'bold' }}>⚙️ طلبات الإدارة</button>
        )}

      </div>

      {/* ➡️ السهم الملكي الأيمن للتحريك والتمرير بنقاء */}
      <button 
        type="button" 
        onClick={() => scrollOuroBar('right')} 
        style={{ background: '#000', color: 'var(--gold-primary)', border: '1px solid var(--gold-primary)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, fontSize: '14px', fontWeight: 'bold', boxShadow: '0 0 8px rgba(212,175,55,0.3)', marginLeft: '5px' }}
      >
        ›
      </button>

    </div>
  );
};

export default ActionBar;
