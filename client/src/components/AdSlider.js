import React, { useState } from 'react';

const AdSlider = ({ ads }) => {
  const [selectedAd, setSelectedAd] = useState(null);

  // دالة الأسهم اليدوية
  const scrollManual = (direction) => {
    const container = document.querySelector('.ads-scroll-container');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="ads-slider-wrapper">
      <button className="slider-arrow arrow-right" onClick={() => scrollManual('right')}>❯</button>
      
      <div className="ads-scroll-container">
        <div className="ads-track">
          {/* نكرر المصفوفة لضمان حركة مستمرة ونضيف وظيفة الضغط لفتح التواصل */}
          {(ads && ads.length > 0 ? [...ads, ...ads] : []).map((ad, i) => (
            <div key={i} className="ad-card-item" onClick={() => setSelectedAd(ad)}>
              <img src={ad.imgUrl} alt="ad" className="ad-image-content" />
            </div>
          ))}
          {(!ads || ads.length === 0) && <div className="no-ads-placeholder">مساحة إعلانية شاغرة...</div>}
        </div>
      </div>

      <button className="slider-arrow arrow-left" onClick={() => scrollManual('left')}>❮</button>

      {/* نافذة خيارات التواصل الملكية */}
      {selectedAd && (
        <div className="ad-modal-overlay" onClick={() => setSelectedAd(null)}>
          <div className="ad-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{color: '#d4af37'}}>👑 تواصل مع المعلن</h3>
            
            {selectedAd.phone && <p style={{color:'#fff'}}>📞 هاتف: {selectedAd.phone}</p>}
            {selectedAd.email && <p style={{color:'#fff'}}>📧 بريد: {selectedAd.email}</p>}
            
            <div className="contact-btns">
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

