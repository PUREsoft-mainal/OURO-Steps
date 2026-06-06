import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const VirtualFlash = ({ user, socket }) => {
  // 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
  const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";
  
  const [myFiles, setMyFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
    // 📟 [متغيرات جديدة] لإدارة وحفظ وقراءة مفتاح Google Drive API KEY الخاص بالفلاشة
  const [flashDriveApiKey, setFlashDriveApiKey] = useState("");
  const [isSavedFlashKey, setIsSavedFlashKey] = useState(false);

  // خطاف الجلب التلقائي لمفتاح درايف الفلاشة الخاص بالمستخدِم فور فتح الصندوق
  useEffect(() => {
    if (user?.username) {
      axios.post(`${API_BASE}/api/flash/get-drive-key`, { username: user.username })
        .then(res => {
          if (res.data && res.data.flashDriveApiKey) {
            setFlashDriveApiKey(res.data.flashDriveApiKey);
            setIsSavedFlashKey(true);
          }
        })
        .catch(() => {});
    }
  }, [user?.username]);

  // دالة حفظ وإرسال مفتاح جوجل درايف السحابي للفلاشة بقاعدة البيانات
  const handleSaveFlashDriveKey = async (e) => {
    e.preventDefault();
    if (!flashDriveApiKey.trim()) return alert("⚠️ الرجاء كتابة أو لصق مفتاح الـ API الخاص بـ Google Drive أولاً!");

    try {
      const res = await axios.post(`${API_BASE}/api/flash/save-drive-key`, {
        username: user?.username,
        flashDriveApiKey: flashDriveApiKey.trim()
      });
      if (res.data.success) {
        setIsSavedFlashKey(true);
        alert(res.data.message);
      }
    } catch (err) {
      alert("❌ فشل ربط مفتاح الفلاشة، تحقق من استقرار اتصال الشبكة.");
    }
  };


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

    // 🧹 دالة تنظيف مستمعات السوكت عند إغلاق واجهة الفلاشة
    return () => {
        if (socket) socket.off('flash_db_updated');
    };
  }, [user?.username, socket]);

  // 📥 دالة التعامل مع رفع الملفات أو المجلدات البرمجية المدمجة والمضغوطة
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
        // 👑 [تصحيح الإشعار] تعديل الرسالة لتتوافق بالملي مع التخزين الأزلي الدائم
        alert("💾 🎉 تم إيداع وتشفير الملف في خزنتك السحابية الدائمة بنجاح وأمان كامل!");
      }
      setUploading(false);
      e.target.value = ""; // إعادة تهيئة حقل الإدخال بنعومة
    } catch (err) {
      console.error(err);
      alert("❌ فشل إيداع الملف بالفلاشة، تحقق من السيرفر السحابي وقاعدة البيانات.");
      setUploading(false);
    }
  };

return (
    <div className="virtual-flash-box gold-border">
      <h4>⚡ فلاشة النقل والخزنة السحابية الدائمة لـ {user?.username} (Virtual USB)</h4>
      <p className="flash-notice-text">📟 يمكنك رفع برامجك، تطبيقاتك، أو هياكلك البرمجية (في مجلد مضغوط Zip) هنا بنقاء كامل. الملفات آمنة ومستقرة دائماً على سحابتك دون حذف تلقائي.</p>

      {/* 📟 [مربع مفتاح Google Drive للامركزية الفلاشة الإلكترونية] */}
      {user && (
        <form 
          onSubmit={handleSaveFlashDriveKey} 
          style={{ 
            display: 'flex', 
            background: 'rgba(230,126,34,0.05)', 
            padding: '14px', 
            borderRadius: '8px', 
            border: '2px solid #e67e22', 
            gap: '10px', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            marginBottom: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <span style={{ fontSize: '12px', color: '#e67e22', fontWeight: 'bold', whiteSpace: 'nowrap' }}>📟 Flash Drive API KEY:</span>
          <input 
            type="password" 
            placeholder={isSavedFlashKey ? "••••••••••••••••••••••••••••••••" : "الصق مفتاح الـ API KEY لحساب Google Drive المخصص لملفات فلاشتك..."}
            value={isSavedFlashKey ? "" : flashDriveApiKey}
            onChange={(e) => { setIsSavedFlashKey(false); setFlashDriveApiKey(e.target.value); }} 
            disabled={isSavedFlashKey && flashDriveApiKey}
            style={{ 
              flex: 1, 
              minWidth: '200px', 
              padding: '8px 12px', 
              background: '#000', 
              color: '#e67e22', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '4px', 
              fontSize: '12px', 
              fontFamily: 'monospace' 
            }}
          />
          <button 
            type="submit" 
            className="gold-btn-small" 
            style={{ 
              background: isSavedFlashKey ? '#27ae60' : '#e67e22', 
              color: '#fff', 
              fontWeight: 'bold', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '4px',
              fontSize: '11px', 
              cursor: 'pointer' 
            }}
          >
            {isSavedFlashKey ? "🔒 تم التفعيل" : "💾 حفظ المفتاح"}
          </button>
        </form>
      )}

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
        {myFiles.map((file, i) => {
          return (
            <div key={file.id || i} className="flash-file-card">
              <div className="flash-file-info">
                <span className="flash-file-name">📄 {file.originalName}</span>
                {/* 👑 [تحديث الحسم البصري] إبادة مؤشر الساعات المتبقية وضخ عبارة الثبات السحابي الدائم */}
                <small className="flash-file-meta">المساحة: {file.size} | الحالة: <strong style={{color:'var(--gold-primary)'}}>🔒 تخزين دائم ومأمن</strong></small>
              </div>
              
              {/* زر التنزيل الفوري المباشر للجهاز الآخر */}
              <a 
                href={`${API_BASE}/api/flash/download/${user?.username}/${file.filename}`}
                className="flash-download-btn-gold"
                download={file.originalName}
              >
                📥 تنزيل للجهاز
              </a>
            </div>
          );
        })}
        {myFiles.length === 0 && <p className="empty-flash-text">📟 الخزنة الافتراضية فارغة حالياً... لا توجد ملفات مودعة.</p>}
      </div>
    </div>
  );
};

export default VirtualFlash;
