import React, { useEffect, useRef } from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const ChatArea = ({ chat, currentUser, msg, setMsg, socket, currentGroup }) => {
  const messagesEndRef = useRef(null);
  
  // 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
  const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

  // 🔥 [تم التطهير والإصلاح] تم حذف كود تعريف السوكت المكرر (const socket = io) من هنا نهائياً لحل الكراش السحابي
  // المكون سيعتمد الآن مباشرة وبسلاسة على الـ socket الممرر بالأعلى والمشفر سحابياً من الـ App.js
 // دالة للنزول التلقائي إلى أسفل المحادثة عند استقبال رسالة جديدة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const send = (e) => {
    e.preventDefault();
    if(msg.trim() && currentGroup) {
      // إرسال الرسالة حصرياً لملف المجموعة المفتوحة حالياً بالسيرفر المحلي
      socket.emit('sendGroupMessage', { 
        roomId: currentGroup.id, 
        text: msg.trim() 
      });
      setMsg("");
    }
  };

  // دالة وسيطة لتعيين المشرفين مباشرة من زران أعلى الشات
  const handleSetModFromHeader = (modType) => {
    if (!currentGroup || !socket) return;
    const modUsername = prompt(`أدخل اسم المستخدم لتعيينه كمشرف ${modType === 'mod1' ? 'أول' : 'ثاني'} لهذه المجموعة:`);
    if (modUsername && modUsername.trim()) {
      socket.emit('assign_group_moderator', { 
        roomId: currentGroup.id, 
        modType, 
        modUsername: modUsername.trim() 
      });
    }
  };

  // التحقق الأمني الجانبي المصحح: هل المستخدم هو منشئ الغرفة، الأدمن العام، أو يحمل رتبة أدمن في الشات الحالي؟
  const isCreatorOrAdmin = currentGroup && currentUser && (
    currentUser === currentGroup.creator || 
    currentUser === 'Admin_Mostafa' || 
    chat.some(m => m.user === currentUser && m.role === 'Admin')
  );

  return (
    <main className="chat-area">
      {/* 👑 شريط رأس الغرفة المطور الحاضن للزرين والبيانات التفاعلية في الأعلى */}
      <div className="chat-room-header" style={{ padding: '12px 20px', background: 'rgba(10, 10, 10, 0.7)', borderBottom: '2px solid var(--border-glass)', fontSize: '13px', color: 'var(--gold-primary)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* جهة اليمين: معلومات الغرفة والمنشئ الأصلي للملف */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span>📢 غُرفة المحادثة: {currentGroup ? currentGroup.name : "جاري التحميل..."}</span>
          <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>المنشئ: {currentGroup?.creator || 'النظام'}</small>
        </div>

        {/* جهة اليسار: شارات المشرفين الحاليين + الزران المذهبان لتعيين الإدارة في الأعلى */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* عرض المشرف الأول والثاني فور تعيينهم لحظياً بداخل الشات */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentGroup?.mod1 && <span className="participant-tag" style={{ fontSize: '11px', padding: '3px 8px' }}>🛡️ مشرف 1: {currentGroup.mod1}</span>}
            {currentGroup?.mod2 && <span className="participant-tag" style={{ fontSize: '11px', padding: '3px 8px' }}>🛡️ مشرف 2: {currentGroup.mod2}</span>}
          </div>

          {/* تفعيل الزران المذهبان في الأعلى لمنشئ المجموعة أو الأدمن فقط */}
          {isCreatorOrAdmin && currentGroup?.id !== 'public' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="assign-btn-gold" 
                style={{ padding: '5px 12px', fontSize: '11px', cursor: 'pointer' }}
                onClick={() => handleSetModFromHeader('mod1')}
              >
                🛡️ + مشرف أول
              </button>
              <button 
                className="assign-btn-gold" 
                style={{ padding: '5px 12px', fontSize: '11px', cursor: 'pointer' }}
                onClick={() => handleSetModFromHeader('mod2')}
              >
                🛡️ + مشرف ثاني
              </button>
            </div>
          )}
          
        </div>

      </div>

      <div className="messages">
        {(chat || []).map((m, i) => (
          <div key={m.id || i} className={`msg ${m.user === currentUser ? 'my-msg' : 'other-msg'}`}>
            <div className="msg-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              
              {/* 🔥 تفعيل كبسولة النيون الدوارة اللانهائية الثلاثية حول صورة المرسل في الشات */}
              <div className="msg-avatar-container">
                <img 
                  src={m.avatar ? `${API_BASE}${m.avatar}` : "/assets/logo.png"} 
                  className="msg-chat-avatar" 
                  alt="av" 
                />
              </div>

              <span className={`badge ${m.role === 'Admin' ? 'admin-badge' : 'user-badge'}`}>{m.role}</span>
              <span className="user-name" style={{ color: m.role === 'Admin' ? 'var(--gold-glow)' : '#fff', fontWeight: 'bold' }}>{m.user}</span>
              <span className="msg-time">{m.time}</span>
            </div>
            <div className="msg-text-content" style={{ paddingRight: '36px', wordBreak: 'break-word' }}>
              {m.text}
            </div>
          </div>
        ))}
        {/* مرجع وهمي في نهاية القائمة لتوجيه خاصية النزول التلقائي */}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-box" onSubmit={send}>
        <input 
          value={msg} 
          onChange={e => setMsg(e.target.value)} 
          placeholder={`اكتب رسالتك الملكية داخل غُرفة ${currentGroup ? currentGroup.name : '...'}`} 
          required
        />
        <button type="submit">إرسال 🚀</button>
      </form>
    </main>
  );
};

export default ChatArea;

