import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const VirtualFlash = ({ user, socket }) => {
  // 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
  const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

  // 🔥 [تم التطهير والإصلاح] تم حذف كود حجز السوكت المكرر (const socket = io) نهائياً لمنع الكراش وحظر الـ CORS
  // المكون سيعتمد الآن مباشرة وبسلاسة على الـ socket الممرر بالأعلى والمشفر من الـ App.js
  
  const [myFiles, setMyFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchFlashFiles = async () => {
      if (!user?.username) return;
      try {
        const res = await axios.get(`${API_BASE}/api/flash/files/${user.username}`);
        setMyFiles(res.data || []);
      } catch (err) {
        console.error("خطأ جلب ملفات الفلاشة:", err);
      }
    };
    fetchFlashFiles();

    // الاستماع لتحديثات الفلاشة الفورية عند الرفع أو الإعادة الآلية عبر السوكت المركزي
    if (socket) {
      socket.on('flash_db_updated', (data) => {
          const userFiles = data.filter(f => f.owner === user?.username);
          setMyFiles(userFiles);
      });
    }

    return () => {
        if (socket) socket.off('flash_db_updated');
    };
  }, [user?.username, socket]);

  // دالة التعامل مع رفع الملفات أو المجلدات البرمجية المدمجة والمضغوطة
  const handleFlashUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const formData = new FormData();
    formData.append('flashFile', file);
    formData.append('username', user?.username);

    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/api/flash/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("💾 🎉 تم إيداع وحفظ الملف في فلاشتك الافتراضية بنجاح ولمدة 72 ساعة!");
      }
      setUploading(false);
      e.target.value = ""; // إعادة تهيئة حقل الإدخال
    } catch (err) {
      console.error(err);
      alert("❌ فشل إيداع الملف بالفلاشة، تحقق من السيرفر السحابي.");
      setUploading(false);
    }
  };

  return (
    <div className="virtual-flash-box gold-border">
      <h4>⚡ فلاشة النقل والمزامنة الذكية لـ {user?.username} (Virtual USB)</h4>
      <p className="flash-notice-text">📟 يمكنك رفع برامجك، تطبيقاتك، أو هياكلك البرمجية (في مجلد مضغوط Zip) هنا لنقلها مباشرة لأي جهاز آخر. الملفات تُباد تلقائياً بعد 72 ساعة.</p>
      
      {/* زر الرفع المذهب والمطور للفلاشة السحابية المحلية */}
      <div className="flash-upload-zone">
        <input type="file" id="vFlashUp" hidden onChange={handleFlashUpload} />
        <button 
          className="action-bar-btn gold-glow-btn" 
          style={{ width: '100%', maxWidth: '100%' }}
          onClick={() => {
            const inputEl = document.getElementById('vFlashUp');
            if (inputEl) inputEl.click();
          }}
          disabled={uploading}
        >
          {uploading ? "⏳ جاري إيداع وحفظ الملف بالفلاشة..." : "📤 إيداع ملف / مجلد برمي مدمج بالفلاشة"}
        </button>
      </div>

      {/* جدول وسجلات الملفات المودعة بالفلاشة حالياً */}
      <div className="flash-files-list scrollbar-gold">
        {myFiles.map(file => {
          // حساب الساعات المتبقية للملف قبل التدمير التلقائي
          const hoursLeft = Math.max(0, Math.ceil((file.expiryDate - Date.now()) / (1000 * 60 * 60)));
          return (
            <div key={file.id} className="flash-file-card">
              <div className="flash-file-info">
                <span className="flash-file-name">📄 {file.originalName}</span>
                <small className="flash-file-meta">المساحة: {file.size} | المتبقي: <strong style={{color:'var(--gold-primary)'}}>{hoursLeft} ساعة</strong> ⏳</small>
              </div>
              
              {/* زر التنزيل الفوري المباشر للجهاز الآخر */}
              <a 
                href={`${API_BASE}/api/flash/download/${user.username}/${file.filename}`}
                className="flash-download-btn-gold"
                download={file.originalName}
              >
                📥 تنزيل للجهاز
              </a>
            </div>
          );
        })}
        {myFiles.length === 0 && <p className="empty-flash-text">📟 الفلاشة الافتراضية فارغة حالياً... لا توجد ملفات مودعة.</p>}
      </div>
    </div>
  );
};

export default VirtualFlash;
