import React, { useState } from 'react';
import axios from 'axios';

const GroupsSidebar = ({ groups, onCreateGroup, user, socket, currentGroup, onJoinRoom }) => {
  // حالة لتخزين بيانات التواصل الاختيارية
  const [adData, setAdData] = useState({
    phone: '',
    whatsapp: '',
    telegram: '',
    email: ''
  });

  const handleAdUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('adImage', selectedFile);
    // إرسال البيانات الإضافية مع الصورة
    formData.append('phone', adData.phone);
    formData.append('whatsapp', adData.whatsapp);
    formData.append('telegram', adData.telegram);
    formData.append('email', adData.email);

    try {
      const response = await axios.post('http://127.0.0.1:5050/api/upload-ad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        alert("✅ تم رفع الإعلان مع بيانات التواصل بنجاح!");
        // تصفير الحقول بعد النجاح
        setAdData({ phone: '', whatsapp: '', telegram: '', email: '' });
        e.target.value = ""; 
      }
    } catch (error) {
      console.error("Error details:", error.response || error);
      alert("❌ فشل الرفع، تأكد من اتصال السيرفر.");
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

      {/* قسم الأدمن - رفع الإعلان مع البيانات */}
      {user && user.username === 'Admin_Mostafa' && (
        <div className="admin-controls" style={{ marginTop: '20px', borderTop: '2px solid var(--gold-primary)', paddingTop: '15px' }}>
          <h4 style={{color: 'var(--gold-glow)', fontSize: '12px'}}>⚙️ إدارة الإعلانات التفاعلية</h4>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px'}}>
            <input 
              type="text" placeholder="رقم الهاتف" className="admin-input"
              value={adData.phone} onChange={(e) => setAdData({...adData, phone: e.target.value})} 
            />
            <input 
              type="text" placeholder="رقم الواتساب (بدون +)" className="admin-input"
              value={adData.whatsapp} onChange={(e) => setAdData({...adData, whatsapp: e.target.value})} 
            />
            <input 
              type="text" placeholder="معرف التلغرام (Username)" className="admin-input"
              value={adData.telegram} onChange={(e) => setAdData({...adData, telegram: e.target.value})} 
            />
          </div>

          <input 
            type="file" id="ad-upload-input" style={{ display: 'none' }} 
            accept="image/*" onChange={handleAdUpload}
          />
          
          <button className="admin-gold-btn" onClick={() => document.getElementById('ad-upload-input').click()}>
            🖼️ اختر الصورة واجهة الإعلان
          </button>
          
          <p style={{ fontSize: '9px', color: '#8e6d45', marginTop: '5px' }}>
            (سيتم دمج البيانات المكتوبة أعلاه مع الصورة فور الرفع)
          </p>
        </div>
      )}
    </aside>
  );
};

export default GroupsSidebar;

