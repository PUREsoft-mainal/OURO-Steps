import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DiscoveryStore = ({ user, socket, API_BASE }) => {
  const [activeTab, setActiveTab] = useState('friends'); // التبديل بين الأصدقاء والسوق
  const [allUsers, setAllUsers] = useState([]);
  const [marketPosts, setMarketPosts] = useState([]);

  // جلب البيانات من السيرفر
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(`${API_BASE}/api/users`);
        const postsRes = await axios.get(`${API_BASE}/api/market`);
        setAllUsers(usersRes.data);
        setMarketPosts(postsRes.data);
      } catch (err) { console.error("Fetch error", err); }
    };
    fetchData();
  }, [API_BASE]);

  return (
    <div className="discovery-modal">
      <div className="discovery-nav">
        <button onClick={() => setActiveTab('friends')}>👥 أصدقاء جدد</button>
        <button onClick={() => setActiveTab('market')}>🛍️ السوق الملكي</button>
      </div>

      <div className="discovery-content">
        {activeTab === 'friends' ? (
          <div className="users-grid">
            {allUsers.map(u => (
              <div key={u.id} className="user-card">
                <span>👤 {u.username}</span>
                <button onClick={() => socket.emit('friend_request', { target: u.username })}>
                  {u.isFriend ? 'الغاء الصداقة' : 'إضافة صديق'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="market-grid">
            {/* قسم نشر بضاعة جديدة للأدمن والمستخدمين */}
            <div className="market-post-card">
               {/* كود رفع منشور السوق */}
            </div>
            {marketPosts.map(post => (
              <div key={post.id} className="market-item">
                <img src={post.imgUrl} alt="product" />
                <p>{post.description}</p>
                <b>السعر: {post.price} 💰</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryStore;
