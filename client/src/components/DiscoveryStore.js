import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DiscoveryStore = ({ user, socket, API_BASE, onClose }) => {
  const [activeTab, setActiveTab] = useState('friends'); // التبديل بين الأصدقاء والسوق
  const [allUsers, setAllUsers] = useState([]);
  const [marketPosts, setMarketPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة رفع منشور جديد للسوق
  const [newPost, setNewPost] = useState({ description: '', price: '', file: null });

  // 1. جلب البيانات من السيرفر السحابي
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(`${API_BASE}/api/users`);
        const postsRes = await axios.get(`${API_BASE}/api/init_data`); // أو مسار السوق الخاص
        setAllUsers(usersRes.data);
        setMarketPosts(postsRes.data.marketPosts || []);
        setLoading(false);
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        setLoading(false);
      }
    };
    fetchData();

    // الاستماع لتحديثات الصداقة اللحظية
    socket.on('friend_updated', (data) => {
        alert(data.message);
        // تحديث القائمة محلياً فوراً ليتغير اسم الزر
        setAllUsers(prev => prev.map(u => 
            u.username === data.targetUser ? { ...u, isFriend: data.status === 'remove' } : u
        ));
    });

    return () => socket.off('friend_updated');
  }, [API_BASE, socket]);

  // 2. دالة رفع منشور للسوق
  const handleMarketUpload = async (e) => {
    e.preventDefault();
    if (!newPost.file) return alert("الرجاء اختيار صورة المنتج");

    const formData = new FormData();
    formData.append('marketImage', newPost.file);
    formData.append('description', newPost.description);
    formData.append('price', newPost.price);
    formData.append('username', user.username);

    try {
      const res = await axios.post(`${API_BASE}/api/market/upload`, formData);
      if (res.data.success) {
        alert("✅ تم نشر بضاعتك في السوق الملكي!");
        setMarketPosts([res.data.post, ...marketPosts]);
        setNewPost({ description: '', price: '', file: null });
      }
    } catch (err) { alert("❌ فشل الرفع للسوق"); }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()}>
        
        {/* نافذة التنقل العلوي */}
        <div className="discovery-tabs">
          <button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>
            👥 أصدقاء جدد
          </button>
          <button className={activeTab === 'market' ? 'active' : ''} onClick={() => setActiveTab('market')}>
            🛍️ السوق الملكي
          </button>
          <button className="close-discovery" onClick={onClose}>❌</button>
        </div>

        <div className="discovery-body scrollbar-gold">
          {loading ? <p className="gold-text">جاري تحميل البيانات الملكية...</p> : (
            <>
              {/* قسم الأصدقاء */}
              {activeTab === 'friends' && (
                <div className="friends-grid">
                  {allUsers.filter(u => u.username !== user.username).map(u => (
                    <div key={u._id} className="user-card-discovery">
                      <div className="user-avatar">👤</div>
                      <div className="user-details">
                        <span className="user-name">{u.username}</span>
                        <span className="user-role">{u.role}</span>
                      </div>
                      <button 
                        className={u.friends?.includes(user.username) ? "unfriend-btn" : "add-friend-btn"}
                        onClick={() => socket.emit('toggle_friend', { targetUser: u.username })}
                      >
                        {u.friends?.includes(user.username) ? "💔 إلغاء الصداقة" : "🤝 إضافة صديق"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* قسم السوق */}
              {activeTab === 'market' && (
                <div className="market-section">
                  {/* نموذج النشر في السوق */}
                  <form className="market-upload-form gold-border" onSubmit={handleMarketUpload}>
                    <h4>📣 انشر بضاعتك الآن</h4>
                    <textarea 
                      placeholder="وصف المنتج..." 
                      value={newPost.description} 
                      onChange={e => setNewPost({...newPost, description: e.target.value})}
                      required
                    />
                    <input 
                      type="text" placeholder="السعر..." 
                      value={newPost.price} 
                      onChange={e => setNewPost({...newPost, price: e.target.value})}
                      required 
                    />
                    <input 
                      type="file" accept="image/*" 
                      onChange={e => setNewPost({...newPost, file: e.target.files[0]})}
                      required
                    />
                    <button type="submit" className="gold-btn">تأكيد النشر</button>
                  </form>

                  {/* عرض المنشورات */}
                  <div className="market-grid">
                    {marketPosts.map(post => (
                      <div key={post._id} className="market-item-card">
                        <img src={post.imgUrl} alt="product" className="market-img" />
                        <div className="market-info">
                          <p className="market-desc">{post.description}</p>
                          <span className="market-price">💰 {post.price}</span>
                          <span className="market-owner">بواسطة: {post.uploader}</span>
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
    </div>
  );
};

export default DiscoveryStore;
