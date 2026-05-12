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

import './App.css';

const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// إنشاء اتصال السوكيت
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

  useEffect(() => {
    socket.on('init_data', (data) => {
      if (data.ads) setAds(data.ads);
      if (data.chatHistory) setChat(data.chatHistory);
      if (data.groups) setGroups([{ id: 'public', name: 'المجموعة العامة' }, ...data.groups]);
      if (data.stats) setStats(data.stats);
      setIsLogged(true);
    });

    socket.on('message', (m) => setChat(prev => [...prev, m]));
    socket.on('update_stats', (newStats) => setStats(newStats));
    socket.on('update_ads', (updatedAds) => setAds(updatedAds));
    socket.on('new_group_success', (group) => {
        setGroups(prev => [...prev, group]);
        console.log("✅ تمت إضافة المجموعة الجديدة للقائمة:", group.name);
    });
    
    socket.on('added_to_group', (data) => {
      if (data.targetUser === user.username) {
        setGroups(prev => [...prev, { id: data.groupId, name: data.groupName }]);
      }
    });

    // داخل useEffect في App.js
    socket.on('new_group_success', (group) => {
        setGroups(prev => [...prev, group]);
    // التعديل: الانتقال التلقائي للغرفة الجديدة
        setCurrentGroup({ id: group._id, name: group.name });
        alert(`✨ تم إنشاء غرفة "${group.name}" والانتقال إليها!`);
    });


    socket.on('error_msg', (msg) => alert("⚠️ " + msg));

    return () => socket.off();
  }, [user.username]);

  // --- إصلاح الزر (تمت إضافة التبعيات اللازمة لمنع التجميد) ---
  const handleCreateGroup = useCallback(() => {
    console.log("🛠️ جاري تشغيل دالة إنشاء الشات...");
    const name = prompt("👑 أدخل اسم الشات الملكي الجديد:");
    
    if (name && name.trim() !== "") {
      socket.emit('create_group', { 
        groupName: name.trim(),
        owner: user.username // إرسال اسم المالك لضمان التوثيق في قاعدة البيانات
      });
      console.log("📡 تم إرسال الطلب للسيرفر باسم:", name);
    } else {
      console.log("⚠️ تم إلغاء الإنشاء أو الاسم فارغ.");
    }
  }, [user.username]); // تأكدنا من أن الدالة تعرف المستخدم الحالي

  const handleAuthAction = (e) => {
    e.preventDefault();
    const action = isSignUp ? 'register' : 'join';
    socket.emit(action, { username: user.username, password: password, role: user.role || 'مستخدم' });
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
    <div className="app-container">
      <div className="app-overlay">
        <Header activeUsers={stats.activeUsers} totalUsers={stats.totalUsers} user={user} />
        <AdSlider ads={ads} /> 

        <main className="main-content">
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
      </div>
    </div>
  );
}

export default App;
