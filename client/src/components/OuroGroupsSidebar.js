import React from 'react';
import axios from 'axios';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const GroupsSidebar = ({ groups, onCreateGroup, user, currentGroup, onJoinRoom }) => {
// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// تفعيل اتصال السوكت المشفر (WSS) ليعمل مع جدار الحماية السحابي
const socket = io(API_BASE, { 
  transports: ['websocket', 'polling'],
  secure: true,
  rejectUnauthorized: false
});

  // دالة التعامل مع رفع صورة الإعلان
  const handleAdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const link = prompt("أدخل الرابط الذي سيفتحه الإعلان (اختياري):") || "#";
    
    const formData = new FormData();
    formData.append('adImage', file);
    formData.append('link', link);

    try {
      // تصحيح المسار ليتجه إلى api/upload-ad المعتمد بالسيرفر المحلي
      const response = await axios.post(`${API_BASE}/api/upload-ad`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.success) {
        alert("✅ تم رفع الإعلان بنجاح وسيظهر للجميع فوراً!");
        e.target.value = ""; 
      }
    } catch (error) {
      console.error("خطأ في رفع الإعلان المحلي:", error);
      alert("❌ فشل رفع الإعلان، تأكد من اتصال السيرفر.");
    }
  };

  return (
    <aside className="sidebar right-side">
      <h3>🌐 المجموعات</h3>
      
      <button className="gold-btn" onClick={onCreateGroup}>
        ➕ إنشاء شات جديد
      </button>

      <div className="groups-list">
        {(groups || []).map((g, i) => (
          <div 
            key={g.id || i} 
            className={`group-item ${currentGroup === g.id ? 'active-group' : ''}`}
            onClick={() => onJoinRoom && onJoinRoom(g.id)}
          >
            {g.name}
          </div>
        ))}
      </div>

      {/* حماية كائن الأدمن لضمان عدم توقف الصفحة وفحص الاسم والرتبة معاً */}
      {user && (user.username === 'Admin_Mostafa' || user.role === 'Admin') && (
        <div className="admin-controls" style={{ marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
          
          <input 
            type="file" 
            id="ad-upload-input" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleAdUpload}
          />
          
          <button className="admin-gold-btn" onClick={() => document.getElementById('ad-upload-input').click()}>
            🖼️ رفع إعلان من الجهاز
          </button>
          
          <p style={{ fontSize: '10px', color: '#8e6d45', marginTop: '5px' }}>
            (سيظهر الإعلان في شريط الإعلانات التفاعلي علوياً)
          </p>
        </div>
      )}
    </aside>
  );
};

export default GroupsSidebar;

