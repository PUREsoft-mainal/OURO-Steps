import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DiscoveryStore = ({ user, socket, API_BASE, defaultTab, onClose }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'friends'); 
  const [allUsers, setAllUsers] = useState([]);
  const [marketPosts, setMarketPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // خيارات النشر للبضاعة الجديدة داخل السوق
  const [newPost, setNewPost] = useState({ description: '', price: '', files: null });

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

  useEffect(() => {
  // 👑 [تعديل الحسم] دالة ذكية لإرسال طلب الصداقة وتطهير شاشة الاستكشاف لحظياً فور النقر
    const handleToggleFriend = (targetUsername) => {
      if (!user?.username || !socket) return;
 
      // 1️⃣ إرسال النبضة الفورية لـ MongoDB Atlas لحفظ الصداقة أزلياً
      socket.emit('toggle_friend', { 
        currentUser: user.username, 
        targetUser: targetUsername 
      });

      // 2️⃣ إخفاء المستخدم فوراً من الشاشة المحلية أمامك لتأكيد نجاح العملية بصرياً
      alert(`👥 تم إرسال طلب الصداقة وتثبيت هويّة المعلن ${targetUsername} سحابياً!`);
    
      // إنعاش الكاش وعمل تصفية فورية للقائمة (سيختفي كارت الشخص المنقور فوراً)
      if (typeof setAllUsers === 'function') {
        setAllUsers(prev => prev.map(u => {
          if (u.username === user.username) {
            const currentFriends = u.friends || [];
            return { ...u, friends: [...currentFriends, targetUsername] };
          }
          return u;
        }));
      }
    };

    
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersRes = await axios.get(`${API_BASE}/api/users`);
        setAllUsers(usersRes.data || []);

        const marketRes = await axios.get(`${API_BASE}/api/market`); 
        setMarketPosts(marketRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("خطأ في مزامنة بيانات المتجر الملكي:", err);
        setLoading(false);
      }
    };
    fetchData();

    // مستمع تحديثات الأصدقاء في ملفات الـ JSON المحلية
    socket.on('friend_updated', (data) => {
        setAllUsers(data.usersList || []);
    });

    // مستمع بث سلعة جديدة بالسوق لحظياً
    socket.on('new_market_post', (post) => {
        setMarketPosts(prev => [post, ...prev]);
    });

    // مستمع الحذف اللحظي لسلعة معينة عبر التاجر أو الأدمن (×)
    socket.on('market_post_deleted', (data) => {
        setMarketPosts(prev => prev.filter(p => p.id !== data.postId));
    });

    // مستمع المزامنة الدورية لحذف السلع تلقائياً بعد مرور 3 أشهر
    socket.on('sync_market_posts', (posts) => {
        setMarketPosts(posts);
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
      socket.off('new_market_post');
      socket.off('market_post_deleted');
      socket.off('sync_market_posts');
      socket.off('new_private_message');
      socket.off('user_added_to_chat');
      socket.off('user_kicked_from_chat');
    };
  }, [API_BASE, socket, user?.username, chatRoomId]);

  useEffect(() => {
    pChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [privateChatHistory]);

  // دالة بدء المراسلة وإنشاء المعرف الفريد للمحادثة الخاصة
  const handleStartChat = async (targetFriend) => {
    const roomId = [user?.username, targetFriend.username].sort().join('_ch_');
    setChatRoomId(roomId);
    setChatParticipants([user?.username, targetFriend.username]);
    setActiveChat(targetFriend);
    
    // تعيين منشئ الغرفة الافتراضي لإتاحة صلاحيات الطرد والإضافة
    setCurrentChatMeta({ creator: user?.username, mod1: '', mod2: '' });

    socket.emit('join_private_room', { roomId });

    try {
      const res = await axios.get(`${API_BASE}/api/private-chat-history/${roomId}`);
      setPrivateChatHistory(res.data || []);
    } catch (err) {
      console.error("خطأ في جلب سجل المحادثة المحلي:", err);
    }
  };

  // دالة إرسال الرسالة الخاصة وبثها عبر السوكيت
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

  // دالة إضافة صديق للمحادثة عبر زر (+) في رأس الشات العائم
  const handleAddFriendToChat = (friendName) => {
    socket.emit('add_user_to_chat', { roomId: chatRoomId, newUser: friendName });
    setShowAddList(false);
  };

  // دالة طرد مستخدم من المحادثة عبر زر (×) بجانب اسمه
  const handleKickUser = (participantName) => {
    socket.emit('kick_user_from_chat', { roomId: chatRoomId, kickedUser: participantName });
  };

  // دالة النشر المطور للسلع في السوق الملكي (تصل حتى 10 صور وتدمج الوصف والسعر)
  const handleMarketUpload = async (e) => {
    e.preventDefault();
    if (!newPost.files || newPost.files.length === 0) return alert("⚠️ الرجاء اختيار صور البضاعة أولاً!");
    if (newPost.files.length > 10) return alert("⚠️ الحد الأقصى المسموح به هو 10 صور فقط للسلعة الواحدة!");

    const formData = new FormData();
    Array.from(newPost.files).forEach(file => formData.append('marketImages', file));
    formData.append('description', newPost.description);
    formData.append('price', newPost.price);
    formData.append('username', user?.username || 'تاجر ملكي');

    try {
      const res = await axios.post(`${API_BASE}/api/market/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("✅ تم نشر سلعتك بنجاح في المعرض الشامل ولمدة 3 أشهر!");
        setNewPost({ description: '', price: '', files: null });
        e.target.reset();
      }
    } catch (err) { 
        console.error(err);
        alert("❌ فشل نشر السلعة، تحقق من اتصال السيرفر."); 
    }
  };

  // دالة حذف منشور السلعة نهائياً عبر زر (×)
  const handleDeletePost = async (postId) => {
    if (!window.confirm("⚠️ هل أنت متأكد من حذف هذا منشور البضاعة وصوره نهائياً من السوق؟")) return;
    try {
      await axios.delete(`${API_BASE}/api/market/delete/${postId}`, { 
        data: { username: user?.username } 
      });
    } catch (err) { alert("❌ فشل الحذف، غير مصرح لك."); }
  };

  // تصفية قوائم الأصدقاء والاستكشاف
  const currentUserData = allUsers.find(u => u.username === user?.username);
  const myFriendsList = currentUserData?.friends || [];
  const usersToDiscover = allUsers.filter(u => u.username !== user?.username && !myFriendsList.includes(u.username));
  const myFriends = allUsers.filter(u => u.username !== user?.username && myFriendsList.includes(u.username));

  // جدار حماية الصلاحيات للمحادثة الجماعية العائمة
  const isAuthorizedToManage = user && (
    user.username === 'Admin_Mostafa' || 
    user.role === 'Admin' || 
    user.username === currentChatMeta.creator || 
    user.username === currentChatMeta.mod1 || 
    user.username === currentChatMeta.mod2
  );

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()}>
        
        <div className="discovery-tabs">
          <button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>👥 إدارة الأصدقاء</button>
          <button className={activeTab === 'market' ? 'active' : ''} onClick={() => setActiveTab('market')}>🛍️ السوق الملكي الفاخر</button>
          <button className="close-discovery" onClick={onClose}>❌ إغلاق</button>
        </div>

        <div className="discovery-body scrollbar-gold">
          {loading ? <p className="gold-text">جاري التحميل والمزامنة الحية البصريّة...</p> : (
            <>
              {activeTab === 'friends' && (
                <div className="friends-split-layout">
                  <div className="discover-column">
                    <h4 className="column-title">🔍 استكشاف وإضافة أصدقاء الجدد</h4>
                    <div className="users-scroll">
                      {usersToDiscover.map(u => (
                        <div key={u.id || u._id || u.username} className="mini-user-card">
                          <span>👤 {u.username}</span>
                          {/* 👑 [تم التعديل والربط الشرعي] استدعاء handleToggleFriend لتشغيل الحركة والاستجابة الفورية */}
                          <button 
                            className="gold-btn-small" 
                            /* ✅ التعديل الهندسي القاطع والجاهز للتشغيل فوراً دون الحاجة لدوال علوية: */
                            onClick={() => {
                              if (socket && user?.username) {
                                 // ضخ إشارة التحديث لـ MongoDB Atlas فوراً
                                socket.emit('toggle_friend', { currentUser: user.username, targetUser: u.username });
                                alert(`👥 تم إرسال طلب الصداقة للمعلن ${u.username} بنجاح!`);
                                // إنعاش الكاش اختصاراً ليختفي كارت الشخص فوراً أمام عينك
                                window.location.reload(); 
                              }
                            }}
                          >
                            إضافة صديق +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="my-friends-column">
                    <h4 className="column-title">🤝 قائمة أصدقائي الحاليين</h4>
                    <div className="users-scroll">
                      {myFriends.map(u => (
                        <div key={u.id} className="mini-user-card friend-active">
                          <span>👤 {u.username}</span>
                          <div className="friend-btns">
                            <button className="gold-btn-small" style={{background:'var(--gold-primary)'}} onClick={() => handleStartChat(u)}>💬 مراسلة</button>
                            <button className="unfriend-btn" onClick={() => socket.emit('toggle_friend', { currentUser: user?.username, targetUser: u.username })}>إلغاء الصداقة 💔</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'market' && (
                <div className="market-section-layout">
                  <form className="market-upload-form gold-border" onSubmit={handleMarketUpload}>
                    <h4>📣 عرض بضاعة جديدة (حتى 10 صور للمنتج)</h4>
                    <textarea 
                      placeholder="اكتب وصف البضاعة بالتفصيل للمشترين..." 
                      onChange={e => setNewPost({...newPost, description: e.target.value})} 
                      required 
                    />
                    <input 
                      type="text" placeholder="💰 حدد السعر المطلوب لبيعها (مثال: 500 جنيه)..." 
                      onChange={e => setNewPost({...newPost, price: e.target.value})} 
                      required 
                    />
                    <div className="file-input-wrapper-gold">
                      <input 
                        type="file" multiple accept="image/*" 
                        onChange={e => setNewPost({...newPost, files: e.target.files})} 
                        required 
                      />
                    </div>
                    <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '10px' }}>نشر في معرض السوق المفتوح</button>
                  </form>

                  <div className="market-facebook-feed">
                    {marketPosts.map(post => {
                      const canDelete = user && (post.uploader === user.username || user.username === 'Admin_Mostafa');
                      return (
                        <div key={post.id} className="facebook-post-card gold-border">
                          <div className="fb-post-header">
                            <div className="fb-uploader-meta">
                              <span className="fb-uploader-avatar">👑</span>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="fb-uploader-name">{post.uploader}</span>
                                <small className="fb-post-time">تم النشر: {post.time}</small>
                              </div>
                            </div>
                            {canDelete && (
                              <button className="fb-delete-btn" onClick={() => handleDeletePost(post.id)} title="حذف السلعة وإلغاء المنشور نهائياً">
                                ×
                              </button>
                            )}
                          </div>

                          <div className="fb-post-body">
                            <p className="fb-product-desc">{post.description}</p>
                            <div className="fb-price-badge">
                              <span>السعر المطلوب للبيع:</span> <strong>{post.price}</strong>
                            </div>
                          </div>

                          <div className={`fb-images-grid grid-count-${Math.min(post.images?.length || 1, 4)}`}>
                            {post.images?.map((img, idx) => (
                              <div key={idx} className="fb-img-wrapper" onClick={() => window.open(`${API_BASE}${img}`, '_blank')}>
                                <img src={`${API_BASE}${img}`} alt="product-view" className="fb-product-img" />
                              </div>
                            ))}
                          </div>

                          <div className="fb-post-footer">
                            <span className="warranty-tag">🛡️ فحص آمن - متبقي على الصلاحية حتى 3 أشهر تلقائياً</span>
                          </div>
                        </div>
                      );
                    })}
                    {marketPosts.length === 0 && <p className="empty-text-gold">معرض البضائع شاغر حالياً... كن أول من يعرض سلعته الملكية!</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🆕 شاشة الفيس بوك العائمة المذهبة المكتملة بالأزرار التفاعلية (+ / ×) */}
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
                {myFriends.filter(f => !chatParticipants.includes(f.username)).map(f => (
                  <div key={f.id} className="dropdown-user-item" onClick={() => handleAddFriendToChat(f.username)}>
                    ➕ {f.username}
                  </div>
                ))}
                {myFriends.filter(f => !chatParticipants.includes(f.username)).length === 0 && (
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
    </div>
  );
};

export default DiscoveryStore;

