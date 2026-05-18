import React, { useState, useRef } from 'react';
import io from 'socket.io-client'; // 🔥 سطر الحل الحاسم لمنع الكراش
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// تفعيل اتصال السوكت المشفر (WSS) ليعمل مع جدار الحماية السحابي
const socket = io(API_BASE, { 
  transports: ['polling', 'websocket'],
  secure: true,
  path: '/socket.io', // التأكيد على مسار البروكسي السحابي
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  rejectUnauthorized: false
});


const AdSlider = ({ ads }) => {
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

  // 👑 تصفية حصرية للشريط العلوي فقط (الذي يحمل كلاس top أو المرفوع قديماً تلقائياً)
  const topAds = (ads || []).filter(ad => !ad.location || ad.location === 'top');

  return (
    <div className="ads-slider-wrapper">
      <button className="slider-arrow arrow-right" onClick={() => scrollManual('right')}>❯</button>
      
      {/* ربط الحاوية بالمرجع الفريد الصارم لمنع تداخل أجهزة الإيقاف والحركة */}
      <div className="ads-scroll-container" ref={scrollContainerRef}>
        <div className="ads-track">
          {/* نكرر مصفوفة الإعلانات العلوية لضمان حركة التمرير المستمرة المستقرة بالـ CSS */}
          {(topAds.length > 0 ? [...topAds, ...topAds] : []).map((ad, i) => {
            const fullImgUrl = ad.imgUrl ? `${API_BASE}${ad.imgUrl}` : '';
            return (
              <div key={`top-ad-${ad.id || i}-${i}`} className="ad-card-item" onClick={() => setSelectedAd(ad)}>
                {fullImgUrl && <img src={fullImgUrl} alt="ad" className="ad-image-content" />}
              </div>
            );
          })}
          {topAds.length === 0 && <div className="no-ads-placeholder">مساحة إعلانية شاغرة للشريط العلوي...</div>}
        </div>
      </div>

      <button className="slider-arrow arrow-left" onClick={() => scrollManual('left')}>❮</button>

      {/* 👑 نافذة التواصل المنبثقة التفاعلية الشاملة (تظهر فور النقر على أي إعلان) */}
      {selectedAd && (
        <div className="ad-modal-overlay" onClick={() => setSelectedAd(null)}>
          <div className="ad-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{color: '#d4af37', marginBottom: '15px'}}>👑 تواصل مع المعلن</h3>
            
            {/* عرض الحقول المستلمة محلياً من السيرفر فورا إذا كانت متوفرة */}
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
                  style={{background: 'var(--gold-primary)', color:'#000', borderRadius:'5px', padding:'8px', fontWeight:'bold', textDecoration:'none'}}
                >
                  🌐 زيارة رابط الإعلان المرفق
                </a>
              )}
              
              {/* 🔥 تم تصحيح مسار روابط الدمج النصي هنا بوضع علامة المائل / لمنع كسر التوجيه كلياً في نظام اللينكس */}
              {selectedAd.whatsapp && 
                <a href={`https://wa.me{selectedAd.whatsapp}`} target="_blank" rel="noreferrer" className="contact-btn wa">واتساب</a>}
              {selectedAd.telegram && 
                <a href={`https://t.me{selectedAd.telegram}`} target="_blank" rel="noreferrer" className="contact-btn tg">تلغرام</a>}
            </div>
            
            <button className="close-ad-btn" onClick={() => setSelectedAd(null)} style={{marginTop:'20px', cursor:'pointer'}}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdSlider;

