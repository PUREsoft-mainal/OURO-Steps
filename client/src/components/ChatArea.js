import React from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const ChatArea = ({ chat, currentUser, msg, setMsg, socket, currentGroup }) => {
  
  const send = (e) => {
    e.preventDefault();
    if(msg.trim()) {
      // تعديل: إرسال الكائن بالكامل ليتوافق مع السيرفر السحابي
      socket.emit('sendMessage', { 
        text: msg, 
        groupId: currentGroup?.id || 'public' 
      });
      setMsg("");
    }
  };

  const addMember = () => {
    const targetUser = prompt("👤 أدخل اسم المستخدم الذي تريد إضافته لهذا الشات:");
    // شرط: لا يمكن الإضافة للمجموعة العامة (public)
    if (targetUser && currentGroup?.id && currentGroup.id !== 'public') {
        socket.emit('add_member', { 
            groupId: currentGroup.id, 
            targetUser: targetUser 
        });
    } else {
        alert("⚠️ تنبيه: زر (+) مخصص للمجموعات الخاصة فقط. لا يمكن إضافة أعضاء للمجموعة العامة!");
    }
  };

  return (
    <main className="chat-area">
      {/* شريط علوي للشات يحتوي على اسم المجموعة وزر الإضافة (+) */}
      <div className="chat-header gold-border" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', alignItems: 'center' }}>
        <h3 className="gold-text">💬 {currentGroup?.name || "المجموعة العامة"}</h3>
        
        {/* زر (+) يظهر فقط إذا كنا داخل مجموعة خاصة وليس العامة */}
        {currentGroup?.id && currentGroup.id !== 'public' && (
          <button className="add-member-btn royal-plus" onClick={addMember} title="إضافة عضو">
            +
          </button>
        )}
      </div>

      <div className="messages">
        {chat.map((m, i) => (
          <div key={i} className={`msg ${m.user === currentUser ? 'my-msg' : ''}`}>
            <span className="badge">{m.role}</span>
            <b>{m.user}:</b> {m.text}
          </div>
        ))}
      </div>

      <form className="input-box" onSubmit={send}>
        <input 
          value={msg} 
          onChange={e => setMsg(e.target.value)} 
          placeholder="اكتب رسالتك..." 
        />
        <button type="submit">إرسال</button>
      </form>
    </main>
  );
};

export default ChatArea;
