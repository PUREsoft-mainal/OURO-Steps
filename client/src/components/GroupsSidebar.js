import React, { useState } from 'react';
import axios from 'axios';

const GroupsSidebar = ({ groups, user, socket, currentGroup, onJoinRoom, triggerCreate }) => {
  // حالة لتخزين بيانات التواصل الاختيارية (الإعلانات)
  const [adData, setAdData] = useState({
    phone: '',
    whatsapp: '',
    telegram: '',
    email: ''
  });

  // دالة التعامل مع رفع الصور والبيانات للسيرفر السحابي
  const handleAdUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('adImage', selectedFile);
    formData.append('phone', adData.phone);
    formData.append('whatsapp', adData.whatsapp);
    formData.append('telegram', adData.telegram);
    formData.append('email', adData.email);

    try {
      // إرسال الطلب للمسار الصحيح في السيرفر السحابي (Hugging Face)
      const response = await axios.post('https://hf.space', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        alert("✅ تم رفع الإعلان التفاعلي بنجاح!");
        setAdData({ phone: '', whatsapp: '', telegram: '', email: '' });
      }
    } catch (error) {
      console.error("خطأ في الرفع:", error);
      alert("❌ فشل الاتصال بالسيرفر السحابي، تأكد من تشغيل Space.");
    }
  };

  return (
    <aside className="sidebar right-side">
      <h3 className="gold-text">🌐 المجموعات المتوفرة</h3>
      
      {/* 🛠️ تصحيح الزر: تم إضافة استدعاء الوظيفة triggerCreate القادمة من App.js */}
      <button 
        className="gold-btn royal-button" 
        onClick={() => {
            console.log("يتم الآن استدعاء وظيفة إنشاء الشات من المكون الفرعي...");
            if (typeof triggerCreate === 'function') {
                triggerCreate();
            } else {
                console.error("خطأ: وظيفة triggerCreate غير موجودة أو لم يتم تمريرها بشكل صحيح.");
            }
        }}
      >
        ➕ إنشاء شات ملكي جديد
      </button>

      <div className="groups-list">
        {/* عرض المجموعات مع تفعيل خاصية التبديل بينها */}
        {groups && groups.map((groupItem, index) => (
          <div 
            key={groupItem.id || groupItem._id || index} 
            className={`group-item ${currentGroup === (groupItem.id || groupItem._id) ? 'active-group' : ''}`}
            onClick={() => onJoinRoom(groupItem.id || groupItem._id)}
          >
            {groupItem.name}
          </div>
        ))}
      </div>

      {/* لوحة تحكم الإعلانات (تظهر فقط للأدمن مصطفى) */}
      {user && user.username === 'Admin_Mostafa' && (
        <div className="admin-controls-wrapper" style={{ marginTop: '20px', borderTop: '2px solid #d4af37', paddingTop: '15px' }}>
          <h4 style={{color: '#d4af37', fontSize: '13px', marginBottom: '10px'}}>⚙️ إدارة الإعلانات والبيانات</h4>
          
          <div className="admin-inputs-container" style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px'}}>
            <input 
              type="text" placeholder="رقم الهاتف الأساسي" className="admin-input"
              value={adData.phone} onChange={(e) => setAdData({...adData, phone: e.target.value})} 
            />
            <input 
              type="text" placeholder="رقم الواتساب (للتواصل المباشر)" className="admin-input"
              value={adData.whatsapp} onChange={(e) => setAdData({...adData, whatsapp: e.target.value})} 
            />
            <input 
              type="text" placeholder="معرف التلغرام (Username)" className="admin-input"
              value={adData.telegram} onChange={(e) => setAdData({...adData, telegram: e.target.value})} 
            />
          </div>

          <input 
            type="file" id="ad-upload-input-file" style={{ display: 'none' }} 
            accept="image/*" onChange={handleAdUpload}
          />
          
          <button 
            className="admin-gold-btn" 
            onClick={() => document.getElementById('ad-upload-input-file').click()}
            style={{width: '100%', padding: '10px', cursor: 'pointer'}}
          >
            🖼️ اختيار صورة الإعلان والرفع السحابي
          </button>
        </div>
      )}
    </aside>
  );
};

export default GroupsSidebar;
