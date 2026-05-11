import React, { useState, useEffect, useCallback, useMemo } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// استدعاء المكونات (التي أرسلتها سابقاً)
import Header from './components/Header';
import AdSlider from './components/AdSlider'; 
import GroupsSidebar from './components/GroupsSidebar';
import UploadSidebar from './components/UploadSidebar';
import LoginBox from './components/LoginBox';
import ChatArea from './components/ChatArea';

// استدعاء التنسيقات
import './App.css';

// الإعدادات السحابية (Hugging Face)
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// إنشاء اتصال السوكيت خارج المكون لضمان استقراره
const socket = io(API_BASE, { 
  transports: ['websocket'], 
  upgrade: false,
  reconnection: true 
});

function App() {
  // --- 1. حالات الهوية والدخول ---
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState({ username: '', role: '', user_id: '' });
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // --- 2. حالات البيانات الأساسية ---
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const [ads, setAds] = useState([]);
  const [files, setFiles] = useState([]); // Stories
  const [groups, setGroups] = useState([{ id: 'public', name: 'المجموعة العامة' }]);
  const [currentGroup, setCurrentGroup] = useState({ id: 'public', name: 'المجموعة العامة' });

  // --- 3. حالات الإحصائيات ---
  const [stats, setStats] = useState({ activeUsers: 0, totalUsers: 0 });

  // --- 4. إدارة أحداث السوكيت (Socket Logic) ---
  useEffect(() => {
    // استقبال البيانات عند الدخول لأول مرة
    socket.on('init_data', (data) => {
      if (data.ads) setAds(data.ads);
      if (data.chatHistory) setChat(data.chatHistory);
      if (data.groups) setGroups([{ id: 'public', name: 'المجموعة العامة' }, ...data.groups]);
      if (data.stats) setStats(data.stats);
      setIsLogged(true);
    });

    // استقبال الرسائل اللحظية
    socket.on('message', (m) => setChat(prev => [...prev, m]));

    // تحديث الإحصائيات لحظياً
    socket.on('update_stats', (newStats) => setStats(newStats));

    // تحديث الإعلانات عند رفع إعلان جديد
    socket.on('update_ads', (updatedAds) => setAds(updatedAds));

    // إدارة المجموعات
    socket.on('new_group_success', (group) => setGroups(prev => [...prev, group]));
    socket.on('added_to_group', (data) => {
      if (data.targetUser === user.username) {
        setGroups(prev => [...prev, { id: data.groupId, name: data.groupName }]);
      }
    });

    socket.on('error_msg', (msg) => alert("⚠️ " + msg));

    return () => {
      socket.off('message');
      socket.off('init_data');
      socket.off('update_stats');
    };
  }, [user.username]);

  // --- 5. العمليات (Actions) ---

  // دخول / تسجيل
  const handleAuthAction = useCallback((e) => {
    e.preventDefault();
    const action = isSignUp ? 'register' : 'join';
    socket.emit(action, { 
      username: user.username, 
      password: password, 
      role: user.role || 'مستخدم' 
    });
  }, [isSignUp, user, password]);

  // إنشاء مجموعة جديدة
const handleCreateGroup = () => {
  const name = prompt("👑 أدخل اسم الشات الملكي الجديد:");
  if (name && name.trim() !== "") {
    // إرسال البيانات للسيرفر
    socket.emit('create_group', { groupName: name });
    console.log("تم إرسال طلب إنشاء مجموعة:", name); // للتأكد من التفاعل في الـ Console
  }
};

  // رفع القصص (Stories) إلى Cloudinary عبر السيرفر
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('user', user.username);

    try {
      const res = await axios.post(`${API_BASE}/api/upload`, fd);
      if (res.data.success) alert("✨ تم نشر قصتك بنجاح!");
    } catch (err) {
      console.error("Upload error", err);
      alert("❌ فشل الرفع، حاول مرة أخرى.");
    }
  };

  // تبديل الغرف
  const handleSwitchRoom = (groupId) => {
    const target = groups.find(g => (g.id || g._id) === groupId);
    if (target) {
      setCurrentGroup({ id: target.id || target._id, name: target.name });
      // هنا يمكن إضافة socket.emit('join_room', groupId) إذا فعلنا الغرف الخاصة بالسيرفر
    }
  };

  // --- 6. واجهة المستخدم (UI) ---

  // إذا لم يسجل الدخول، اعرض شاشة الدخول فقط
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

  // الواجهة الرئيسية للمنصة
  return (
    <div className="app-container">
      <div className="app-overlay">
        
        {/* الرأس: الإحصائيات والملف الشخصي */}
        <Header 
          activeUsers={stats.activeUsers} 
          totalUsers={stats.totalUsers} 
          user={user} 
        />

        {/* سلايدر الإعلانات التفاعلي */}
        <AdSlider ads={ads} /> 

        <main className="main-content">
          {/* الجانب الأيمن: إدارة المجموعات */}
          <GroupsSidebar 
            groups={groups} 
            user={user} 
            socket={socket}
            currentGroup={currentGroup.id}
            onJoinRoom={handleSwitchRoom}
            onCreateGroup={handleCreateGroup}
          />

          {/* المنتصف: منطقة الدردشة */}
          <ChatArea 
            chat={chat} 
            currentUser={user.username} 
            msg={msg} 
            setMsg={setMsg} 
            socket={socket} 
            currentGroup={currentGroup}
          />

          {/* الجانب الأيسر: القصص (Stories) */}
          <UploadSidebar 
            files={files} 
            serverUrl={API_BASE} 
            onUpload={handleFileUpload} 
          />
        </main>

      </div>
    </div>
  );
}

export default App;
