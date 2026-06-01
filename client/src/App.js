/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Header from './components/Header';
import AdSlider from './components/AdSlider'; 
import ActionBar from './components/ActionBar'; 
import GroupsSidebar from './components/GroupsSidebar';
import UploadSidebar from './components/UploadSidebar';
import LoginBox from './components/LoginBox';
import ChatArea from './components/ChatArea';
import PrayerWidget from './components/PrayerWidget'; 
import AdSliderBottom from './components/AdSliderBottom';
import DiscoveryStore from './components/DiscoveryStore';
import Market from './components/Market'; 
import ApiKeyModal from './components/ApiKeyModal';
import OuroCenterModal from './components/OuroCenterModal';
import './App.css';

const API_BASE = "https://hf.space";

const socket = io(API_BASE, { 
  transports: ['websocket', 'polling'],
  secure: true,
  path: '/socket.io',
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  rejectUnauthorized: false
});

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState({ username: '', role: '', user_id: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [password, setPassword] = useState("");
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const [files, setFiles] = useState([]);
  const [ads, setAds] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryTab, setDiscoveryTab] = useState('friends');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState({ id: 'public', name: 'المجموعة العامة' });
  const [groups, setGroups] = useState([{ id: 'public', name: 'المجموعة العامة' }]);
  const [showPrayerModal, setShowPrayerModal] = useState(false); 
  const [showMarket, setShowMarket] = useState(false); 
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [marketPosts, setMarketPosts] = useState([]);
  const [newPost, setNewPost] = useState({ description: "", price: "", files: null });
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  
  // 👑 متغيرات الـ State المخصصة لتغذية الفلاشة الإلكترونية الحية ربطاً بالسحاب
  const [flashFiles, setFlashFiles] = useState([]);
  const [flashTitle, setFlashTitle] = useState("");
  const [selectedFlashFile, setSelectedFlashFile] = useState(null);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("🗑️ هل أنت متأكد من حذف هذه السلعة؟")) return;
    try {
      const res = await axios.delete(`${API_BASE}/api/market/delete/${postId}`, {
        data: { uploader: user?.username }
      });
      if (res.data.success) {
        alert("🗑️ تم حذف السلعة بنجاح!");
        setMarketPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) { alert("❌ غير مصرح لك بالحذف."); }
  };

  const handleMarketUpload = async (e) => {
    e.preventDefault();
    if (!newPost.description.trim() || !newPost.price.trim() || !newPost.files) {
      return alert("⚠️ الرجاء ملء كافة حقول السلعة واختيار الصور!");
    }
    const formData = new FormData();
    formData.append('username', user?.username);
    formData.append('description', newPost.description);
    formData.append('price', newPost.price);
    for (let i = 0; i < newPost.files.length; i++) {
      formData.append('marketImages', newPost.files[i]);
    }  
    try {
      const res = await axios.post(`${API_BASE}/api/upload-market`, formData);
      if (res.data.success) {
        setNewPost({ description: "", price: "", files: null });
        alert("🎉 تم نشر بضاعتك في السوق السحابي بنجاح!");
      }
    } catch (err) { alert("❌ فشل رفع السلعة للسيرفر السحابي."); }
  };

  // 👑 [دالة رفع ملفات الفلاشة الحقيقية لجوجل سحابياً]
  const handleFlashUpload = async () => {
    if (!flashTitle.trim() || !selectedFlashFile) return alert("⚠️ يرجى كتابة اسم وتحديد ملف أولاً!");
    const formData = new FormData();
    formData.append('username', user?.username);
    formData.append('flashFile', selectedFlashFile);
    
    try {
      const res = await axios.post(`${API_BASE}/api/flash/upload`, formData);
      if (res.data.success) {
        alert("🚀 تم تشفير وتأمين ورفع برنامجك مباشرة لحاوية Google Cloud بنجاح!");
        setFlashTitle("");
        setSelectedFlashFile(null);
        // إعادة جلب فوري للملفات المحدثة
        const updated = await axios.get(`${API_BASE}/api/flash/files/${user?.username}`);
        setFlashFiles(updated.data || []);
      }
    } catch (err) { alert("❌ حدث خطأ أثناء الرفع السحابي للفلاشة."); }
  };

  useEffect(() => {
    if (isLogged) {
      axios.get(`${API_BASE}/api/market`).then(res => setMarketPosts(res.data || [])).catch(() => {});
      axios.get(`${API_BASE}/api/flash/files/${user?.username}`).then(res => setFlashFiles(res.data || [])).catch(() => {});

      socket.on('new_market_post', (post) => setMarketPosts(prev => [post, ...prev]));
      socket.on('market_post_deleted', (data) => setMarketPosts(prev => prev.filter(p => p.id !== data.postId)));
      socket.on('flash_db_updated', (data) => setFlashFiles(data));
    }
    return () => {
      if (socket) {
        socket.off('new_market_post');
        socket.off('market_post_deleted');
        socket.off('flash_db_updated');
      }
    };
  }, [isLogged]);

  useEffect(() => {
    if (isLogged && socket) {
      setLoading(true);
      socket.on('init_users_data', (usersList) => {
        setAllUsers(usersList || []);
        setLoading(false);
      });
      socket.on('friend_updated', (data) => setAllUsers(data.usersList || []));
    }
    return () => {
      if (socket) {
        socket.off('init_users_data');
        socket.off('friend_updated');
      }
    };
  }, [isLogged]);
  
  useEffect(() => {
    if (socket) {
      socket.on('group_message', (data) => {
        if (data.roomId === currentGroup.id) setChat(prev => [...prev, data.msg]);
      });
      socket.on('message', (m) => setChat(prev => [...prev, m]));
      
      socket.on('init_data', (data) => { 
        if (data.user) {
          setAds(data.ads || []); 
          setChat(data.chatHistory || []); 
          setUser(data.user);
          if (data.groups) setGroups(data.groups); 
          setTotalUsers(data.stats?.totalUsers || 0); 
          setActiveUsers(data.stats?.activeUsers || 0); 
          setIsLogged(true); 
          setAllUsers(data.usersList || []);
          setLoading(false);
        }
      });

      socket.on('update_stats', (data) => { 
        if (data) { setTotalUsers(data.totalUsers || 0); setActiveUsers(data.activeUsers || 0); }
      });
      socket.on('new_file', (f) => setFiles(prev => [f, ...prev]));
      socket.on('new_group_added', (g) => setGroups(prev => [...prev, g]));
      socket.on('register_success', () => { alert(`🎉 تم التسجيل بنجاح!`); setIsSignUp(false); setPassword(""); });
      socket.on('update_groups_list', (g) => { setGroups(g); const c = g.find(x => x.id === currentGroup.id); if (c) setCurrentGroup(c); });
      socket.on('group_chat_history', (data) => { if (data.roomId === currentGroup.id) setChat(data.history || []); });
      socket.on('group_deleted_success', (data) => {
        setGroups(prev => prev.filter(g => g.id !== data.roomId));
        setCurrentGroup({ id: 'public', name: 'المجموعة العامة' });
        socket.emit('join_group_room', { roomId: 'public' });
      });
      socket.on('update_ads', (data) => setAds(data));
      socket.on('error_msg', (msg) => alert("⚠️ " + msg));
    }
    return () => { if (socket) { socket.removeAllListeners(); } };
  }, [currentGroup.id]);

  useEffect(() => {
    if (!isLogged) return;
    const fetchLiveAds = async () => { try { const res = await axios.get(`${API_BASE}/api/ads`); if (res.data) setAds(res.data); } catch (err) {} };
    fetchLiveAds();
    const adsInterval = setInterval(fetchLiveAds, 15 * 60 * 1000);
    return () => clearInterval(adsInterval);
  }, [isLogged]); 

  useEffect(() => {
    if (!isLogged) return;
    const fetchStories = async () => { try { const res = await axios.get(`${API_BASE}/api/stories`); if (res.data) setFiles(res.data); } catch (err) {} };
    fetchStories();
  }, [isLogged]);

  const handleAction = (e) => {
    e.preventDefault();
    if (!user.username || !password) return alert("⚠️ يرجى ملء جميع الحقول.");
    if (!socket.connected) socket.connect();
    socket.emit(isSignUp ? 'register' : 'join', { username: user.username, password: password, role: user.role || 'مستخدم' });
  };

  const handleFileUpload = async (e) => {
    if (e.target.files?.[0]) {
      const fd = new FormData();
      fd.append('storyFile', e.target.files[0]);
      fd.append('username', user.username);
      try { await axios.post(`${API_BASE}/api/upload-story`, fd); } catch (err) { console.error(err); }
    }
  };

  const handleSwitchRoom = (roomId) => {
    socket.emit('join_group_room', { roomId });
    const target = groups.find(g => g.id === roomId);
    if (target) setCurrentGroup(target);
  };

  const handleCreateGroup = () => {
    const name = prompt("أدخل اسم المجموعة المخصصة الجديدة:");
    if (name && name.trim()) socket.emit('create_group', { name });
  };

  if (!isLogged) {
    return (
      <div className="login-page" style={{ backgroundImage: "url('/assets/background.png')", backgroundSize: 'cover' }}>
        <LoginBox isSignUp={isSignUp} setIsSignUp={setIsSignUp} user={user} setUser={setUser} password={password} setPassword={setPassword} handleAction={handleAction} />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundImage: "url('/assets/background.png')", backgroundSize: 'cover' }}>
      <div className="app-overlay">
        <Header activeUsers={activeUsers} totalUsers={totalUsers} user={user} renderCoinBadge={<div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.4)', padding: '3px 10px', borderRadius: '4px', border: '1px solid #27ae60' }}><span style={{ color: '#27ae60', fontSize: '10px', fontWeight: 'bold' }}>🔐 نظام التصاريح الإدارية نشط 🏛️</span></div>} />
        
        <div className="header-center">
          <div className="welcome-msg">مرحباً بكم فى عالمكم الجديد</div>
          <img src="/assets/logo.png" className="mini-logo" alt="logo" />
        </div>
          
        <div className="ads-section-wrapper">
          <AdSlider ads={ads} filterLocation="top" user={user} /> 
        </div>

        <ActionBar setShowDiscovery={setShowDiscovery} setDiscoveryTab={setDiscoveryTab} setShowPrayerModal={setShowPrayerModal} setShowMarket={setShowMarket} friendRequestsCount={(() => { const c = allUsers.find(u => u.username === user?.username); return c && c.friendRequests ? c.friendRequests.length : 0; })()} setShowApiKeyModal={setShowApiKeyModal} setShowCenterModal={setShowCenterModal} setShowFlashModal={setShowFlashModal} />

            <div className="main-content">
          <GroupsSidebar groups={groups} user={user} socket={socket} currentGroup={currentGroup.id} onJoinRoom={handleSwitchRoom} onCreateGroup={handleCreateGroup} />
          <ChatArea chat={chat} currentUser={user.username} msg={msg} setMsg={setMsg} socket={socket} currentGroup={currentGroup} />
          <UploadSidebar files={files} serverUrl={API_BASE} onUpload={handleFileUpload} user={user} />
        </div>

        {showDiscovery && <DiscoveryStore user={user} socket={socket} API_BASE={API_BASE} defaultTab={discoveryTab} allUsers={allUsers} setAllUsers={setAllUsers} loading={loading} onClose={() => setShowDiscovery(false)} />}
        {showApiKeyModal && <ApiKeyModal user={user} API_BASE={API_BASE} onClose={() => setShowApiKeyModal(false)} />}
        {showCenterModal && <OuroCenterModal user={user} socket={socket} API_BASE={API_BASE} onClose={() => setShowCenterModal(false)} />}

        {/* 👑 [تعديل الفلاشة لتعرض وتحمل البيانات الحقيقية من مستودع جوجل سحابياً] */}
        {showFlashModal && (
          <div className="discovery-overlay" onClick={() => setShowFlashModal(false)}>
            <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '650px', background: '#070707', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(230,126,34,0.2)', paddingBottom: '10px' }}>
                <h3 style={{ color: '#e67e22', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>منظومة الفلاشة الإلكترونية الموقوتة لـ Google Cloud</h3>
                <button onClick={() => setShowFlashModal(false)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>
              <div className="discovery-body scrollbar-gold">
                <div className="market-upload-form gold-border" style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <input type="text" placeholder="📄 اكتب اسم البرنامج..." style={{ padding: '8px', background: '#000', color: '#fff', width: '100%', marginBottom: '10px' }} value={flashTitle} onChange={e => setFlashTitle(e.target.value)} />
                  <input type="file" id="realFlashInput" hidden onChange={e => setSelectedFlashFile(e.target.files?.[0] || null)} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="gold-btn-small" onClick={() => document.getElementById('realFlashInput').click()}>📁 {selectedFlashFile ? selectedFlashFile.name : "اختر ملف/تطبيق"}</button>
                    <button className="gold-btn-small" style={{ background: '#27ae60' }} onClick={handleFlashUpload}>🚀 بدء الرفع السحابي</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {flashFiles.map(file => (
                    <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#000', border: '1px solid #333' }}>
                      <div style={{ textAlign: 'right' }}><strong style={{ color: '#fff' }}>{file.originalName}</strong><br/><small style={{ color: '#aaa' }}>الحجم: {file.size} | المالك: {file.owner}</small></div>
                      <a href={file.gcsUrl} target="_blank" rel="noreferrer" className="gold-btn-small" style={{ background: '#2980b9', textDecoration: 'none', color: '#fff' }}>تحميل 📥</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showMarket && <Market user={user} marketPosts={marketPosts} handleMarketUpload={handleMarketUpload} handleDeletePost={handleDeletePost} setNewPost={setNewPost} newPost={newPost} apiBase={API_BASE} onClose={() => setShowMarket(false)} />}
        <div style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box', marginTop: '15px' }}><AdSliderBottom ads={ads} user={user} /></div>
        {showPrayerModal && <div className="ad-modal-overlay" onClick={() => setShowPrayerModal(false)}><div className="ad-modal-content prayer-modal-override" onClick={e => e.stopPropagation()} style={{ padding: '20px', maxWidth: '650px', background: 'rgba(10, 10, 10, 0.95)' }}><h3 style={{ color: '#d4af37', marginBottom: '20px', textAlign: 'center' }}>🕋 مواقيت الصلاة والآذان</h3><PrayerWidget socket={socket} user={user} /><button className="close-ad-btn" onClick={() => setShowPrayerModal(false)} style={{ marginTop: '20px', width: '100%' }}>إغلاق</button></div></div>}
        <div className="disclaimer-bar" style={{ margin: '15px 0', textAlign: 'center' }}> 👑 منصة OURO Steps - تجربة ملكية فريدة 2026 </div>
      </div>
    </div>
  );
}

export default App;
