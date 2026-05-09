import React from 'react';
import axios from 'axios';

const GroupsSidebar = ({ groups, onCreateGroup, user, socket, currentGroup, onJoinRoom }) => {
  
  // دالة التعامل مع رفع صورة الإعلان
  const handleAdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const link = prompt("أدخل الرابط الذي سيفتحه الإعلان (اختياري):") || "#";
    
    const formData = new FormData();
    formData.append('adImage', file);
    formData.append('link', link);

    try {
      // إرسال الصورة للسيرفر عبر المسار الذي أنشأناه
      await axios.post('http://127.0.0.1:5050', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("✅ تم رفع الإعلان بنجاح وسيظهر للجميع فوراً!");
    } catch (error) {
      console.error("خطأ في رفع الإعلان:", error);
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
        {groups.map((g, i) => (
          <div 
            key={g.id || i} 
            className={`group-item ${currentGroup === g.id ? 'active-group' : ''}`}
            onClick={() => onJoinRoom(g.id)}
          >
            {g.name}
          </div>
        ))}
      </div>

      {/* قسم الأدمن المطور لرفع الصور */}
      {user && user.username === 'Admin_Mostafa' && (
        <div className="admin-controls" style={{ marginTop: '20px', borderTop: '1px solid var(--bronze-border)', paddingTop: '15px' }}>
          
          {/* حقل رفع ملف مخفي */}
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
            (سيظهر الإعلان في المربعات العلوية 20×20)
          </p>
        </div>
      )}
    </aside>
  );
};

export default GroupsSidebar;

