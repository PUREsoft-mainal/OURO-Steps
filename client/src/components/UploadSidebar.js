import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const UploadSidebar = ({ files, serverUrl, onUpload, user }) => { 
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [storyFile, setStoryFile] = useState(null); // 👑 المتغير المخصص لحقن الصورة فيزيائياً بالذاكرة
  const [isTextStatus, setIsTextStatus] = useState(false); // تحديد نوع الحالة (نصية أم وسائط)
  const [textBg, setTextBg] = useState("#1a1a1a"); // اللون الافتراضي للحالة النصية
  const [selectedFileName, setSelectedFileName] = useState(""); // 👑 لتخزين اسم الملف المختار وعرضه للمستخدم
  
  // 👑 خيارات خلفيات النيون الفاخرة للستوري النصي المعتمدة بملفك
  const bgOptions = ["#8a6f27", "#1c1c1c", "#4a154b", "#0b3c5d", "#328cc1", "#d9534f", "#27ae60"];

  // 👑 دالة ذكية لمراقبة وتأمين التقاط الملف المختار من جهاز المستخدم وعرض اسمه
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setStoryFile(e.target.files[0]); // 👑 حقن الملف الفيزيائي بالكامل لمنع الـ 404
      setSelectedFileName(e.target.files[0].name); 
    } else {
      setStoryFile(null);
      setSelectedFileName("");
    }
  };
  
  // دالة النشر المطورة والمحمية من الكراش والتوجيه المكسور
  const handlePublishStatus = async (e) => {
    e.preventDefault();
    if (!user?.username) return alert("❌ يجب تسجيل الدخول أولاً بحسابك الملكي");
    
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('caption', caption.trim()); // استخدام متغير النص المعتمد بالـ textarea
    
    if (isTextStatus) {
      if (!caption.trim()) return alert("⚠️ الرجاء كتابة نص أولاً لنشره كحالة نصية!");
      formData.append('isTextOnly', 'true');
      formData.append('textBg', textBg); // إرسال لون النيون الذهبي المختار من المصفوفة
    } else {
      // 👑 التأكد من وجود الملف الفيزيائي المخزن بالذاكرة قبل الإرسال
      if (!storyFile) {
        return alert("⚠️ الرجاء اختيار ملف (صورة/فيديو/صوت) أولاً من مربع الاستقبال!");
      }
      formData.append('storyFile', storyFile); // 👑 ضخ الملف الفيزيائي الصافي مباشرة لملتر السحابي بنجاح
      formData.append('isTextOnly', 'false');
      formData.append('textBg', '#1a1a1a');
    }


    try {
      setUploading(true);
      // 👑 [تصحيح التوجيه السحابي الأزلي] الإرسال للمسار الشرعي المرتبط بـ MongoDB Atlas لحظر الـ 404
      const res = await axios.post(`${serverUrl}/api/upload-story`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

    if (res.data.success) {
            alert("👑 🎉 تم إيداع ونشر حالتك الملكية بنجاح في خزائن السحاب لـ 24 ساعة!");
            setCaption(""); // تصفير الصندوق الذكي
            setStoryFile(null); // 👑 [تمت الإضافة بنجاح] تصفير الملف فيزيائياً من الذاكرة فور اكتمال الرفع
        
            const fileInput = document.getElementById('sideUpFiles'); // مطابقة الـ ID مع المربع المطور بالأسفل
            if (fileInput) fileInput.value = ""; // تصفير حقل اختيار الملفات
        
            // تمرير البيانات للمكون الأب لإنعاش الشاشة لحظياً
            if (onUpload && res.data.file) {
              onUpload(res.data.file);
            }   
          }

      setUploading(false);
    } catch (err) {
      console.error("خطأ أثناء النشر السحابي للحالة المحدثة:", err);
      alert("❌ فشل النشر، تحقق من اتصال السيرفر السحابي وقاعدة البيانات.");
      setUploading(false);
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
          className="story-caption-textarea" 
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={isTextStatus ? "اكتب حالتك النصية الملكية هنا..." : "أضف تعليقاً ووصفاً يظهر أسفل القصة..."}
          style={{ width: '100%', minHeight: '60px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
          required={isTextStatus}
        />

        {/* عرض عناصر الاختيار التفاعلية بناءً على التبويب النشط */}
        {!isTextStatus ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* 👑 [إضافة مأمنة] حقن مستمع الالتقاط الفوري للملف وتخزين اسمه بالـ state الشغالة دون مساس بالبقية */}
            <input 
              type="file" 
              id="sideUpFiles" 
              accept="image/*,video/*,audio/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} // 👑 ربط واستدعاء الدالة العلوية باسمها لإنهاء تحذير الـ eslint                if (e.target.files && e.target.files[0])    
            />
            <button className="upload-trigger" type="button" style={{ width: '100%', padding: '8px', fontSize:'12px', cursor: 'pointer' }} onClick={() => document.getElementById('sideUpFiles').click()}>
              📁 اختر الملف من جهازك (صورة/فيديو/صوت)
            </button>
            
            {/* 👑 [إضافة مأمنة] حاوية إلكترونية مصغرة تلمح للمستخدم باسم الصورة أو الصوت الجاهز للإيداع السحابي */}
            {selectedFileName && (
              <small style={{ color: 'var(--gold-primary)', fontSize: '11px', textAlign: 'center', wordBreak: 'break-all', direction: 'ltr', marginTop: '2px', display: 'block', fontWeight: 'bold' }}>
                📎 جاهز للرفع: {selectedFileName}
              </small>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', padding: '4px 0' }}>
            <span style={{ fontSize: '11px', color: 'var(--gold-primary)', whiteSpace: 'nowrap' }}>الخلفية:</span>
            {bgOptions.map(bg => (
              <div 
                key={bg} 
                onClick={() => setTextBg(bg)}
                style={{ width: '20px', height: '20px', borderRadius: '50%', background: bg, cursor: 'pointer', border: textBg === bg ? '2px solid #fff' : '1px solid #000', flexShrink: 0, transition: '0.2s' }}
              />
            ))}
          </div>
        )}

        {/* زر النشر العام الخاضع لتوحيد الـ CSS المذهب الفاخر المأمن بالـ uploading قفلياً */}
        <button 
          className="gold-btn" 
          type="submit" 
          style={{ padding: '10px', fontSize: '13px', width: '100%', marginTop: '4px', cursor: uploading ? 'not-allowed' : 'pointer' }} 
          onClick={handlePublishStatus}
          disabled={uploading}
        >
          {uploading ? "⏳ جاري إيداع وحفظ الستوري..." : "✨ انشر الحالة التفاعلية"}
        </button>
      </div>

      {/* 📜 حاوية عرض وتصفح القصص والحالات النشطة */}
      <div className="stories-container scrollbar-gold">
        {(files || []).map((f, i) => {
          const fileUrl = f.url ? `${serverUrl}${f.url}` : null;
          // صيانة المعرّف ليفحص رابط الـ url السحابي النقي بدقة صلبة من مونجو
          const isVideo = f.url?.match(/\.(mp4|webm|ogg)$/i);
          const isImage = f.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          const isAudio = f.url?.match(/\.(mp3|wav|ogg)$/i);

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
                    {isImage && <img src={fileUrl} alt="story" className="story-media" crossOrigin="anonymous" />}
                    {isVideo && (
                      <video controls className="story-media" crossOrigin="anonymous">
                        <source src={fileUrl} />
                      </video>
                    )}
                    {isAudio && (
                      <audio controls className="story-audio" crossOrigin="anonymous">
                        <source src={fileUrl} />
                      </audio>
                    )}
                    
                    {/* طباعة التعليق والوصف المصاحب للقصة بالأسفل بنقاء ممتاز */}
                    {f.caption && (
                      <p style={{ padding: '8px 10px', fontSize: '12px', color: '#f0f0f0', wordBreak: 'break-word', lineHeight: '1.4', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', marginTop: '8px', borderRight: '2px solid var(--gold-primary)', textAlign: 'right' }}>
                        💬 {f.caption}
                      </p>
                    )}
                  </>
                )}
              </div>
              
              <div className="story-footer">
                {fileUrl ? (
                  <a href={fileUrl} download={`story-${f.id}`} target="_blank" rel="noreferrer" className="download-link">💾 حفظ الملف</a>
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

