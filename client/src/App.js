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

  if (!isLogged) {
    return (
      <div className="login-page">
        <LoginBox 
          isSignUp={isSignUp} setIsSignUp={setIsSignUp}
          user={user} setUser={setUser}
          password={password} setPassword={setPassword}
          handleAction={handleAuthAction}
        />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <div className="app-overlay" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        <Header 
          activeUsers={stats.activeUsers} 
          totalUsers={stats.totalUsers} 
          user={user} 
          onOpenDiscovery={() => setShowDiscovery(true)} 
        />
        
          {/* حذفنا الـ style المباشر واكتفينا بالكلاس */}
        <div className="ads-section-wrapper">
          <AdSlider ads={ads} /> 
        </div>


        <main className="main-content" style={{ marginTop: '20px', display: 'flex', flexGrow: 1, gap: '20px', padding: '0 20px' }}>
          <GroupsSidebar 
            groups={groups} 
            user={user} 
            socket={socket}
            currentGroup={currentGroup.id}
            onJoinRoom={handleSwitchRoom}
            triggerCreate={handleCreateGroup} 
          />

          <ChatArea 
            chat={chat} 
            currentUser={user.username} 
            msg={msg} 
            setMsg={setMsg} 
            socket={socket} 
            currentGroup={currentGroup}
          />

          <UploadSidebar files={files} serverUrl={API_BASE} onUpload={handleFileUpload} />
        </main>

        {showDiscovery && (
          <DiscoveryStore 
            user={user} 
            socket={socket} 
            API_BASE={API_BASE} 
            onClose={() => setShowDiscovery(false)} 
          />
        )}

        <div className="disclaimer-bar">
          👑 منصة OURO Steps - تجربة ملكية فريدة
        </div>
      </div>
    </div>
  );
}

export default App;
