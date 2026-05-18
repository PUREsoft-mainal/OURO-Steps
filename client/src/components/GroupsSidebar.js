import React, { useState } from 'react';
import axios from 'axios'; // الاستدعاء الصحيح والوحيد النقي
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const GroupsSidebar = ({ groups, onCreateGroup, user, currentGroup, onJoinRoom, socket }) => {
  // 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
  const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

  // 🔥 [تم التطهير والإصلاح] تم حذف كود (const socket = io) المكرر والمسبب للكراش نهائياً من هنا
  // المكون سيعتمد الآن بنقاء كامل على الـ socket الممرر في الترويسة بالأعلى والمشفر من الـ App.js
  
  const [showModMenu, setShowModMenu] = useState(null); // منسدلة التعيين

  // حالة مطورة لتخزين بيانات التواصل بالإضافة إلى خانة الرابط المرفق والمدة
  const [adData, setAdData] = useState({
    link: '', 
    phone: '',
    whatsapp: '',
    telegram: '',
    email: '', 
    duration: '30', // القيمة الافتراضية شهر (30 يوم كحد أدنى)
    location: 'top' // الموضع الافتراضي للشريط (العلوى)
  });

  // دالة التعامل مع رفع الإعلان وإقران البيانات المتعددة معه فوراً للسيرفر
  const handleAdUpload = async (e) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('adImage', selectedFile);
    formData.append('duration', adData.duration);
    formData.append('link', adData.link);
    formData.append('phone', adData.phone);
    formData.append('whatsapp', adData.whatsapp);
    formData.append('telegram', adData.telegram);
    formData.append('email', adData.email);
    formData.append('location', adData.location);

    try {
      // تم تصحيح توحيد المتجر هنا ليعتمد على axios الصافية فوراً
      const response = await axios.post(`${API_BASE}/api/upload-ad`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        alert("✅ تم رفع الإعلان التفاعلي الشامل برابطه وبياناته بنجاح!");
        setAdData({ link: '', phone: '', whatsapp: '', telegram: '', email: '', duration: '30' });
        e.target.value = ""; 
      }
    } catch (error) {
      console.error("خطأ أثناء رفع الإعلان المحلي للأدمن:", error);
      alert("❌ فشل الرفع، تأكد من اتصال السيرفر.");
    }
  };

  // دالة إرسال إشارة حذف المجموعة (×) للسيرفر
  const handleDeleteRoom = (e, roomId) => {
    e.stopPropagation(); // منع فتح الشات عند الضغط على زر الحذف
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذه المجموعة وملف محادثتها نهائياً؟")) {
        socket.emit('delete_group', { roomId });
    }
  };

  // دالة تعيين المشرفين من قبل المنشئ
  const handleSetMod = (roomId, modType) => {
    const modUsername = prompt(`أدخل اسم المستخدم لتعيينه كمشرف ${modType === 'mod1' ? 'أول' : 'ثاني'}:`);
    if (modUsername && modUsername.trim()) {
        socket.emit('assign_group_moderator', { roomId, modType, modUsername: modUsername.trim() });
        setShowModMenu(null);
    }
  };

  return (
    <aside className="sidebar right-side">
      <h3>🌐 غرف المجموعات</h3>
      
      <button className="gold-btn" onClick={onCreateGroup}>
        ➕ إنشاء شات مخصص جديد
      </button>

      <div className="groups-list">
        {(groups || []).map((g, i) => {
          const isOwner = user && (user.username === g.creator || user.username === 'Admin_Mostafa' || user.role === 'Admin' || user.username === g.mod1 || user.username === g.mod2);
          const isCreatorOnly = user && user.username === g.creator;

          return (
            <div 
              key={g.id || i} 
              className={`group-item-container ${currentGroup === g.id ? 'active-group-box' : ''}`}
              onClick={() => onJoinRoom && onJoinRoom(g.id)}
            >
              <div className="group-item-meta">
                <span className="group-name-text">💬 {g.name}</span>
                <small className="group-owner-tag">بواسطة: {g.creator}</small>
              </div>

              <div className="group-action-controls">
                {isCreatorOnly && (
                  <button className="mod-settings-btn" onClick={(e) => { e.stopPropagation(); setShowModMenu(showModMenu === g.id ? null : g.id); }}>
                    👑 المشرفين
                  </button>
                )}
                
                {isOwner && g.id !== 'public' && (
                  <button className="delete-group-badge" onClick={(e) => handleDeleteRoom(e, g.id)}>×</button>
                )}
              </div>

              {showModMenu === g.id && (
                <div className="mod-assignment-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button className="assign-btn-gold" onClick={() => handleSetMod(g.id, 'mod1')}>🛡️ تعيين مشرف أول</button>
                  <button className="assign-btn-gold" onClick={() => handleSetMod(g.id, 'mod2')}>🛡️ تعيين مشرف ثاني</button>
                  <div className="mods-status-text">
                    {g.mod1 && `👤 مشرف 1: ${g.mod1}`} {g.mod1 && <br/>}
                    {g.mod2 && `👤 مشرف 2: ${g.mod2}`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* قسم الأدمن المطور لرفع الإعلانات الشاملة مذهبة أسفل قائمة المجموعات */}
      {user && (user.username === 'Admin_Mostafa' || user.role === 'Admin' || String(user.username).toLowerCase().includes('admin')) && (
        <div className="admin-controls" style={{ marginTop: '25px', borderTop: '2px solid var(--gold-primary)', paddingTop: '15px' }}>
          <h4 style={{ color: 'var(--gold-glow)', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>⚙️ إدارة الإعلانات التفاعلية</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            <input 
              type="text" placeholder="🔗 ارفاق رابط الإعلان (اختياري)" className="admin-input"
              value={adData.link} onChange={(e) => setAdData({...adData, link: e.target.value})} 
            />

            {/* 👑 إضافة زر (مكان النشر) ذو الاختيارات المحددة (العلوى) و (السفلى) عند رفع الإعلان */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '11px', color: 'var(--gold-primary)', whiteSpace: 'nowrap' }}>مكان النشر:</label>
              <select 
                className="admin-input" 
                style={{ width: '138px', background: '#000', color: '#fff', cursor: 'pointer', border: '1px solid var(--border-glass)', padding: '6px', borderRadius: '6px' }}
                value={adData.location} 
                onChange={(e) => setAdData({...adData, location: e.target.value})}
              >
                <option value="top">الشريط العلوى ⬆️</option>
                <option value="bottom">الشريط السفلى ⬇️</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '11px', color: 'var(--gold-primary)', whiteSpace: 'nowrap' }}>⏳ مدة العرض (أيام):</label>
              <input 
                type="number" min="30" placeholder="أقل شيء 30 يوم" className="admin-input" style={{ flex: 1, maxWidth: '90px', textAlign: 'center' }}
                value={adData.duration} onChange={(e) => setAdData({...adData, duration: e.target.value})} 
              />
            </div>


            <input 
              type="text" placeholder="📞 رقم الهاتف" className="admin-input"
              value={adData.phone} onChange={(e) => setAdData({...adData, phone: e.target.value})} 
            />
            <input 
              type="text" placeholder="💬 رقم الواتساب (بدون +)" className="admin-input"
              value={adData.whatsapp} onChange={(e) => setAdData({...adData, whatsapp: e.target.value})} 
            />
            <input 
              type="text" placeholder="✈️ معرف التلغرام (Username)" className="admin-input"
              value={adData.telegram} onChange={(e) => setAdData({...adData, telegram: e.target.value})} 
            />
            <input 
              type="email" placeholder="📧 البريد الإلكتروني" className="admin-input"
              value={adData.email} onChange={(e) => setAdData({...adData, email: e.target.value})} 
            />
          </div>

          <input 
            type="file" id="ad-upload-input" style={{ display: 'none' }} 
            accept="image/*" onChange={handleAdUpload}
          />
          
          <button className="admin-gold-btn" type="button" onClick={() => document.getElementById('ad-upload-input').click()}>
            🖼️ اختر الصورة واضغط للرفع الفوري
          </button>
        </div>
      )}

    </aside>
  );
};

export default GroupsSidebar;

