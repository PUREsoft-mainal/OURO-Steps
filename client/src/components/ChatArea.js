import React from 'react';

const ChatArea = ({ chat, currentUser, msg, setMsg, socket, currentGroup }) => {
  
  const send = (e) => {
    e.preventDefault();
    if(msg.trim()) {
      // إرسال الرسالة مع تحديد معرف المجموعة (إذا كان شات خاص)
      socket.emit('sendMessage', { 
        text: msg, 
        groupId: currentGroup?.id || 'public' 
      });
      setMsg("");
    }
  };

  // دالة زر (+) لإضافة مستخدم جديد للشات
  const addMember = () => {
    const targetUser = prompt("👤 أدخل اسم المستخدم الذي تريد إضافته لهذا الشات:");
    if (targetUser && currentGroup?.id) {
        socket.emit('add_member', { 
            groupId: currentGroup.id, 
            targetUser: targetUser 
        });
    } else if (!currentGroup?.id) {
        alert("⚠️ لا يمكن إضافة أعضاء للمجموعة العامة، أنشئ شات خاص أولاً!");
    }
  };

  return (
    <main className="chat-area">
      {/* شريط علوي للشات يحتوي على اسم المجموعة وزر الإضافة */}
      <div className="chat-header gold-border">
        <h3>💬 {currentGroup?.name || "المجموعة العامة"}</h3>
        <button className="add-member-btn" onClick={addMember} title="إضافة عضو">
          +
        </button>
      </div>

      <div className="messages">
        {chat.map((m, i) => (
          <div key={i} className={`msg ${m.user === currentUser ? 'my-msg' : ''}`}>
            <span className="badge">{m.role}</span>
            <b>{m.user} {m.user_id}:</b> {m.text}
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
