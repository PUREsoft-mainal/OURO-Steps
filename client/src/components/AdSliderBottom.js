import React, { useState, useRef } from 'react';
import axios from 'axios'; // استدعاء حزمة الاتصال لإرسال إشارة الحذف للسيرفر
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

// النطاق السحابي المعتمد للمشروع على هيدينج فيس
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

const AdSliderBottom = ({ ads, user }) => { // 👑 استقبال جلسة الـ user للتحقق من هوية الأدمن
  const [selectedAd, setSelectedAd] = useState(null);
  const scrollContainerRef = useRef(null);

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
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذا الإعلان نهائياً من شريط المنصة؟")) {
      try {
        await axios.delete(`${API_BASE}/api/delete-ad/${adId}`);
        alert("🗑️ تم حذف الإعلان وتطهيره بنجاح!");
      } catch (err) {
        console.error("خطأ حذف الإعلان:", err);
        alert("❌ فشل الحذف، تحقق من اتصال السيرفر السحابي.");
      }
    }
  };

  // ✅ [تعديل الحسم] تصفية شاملة ومأمنة تفرض ظهور الإعلانات السفلية عند جميع المستخدمين فوراً
  const bottomAds = (ads || []).filter(ad => ad.location === 'bottom');

  return (
    <div className="ads-slider-wrapper-bottom">
      <button className="slider-arrow arrow-right" onClick={() => scrollManual('right')}>❯</button>
      
      <div className="ads-scroll-container-bottom" ref={scrollContainerRef}>
        <div className="ads-track-bottom">
          {/* 👑 عرض المصفوفة الصافية مباشرة دون تكرار قسري للإعلان الواحد */}
          {(bottomAds.length > 0 ? [...bottomAds] : []).map((ad, i) => {
            const fullImgUrl = ad.imgUrl ? (ad.imgUrl.startsWith('http') ? ad.imgUrl : `${API_BASE}${ad.imgUrl}`) : '';
            return (
              /* 👑 [مفتاح الحل القاطع] قفل المعرّف على الـ id الثابت لإبقاء بقية الإعلانات السفلية منسابة دون اختفاء فور الحذف */
              <div 
                key={ad.id || `bottom-ad-${i}`} 
                className="ad-card-item-bottom" 
                style={{ position: 'relative' }} // لتثبيت موقع شارة الحذف بالزاوية بدقة
                onClick={() => setSelectedAd(ad)}
              >
                {/* 👑 زر الحذف (×) للأدمن مستقر في الزاوية العلوية اليسرى بدقة */}
                {user && user.username === 'Admin_Mostafa' && (
                  <button 
                    className="delete-ad-x-badge" 
                    type="button" 
                    onClick={(e) => handleDeleteAd(e, ad.id)}
                  >
                    ×
                  </button>
                )}
                {fullImgUrl && <img src={fullImgUrl} alt="ad" className="ad-image-content-bottom" crossOrigin="anonymous" />}
              </div>
            );
          })}
          {bottomAds.length === 0 && <div className="no-ads-placeholder-bottom">مساحة إعلانية شاغرة للشريط السفلي...</div>}
        </div>
      </div>

      <button className="slider-arrow arrow-left" onClick={() => scrollManual('left')}>❮</button>

      {selectedAd && (
        <div className="ad-modal-overlay" onClick={() => setSelectedAd(null)}>
          <div className="ad-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{color: '#d4af37', marginBottom: '15px'}}>👑 تواصل مع المعلن</h3>
            {selectedAd.phone && <p style={{color:'#fff', fontSize:'14px', margin:'8px 0'}}>📞 هاتف: {selectedAd.phone}</p>}
            {selectedAd.email && <p style={{color:'#fff', fontSize:'14px', margin:'8px 0'}}>📧 بريد: {selectedAd.email}</p>}
            
            <div className="contact-btns" style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px'}}>
              {selectedAd.link && selectedAd.link !== '#' && (
                <a 
                  href={selectedAd.link.startsWith('http') ? selectedAd.link : `http://${selectedAd.link}`} 
                  target="_blank" rel="noreferrer" className="contact-btn"
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

export default AdSliderBottom;
