import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// استدعاء المكونات
import Header from './components/Header';
import AdSlider from './components/AdSlider'; 
import GroupsSidebar from './components/GroupsSidebar';
import UploadSidebar from './components/UploadSidebar';
import LoginBox from './components/LoginBox';
import ChatArea from './components/ChatArea';
import DiscoveryStore from './components/DiscoveryStore';

import './App.css';

const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

const socket = io(API_BASE, { 
  transports: ['websocket'], 
  upgrade: false,
  reconnection: true 
});

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState({ username: '', role: '', user_id: '' });
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const [ads, setAds] = useState([]);
  const [files, setFiles] = useState([]);
  const [groups, setGroups] = useState([{ id: 'public', name: 'المجموعة العامة' }]);
  const [currentGroup, setCurrentGroup] = useState({ id: 'public', name: 'المجموعة العامة' });
  const [stats, setStats] = useState({ activeUsers: 0, totalUsers: 0 });
  const [showDiscovery, setShowDiscovery] = useState(false);

  useEffect(() => {
    socket.on('init_data', (data) => {
      if (data.ads) setAds(data.ads);
      if (data.chatHistory) setChat(data.chatHistory);
      if (data.groups) setGroups([{ id: 'public', name: 'المجموعة العامة' }, ...data.groups]);
      if (data.stats) setStats(data.stats);
      setIsLogged(true);
      setTimeout(() => {
        setIsLogged(true);
      }, 100);
    });

    socket.on('message', (m) => setChat(prev => [...prev, m]));
    socket.on('update_stats', (newStats) => setStats(newStats));
    socket.on('update_ads', (updatedAds) => setAds(updatedAds));
    
    socket.on('new_group_success', (group) => {
        setGroups(prev => [...prev, group]);
        setCurrentGroup({ id: group._id || group.id, name: group.name }); 
        console.log(`✨ تم الانتقال لغرفة: ${group.name}`);
    });
    
    socket.on('added_to_group', (data) => {
      if (data.targetUser === user.username) {
        setGroups(prev => [...prev, { id: data.groupId, name: data.groupName }]);
      }
    });

    socket.on('error_msg', (msg) => alert("⚠️ " + msg));

    return () => socket.off();
  }, [user.username]);

  const handleCreateGroup = useCallback(() => {
    const name = prompt("👑 أدخل اسم الشات الملكي الجديد:");
    if (name && name.trim() !== "") {
      socket.emit('create_group', { groupName: name.trim(), owner: user.username });
    }
  }, [user.username]);

  const handleAuthAction = (e) => {
    e.preventDefault();
    const action = isSignUp ? 'register' : 'join';
    socket.emit(action, { username: user.username, password: password, role: user.role || 'مستخدم' });
  };

  const addFriendAndStartChat = async (friendInfo) => {
    try {
        const response = await fetch('http://localhost:5000/api/add-friend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(friendInfo)
        });
        const data = await response.json();
        console.log("خطة الدردشة الفردية بدأت:", data.message);
    } catch (error) {
        console.error("خطأ في بدء الإعداد:", error);
    }
};

  const handleSendMessage = async (text) => {
    const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: "101", text: text })
    });
    
    const result = await response.json();
    if (result.success) {
        console.log(`تم الإرسال في تمام الساعة: ${new Date(result.timestamp).toLocaleTimeString()}`);
    }
};


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('adImage', file);
    fd.append('user', user.username);
    try {
      await axios.post(`${API_BASE}/api/upload-ad`, fd);
      alert("✅ تم الرفع بنجاح!");
    } catch (err) { console.error("Upload error", err); }
  };

  const handleSwitchRoom = (groupId) => {
    const target = groups.find(g => (g.id || g._id) === groupId);
    if (target) setCurrentGroup({ id: target.id || target._id, name: target.name });
  };

  // --- عرض واجهة تسجيل الدخول ---
  if (!isLogged) {
    return (
      /* الربط المطلق بكلاس login-page لضمان تمركز العناصر */
      <div className="login-page">
        <LoginBox 
          isSignUp={isSignUp} 
          setIsSignUp={setIsSignUp}
          user={user} 
          setUser={setUser}
          password={password} 
          setPassword={setPassword}
          handleAction={handleAuthAction}
        />
      </div>
    );
  }

  // --- عرض الواجهة الرئيسية الملكية ---
  return (
    /* 1. الحاوية الأم: تتبع .app-container لضمان التمدد الحر وشريط التمرير */
    <div className="app-container">
      
      {/* 2. الغلاف: يتبع .app-overlay للمرونة وتوزيع العناصر تحت بعضها */}
      <div className="app-overlay">
        
        {/* 3. الهيدر الملكي: يطبق .ouro-header بكل مسافاته (يحتوي بداخله على اللوجو 500px) */}
        <Header 
          activeUsers={stats.activeUsers} 
          totalUsers={stats.totalUsers} 
          user={user} 
          onOpenDiscovery={() => setShowDiscovery(true)} 
        />
        
        {/* 4. شريط الإعلانات: يتبع .ads-section-wrapper لترك مسافة الـ 450px للوجو */}
        <div className="ads-section-wrapper">
          <AdSlider ads={ads} /> 
        </div>

        {/* 5. المحتوى الرئيسي: يتبع .main-content لتقسيم الشات والسايدبار ببنط 8px ودوران 60px */}
        <main className="main-content">
          
          {/* الجانب الأيمن: المجموعات (Sidebar) */}
          <GroupsSidebar 
            groups={groups} 
            user={user} 
            socket={socket}
            currentGroup={currentGroup.id}
            onJoinRoom={handleSwitchRoom}
            triggerCreate={handleCreateGroup} 
          />

          {/* المنتصف: ساحة الدردشة (Chat Area) */}
          <ChatArea 
            chat={chat} 
            currentUser={user.username} 
            msg={msg} 
            setMsg={setMsg} 
            socket={socket} 
            currentGroup={currentGroup}
          />

          {/* الجانب الأيسر: القصص والمشاركات (Stories Sidebar) */}
          {/* تم تغليفه بكلاس stories-sidebar لربطه بتنسيق الـ 300px في ملف الـ CSS */}
          <div className="stories-sidebar">
            <UploadSidebar 
              files={files} 
              serverUrl={API_BASE} 
              onUpload={handleFileUpload} 
            />
          </div>
          
        </main>

        {/* 6. نافذة الأصدقاء والسوق (Discovery Modal) */}
        {showDiscovery && (
          <DiscoveryStore 
            user={user} 
            socket={socket} 
            API_BASE={API_BASE} 
            onClose={() => setShowDiscovery(false)} 
          />
        )}

        {/* 7. شريط التنبيه السفلي: يتبع .disclaimer-bar لضمان اللون الذهبي المتوهج */}
        <div className="disclaimer-bar">
          👑 منصة OURO Steps - تجربة ملكية فريدة 2026
        </div>

      </div>
    </div>
  );
}

export default App;
