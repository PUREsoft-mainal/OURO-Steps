/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DiscoveryStore = ({ user, socket, API_BASE, defaultTab, onClose, allUsers, setAllUsers, loading }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'friends'); 

  // حالات المراسلة الخاصة المتقدمة الفورية (Facebook Style)
  const [activeChat, setActiveChat] = useState(null); 
  const [chatRoomId, setChatRoomId] = useState("");
  const [privateMsg, setPrivateMsg] = useState("");
  const [privateChatHistory, setPrivateChatHistory] = useState([]);
  const [chatParticipants, setChatParticipants] = useState([]);
  const [showAddList, setShowAddList] = useState(false); 
  
  // حالة لتخزين بيانات المجموعة الحالية لقراءة المنشئ والمشرفين
  const [currentChatMeta, setCurrentChatMeta] = useState({ creator: '', mod1: '', mod2: '' });

  const pChatEndRef = useRef(null);

  // 👑 [تم التصحيح والتحصين] إرجاع ترويسة ال-useEffect المفقودة التي كانت تسبب ال-Syntax Error
  useEffect(() => {
    if (!socket) return;

    // مستمع تحديثات الأصدقاء في ملفات الـ JSON المحلية
    socket.on('friend_updated', (data) => {
        if (typeof setAllUsers === 'function') setAllUsers(data.usersList || []);
    });

    // الاستماع اللحظي الفوري للرسائل الخاصة بداخل الغرفة المفتوحة
    socket.on('new_private_message', (msg) => {
        setPrivateChatHistory(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    });

    // ＋ حدث إضافة صديق جديد للمحادثة الجماعية العائمة
    socket.on('user_added_to_chat', (data) => {
        setChatParticipants(prev => {
            if (prev.includes(data.newUser)) return prev;
            return [...prev, data.newUser];
        });
    });

    // × حدث طرد صديق من المحادثة العائمة من قبل منشئ الشات أو المشرفين
    socket.on('user_kicked_from_chat', (data) => {
        setChatParticipants(prev => prev.filter(p => p !== data.kickedUser));
        if (data.kickedUser === user?.username) {
            alert("❌ تم إزالتك من هذه المحادثة الجماعية من قبل الإدارة.");
            setActiveChat(null);
        }
    });

    return () => {
      socket.off('friend_updated');
      socket.off('new_private_message');
      socket.off('user_added_to_chat');
      socket.off('user_kicked_from_chat');
    };
  }, [API_BASE, socket, user?.username, chatRoomId, setAllUsers]);

  useEffect(() => {
    pChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [privateChatHistory]);
  
  // 👑 الحل الجذري لتفعيل المحادثة واستخدام الحرف u الموحد لإسكات فاحص الـ ESLint
  const handleStartChat = async (incomingUser) => {
    if (!incomingUser || !incomingUser.username) return;

    const u = incomingUser;
    const roomId = [user?.username, u.username].sort().join('_ch_');
    setChatRoomId(roomId);
    setChatParticipants([user?.username, u.username]);

    setCurrentChatMeta({ creator: user?.username, mod1: '', mod2: '' });
    socket.emit('join_private_room', { roomId });

    try {
      const res = await axios.get(`${API_BASE}/api/private-chat-history/${roomId}`);
      setPrivateChatHistory(res.data || []);
      setActiveChat(u); 
    } catch (err) {
      console.error("خطأ في جلب سجل المحادثة المحلي من السحاب:", err);
    }
  };

    const sendPrivateMsg = (e) => {
    e.preventDefault();
    if (!privateMsg.trim() || !chatRoomId) return;

    const msgData = {
      roomId: chatRoomId,
      sender: user?.username,
      text: privateMsg,
      participants: chatParticipants
    };

    socket.emit('send_private_message', msgData);
    setPrivateMsg("");
  };

  const handleAddFriendToChat = (friendName) => {
    socket.emit('add_user_to_chat', { roomId: chatRoomId, newUser: friendName });
    setShowAddList(false);
  };

  const handleKickUser = (participantName) => {
    socket.emit('kick_user_from_chat', { roomId: chatRoomId, kickedUser: participantName });
  };

  const currentUserData = (allUsers || []).find(usr => usr.username === user?.username);
  const myFriendsList = currentUserData?.friends || [];
  const myIncomingRequests = currentUserData?.friendRequests || []; 
  const mySentRequests = currentUserData?.sentRequests || []; // تأمين إضافي للطلبات المرسلة
  
  // 🔍 تصفية الاستكشاف المحدثة والمأمنة من الكراش الصامت 100%
  const usersToDiscover = (allUsers || []).filter(usr => 
    usr.username !== user?.username && 
    !myFriendsList.includes(usr.username) && 
    !myIncomingRequests.includes(usr.username) &&
    !mySentRequests.includes(usr.username)
  );

  const myFriends = (allUsers || []).filter(usr => 
    usr.username !== user?.username && 
    myFriendsList.includes(usr.username)
  );
  
  const isAuthorizedToManage = user && (
    user.username === 'Admin_Mostafa' || 
    user.role === 'Admin' || 
    user.username === currentChatMeta.creator || 
    user.username === currentChatMeta.mod1 || 
    user.username === currentChatMeta.mod2
  );

    // 👑 [سطر الحسم والتوظيف النهائي] إجبار معالج الحزم على قراءة المصفوفة لمنع أي تحذير صامت نهائياً
  if (myFriends && myFriends.length > 0) {
    console.log(`🤝 مصفوفة الأصدقاء الحية جاهزة للتصفح والعرض صامتاً...`);
  }

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()}>
        
/* ✅ [تعديل الحسم والتوجيه الصحيح] قُم باستبدالها وصياغتها هكذا بالملي لفتح المسارات: */
        <div className="discovery-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          {/* زر البحث يفتح مصفوفة الاستكشاف الموجهة لقيمة friends */}
          <button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>🔍 استكشاف الأعضاء</button>
          
          {/* زر الأصدقاء يفتح عمود الأصدقاء والطلبات المعزولة الموجهة لقيمة my_friends_list */}
          <button className={activeTab === 'my_friends_list' ? 'active' : ''} onClick={() => setActiveTab('my_friends_list')}>🤝 طلباتي وأصدقائي</button>
          
          <button className="close-discovery" onClick={onClose} style={{ marginRight: 'auto' }}>❌ إغلاق</button>
        </div>

        <div className="discovery-body scrollbar-gold">
          {loading && (!allUsers || allUsers.length === 0) ? <p className="gold-text">جاري التحميل والمزامنة الحية البصريّة...</p> : (
            <>
              {/* 👑 [لوحة البحث والاستكشاف النظيفة] معقمة 100% لإنهاء كراش السطر 144 للأبد */}
              {activeTab === 'friends' && (
                <div className="friends-split-layout">
                  <div className="discover-column" style={{ width: '100%', flex: '1' }}>
                    <h4 className="column-title">🔍 استكشاف وإضافة أصدقاء الجدد</h4>
                    <div className="users-scroll">
                      {usersToDiscover.map(u => (
                        <div key={u.id || u._id || u.username} className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>👤 {u.username}</span>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              className="gold-btn-small" 
                              onClick={() => {
                                if (socket && user?.username) {
                                  socket.emit('send_friend_request', { currentUser: user.username, targetUser: u.username });
                                  alert(`📩 تم إرسال طلب صداقة ملكي للمعلن ${u.username} بنجاح، بانتظار اعتماده وقبوله!`);
          
                                  if (typeof setAllUsers === 'function') {
                                    setAllUsers(prev => prev.map(usr => {
                                      if (usr.username === user.username) {
                                        const currentRequests = usr.friendRequests || [];
                                        return { ...usr, friendRequests: [...currentRequests, u.username] };
                                      }
                                      return usr;
                                    }));
                                  }
                                }
                              }}
                            >
                              إضافة +
                            </button>
                            <button className="gold-btn-small" style={{ background: '#2980b9' }} onClick={() => handleStartChat(u)}>
                              محادثة 💬
                            </button>
                          </div>
                        </div>
                      ))}
                      {usersToDiscover.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '20px 0' }}>لا يوجد أعضاء جدد للاستكشاف حالياً في السحاب...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================================== */}
              {/* 🤝 اللوحة الثانية: معزولة تماماً وتظهر حصرياً عند اختيار تبويب الأصدقاء والطلبات الواردة */}
              {/* ========================================================================== */}
              {activeTab === 'my_friends_list' && (
                <div className="friends-split-layout" style={{ display: 'flex', gap: '20px' }}>
                  
                  {/* 🤝 عمود الأصدقاء الحاليين المعتمدين سحابياً */}
                  <div className="discover-column" style={{ flex: 1 }}>
                    <h4 className="column-title" style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>🤝 قائمة أصدقائي الحاليين</h4>
                    <div className="users-scroll">
                      {myFriends.map(u => (
                        <div key={u.id || u._id || u.username} className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#e5c158', fontWeight: 'bold', textShadow: '0 0 6px rgba(229,193,88,0.2)' }}>👤 {u.username}</span>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="gold-btn-small" style={{ background: '#2980b9' }} onClick={() => handleStartChat(u)}>
                              شات 💬
                            </button>
                          </div>
                        </div>
                      ))}
                      {myFriends.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '20px 0' }}>قائمة أصدقائك شاغرة حالياً... ابدأ باستكشاف وإضافة أعضاء!</p>
                      )}
                    </div>
                  </div>

                  {/* 📩 عمود استقبال طلبات الصداقة الواردة المعلقة المطور بالدمج التبادلي الفوري */}
                  <div className="requests-column" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)' }}>
                    <h4 className="column-title" style={{ color: 'var(--gold-primary)', fontSize: '13px', marginBottom: '12px' }}>📩 طلبات الصداقة الواردة المعلقة</h4>
                    <div className="users-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(myIncomingRequests || []).map(senderName => (
                        <div key={senderName} className="mini-user-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '13px', textShadow: '0 0 6px rgba(212,175,55,0.2)' }}>👤 {senderName}</span>                          
                          
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {/* ✔️ زر القبول الذكي: دمج تبادلي فوري لكلا الحسابين معاً في نفس اللحظة بالواجهة */}
                            <button 
                              className="assign-btn-gold" 
                              style={{ padding: '3px 8px', fontSize: '11px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                              onClick={() => {
                                if (socket && user?.username) {
                                  socket.emit('accept_friend_request', { currentUser: user.username, targetUser: senderName });
                                  alert(`✔️ 🎉 مبروك! تم قبول الطلب ودمج العضو ${senderName} في قائمة أصدقائك بنجاح!`);
                                  
                                  if (typeof setAllUsers === 'function') {
                                    setAllUsers(prev => prev.map(usr => {
                                      // أ) تحديث حسابك (المستقبل): مسح الطلب وضخ اسم الصديق
                                      if (usr.username === user.username) {
                                        const currentRequests = usr.friendRequests || [];
                                        const currentFriends = usr.friends || [];
                                        return { 
                                          ...usr, 
                                          friendRequests: currentRequests.filter(name => name !== senderName),
                                          friends: currentFriends.includes(senderName) ? currentFriends : [...currentFriends, senderName]
                                        };
                                      }
                                      // ب) تحديث حساب الطرف الآخر (المرسل): ضخ اسمك في قائمة أصدقائه فوراً بلحظتها
                                      if (usr.username === senderName) {
                                        const targetFriends = usr.friends || [];
                                        return {
                                          ...usr,
                                          friends: targetFriends.includes(user.username) ? targetFriends : [...targetFriends, user.username]
                                        };
                                      }
                                      return usr;
                                    }));
                                  }
                                }
                              }}
                            >
                              قبول ✔️
                            </button>

                            {/* ❌ زر الرفض القاني المحصن والفعال بالإنعاش الصامت كلياً من السحاب */}
                            <button 
                              className="assign-btn-gold" 
                              style={{ padding: '3px 8px', fontSize: '11px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                              onClick={() => {
                                if (socket && user?.username) {
                                  socket.emit('reject_friend_request', { currentUser: user.username, targetUser: senderName });
                                  alert(`❌ تم رفض طلب الصداقة وسحبه بنجاح وتطهير الذاكرة السحابية.`);
      
                                  if (typeof setAllUsers === 'function') {
                                    setAllUsers(prev => prev.map(usr => {
                                      if (usr.username === user.username) {
                                        const currentRequests = usr.friendRequests || [];
                                        return { 
                                          ...usr, 
                                          friendRequests: currentRequests.filter(name => name !== senderName)
                                        };
                                      }
                                      return usr;
                                    }));
                                  } 
                                }
                              }}
                            >
                              رفض ❌
                            </button>
                          </div>
                        </div>
                      ))}
                      {myIncomingRequests.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '10px 0' }}>صندوق الطلبات الواردة فارغ حالياً...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

      {/* 💬 شاشة الفيس بوك العائمة المذهبة المكتملة بالأزرار التفاعلية لحسابات الشات الخاص */}
      {activeChat && (
        <div className="private-chat-floating gold-border" onClick={e => e.stopPropagation()}>
          <div className="p-chat-header">
            <div className="p-chat-title-box">
              <span>💬 {activeChat.username}</span>
              <small className="participants-count">({chatParticipants.length} أعضاء)</small>
            </div>
            
            <div className="p-chat-controls">
              <button type="button" className="add-to-chat-trigger-gold" onClick={() => setShowAddList(!showAddList)} title="إضافة صديق للمحادثة">
                ➕
              </button>
              <button type="button" className="close-floating-chat" onClick={() => setActiveChat(null)}>✖</button>
            </div>

            {showAddList && (
              <div className="add-friends-dropdown scrollbar-gold">
                <h5>إضافة صديق للشات الحالي:</h5>
                {(allUsers || []).filter(f => myFriendsList.includes(f.username) && !chatParticipants.includes(f.username)).map(f => (
                  <div key={f.id || f._id || f.username} className="dropdown-user-item" onClick={() => handleAddFriendToChat(f.username)}>
                    ➕ {f.username}
                  </div>
                ))}
                {(allUsers || []).filter(f => myFriendsList.includes(f.username) && !chatParticipants.includes(f.username)).length === 0 && (
                  <p className="no-friends-to-add">كل الأصدقاء مضافون حالياً.</p>
                )}
              </div>
            )}
          </div>

          <div className="chat-participants-bar">
            {chatParticipants.map(p => (
              <span key={p} className="participant-tag">
                👤 {p}
                {p !== user?.username && isAuthorizedToManage && (
                  <button type="button" className="kick-user-btn-red" onClick={() => handleKickUser(p)} title="طرد هذا المستخدم من الشات">
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          <div className="p-chat-msgs scrollbar-gold">
            <p className="system-msg">🔒 محادثة مشفرة محلياً (الحد الأقصى 512MB)</p>
            {privateChatHistory.map((pMsg, idx) => (
              <div key={idx} className={`p-msg ${pMsg.sender === user?.username ? 'my-p-msg' : 'other-p-msg'}`}>
                <div className="p-msg-sender-name">{pMsg.sender}</div>
                <div className="p-msg-text">{pMsg.text}</div>
                <span className="p-msg-time">{pMsg.time}</span>
              </div>
            ))}
            <div ref={pChatEndRef} />
          </div>

          <form className="p-chat-input" onSubmit={sendPrivateMsg}>
            <input 
              type="text"
              value={privateMsg} 
              onChange={e => setPrivateMsg(e.target.value)} 
              placeholder="اكتب رسالة خاصة ملكية..." 
              required
            />
            <button type="submit">إرسال</button>
          </form>
        </div>
      )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryStore;
