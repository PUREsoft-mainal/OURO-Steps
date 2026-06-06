import React, { useState } from 'react';
import '../App.css';

// 📸 كبسولة الـ Slider المحدثة لتقليب وعرض صور البضاعة المستوردة من درايف الأدمن Mostafa
const ProductImageSlider = ({ images, apiBase }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = images?.length || 0;

  if (total === 0) return <div className="fb-img-wrapper"><img src="/assets/logo.png" alt="Ouro" className="fb-product-img" /></div>;

  // 👑 [صياغة الرابط السيادي المحمي للتحميل والعرض الحركي طيراناً من حساب الأدمن]
  const driveImgUrl = images[currentIndex].startsWith('/uploads') 
    ? `${apiBase}${images[currentIndex]}` 
    : `${apiBase}/api/flash/download/Admin_Mostafa/${images[currentIndex]}`; // سحب الصورة حياً من درايف الأدمن عبر جسر السيرفر

  return (
    <div className="ouro-slider-container" style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '8px', background: '#070707', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
      <div className="fb-img-wrapper" style={{ cursor: 'pointer', textAlign: 'center', position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => window.open(driveImgUrl, '_blank')}>
        <img src={driveImgUrl} alt="product" className="fb-product-img" style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }} />
      </div>
      {total > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + total) % total); }} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', zIndex: 10 }}>‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % total); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', zIndex: 10 }}>›</button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 0', background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              {images.map((_, idx) => (
                <div key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentIndex === idx ? 'var(--gold-primary)' : 'rgba(255,255,255,0.2)', cursor: 'pointer' }} />
              ))}
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'bold' }}>
              📸 الصورة {currentIndex + 1} من {total}
            </small>
          </div>
        </>
      )}
    </div>
  );
};

// 🛍️ المكون الرئيسي للمتجر المستقل المتكامل بكافة الخصائص
const Market = ({ user, marketPosts, handleMarketUpload, handleDeletePost, setNewPost, newPost, apiBase, onClose }) => {
  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '900px' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0 }}>🛍️ السوق الملكي الفاخر (OURO Market)</h3>
          <button className="close-discovery" onClick={onClose}>❌ إغلاق</button>
        </div>

        {/* تفعيل شريط التمرير المذهب scrollbar-gold مع تحديد أبعاد مرنة للراحة البصرية */}
        <div className="discovery-body scrollbar-gold" style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '5px' }}>
          <div className="market-section-layout">
            
            {/* 📣 فورم عرض السلع وبث المنتجات الجديد */}
            <form className="market-upload-form gold-border" onSubmit={handleMarketUpload}>
              <h4>📣 عرض بضاعة جديدة (حتى 10 صور للمنتج)</h4>
              <textarea 
                placeholder="اكتب وصف البضاعة بالتفصيل للمشترين..." 
                value={newPost.description || ""}
                onChange={e => setNewPost({...newPost, description: e.target.value})} 
                required 
              />
              <input 
                type="text" 
                placeholder="💰 حدد السعر المطلوب لبيعها (مثال: 500 جنيه)..." 
                value={newPost.price || ""}
                onChange={e => setNewPost({...newPost, price: e.target.value})} 
                required 
              />
              <div className="file-input-wrapper-gold">
                <input 
                  type="file" 
                  multiple={true} // 🔒 تفعيل التظليل المتعدد لجميع أنظمة التشغيل والموبايل
                  accept="image/*" 
                  name="marketImages" // مطابقة اسم الحقل مع مولتر السيرفر لصب الحزم بنقاء
                  onChange={e => {
                    // تحويل قائمة الملفات الملتقطة فوراً إلى مصفوفة صلبة ومستقرة لمنع الفقد الرقمي
                    const selectedFiles = Array.from(e.target.files || []);
                    setNewPost({ ...newPost, files: selectedFiles });
                  }} 
                  required 
                />
              </div>
              <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '10px' }}>نشر في معرض السوق المفتوح</button>
            </form>

            {/* 🛍️ فيد وعرض المنتجات التفاعلي الفاخر الموصول بـ الـ Slider */}
            <div className="market-facebook-feed">
              {marketPosts.map(post => {
                const canDelete = user && (post.uploader === user.username || user.username === 'Admin_Mostafa');
                return (
                  <div key={post.id} className="facebook-post-card gold-border">
                    <div className="fb-post-header">
                      <div className="fb-uploader-meta">
                        <span className="fb-uploader-avatar">👑</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="fb-uploader-name">{post.uploader}</span>
                          <small className="fb-post-time">تم النشر: {post.time}</small>
                        </div>
                      </div>
                      {canDelete && (
                        <button className="fb-delete-btn" onClick={() => handleDeletePost(post.id)} title="حذف السلعة وإلغاء المنشور نهائياً">
                          ×
                        </button>
                      )}
                    </div>

                    <div className="fb-post-body">
                      <p className="fb-product-desc">{post.description}</p>
                      <div className="fb-price-badge">
                        <span>السعر المطلوب للبيع:</span> <strong>{post.price}</strong>
                      </div>
                    </div>

                    {/* 👑 صب واستدعاء كبسولة الـ Slider المطور لتقليب الصور المتعددة بنقاء */}
                    <ProductImageSlider images={post.images} apiBase={apiBase} />

                    <div className="fb-post-footer">
                      <span className="warranty-tag">🛡️ فحص آمن - متبقي على الصلاحية حتى 3 أشهر تلقائياً</span>
                    </div>
                  </div>
                );
              })}
              {marketPosts.length === 0 && <p className="empty-text-gold">معرض البضائع شاغر حالياً... كن أول من يعرض سلعته الملكية!</p>}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Market;
