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

// التعديل هنا: يجب استخدام متغير API_BASE وليس hf.space
const socket = io(API_BASE, { 
  transports: ['websocket'],
  withCredentials: false
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
    // حذف أي مستمعات قديمة "تائهة" لضمان اتصال نظيف
    socket.removeAllListeners();

    socket.on('connect', () => console.log("📡 تم الاتصال بالسيرفر السحابي!"));
    socket.on('connect_error', (err) => console.log("❌ خطأ اتصال:", err.message));

    // 1. الاستماع لنجاح الدخول (المفتاح الرئيسي)
    socket.on('login_success', (u) => {
        console.log("✅ رد السيرفر بالنجاح! المستخدم هو:", u.username);
        setUser(u);
        setIsLogged(true); // تأكد أن الحالة IsLogged معرفة فوق بـ [isLogged, setIsLogged]
    });

    // 2. الاستماع للبيانات الشاملة (لضمان تحميل الشات والإعلانات)
    socket.on('init_data', (data) => {
      console.log("📥 استلام البيانات الشاملة من السيرفر");
      if (data && data.user) {
        setAds(data.ads || []);
        setChat(data.chatHistory || []);
        setFiles(data.stories || []); 
        setUser(data.user);
        setIsLogged(true); 
      }
    });

    socket.on('new_story', (newFile) => {
        setFiles(prev => [newFile, ...prev]); 
    });

    // 3. الاستماع لرسائل الشات
    socket.on('message', (m) => setChat(prev => [...prev, m]));

    // 4. رسائل الخطأ
    socket.on('error_msg', (msg) => {
        console.log("❌ رد السيرفر بالفشل:", msg);
        alert(msg);
    });

    // تنظيف عند الخروج
    return () => socket.removeAllListeners();
}, []);

    // 3. الاستماع لبيانات المبادأة
    socket.on('init_data', (data) => { 
      console.log("📥 بيانات المبادأة وصلت من السيرفر");
      if (data && data.user) {
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

    // ... باقي المستمعات (update_stats, new_file, etc.) كما هي لديك

    socket.on('error_msg', (msg) => alert("⚠️ " + msg));

    // تنظيف المستمعات عند إغلاق المكون
    return () => {
      socket.off('message');
      socket.off('login_success');
      socket.off('init_data');
      socket.off('error_msg');
    };
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
  const file = e.target.files[0];
  if (file) {
    const fd = new FormData();
    fd.append('file', file); // تأكد أن الاسم 'file' يطابق ما ينتظره السيرفر
    fd.append('uploader', user.username);
    
    try {
      // نستخدم نفس مسار رفع الإعلانات أو مسار مخصص للقصص
      const res = await axios.post(`${API_BASE}/api/upload-story`, fd);
      if (res.data.success) {
        alert("✅ تم الرفع بنجاح!");
      }
    } catch (err) {
      console.error("خطأ في الرفع:", err);
      alert("❌ فشل الرفع، تأكد من حجم الملف");
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

