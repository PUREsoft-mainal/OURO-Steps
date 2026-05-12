import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DiscoveryStore = ({ user, socket, API_BASE, onClose }) => {
  const [activeTab, setActiveTab] = useState('friends'); 
  const [allUsers, setAllUsers] = useState([]);
  const [marketPosts, setMarketPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حالة المراسلة الخاصة (للمربع العائم)
  const [activeChat, setActiveChat] = useState(null);
  const [privateMsg, setPrivateMsg] = useState("");
  const [privateChatHistory, setPrivateChatHistory] = useState([]);

  const [newPost, setNewPost] = useState({ description: '', price: '', files: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersRes = await axios.get(`${API_BASE}/api/users`);
        const postsRes = await axios.get(`${API_BASE}/api/init_data`);
        console.log("قائمة المستخدمين المستلمة:", usersRes.data); // للفحص في الـ Console
        setAllUsers(usersRes.data);
        const postsRes = await axios.get(`${API_BASE}/api/init_data`); 
        setMarketPosts(postsRes.data.marketPosts || []);
        setLoading(false);
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]); // جلب البيانات عند فتح المكون

    socket.on('friend_updated', (data) => {
        // تحديث القائمة فوراً عند الإضافة أو الإلغاء
        setAllUsers(prev => prev.map(u => 
            u.username === data.targetUser 
            ? { ...u, friends: data.status === 'remove' ? [...(u.friends || []), user.username] : (u.friends || []).filter(f => f !== user.username) } 
            : u
        ));
    });

    return () => socket.off('friend_updated');
  }, [API_BASE, socket, user.username]);

  // تصفية القوائم (يمين ويسار)
  const usersToDiscover = allUsers.filter(u => u.username !== user.username && !u.friends?.includes(user.username));
  const myFriends = allUsers.filter(u => u.username !== user.username && u.friends?.includes(user.username));

  // دالة الرفع للسوق
  const handleMarketUpload = async (e) => {
    e.preventDefault();
    if (!newPost.files) return alert("الرجاء اختيار الصور");
    const formData = new FormData();
    Array.from(newPost.files).forEach(file => formData.append('marketImages', file));
    formData.append('description', newPost.description);
    formData.append('price', newPost.price);
    formData.append('username', user.username);

    try {
      const res = await axios.post(`${API_BASE}/api/market/upload`, formData);
      if (res.data.success) {
        alert("✅ تم النشر!");
        setMarketPosts([res.data.post, ...marketPosts]);
      }
    } catch (err) { alert("❌ فشل النشر"); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("حذف المنشور؟")) return;
    try {
      await axios.delete(`${API_BASE}/api/market/delete/${postId}`, { data: { username: user.username } });
      setMarketPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) { alert("فشل الحذف"); }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()}>
        
        <div className="discovery-tabs">
          <button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>👥 أصدقاء جدد</button>
          <button className={activeTab === 'market' ? 'active' : ''} onClick={() => setActiveTab('market')}>🛍️ السوق الملكي</button>
          <button className="close-discovery" onClick={onClose}>❌ إغلاق</button>
        </div>

        <div className="discovery-body scrollbar-gold">
          {loading ? <p className="gold-text">جاري التحميل...</p> : (
            <>
              {activeTab === 'friends' && (
                <div className="friends-split-layout">
                  {/* القائمة اليمنى: اكتشاف */}
                  <div className="discover-column">
                    <h4 className="column-title">🔍 استكشاف أشخاص جدد</h4>
                    <div className="users-scroll">
                      {usersToDiscover.map(u => (
                        <div key={u._id} className="mini-user-card">
                          <span>👤 {u.username}</span>
                          <button className="add-friend-btn" onClick={() => socket.emit('toggle_friend', { targetUser: u.username })}>إضافة صديق +</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* القائمة اليسرى: الأصدقاء */}
                  <div className="my-friends-column">
                    <h4 className="column-title">🤝 قائمة أصدقائي</h4>
                    <div className="users-scroll">
                      {myFriends.map(u => (
                        <div key={u._id} className="mini-user-card friend-active">
                          <span>👤 {u.username}</span>
                          <div className="friend-btns">
                            <button className="msg-btn" onClick={() => setActiveChat(u)}>مراسلة 💬</button>
                            <button className="unfriend-btn" onClick={() => socket.emit('toggle_friend', { targetUser: u.username })}>إلغاء 💔</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'market' && (
                <div className="market-section">
                  <form className="market-upload-form gold-border" onSubmit={handleMarketUpload}>
                    <h4>📣 انشر بضاعة (صور متعددة)</h4>
                    <textarea placeholder="وصف البضاعة..." onChange={e => setNewPost({...newPost, description: e.target.value})} required />
                    <input type="text" placeholder="السعر..." onChange={e => setNewPost({...newPost, price: e.target.value})} required />
                    <input type="file" multiple accept="image/*" onChange={e => setNewPost({...newPost, files: e.target.files})} required />
                    <button type="submit" className="gold-btn">نشر</button>
                  </form>

                  <div className="market-grid">
                    {marketPosts.map(post => (
                      <div key={post._id} className="market-item-card">
                        <div className="post-header">
                          <span>👤 {post.uploader}</span>
                          {(post.uploader === user.username || user.username === 'Admin_Mostafa') && (
                            <button className="delete-post-btn" onClick={() => handleDeletePost(post._id)}>حذف</button>
                          )}
                        </div>
                        <div className="post-images-slider">
                          {post.images?.map((img, idx) => <img key={idx} src={img} className="market-img-slide" alt="p" />)}
                        </div>
                        <div className="market-info">
                          <p>{post.description}</p>
                          <span className="market-price">💰 {post.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🆕 مربع المراسلة العائم (Facebook Style) */}
      {activeChat && (
        <div className="private-chat-floating gold-border" onClick={e => e.stopPropagation()}>
          <div className="p-chat-header">
            <span>💬 {activeChat.username}</span>
            <button onClick={() => setActiveChat(null)}>✖</button>
          </div>
          <div className="p-chat-msgs scrollbar-gold">
            <p className="system-msg">بداية المحادثة مع {activeChat.username}</p>
            {/* هنا ستظهر الرسائل الخاصة لاحقاً */}
          </div>
          <div className="p-chat-input">
            <input 
                value={privateMsg} 
                onChange={e => setPrivateMsg(e.target.value)} 
                placeholder="اكتب رسالة..." 
            />
            <button onClick={() => {
                socket.emit('private_message', { to: activeChat.username, text: privateMsg });
                setPrivateMsg("");
            }}>إرسال</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryStore;
