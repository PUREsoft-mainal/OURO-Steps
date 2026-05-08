import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Header from './components/Header';
import AdSlider from './components/AdSlider'; 
import GroupsSidebar from './components/GroupsSidebar';
import UploadSidebar from './components/UploadSidebar';
import LoginBox from './components/LoginBox';
import ChatArea from './components/ChatArea';
import './App.css';

// 1. استخدام الرابط المباشر لـ Hugging Face
const API_BASE = "https://hf.space";

const socket = io(API_BASE, { 
  transports: ['websocket'],
  upgrade: false,
  reconnection: true,
  reconnectionAttempts: 5
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
  const [groups, setGroups] = useState([{ id: 'public', name: 'المجموعة العامة' }]);

  useEffect(() => {
    socket.removeAllListeners();

    socket.on('connect', () => console.log("📡 تم الاتصال بالسيرفر السحابي!"));
    socket.on('connect_error', (err) => console.log("❌ خطأ اتصال:", err.message));

    socket.on('login_success', (u) => {
        console.log("✅ رد السيرفر بالنجاح! المستخدم هو:", u.username);
        setUser(u);
        setIsLogged(true); 
    });

    socket.on('init_data', (data) => {
      console.log("📥 استلام البيانات الشاملة من السيرفر");
      if (data) {
        if (data.ads) setAds(data.ads);
        if (data.chatHistory) setChat(data.chatHistory);
        if (data.stories) setFiles(data.stories); 
        if (data.stats) {
            setTotalUsers(data.stats.totalUsers);
            setActiveUsers(data.stats.activeUsers);
        }
        if (data.user) {
            setUser(data.user);
            setIsLogged(true);
        }
      }
    });

    socket.on('new_story', (newFile) => {
        setFiles(prev => [newFile, ...prev]); 
    });

    socket.on('message', (m) => setChat(prev => [...prev, m]));

    socket.on('update_stats', (data) => {
        setTotalUsers(data.totalUsers);
        setActiveUsers(data.activeUsers);
    });

    socket.on('error_msg', (msg) => {
        console.log("❌ رد السيرفر بالفشل:", msg);
        alert(msg);
    });

    return () => socket.removeAllListeners();
  }, []);

  const handleAction = (e) => {
    e.preventDefault();
    const action = isSignUp ? 'register' : 'join';
    socket.emit(action, { 
        username: user.username, 
        password: password, 
        role: user.role || 'مستخدم' 
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploader', user.username);
      
      try {
        // تنبيه: Cloudinary يحتاج HTTPS للرفع، لذا نستخدم API_BASE
        const res = await axios.post(`${API_BASE}/api/upload-story`, fd);
        if (res.data.success) {
          alert("✅ تم الرفع بنجاح!");
        }
      } catch (err) {
        console.error("خطأ في الرفع:", err);
        alert("❌ فشل الرفع، تأكد أن السيرفر يعمل");
      }
    }
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
        <Header activeUsers={activeUsers} totalUsers={totalUsers} user={user} />
        <AdSlider ads={ads} /> 
        <div className="main-content">
          <GroupsSidebar groups={groups} socket={socket} user={user} />
          <ChatArea chat={chat} currentUser={user.username} msg={msg} setMsg={setMsg} socket={socket} />
          <UploadSidebar files={files} serverUrl={API_BASE} onUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}

export default App;
