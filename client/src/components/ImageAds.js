import React, { useRef } from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً


// نطاق السيرفر المحلي الخاص بجهازك لخدمة الصور
const API_BASE = "http://127.0.0.1:5050";

const ImageAds = ({ ads }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth / 2; // مقدار التحريك
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="ads-slider-wrapper">
      <button className="slider-arrow arrow-left" onClick={() => scroll('left')}>❮</button>
      
      <div className="ads-scroll-container" ref={scrollRef}>
        {ads && ads.length > 0 ? (
          ads.map((ad, i) => {
            // دمج النطاق المحلي مع مسار الصورة المستلم من السيرفر لمنع كسر الصور
            const fullImgUrl = ad.imgUrl ? (ad.imgUrl.startsWith('http') ? ad.imgUrl : `${API_BASE}${ad.imgUrl}`) : '';
            
            return (
              <a key={ad.id || i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="ad-card">
                {fullImgUrl && <img src={fullImgUrl} alt={`Ad ${i}`} className="ad-box-img" />}
              </a>
            );
          })
        ) : (
          <div className="no-ads-text">مساحة إعلانية شاغرة...</div>
        )}
      </div>

      <button className="slider-arrow arrow-right" onClick={() => scroll('right')}>❯</button>
    </div>
  );
};

export default ImageAds;

