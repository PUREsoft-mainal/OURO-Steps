import React, { useEffect, useRef,  useState} from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const ChatArea = ({ chat, currentUser, msg, setMsg, socket, currentGroup }) => {
  const messagesEndRef = useRef(null);
  
  // 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
  const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

  const [activeMenuId, setActiveMenuId] = useState(null); // لتحديد القائمة المفتوحة للرسالة
  const [editingMsgId, setEditingMsgId] = useState(null); // لتحديد الرسالة الجاري تعديلها
  const [editValue, setEditValue] = useState(""); // لتخزين النص الجديد أثناء التعديل


  // 🔥 [تم التطهير والإصلاح] تم حذف كود تعريف السوكت المكرر (const socket = io) من هنا نهائياً لحل الكراش السحابي
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
      // إرسال الرسالة حصرياً لملف المجموعة المفتوحة حالياً بالسيرفر السحابي
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

    // 🗑️ دالة إطلاق إشارة حذف الرسالة
  const handleDeleteMessage = (msgId) => {
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذه الرسالة نهائياً؟")) {
      socket.emit('delete_group_message', { roomId: currentGroup.id, msgId });
      setActiveMenuId(null);
    }
  };

  // 📝 دالة حفظ التعديل وإرسال النص الجديد
  const handleSaveEdit = (msgId) => {
    if (editValue.trim()) {
      socket.emit('edit_group_message', { roomId: currentGroup.id, msgId, newText: editValue.trim() });
      setEditingMsgId(null);
      setEditValue("");
    }
  };


  return (
    <main className="chat-area">
      {/* 👑 شريط رأس الغرفة المطور الحاضن للزرين والبيانات التفاعلية في الأعلى */}
      <div className="chat-room-header" style={{ padding: '12px 20px', background: 'rgba(10, 10, 10, 0.7)', borderBottom: '2px solid var(--border-glass)', fontSize: '13px', color: 'var(--gold-primary)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>


        {/* جهة اليمين: معلومات الغرفة والمنشئ الأصلي للملف + زر إضافة صديق المطور */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>📢 غُرفة المحادثة: {currentGroup ? currentGroup.name : "جاري التحميل..."}</span>
            <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>المنشئ: {currentGroup?.creator || 'النظام'}</small>
          </div>

          {/* 👑 زر (+) الفاخر لإضافة صديق للغرفة يظهر فقط للمنشئ أو الأدمن ويدعم المونجو أطلس */}
          {(currentUser === 'Admin_Mostafa' || currentUser === currentGroup?.creator) && currentGroup?.id !== 'public' && (
            <button
              className="assign-btn-gold"
              style={{ padding: '3px 8px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', background: 'var(--gold-primary)', color: '#000', fontWeight: 'bold', border: 'none' }}
              title="إضافة صديق مصرح له بدخول هذه الغرفة المغلقة"
              onClick={() => {
                const targetUser = window.prompt("👥 اكتب اسم المستخدم الصارم الذي تود منحه إذن الدخول لهذه الغرفة الحصري:");
                if (targetUser && targetUser.trim()) {
                  socket.emit('add_user_to_group', { roomId: currentGroup.id, targetUser: targetUser.trim() });
                  alert(`🎉 تم إرسال الإذن وتثبيت العضو ${targetUser} سحابياً بالأطلس بنجاح!`);
                }
              }}
            >
              ➕ إضافة عضو
            </button>
          )}
        </div>
  
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
        {(chat || []).map((m, i) => {
          const isMyMsg = m.user === currentUser;
          const isAdmin = currentUser === 'Admin_Mostafa';
          const isEditing = editingMsgId === m.id;

          return (
            <div 
              key={m.id || i} 
              className={`msg ${isMyMsg ? 'my-msg' : 'other-msg'}`}
              style={{ position: 'relative' }} // تثبيت عائم للزر النقاط بالزوايا هندسياً
            >
              {/* 👑 زر الخيارات (...) العائم عالي الفخامة بالزاوية العلوية */}
              {(isMyMsg || isAdmin) && !isEditing && (
                <div className="msg-options-container" style={{ position: 'absolute', top: '5px', left: isMyMsg ? 'auto' : '10px', right: isMyMsg ? '10px' : 'auto', zIndex: 5 }}>
                  <button 
                    type="button" 
                    className="msg-dots-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === m.id ? null : m.id);
                    }}
                  >
                    •••
                  </button>

                  {/* القائمة المنبثقة التفاعلية لإدارة التعديل والحذف للرسالة المحددة */}
                  {activeMenuId === m.id && (
                    <div className="msg-dropdown-menu gold-border">
                      {isMyMsg && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingMsgId(m.id);
                            setEditValue(typeof m.text === 'object' && m.text !== null ? m.text.text : m.text);
                            setActiveMenuId(null);
                          }}
                        >
                          📝 تعديل
                        </button>
                      )}
                      <button 
                        type="button" 
                        className="delete-item-btn" 
                        onClick={() => handleDeleteMessage(m.id)}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="msg-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                
                {/* 🔥 كبسولة الأوتار الدوارة اللانهائية حول الأفاتار */}
                <div className="msg-avatar-container">
                  <img 
                    src={m.avatar ? `${API_BASE}${m.avatar}` : "/assets/logo.png"} 
                    className="msg-chat-avatar" 
                    alt="av" 
                  />
                </div>

                <span className={`badge ${m.role === 'Admin' ? 'admin-badge' : 'user-badge'}`}>{m.role}</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="user-name" style={{ color: m.role === 'Admin' ? 'var(--gold-glow)' : '#fff', fontWeight: 'bold' }}>{m.user}</span>
                  
                  {/* أزرار العلاقات الاجتماعية (+) و (×) بمقاس 15 بكسل للتحكم بالأصدقاء */}
                  {m.user !== currentUser && (
                    <div className="chat-relationship-controls" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                      <button 
                        className="add-friend-chat-btn" 
                        type="button" 
                        title={`إضافة ${m.user} للأصدقاء`}
                        onClick={() => {
                          if (window.confirm(`👥 هل تود إضافة ${m.user} إلى أصدقائك في عالم OURO Steps؟`)) {
                            socket.emit('toggle_friend', { currentUser: currentUser, targetUser: m.user });
                            alert(`🎉 تم إضافة ${m.user} بنجاح!`);
                          }
                        }}
                      >
                        +
                      </button>
                      <button 
                        className="remove-friend-chat-btn" 
                        type="button" 
                        title={`حذف ${m.user} من الأصدقاء`}
                        onClick={() => {
                          if (window.confirm(`⚠️ هل تود حذف ${m.user} وإزالته من قائمة أصدقائك بالكامل؟`)) {
                            socket.emit('toggle_friend', { currentUser: currentUser, targetUser: m.user });
                            alert(`🗑️ تم إزالة ${m.user} من الأصدقاء بنجاح!`);
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <span className="msg-time">{m.time}</span>
              </div>

              {/* منطقة عرض النص التفاعلي: تتحول لحقل إدخال مرن ومذهب عند تفعيل وضع التعديل */}
              <div className="msg-text-content" style={{ paddingRight: '45px', paddingLeft: '45px', wordBreak: 'break-word' }}>
                {isEditing ? (
                  <div className="edit-msg-inline-box" style={{ display: 'flex', gap: '5px', marginTop: '5px', width: '100%' }}>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ flex: 1, padding: '4px 8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px' }}
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)} 
                    />
                    <button type="button" className="assign-btn-gold" style={{ padding: '2px 10px', fontSize: '11px', cursor: 'pointer' }} onClick={() => handleSaveEdit(m.id)}>حفظ</button>
                    <button type="button" style={{ padding: '2px 10px', fontSize: '11px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setEditingMsgId(null)}>إلغاء</button>
                  </div>
                ) : (
                  typeof m.text === 'object' && m.text !== null ? m.text.text : m.text
                )}
              </div>

            </div>
          );
        })}
        {/* مرجع وهمي في نهاية القائمة لتوجيه خاصية النزول التلقائي */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 👑 لوحة تحكم الفورم وقنوات حقن الإضافات الخمسة الشاملة بجوار زر الإرسال */}
      <form className="input-box" onSubmit={send} style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
        
        {/* ➕ زر الإضافات المطور عالي الفخامة الحاضن للخيارات الخمسة المذهبة */}
        <button 
          type="button"
          className="assign-btn-gold"
          style={{ width: '15px', height: '15px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '8px', background: 'linear-gradient(135deg, #1c1c1c 0%, #0d0d0d 100%)', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)' }}
          onClick={() => {
            const actionType = window.prompt(
              "👑 استوديو الملحقات الملكي الشامل:\n\n" +
              "اكتب رقم الخيار المطلوب حقنه بالشات فوراً:\n" +
              "1️⃣ - رفع صور وفيديوهات بجميع الصيغ\n" +
              "2️⃣ - رفع ملفات ومستندات PDF حرة\n" +
              "3️⃣ - إدراج رابط لموقع خارجي\n" +
              "4️⃣ - إرسال الموقع الجغرافي اللحظي GPS"
            );

            if (actionType === "1" || actionType === "2") {
              const fileLink = window.prompt("📁 الصق هنا رابط المرفق أو ملف الميديا المرفوع سحابياً لحقنه بالشات فوراً:");
              if (fileLink && fileLink.trim()) setMsg(prev => prev + ` [📎 مرفق سحابي: ${fileLink.trim()}]`);
            } else if (actionType === "3") {
              const webLink = window.prompt("🌐 اكتب أو الصق رابط الموقع الإلكتروني المستهدف:");
              if (webLink && webLink.trim()) setMsg(prev => prev + ` ${webLink.trim()} `);
            } else if (actionType === "4") {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  // 👑 [تم التصحيح والتحصين] صياغة الرابط القياسي الصحيح لخرائط جوجل لتشغيل الـ GPS بنجاح ساحق
                  const geoLink = `https://google.com{pos.coords.latitude},${pos.coords.longitude}`;
                  setMsg(prev => prev + ` 📍 موقعي الجغرافي الحي: ${geoLink} `);
                  alert("✅ تم قنص إحداثيات الـ GPS وحقنها بصندوق الرسائل بنجاح فخم!");
                }, () => alert("❌ عذراً، يرجى تفعيل إذن الـ GPS بالمتصفح أولاً."));
              }
            }
          }}
          title="انقر لحقن مرفقات (PDF, صور, فيديو, روابط, GPS)"
        >
          ＋
        </button>

        <input 
          value={msg} 
          onChange={e => setMsg(e.target.value)} 
          placeholder={`اكتب رسالتك الملكية داخل غُرفة ${currentGroup ? currentGroup.name : '...'}`} 
          required
          style={{ flex: 1 }}
        />
        <button type="submit">إرسال 🚀</button>
      </form>
    </main>
  );
};

export default ChatArea;
