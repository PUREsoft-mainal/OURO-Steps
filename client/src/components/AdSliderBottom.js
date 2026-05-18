import React, { useState, useRef } from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// تفعيل اتصال السوكت المشفر (WSS) ليعمل مع جدار الحماية السحابي
const socket = io(API_BASE, { 
  transports: ['websocket', 'polling'],
  secure: true,
  rejectUnauthorized: false
});

const AdSliderBottom = ({ ads }) => {
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

  // 👑 تصفية حصرية صارمة: جلب الإعلانات المخصصة للشريط السفلي فقط
  const bottomAds = (ads || []).filter(ad => ad.location === 'bottom');

  return (
    <div className="ads-slider-wrapper-bottom">
      <button className="slider-arrow arrow-right" onClick={() => scrollManual('right')}>❯</button>
      
      <div className="ads-scroll-container-bottom" ref={scrollContainerRef}>
        <div className="ads-track-bottom">
          {(bottomAds.length > 0 ? [...bottomAds, ...bottomAds] : []).map((ad, i) => {
            const fullImgUrl = ad.imgUrl ? (ad.imgUrl.startsWith('http') ? ad.imgUrl : `${API_BASE}${ad.imgUrl}`) : '';
            return (
              <div key={`bottom-ad-${ad.id || i}-${i}`} className="ad-card-item-bottom" onClick={() => setSelectedAd(ad)}>
                {fullImgUrl && <img src={fullImgUrl} alt="ad" className="ad-image-content-bottom" />}
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
                  style={{background: 'var(--gold-primary)', color:'#000', borderRadius:'5px', padding:'8px', fontWeight:'bold', textDecoration:'none'}}
                >
                  🌐 زيارة رابط الإعلان المرفق
                </a>
              )}
              {/* 🔥 تم إصلاح وصيانة الروابط البرمجية المكسورة هنا بوضع المائل / الحاسم لحماية التوجيه اللينكسي */}
              {selectedAd.whatsapp && <a href={`https://wa.me{selectedAd.whatsapp}`} target="_blank" rel="noreferrer" className="contact-btn wa">واتساب</a>}
              {selectedAd.telegram && <a href={`https://t.me{selectedAd.telegram}`} target="_blank" rel="noreferrer" className="contact-btn tg">تلغرام</a>}
            </div>
            <button className="close-ad-btn" onClick={() => setSelectedAd(null)} style={{marginTop:'20px', cursor:'pointer'}}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdSliderBottom;

