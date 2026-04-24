import React from 'react';

const ChatArea = ({ chat, currentUser, msg, setMsg, socket }) => {
  const send = (e) => {
    e.preventDefault();
    if(msg.trim()) {
      socket.emit('sendMessage', msg);
      setMsg("");
    }
  };

  return (
    <main className="chat-area">
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

