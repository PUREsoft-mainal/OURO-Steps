import React, { useState, useRef } from 'react';
import axios from 'axios'; // استدعاء حزمة الاتصال لإرسال إشارة الحذف للسيرفر
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

// النطاق السحابي المعتمد للمشروع على هيدينج فيس
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

const AdSlider = ({ ads, user }) => { // 👑 استقبال جلسة الـ user للتحقق من هوية الأدمن
  const [selectedAd, setSelectedAd] = useState(null);
  
  // 👑 استخدام المرجع الداخلي (Ref) لتمييز الشريط ومنع تداخل أجهزة الحركة بالمتصفح
  const scrollContainerRef = useRef(null);

  // دالة الأسهم اليدوية لتصفح الإعلانات يدوياً باستخدام المرجع الذكي
  const scrollManual = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // دالة إرسال طلب حذف الإعلان للسيرفر السحابي فوراً
  const handleDeleteAd = async (e, adId) => {
    e.stopPropagation(); // منع فتح نافذة تفاصيل الإعلان عند الضغط على زر الحذف
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذا الإعلان نهائياً من منصة OURO Steps؟")) {
      try {
        await axios.delete(`${API_BASE}/api/delete-ad/${adId}`);
        alert("🗑️ تم حذف الإعلان وتطهيره بنجاح!");
      } catch (err) {
        console.error("خطأ حذف الإعلان:", err);
        alert("❌ فشل الحذف، تأكد من اتصال السيرفر السحابي.");
      }
    }
  };

  // ✅ [تعديل الحسم] تصفية شاملة ومأمنة تجعل الإعلانات تظهر لجميع الزوار والمستخدمين دون تضارب
  const topAds = (ads || []).filter(ad => !ad.location || ad.location === 'top' || ad.location === '');

  return (
    <div className="ads-slider-wrapper">
      <button className="slider-arrow arrow-right" onClick={() => scrollManual('right')}>❯</button>
      
      {/* ربط الحاوية بالمرجع الفريد الصارم لمنع تداخل أجهزة الإيقاف والحركة */}
      <div className="ads-scroll-container" ref={scrollContainerRef}>
        <div className="ads-track">
          {/* 👑 عرض المصفوفة الصافية مباشرة دون تكرار قسري للإعلان الواحد */}
          {(topAds.length > 0 ? [...topAds] : []).map((ad, i) => {
            // حماية كسر حظر المتصفح: التأكد من صياغة مسار URL نقي ومتوافق أمنياً
            const fullImgUrl = ad.imgUrl 
              ? (ad.imgUrl.startsWith('http') ? ad.imgUrl : `${API_BASE}${ad.imgUrl}`) 
              : '';
              
            return (
              /* 👑 [مفتاح الحل القاطع] ربط الـ key بـ ad.id المعزول بالذاكرة لمنع اختفاء بقية الإعلانات فور الحذف */
              <div 
                key={ad.id || `top-ad-${i}`} 
                className="ad-card-item" 
                style={{ position: 'relative' }} // تثبيت المواقع للزر العائم بالزاوية
                onClick={() => setSelectedAd(ad)}
              >
                {/* 👑 زر الحذف النيوني الذكي يظهر فقط وحصرياً لحسابك الملكي بالزاوية */}
                {user && user.username === 'Admin_Mostafa' && (
                  <button 
                    className="delete-ad-x-badge" 
                    type="button" 
                    onClick={(e) => handleDeleteAd(e, ad.id)}
                  >
                    ×
                  </button>
                )}
                
                {fullImgUrl && <img src={fullImgUrl} alt="ad" className="ad-image-content" crossOrigin="anonymous" />}
              </div>
            );
          })}
          {topAds.length === 0 && <div className="no-ads-placeholder">مساحة إعلانية شاغرة للشريط العلوي...</div>}
        </div>
      </div>

      <button className="slider-arrow arrow-left" onClick={() => scrollManual('left')}>❮</button>

      {/* 👑 نافذة التواصل المنبثقة التفاعلية الشاملة */}
      {selectedAd && (
        <div className="ad-modal-overlay" onClick={() => setSelectedAd(null)}>
          <div className="ad-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{color: '#d4af37', marginBottom: '15px'}}>👑 تواصل مع المعلن</h3>
            
            {selectedAd.phone && <p style={{color:'#fff', fontSize:'14px', margin:'8px 0'}}>📞 هاتف: {selectedAd.phone}</p>}
            {selectedAd.email && <p style={{color:'#fff', fontSize:'14px', margin:'8px 0'}}>📧 بريد: {selectedAd.email}</p>}
            
            <div className="contact-btns" style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px'}}>
              
              {/* 🔗 الزر الذهبي المطور لعرض وزيارة رابط الإعلان المرفق الخارجي */}
              {selectedAd.link && selectedAd.link !== '#' && (
                <a 
                  href={selectedAd.link.startsWith('http') ? selectedAd.link : `http://${selectedAd.link}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="contact-btn"
                  style={{background: 'var(--gold-primary)', color:'#000', borderRadius:'5px', padding:'8px', fontWeight:'bold', textDecoration:'none', textAlign: 'center'}}
                >
                  🌐 زيارة رابط الإعلان المرفق
                </a>
              )}
              
              {/* 👑 [تم الدمج والحسم بالملي] - تصحيح شريان الروابط بالشرطة المائلة والرسالة المشفرة الموجهة */}
              {selectedAd?.whatsapp && (
                <a 
                  href={`https://wa.me{selectedAd.whatsapp.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-btn wa"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                >
                  واتساب 💬
                </a>
              )}
              
              {selectedAd?.telegram && (
                <a 
                  href={`https://t.me{selectedAd.telegram.replace('@', '').trim()}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-btn tg"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                >
                  تلغرام ✈️
                </a>
              )}

            </div>
            
            <button className="close-ad-btn" onClick={() => setSelectedAd(null)} style={{marginTop:'20px', cursor:'pointer'}}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdSlider;
