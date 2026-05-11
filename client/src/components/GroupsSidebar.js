import React, { useState } from 'react';
import axios from 'axios';

const GroupsSidebar = ({ groups, user, socket, currentGroup, onJoinRoom, triggerCreate }) => {
  const [adData, setAdData] = useState({
    phone: '',
    whatsapp: '',
    telegram: '',
    email: ''
  });

  // دالة رفع الإعلانات مع تصحيح المسار ليتوافق مع السيرفر
  const handleAdUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('adImage', selectedFile);
    formData.append('phone', adData.phone);
    formData.append('whatsapp', adData.whatsapp);
    formData.append('telegram', adData.telegram);
    formData.append('email', adData.email);

    try {
      // الرابط المسئول عن الرفع في السيرفر هو /api/upload-ad
      const response = await axios.post('https://hf.space', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        alert("✅ تم رفع الإعلان بنجاح!");
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
      
      {/* هذا الزر يستدعي الوظيفة القادمة من App.js مباشرة */}
      <button className="gold-btn" onClick={triggerCreate}> ➕ إنشاء شات جديد </button>

      <div className="groups-list">
        {groups.map((g, i) => (
          <div 
            key={g.id || g._id || i} 
            /* تصحيح: مقارنة الـ ID الحالي بالجروب المختار لعمل اللون الذهبي (Active) */
            className={`group-item ${currentGroup === (g.id || g._id) ? 'active-group' : ''}`}
            /* تصحيح: استدعاء onJoinRoom لتبديل الغرف في App.js */
            onClick={() => onJoinRoom(g.id || g._id)}
          >
            {g.name}
          </div>
        ))}
      </div>

      {/* قسم الأدمن - مخصص فقط لـ Admin_Mostafa */}
      {user && user.username === 'Admin_Mostafa' && (
        <div className="admin-controls" style={{ marginTop: '20px', borderTop: '2px solid #d4af37', paddingTop: '15px' }}>
          <h4 style={{color: '#d4af37', fontSize: '12px'}}>⚙️ إدارة الإعلانات التفاعلية</h4>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px'}}>
            <input 
              type="text" placeholder="رقم الهاتف" className="admin-input"
              value={adData.phone} onChange={(e) => setAdData({...adData, phone: e.target.value})} 
            />
            <input 
              type="text" placeholder="رقم الواتساب" className="admin-input"
              value={adData.whatsapp} onChange={(e) => setAdData({...adData, whatsapp: e.target.value})} 
            />
            <input 
              type="text" placeholder="معرف التلغرام" className="admin-input"
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
        </div>
      )}
    </aside>
  );
};

export default GroupsSidebar;
