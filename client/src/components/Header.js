import React, { useState } from 'react';
import axios from 'axios';
import StatsBar from './StatsBar';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const Header = ({ activeUsers, totalUsers, user }) => {
  const [showCS, setShowCS] = useState(false);
// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// تفعيل اتصال السوكت المشفر (WSS) ليعمل مع جدار الحماية السحابي
const socket = io(API_BASE, { 
  transports: ['polling', 'websocket'],
  secure: true,
  path: '/socket.io', // التأكيد على مسار البروكسي السحابي
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  rejectUnauthorized: false
});
  
  // دمج الحالة الخاصة بالصورة الشخصية الملكية مع وضع لوجو المنصة كصورة افتراضية
  const [avatar, setAvatar] = useState(user?.avatar ? `${API_BASE}${user.avatar}` : "/assets/logo.png");

  // دالة التعامل مع رفع الصورة الشخصية الفورية وتمريرها للسيرفر
  const handleAvatarChange = async (e) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);
    formData.append('username', user?.username || '');

    try {
      const res = await axios.post(`${API_BASE}/api/user/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setAvatar(`${API_BASE}${res.data.avatarUrl}`);
        alert("👑 تم تحديث صورتك الشخصية الملكية بنجاح أمام الجميع!");
      }
    } catch (err) {
      console.error("خطأ تحديث الأفاتار:", err);
      alert("❌ فشل تحديث الصورة، تحقق من تشغيل السيرفر المحلي.");
    }
  };

  return (
    <header className="ouro-header">

      {/* جهة اليمين: الإحصائيات + خدمة العملاء فقط */}
      <div className="header-right">
        <StatsBar activeCount={activeUsers} totalCount={totalUsers} />
        
        <div className="customer-service-container">
          <button className="cs-btn" onClick={() => setShowCS(!showCS)}>
            🎧 خدمة العملاء
          </button>
          
          {showCS && (
            <div className="cs-dropdown">
              <p>📞 <strong>واتساب:</strong> 01080166413</p>
              <p>💸 <strong>فودافون كاش:</strong> 01080166413</p>
              <p>📧 <strong>البريد:</strong> mostafadesha953@gmail.com</p>
              <p style={{fontSize: '10px', color: 'var(--gold-primary)'}}>نحن هنا لخدمتك دائماً</p>
            </div>
          )}
        </div>
      </div>

      {/* 👑 جهة اليسار المطور: عرض الصورة الشخصية المتوهجة بالنيون + اسم المستخدم + زر الخروج */}
      <div className="user-profile-section">
        <div className="avatar-picker-wrapper" title="اضغط هنا لتغيير صورتك الشخصية الملكية">
          {/* حقل رفع ملفات مخفي يتم تفعيله بالنقر على الصورة */}
          <input 
            type="file" 
            id="avatarUpInput" 
            accept="image/*" 
            hidden 
            onChange={handleAvatarChange} 
          />
          <img 
            src={avatar} 
            className="user-global-avatar" 
            alt="avatar" 
            onClick={() => document.getElementById('avatarUpInput').click()} 
          />
        </div>
        
        <span className="user-info-text"> {user && user.username ? user.username : "جاري التحميل..."}</span>
        <button onClick={() => window.location.reload()} className="logout-btn">خروج</button>
      </div>

    </header>
  );
};

export default Header;

