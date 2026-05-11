import React, { useState } from 'react';
import axios from 'axios';

const GroupsSidebar = ({ groups, user, socket, currentGroup, onGroupSelect, onCreateGroup }) => {  // حالة لتخزين بيانات التواصل الاختيارية
  const [adData, setAdData] = useState({
    phone: '',
    whatsapp: '',
    telegram: '',
    email: ''
  });

  // دالة إنشاء مجموعة جديدة عبر السوكيت
  const handleCreateGroup = () => {
    const name = prompt("👑 أدخل اسم الشات الجديد:");
    if (name) {
      socket.emit('create_group', { groupName: name });
    }
  };

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
      // تصحيح الرابط ليكون السيرفر السحابي (Hugging Face) بدلاً من localhost
      const response = await axios.post('https://puresoft-mainal-ouro-steps.hf.space', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        alert("✅ تم رفع الإعلان مع بيانات التواصل بنجاح!");
        setAdData({ phone: '', whatsapp: '', telegram: '', email: '' });
        e.target.value = ""; 
      }
    } catch (error) {
      console.error("Error details:", error.response || error);
      alert("❌ فشل الرفع، تأكد من اتصال السيرفر السحابي.");
    }
  };

  return (
    <aside className="sidebar right-side">
      <h3>🌐 المجموعات</h3>
      
      {/* زر إنشاء شات جديد المربوط بالسوكيت */}
      <button className="gold-btn" onClick={onCreateGroup}>
        ➕ إنشاء شات جديد
      </button>

      <div className="groups-list">
        {groups.map((g, i) => (
          <div 
            key={g.id || g._id || i} 
            className={`group-item ${currentGroup?.id === (g.id || g._id) ? 'active-group' : ''}`}
            onClick={() => onGroupSelect({ id: g.id || g._id, name: g.name })}
          >
            {g.name}
          </div>
        ))}
      </div>

      {/* قسم الأدمن - رفع الإعلان مع البيانات */}
      {user && user.username === 'Admin_Mostafa' && (
        <div className="admin-controls" style={{ marginTop: '20px', borderTop: '2px solid #d4af37', paddingTop: '15px' }}>
          <h4 style={{color: '#d4af37', fontSize: '12px'}}>⚙️ إدارة الإعلانات التفاعلية</h4>
          
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
