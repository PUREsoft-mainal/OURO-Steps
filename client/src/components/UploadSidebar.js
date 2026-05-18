import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const UploadSidebar = ({ files, serverUrl, user }) => {
  const [statusText, setStatusText] = useState(""); // نص الحالة أو تعليق الوسائط
  const [isTextStatus, setIsTextStatus] = useState(false); // تحديد نوع الحالة (نصية أم وسائط)
  const [selectedBg, setSelectedBg] = useState("#8a6f27"); // اللون الافتراضي للحالات النصية

  // خيارات خلفيات النيون الفاخرة للستوري النصي
  const bgOptions = ["#8a6f27", "#1c1c1c", "#4a154b", "#0b3c5d", "#328cc1", "#d9534f", "#27ae60"];

  // دالة النشر المطورة (تتعامل مع الوسائط المرفقة بتعليق أو الحالة النصية النقية الملونة)
  const handlePublishStatus = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user', user?.username || 'مستخدم مجهول');
    formData.append('caption', statusText);

    if (isTextStatus) {
      if (!statusText.trim()) return alert("⚠️ الرجاء كتابة نص أولاً لنشره كحالة نصية!");
      formData.append('isTextOnly', 'true');
      formData.append('textBg', selectedBg);
    } else {
      const fileInput = document.getElementById('sideUpFiles');
      if (!fileInput || !fileInput.files[0]) return alert("⚠️ الرجاء اختيار ملف (صورة/فيديو/صوت) أولاً أو التبديل لحالة نصية!");
      formData.append('file', fileInput.files[0]);
      formData.append('isTextOnly', 'false');
    }

    try {
      const res = await axios.post(`${serverUrl}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("✅ تم نشر حالتك الملكية بنجاح ولمدة يومين!");
        setStatusText("");
        const fileInput = document.getElementById('sideUpFiles');
        if (fileInput) fileInput.value = ""; // تصفير حقل اختيار الملفات
      }
    } catch (err) {
      console.error("خطأ أثناء النشر المحلي للحالة:", err);
      alert("❌ فشل النشر، تأكد من اتصال السيرفر.");
    }
  };

  return (
    <aside className="sidebar left-side stories-sidebar">
      <h3>🎬 استوديو القصص (Stories)</h3>
      
      {/* 🛠️ لوحة تحكم إنشاء ونشر الحالات المطورة (نصية وملونة ووسائط) */}
      <div className="create-story-box" style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--border-glass)' }}>
        
        {/* أزرار التبديل العلوية المذهبة بين الوسائط والنص */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className={`cs-btn ${!isTextStatus ? 'active' : ''}`} style={{ flex: 1, fontSize:'11px', padding:'6px', borderRadius:'6px' }} onClick={() => setIsTextStatus(false)}>🖼️ قصة وسائط</button>
          <button type="button" className={`cs-btn ${isTextStatus ? 'active' : ''}`} style={{ flex: 1, fontSize:'11px', padding:'6px', borderRadius:'6px' }} onClick={() => setIsTextStatus(true)}>✍️ حالة نصية</button>
        </div>

        {/* صندوق الكتابة الذكي والتعليقات المشترك */}
        <textarea 
  className="story-caption-textarea" // إضافة اسم الكلاس هنا للتحكم الكامل
  value={statusText}
  onChange={(e) => setStatusText(e.target.value)}
  placeholder={isTextStatus ? "اكتب حالتك النصية الملكية هنا..." : "أضف تعليقاً ووصفاً يظهر مع القصة..."}
  required={isTextStatus}
          value={statusText}
          onChange={(e) => setStatusText(e.target.value)}
          placeholder={isTextStatus ? "اكتب حالتك النصية الملكية هنا..." : "أضف تعليقاً ووصفاً يظهر أسفل القصة..."}
          style={{ width: '100%', minHeight: '60px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
          required={isTextStatus}
        />

        {/* عرض عناصر الاختيار التفاعلية بناءً على التبويب النشط */}
        {!isTextStatus ? (
          <div>
            <input type="file" id="sideUpFiles" accept="image/*,video/*,audio/*" style={{ display: 'none' }} />
            <button className="upload-trigger" type="button" style={{ width: '100%', padding: '8px', fontSize:'12px' }} onClick={() => document.getElementById('sideUpFiles').click()}>
              📁 اختر الملف من جهازك (صورة/فيديو/صوت)
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', padding: '4px 0' }}>
            <span style={{ fontSize: '11px', color: 'var(--gold-primary)', whiteSpace: 'nowrap' }}>الخلفية:</span>
            {bgOptions.map(bg => (
              <div 
                key={bg} 
                onClick={() => setSelectedBg(bg)}
                style={{ width: '20px', height: '20px', borderRadius: '50%', background: bg, cursor: 'pointer', border: selectedBg === bg ? '2px solid #fff' : '1px solid #000', flexShrink: 0, transition: '0.2s' }}
              />
            ))}
          </div>
        )}

        {/* زر النشر العام الخاضع لتوحيد الـ CSS المذهب الفاخر */}
        <button className="gold-btn" type="button" style={{ padding: '10px', fontSize: '13px', width: '100%', marginTop: '4px' }} onClick={handlePublishStatus}>
          ✨ انشر الحالة التفاعلية
        </button>
      </div>

      {/* 📜 حاوية عرض وتصفح القصص والحالات النشطة */}
      <div className="stories-container scrollbar-gold">
        {(files || []).map((f, i) => {
          const fileUrl = f.url ? `${serverUrl}${f.url}` : null;
          const isVideo = f.name?.match(/\.(mp4|webm|ogg)$/i);
          const isImage = f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          const isAudio = f.name?.match(/\.(mp3|wav|ogg)$/i);

          return (
            <div key={f.id || i} className="story-card">
              <div className="story-user-info">
                <span className="user-dot">●</span> {f.user || "مستخدم مجهول"}
              </div>
              
              <div className="story-content">
                {/* 1. النشر النصي الملون على طريقة الفيس بوك والواتساب */}
                {f.isTextOnly ? (
                  <div style={{ background: f.textBg || '#1a1a1a', padding: '25px 15px', borderRadius: '8px', color: '#fff', textAlign: 'center', fontSize: '14px', fontStyle: 'normal', fontWeight: 'bold', wordBreak: 'break-word', textShadow: '2px 2px 4px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {f.caption}
                  </div>
                ) : (
                  <>
                    {/* 2. النشر الفعلي للوسائط المتعددة (صور/فيديو/صوت) */}
                    {isImage && <img src={fileUrl} alt="story" className="story-media" />}
                    {isVideo && (
                      <video controls className="story-media">
                        <source src={fileUrl} />
                      </video>
                    )}
                    {isAudio && (
                      <audio controls className="story-audio">
                        <source src={fileUrl} />
                      </audio>
                    )}
                    
                    {/* طباعة التعليق والوصف المصاحب للقصة بالأسفل بنقاء ممتاز */}
                    {f.caption && (
                      <p style={{ padding: '8px 10px', fontSize: '12px', color: '#f0f0f0', wordBreak: 'break-word', lineHeight: '1.4', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', marginTop: '8px', borderRight: '2px solid var(--gold-primary)' }}>
                        💬 {f.caption}
                      </p>
                    )}
                  </>
                )}
              </div>
              
              <div className="story-footer">
                {fileUrl ? (
                  <a href={fileUrl} download={f.name} target="_blank" rel="noreferrer" className="download-link">💾 حفظ الملف</a>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>📝 حالة نصية</span>
                )}
                <span className="story-time">{f.time || "منذ قليل"}</span>
              </div>
            </div>
          );
        })}
        {files.length === 0 && (
          <p className="empty-text" style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
            لا يوجد قصص أو حالات منشورة حالياً.
          </p>
        )}
      </div>
    </aside>
  );
};

export default UploadSidebar;

