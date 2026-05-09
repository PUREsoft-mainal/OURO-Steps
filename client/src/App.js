import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Header from './components/Header';
import AdSlider from './components/AdSlider'; // استخدام المكون الجديد
import GroupsSidebar from './components/GroupsSidebar';
import UploadSidebar from './components/UploadSidebar';
import LoginBox from './components/LoginBox';
import ChatArea from './components/ChatArea';
import './App.css';

const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";
const socket = io(API_BASE, { 
  transports: ['websocket'], // حذفنا polling لإجبار الاتصال المباشر
  upgrade: false 
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
    // 1. الاستماع لرسائل الشات
    socket.on('message', (m) => setChat(prev => [...prev, m]));
    
    // 2. الاستماع لنجاح الدخول وفتح الصفحة فوراً
    socket.on('login_success', (u) => {
        console.log("✅ تم تسجيل الدخول بنجاح");
        setUser(u);
        setIsLogged(true);
    });

    // 3. الاستماع لبيانات المبادأة (الإعلانات، الشات، الإحصائيات)
    socket.on('init_data', (data) => { 
      if (data.user) {
        setAds(data.ads || []); 
        setChat(data.chatHistory || []);
        setUser(data.user); 
        if (data.stats) { 
            setTotalUsers(data.stats.totalUsers); 
            setActiveUsers(data.stats.activeUsers); 
        }
        setIsLogged(true); 
      }
    });

    // 4. تحديث الإحصائيات (المتواجدون والمسجلون)
    socket.on('update_stats', (data) => { 
      setTotalUsers(data.totalUsers); 
      setActiveUsers(data.activeUsers); 
    });

    // 5. الاستماع للملفات والمجموعات الجديدة
    socket.on('new_file', (f) => setFiles(prev => [f, ...prev]));
    socket.on('new_group_added', (g) => setGroups(prev => [...prev, g]));
    
    // 6. الاستماع لنجاح تسجيل حساب جديد
    socket.on('register_success', (u) => { 
      alert(`🎉 تم التسجيل بنجاح`); 
      setIsSignUp(false); // العودة لصفحة الدخول
    });

    // 7. تحديث شريط الإعلانات
    socket.on('update_ads', (data) => {
      setAds(data);
    });

    // 8. رسائل الخطأ
    socket.on('error_msg', (msg) => alert("⚠️ " + msg));

    // تنظيف المستمعات عند إغلاق المكون
    return () => socket.off();
  }, []);

  const handleAction = (e) => {
    e.preventDefault();
    if (!socket.connected) socket.connect();
    const action = isSignUp ? 'register' : 'join';
    socket.emit(action, { 
        username: user.username, 
        password: password, 
        role: user.role || 'مستخدم' 
    });
  };

  const handleFileUpload = async (e) => {
    if (e.target.files[0]) {
      const fd = new FormData();
      fd.append('file', e.target.files[0]);
      fd.append('user', user.username);
      try {
        await axios.post(`${API_BASE}/api/upload`, fd);
      } catch (err) { console.error("Upload error", err); }
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
        {/* الهيدر الملكي */}
        <Header activeUsers={activeUsers} totalUsers={totalUsers} user={user} />
        
        {/* شريط الإعلانات الجديد بالملف المستقل والأسهم */}
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

