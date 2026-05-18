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
import DiscoveryStore from './components/DiscoveryStore';
import VirtualFlash from './components/VirtualFlash';
import PrayerWidget from './components/PrayerWidget'; 
import AdSliderBottom from './components/AdSliderBottom';
import './App.css';

// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// تفعيل اتصال السوكت المشفر (WSS) ليعمل مع جدار الحماية السحابي
const socket = io(API_BASE, { 
  transports: ['websocket', 'polling'],
  secure: true,
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
  const [currentGroup, setCurrentGroup] = useState({ id: 'public', name: 'المجموعة العامة' });
  const [groups, setGroups] = useState([{ id: 'public', name: 'المجموعة العامة' }]);

  useEffect(() => {
    const fetchInitialFiles = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/stories`); 
        setFiles(res.data || []);
      } catch (err) {
        console.error("خطأ جلب سجل الحالات البثية:", err);
      }
    };
    fetchInitialFiles();

    socket.on('group_message', (data) => {
      if (data.roomId === currentGroup.id) {
        setChat(prev => [...prev, data.msg]);
      }
    });

    socket.on('message', (m) => setChat(prev => [...prev, m]));
    
    socket.on('init_data', (data) => { 
      if (data.user) {
        setAds(data.ads || []); 
        setChat(data.chatHistory || []);
        setUser(data.user);
        if (data.groups) setGroups(data.groups); 
        if (data.stats) { 
            setTotalUsers(data.stats.totalUsers); 
            setActiveUsers(data.stats.activeUsers); 
        }
        setIsLogged(true); 
      }
    });

    socket.on('update_stats', (data) => { 
      setTotalUsers(data.totalUsers); 
      setActiveUsers(data.activeUsers); 
    });

    socket.on('new_file', (f) => setFiles(prev => [f, ...prev]));
    socket.on('new_group_added', (g) => setGroups(prev => [...prev, g]));
    
    socket.on('register_success', (u) => { 
      alert(`🎉 تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.`); 
      setIsSignUp(false); 
      setPassword("");
    });

    socket.on('update_groups_list', (updatedGroups) => {
      setGroups(updatedGroups);
      const currentUpdate = updatedGroups.find(g => g.id === currentGroup.id);
      if (currentUpdate) setCurrentGroup(currentUpdate);
    });

    socket.on('group_chat_history', (data) => {
      if (data.roomId === currentGroup.id) {
        setChat(data.history || []);
      }
    });

    socket.on('group_deleted_success', (data) => {
      setGroups(prev => prev.filter(g => g.id !== data.roomId));
      setChat([]); 
      setCurrentGroup({ id: 'public', name: 'المجموعة العامة' });
      socket.emit('join_group_room', { roomId: 'public' });
      alert("🗑️ تم حذف المجموعة وتطهير ملف محادثتها من الهارد بنجاح!");
    });

    socket.on('update_ads', (data) => setAds(data));
    socket.on('error_msg', (msg) => alert("⚠️ " + msg));

    return () => {
      socket.off('group_message');
      socket.off('message');
      socket.off('init_data');
      socket.off('update_stats');
      socket.off('new_file');
      socket.off('new_group_added');
      socket.off('register_success');
      socket.off('update_groups_list');
      socket.off('group_chat_history');
      socket.off('group_deleted_success');
      socket.off('update_ads');
      socket.off('error_msg');
    };
  }, [currentGroup.id]);

  const handleAction = (e) => {
    e.preventDefault();
    if (!user.username || !password) {
      alert("⚠️ يرجى ملء جميع الحقول المتاحة.");
      return;
    }
    if (!socket.connected) socket.connect();
    const action = isSignUp ? 'register' : 'join';
    socket.emit(action, { username: user.username, password: password, role: user.role || 'مستخدم' });
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const fd = new FormData();
      fd.append('file', e.target.files[0]);
      fd.append('user', user.username);
      try {
        await axios.post(`${API_BASE}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } catch (err) { 
        console.error("Upload error", err); 
      }
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
        <LoginBox 
          isSignUp={isSignUp} setIsSignUp={setIsSignUp}
          user={user} setUser={setUser}
          password={password} setPassword={setPassword}
          handleAction={handleAction}
        />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundImage: "url('/assets/background.png')", backgroundSize: 'cover' }}>
      <div className="app-overlay">
        
        {/* 1. شريط نظام السقف الإلكتروني */}
        <Header activeUsers={activeUsers} totalUsers={totalUsers} user={user} />
        
        {/* 2. الفراغ الملكي الفاصل المستقل لعرض جملة الترحيب واللوجو حرّاً */}
        <div className="header-center">
          <div className="welcome-msg">مرحباً بكم فى عالمكم الجديد</div>
          <img src="/assets/logo.png" className="mini-logo" alt="logo" />
        </div>
        
        {/* 3. شريط الإعلانات التفاعلي المربوط بمسافات الـ CSS (العلوى الحصري) */}
        <div className="ads-slider-wrapper">
          <AdSlider ads={ads} filterLocation="top" /> 
        </div>

        {/* 4. استدعاء شريط الأزرار المستقل والمطور ديناميكياً */}
        <ActionBar 
          setShowDiscovery={setShowDiscovery} 
          setDiscoveryTab={setDiscoveryTab} 
        />

        {/* ✨ تم تطهير وحذف الرموز القديمة للفلاشة ومواقيت الصلاة من هذا المربع العلوي بنجاح لتوسيع الرؤية الشاهقة */}

        {/* 5. المخطط الثلاثي للدردشة والقوائم والقصص */}
        {/* 5. المخطط الثلاثي للدردشة والقوائم والقصص المأمن من التداخل */}
        {/* 5. المخطط الثلاثي للدردشة والقوائم والقصص النظيف تماماً من أي تداخل */}
        <div className="main-content">
          
          {/* الجانب الأيمن: المجموعات وأدوات الأدمن وتمرير السوكيت الفعال */}
          <GroupsSidebar 
            groups={groups} 
            user={user} 
            socket={socket}
            currentGroup={currentGroup.id}
            onJoinRoom={handleSwitchRoom}
            onCreateGroup={handleCreateGroup} 
          />

          {/* المنتصف: منطقة الدردشة واستقبال رسائل الغرفة الفرعية */}
          <ChatArea 
            chat={chat} 
            currentUser={user.username} 
            msg={msg} 
            setMsg={setMsg} 
            socket={socket} 
            currentGroup={currentGroup} 
          />

          {/* الجانب الأيسر: القصص والمشاركات العامة */}
          <UploadSidebar 
            files={files} 
            serverUrl={API_BASE} 
            onUpload={handleFileUpload} 
            user={user} 
          />
          
        </div> {/* 🧱 تم إغلاق المخطط الثلاثي بنجاح تام لحماية مساحة الدردشة كلياً */}

        {/* 6. نافذة الأصدقاء والسوق الملكي التفاعلي المنبثقة */}
        {showDiscovery && (
          <DiscoveryStore 
            user={user} 
            socket={socket} 
            API_BASE={API_BASE} 
            defaultTab={discoveryTab} 
            onClose={() => setShowDiscovery(false)} 
          />
        )}

        {/* 👑 1. [الموضع الاحترافي الصحيح] شريط الإعلانات التفاعلي السلس المكتمل بجميع المواصفات والحركة التلقائية متموضع بعرض الصفحة كلياً تحت الشات */}
        <div className="ads-section-wrapper" style={{ marginTop: '15px', marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
          <AdSlider ads={ads} filterLocation="bottom" />
        </div>

        {/* 👑 2. حاوية بقية الأدوات السفلية المستقرة بانتظام ممتد */}
        <div className="spacer-wrapper-zone" style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '15px' }}> 

          {/* 🕋 ب) منظومة مواقيت الصلاة والأذان المتزامن مع صورة الكعبة متمركزة يميناً بارتفاع 120px */}
          <PrayerWidget socket={socket} />

          {/* 📟 ج) الفلاشة الافتراضية الموقوتة بـ 72 ساعة مستقرة في موضعها السفلي الاحترافي بنجاح وثبات كامل */}
          <VirtualFlash user={user} socket={socket} />
    
          {/* 7. شريط الإقرارات والبار السفلي الأزلي للمنصة */}
          <div className="disclaimer-bar" style={{ margin: '5px 0 0 0' }}>
            👑 منصة OURO Steps - تجربة ملكية فريدة 2026
          </div>

        </div> {/* إغلاق حاوية التتابع الفرعية بشكل صحيح */}

      </div> {/* إغلاق app-overlay */}
    </div> // إغلاق app-container
  );
}

export default App;
