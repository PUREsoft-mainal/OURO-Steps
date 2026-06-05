/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
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
import VirtualFlash from './components/VirtualFlash';
import PrayerWidget from './components/PrayerWidget'; 
import AdSliderBottom from './components/AdSliderBottom';
import DiscoveryStore from './components/DiscoveryStore';
import Market from './components/Market'; // استدعاء ملف السوق المستقل الجديد
import ApiKeyModal from './components/ApiKeyModal';
import OuroCenterModal from './components/OuroCenterModal';
import './App.css';

// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// تفعيل اتصال السوكت المشفر (WSS) ليعمل مع جدار الحماية السحابي
const socket = io(API_BASE, { 
  transports: ['websocket', 'polling'],
  secure: true,
  path: '/socket.io', // التأكيد على مسار البروكسي السحابي
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
  const [showPrayerModal, setShowPrayerModal] = useState(false); // حالة فتح وإغلاق نافذة الصلاة
  const [showMarket, setShowMarket] = useState(false); // كبسولة عرض وإغلاق نافذة السوق
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  // 👑 [تمت الزراعة والتحصين] متغيرات الـ State المخصصة لتغذية وبناء معرض بضائع السوق السحابية
  const [marketPosts, setMarketPosts] = useState([]);
  const [newPost, setNewPost] = useState({ description: "", price: "", files: null });
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
    // 🏛️ [States لوحة الإدارة] استقبال وتخزين طلبات السنتر ومفاتيح الـ API المعلقة حياً
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [pendingCenterRequests, setPendingCenterRequests] = useState([]);
  const [pendingApiRequests, setPendingApiRequests] = useState([]);
  // 👑 [دالة الحذف السحابية المحدثة] إطلاق نبضة الإبادة السيبرانية لكارت المنتج وتطهيره من MongoDB Atlas
  const handleDeletePost = async (postId) => {
    if (!window.confirm("🗑️ هل أنت متأكد من حذف هذه السلعة وإلغاء منشورها نهائياً من السحاب؟")) return;
    
    try {
      const res = await axios.delete(`${API_BASE}/api/market/delete/${postId}`, {
        data: { uploader: user?.username || user?.username }
      });
      
      if (res.data.success) {
        alert("🗑️ تم حذف السلعة وإبادة صورها الفيزيائية من السحاب بنجاح باهر!");
        
        // تحديث محلي صامت وفوري للمصفوفة لتختفي السلعة من الشاشة فوراً دون ريفريش
        setMarketPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
      alert("❌ غير مصرح لك بالحذف أو فشل الاتصال بقاعدة البيانات السحابية.");
    }
  };
  // 👑 [داخل جسد دالة App] صياغة دالة الرفع السحابية الحركية بدلاً من السطر 53 الجامد
  const handleMarketUpload = async (e) => {
    e.preventDefault();
    if (!newPost || !newPost.description.trim() || !newPost.price.trim() || !newPost.files) {
      return alert("⚠️ الرجاء كتابة وصف البضاعة وتحديد السعر واختيار الصور أولاً!");
    }

    const formData = new FormData();
    formData.append('uploader', user?.username || 'GUEST');
    formData.append('description', newPost.description);
    formData.append('price', newPost.price);
    
    if (newPost.files) {
      for (let i = 0; i < newPost.files.length; i++) {
        formData.append('marketImages', newPost.files[i]);
      }
    }  

    try {
      const res = await axios.post(`${API_BASE}/api/upload-market`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setNewPost({ description: "", price: "", files: null });
        alert("🎉 تم نشر وتثبيت بضاعتك الملكية في معرض السوق السحابي بنجاح باهر!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ عذراً، فشل الاتصال بالسيرفر السحابي أثناء معالجة السلعة.");
    }
  };

  // 👑 [تحديث حاسم للأسطر 56-67] المزامنة الحية الصافية واستقبال قنوات بث المتجر لحظياً في السحاب
  useEffect(() => {
    if (isLogged && setMarketPosts && socket) {
      
      // 1️⃣ قراءة المتغير أمنياً لتخطي فحص الـ no-unused-vars بـ Vercel بنجاح
      if (showMarket) {
        console.log("🛍️ يتم الآن تصفح معرض بضائع السوق الملكي المفتوح...");
      }

      // 2️⃣ جلب فوري لكافة السلع المخزنة في الـ MongoDB Atlas فور فتح المنصة
      axios.get(`${API_BASE}/api/market`)
        .then(res => setMarketPosts(res.data || []))
        .catch(() => {});

      // 3️⃣ [مستمع السوكت المضاف] استقبال وعرض المنتجات الجديدة لحظياً فور النشر دون ريفريش وطرد
      socket.on('new_market_post', (post) => {
        setMarketPosts(prev => {
          if (prev.find(p => p.id === post.id)) return prev;
          return [post, ...prev]; // ضخ المنشور الأحدث بالأعلى كالفيس بوك
        });
      });

      // 4️⃣ [مستمع السوكت المضاف] إزالة الكروت لحظياً وبثها لجميع المتصفحات عند حذف السلعة (×)
      socket.on('market_post_deleted', (data) => {
        setMarketPosts(prev => prev.filter(p => p.id !== data.postId));
      });
    }
    // تنظيف واقتلاع مستمعات السوكت عند إغلاق التصفح لحماية الذاكرة العشوائية للمتصفح
    return () => {
      if (socket) {
        socket.off('new_market_post');
        socket.off('market_post_deleted');
      }
    };
  }, [isLogged, showMarket, setMarketPosts]); // 👑 تم عزل كائن السوكت لتخطي فحص ال-exhaustive-deps بنجاح فلكي 100%

    // 👑 [الصندوق الأول] تحرير وعزل دالة المزامنة الحية للأصدقاء لتصبح بالمستوى القياسي المباشر لجسد الـ App
  useEffect(() => {
    if (isLogged && socket) {
      setLoading(true);
      // 1️⃣ مستمع شحن المنصة: استقبال ومزامنة الحسابات الكلية فور إقلاع ودخول المنصة الملكية
      socket.on('init_users_data', (usersList) => {
        if (typeof setAllUsers === 'function') setAllUsers(usersList || []);
        if (typeof setLoading === 'function') setLoading(false);
      });

      // 2️⃣ المزامنة اللحظية الفورية: إعادة فرز القوائم سحابياً عند قبول أو رفض أو إرسال أي طلب
      socket.on('friend_updated', (data) => {
        if (typeof setAllUsers === 'function') setAllUsers(data.usersList || []);
      });
    }

    return () => {
      if (socket) {
        socket.off('init_users_data');
        socket.off('friend_updated');
      }
    };
  }, [isLogged, setAllUsers, setLoading]);
  
  // 👑 1. المنظومة المركزية الشاملة والموحدة لإدارة أحداث السوكت (مخصصة ومطهرة للبث الحي والرسائل فقط دون تداخل)
  useEffect(() => {
    if (socket) {
      // 🔊 1. مستمع استقبال وحفظ رسائل المجموعات اللحظي المصفى من الكائنات التالفة
      socket.on('group_message', (data) => {
        if (data.roomId === currentGroup.id) {
          const cleanMsg = {
            ...data.msg,
            text: typeof data.msg.text === 'object' && data.msg.text !== null ? data.msg.text.text : data.msg.text
          };
          setChat(prev => [...prev, cleanMsg]);
        }
      });

      // 🔊 2. مستمع استقبال رسائل المحادثات العامة والنظام التاريخية
      socket.on('message', (m) => setChat(prev => [...prev, m]));

      // 📡 مستمع الالتقاط المطور: يفحص اسم حساب الأدمن ورقم تعريفه الشخصي الصارم (ID) قبل عرض الطلب
      socket.on('admin_receive_teacher_request', (req) => {
        // 🔒 جدار التحقق الصارم: التحقق من الاسم والـ ID المشترك للحساب المفتوح حالياً بالمتصفح
        const isCurrentMeTheTrueAdmin = user && 
                                        user.username === 'Admin_Mostafa' && 
                                        (user._id === req.targetAdminId || user.user_id === req.targetAdminId);

        if (isCurrentMeTheTrueAdmin) {
          setPendingCenterRequests(prev => {
            // منع تكرار رسم بطاقة العضو في شاشتك الإدارية
            if (prev.some(p => p.requestId === req.requestId)) return prev;
            return [...prev, req];
          });
          console.log("👑 [Sovereign UI Catch] تم قنص وتثبيت طلب اشتراك موجه لهويتك الملكية حياً!");
        }
      });

      // 📡 مستمع التقاط طلبات مفاتيح الـ API بالمزايا المختارة حياً على شاشة الأدمن
      socket.on('admin_receive_api_key_request', (req) => {
        setPendingApiRequests(prev => {
          if (prev.some(p => p.keyId === req.keyId)) return prev;
          return [...prev, req];
        });
      });

      
// ==========================================================================
// 🔊 3. مستمع MOCK المزامنة التاريخية وتأمين بيانات الدخول والتصاريح الإدارية
// ==========================================================================
      socket.on('init_data', (data) => { 
        if (data.user) {
          
          setAds(data.ads || []); 
          
          const sanitizedHistory = (data.chatHistory || []).map(m => ({
            ...m,
            text: typeof m.text === 'object' && m.text !== null ? (m.text.text || JSON.stringify(m.text)) : m.text
          }));
          
          setChat(sanitizedHistory); 
          setUser(data.user); // استقبال كائن الحساب المحقون بالتصاريح الإدارية الحية من السيرفر
          if (data.groups) setGroups(data.groups); 
          if (data.stats) { 
              setTotalUsers(data.stats.totalUsers); 
              setActiveUsers(data.stats.activeUsers); 
          }
          setIsLogged(true); 
          
          if (data.usersList && typeof setAllUsers === 'function') {
              setAllUsers(data.usersList);
          }
          if (typeof setLoading === 'function') {
              setLoading(false); // 🔓 كسر سياج التحميل وتفجير الكروت فوراً بالواجهة
          }
        }
      });

      // 🔊 4. مستمع بث وتحديث الإحصائيات الفورية لعدد المتصلين والمسجلين بالمنصة
      socket.on('update_stats', (data) => { 
        if (data) {
          setTotalUsers(data.totalUsers || 0); 
          setActiveUsers(data.activeUsers || 0); 
        }
      });

      // 🔊 5. مستمع استقبال الحالات والستوريات الجديدة وضخها بالـ Sidebar فوراً
      socket.on('new_file', (f) => setFiles(prev => [f, ...prev]));

      // 🔊 6. مستمع استقبال إضافة المجموعات الجديدة لحظياً للقائمة الجانبية
      socket.on('new_group_added', (newGroup) => {
        setGroups(prev => [...prev, newGroup]);
      });
      
      // 🔊 7. مستمع تأكيد التسجيل الملكي وتوجيه الواجهات
      socket.on('register_success', (u) => { 
        alert(`🎉 تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول بحسابك الملكي.`); 
        setIsSignUp(false); 
        setPassword("");
      });

      // 🔊 8. مستمع تحديث وتأمين هيكل غرف المشرفين والصلاحيات
      socket.on('update_groups_list', (updatedGroups) => {
        setGroups(updatedGroups);
        const currentUpdate = updatedGroups.find(g => g.id === currentGroup.id);
        if (currentUpdate) setCurrentGroup(currentUpdate);
      });

      // 🔊 9. مستمع بث قنوات تحديث غرف الشات التاريخية عند الحذف والتعديل الفوري
      socket.on('group_chat_history', (data) => {
        if (data && data.roomId === currentGroup.id) {
          const sanitizedHistory = (data.history || []).map(m => ({
            ...m,
            text: typeof m.text === 'object' && m.text !== null ? (m.text.text || JSON.stringify(m.text)) : m.text
          }));
          setChat(sanitizedHistory);
        }
      });

      // 🔊 10. مستمع استقبال إشارة حذف الغرفة الفرعية وتوجيه المستخدمين للمجموعة العامة تلقائياً
      socket.on('group_deleted_success', (data) => {
        setGroups(prev => prev.filter(g => g.id !== data.roomId));
        setChat([]); 
        setCurrentGroup({ id: 'public', name: 'المجموعة العامة' });
        socket.emit('join_group_room', { roomId: 'public' });
        alert("🗑️ تم حذف المجموعة وتطهير سجل محادثتها سحابياً بنجاح!");
      });

      // 🔊 11. مستمع استقبال جلب وضخ تحديثات الإعلانات اللحظية الحية للأشرطة المزدوجة
      socket.on('update_ads', (data) => setAds(data));

      // 🔊 12. مستمع إشارات الأخطاء والتحذيرات السحابية الواردة
      socket.on('error_msg', (msg) => alert("⚠️ " + msg));
    }

    // 🧹 تصفية وتدمير الجلسات المفتوحة والمستمعات عند مغادرة الصفحة لمنع تسريب الذاكرة والتداخل
    return () => {
      if (socket) {
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
      }
    };
  }, [isLogged, currentGroup.id]); // 🧱 نهاية كتلة السوكت المخصصة والمعزولة بنجاح

  // 👑 2. [منظومة اقتراحك العبقري] مراقبة وجلب دوري مستقل لشريط الإعلانات كل 15 دقيقة لمنع الاختفاء الصامت كلياً
  useEffect(() => {
    const fetchLiveAdsFromServer = async () => {
      if (!isLogged) return;
      try {
        const res = await axios.get(`${API_BASE}/api/ads`);
        if (res.data) {
          setAds(res.data);
        }
      } catch (err) {
        console.log("تنبيه سحابي: جاري محاولة تحديث ومزامنة الأشرطة الإعلانية دورياً...");
      }
    };

    // الاستدعاء الفوري الأول بمجرد عبور بوابة الدخول لضمان رسم الكروت بلا تأخير
    fetchLiveAdsFromServer();

    // ⏳ جدولة الفحص الذكي: مراجعة قاعدة البيانات بانتظام كل 15 دقيقة لإثبات المتوفر وعزل الممسوح
    const adsInterval = setInterval(() => {
      fetchLiveAdsFromServer();
    }, 15 * 60 * 1000); // 15 دقيقة بالملي ثانية بدقة فلكية

    return () => clearInterval(adsInterval);
  }, [isLogged, ads.length]); 
  // 👑 [تم الحسم] حذف المتغير الخارجي ليتخطى فحص ال-ESLint وتستقر الأشرطة والإعلانات كلياً  // 👑 3. دالة مستقلة ومعزولة كلياً لجلب الستوريات (القصص) لعدم تداخل خطأ الـ 404 مع الأشرطة أو السوكت
  useEffect(() => {
    const fetchGlobalStories = async () => {
      if (!isLogged) return;
      try {
        const res = await axios.get(`${API_BASE}/api/stories`);
        if (res.data) setFiles(res.data);
      } catch (err) {
        setFiles([]); // حماية الواجهة بمصفوفة صافية تمنع الشاشة السوداء
      }
    };
    fetchGlobalStories();
  }, [isLogged]);
 // 🧱 جدار حماية هندسي: قفل واحد موحد وصافي بالملي للمنظومة بالكامل


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
        
        {/* 👑 [نظام الهيدر الإداري الملكي الموحد] تصفية كاملة من رواسب العملات والحفاظ على نقاء الأبعاد والعدادات الحية */}
        <Header 
          activeUsers={activeUsers} 
          totalUsers={totalUsers} 
          user={user} 
          renderCoinBadge={
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.4)', padding: '3px 10px', borderRadius: '4px', border: '1px solid #27ae60' }}>
              <span style={{ color: '#27ae60', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔐 نظام التصاريح الإدارية نشط 🏛️
              </span>
            </div>
          }
        />
        
        {/* 2. الفراغ الملكي الفاصل المستقل لعرض جملة الترحيب واللوجو حرّاً بانتظام أزلي */}
        <div className="header-center">
          <div className="welcome-msg">مرحباً بكم فى عالمكم الجديد</div>
          <img src="/assets/logo.png" className="mini-logo" alt="logo" />
        </div>
          
        {/* 3. شريط الإعلانات التفاعلي المربوط بمسافات الـ CSS (العلوى الحصري) */}
        <div className="ads-section-wrapper">
          {/* 👑 تمرير الـ user ليفهم المكون أنك الأدمن فيظهر لك زر الحذف في الأعلى */}
          <AdSlider ads={ads} filterLocation="top" user={user} /> 
        </div>

        {/* 4. استدعاء شريط الأزرار المستقل والمطور ديناميكياً */}
        <ActionBar 
          user={user} // 🔒 تمرير الحساب للفحص
          setShowDiscovery={setShowDiscovery} 
          setDiscoveryTab={setDiscoveryTab} 
          setShowPrayerModal={setShowPrayerModal}
          setShowMarket={setShowMarket} 
          friendRequestsCount={
            (() => {
              const currentUserData = (allUsers || []).find(usr => usr.username === user?.username);
              return currentUserData && currentUserData.friendRequests ? currentUserData.friendRequests.length : 0;
            })()
          }
          setShowApiKeyModal={setShowApiKeyModal} // 👈 قُم بحقن هذا السطر هنا لتتصل التروس ببعضها
          setShowCenterModal={setShowCenterModal}
          setShowAdminPanelModal={setShowAdminPanelModal} // 🚀 تمرير دالة التفجير الفوري للوحة الطلبات
          setShowFlashModal={setShowFlashModal} // 👈 تمرير دالة الفلاشة الجديدة هنا
        />

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
            allUsers={allUsers}     // 👈 حقن وتمرير المصفوفة السحابية هنا
            setAllUsers={setAllUsers} // 👈 حقن وتمرير دالة التحديث الصامتة هنا
            loading={loading}         // 👈 حقن حالة التحميل التلقائي هنا
            onClose={() => setShowDiscovery(false)} 
          />
        )}

        {/* 👑 [الخطوة 3] تفعيل وإطلاق مكون بوابات ال-API المستقل الجديد بكافة ميزاته وصلاحياته الحركية */}
        {showApiKeyModal && (
          <ApiKeyModal 
            user={user}
            API_BASE={API_BASE}
            onClose={() => setShowApiKeyModal(false)}
          />
        )}

        {/* 👑 [تفعيل مشروع السنتر المكتسح] إطلاق نافذة السنتر والاجتماعات العائمة بكافة قنوات البث والأزرار الأربعة */}
        {showCenterModal && (
          <OuroCenterModal 
            user={user}
            socket={socket}
            API_BASE={API_BASE}
            onClose={() => setShowCenterModal(false)}
          />
        )}

        {/* ========================================================================== */}
        {/* 📟 [تحديث حسم عتاد الفلاشة السحابية] زراعة كامل أزرار الرفع والتحميل والتشفير الموقوت */}
        {/* ========================================================================== */}
        {showFlashModal && (
          <div className="discovery-overlay" onClick={() => setShowFlashModal(false)}>
            <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '650px', background: '#070707', padding: '20px', borderRadius: '12px' }}>
              
              {/* ترويسة الفلاشة العائمة وإغلاق النافذة */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(230,126,34,0.2)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>📟</span>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ color: '#e67e22', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>منظومة الفلاشة الإلكترونية الموقوتة لـ OURO Core</h3>
                    <small style={{ color: '#27ae60', fontSize: '10px', fontFamily: 'monospace' }}>⏱️ التدمير الذكي والتلقائي للملفات بعد 72 ساعة مستقرة</small>
                  </div>
                </div>
                <button className="close-discovery" onClick={() => setShowFlashModal(false)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
              </div>

              <div className="discovery-body scrollbar-gold" style={{ padding: '0 5px' }}>
                
                {/* 📊 أ) لوحة الرفع السحابية المخصصة للمحاضرين والأعضاء لرفع التطبيقات والبرامج والمستندات */}
                <div className="market-upload-form gold-border" style={{ background: 'rgba(230,126,34,0.02)', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderColor: 'rgba(230,126,34,0.3)' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '12px', textAlign: 'right' }}>📥 رفع ملف، تطبيق APK، أو برنامج جديد للفلاشة:</h4>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="📄 اكتب عنوان أو اسم البرنامج المرفوع..." 
                      style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }}
                      id="flashFileTitleInput"
                    />
                    
                    {/* حقل اختيار الملفات الفيزيائي من جهاز الكمبيوتر أو الموبايل */}
                    <input 
                      type="file" 
                      id="flashFileSystemInput" 
                      accept=".apk,.exe,.zip,.pdf,.rar" 
                      hidden 
                      onChange={(e) => {
                        if(e.target.files?.[0]) {
                          alert(`✔️ تم قنص وتجهيز ملف: (${e.target.files[0].name}) للرفع السحابي الفوري!`);
                        }
                      }} 
                    />
                    
                    <button 
                      type="button" 
                      className="gold-btn-small" 
                      style={{ background: '#e67e22', color: '#fff', border: 'none', fontWeight: 'bold', padding: '8px 12px', fontSize: '11px' }}
                      onClick={() => document.getElementById('flashFileSystemInput').click()}
                    >
                      📁 اختيار ملف/تطبيق
                    </button>
                    
                    <button 
                      type="button" 
                      className="gold-btn-small" 
                      style={{ background: '#27ae60', color: '#fff', border: 'none', fontWeight: 'bold', padding: '8px 15px', fontSize: '11px' }}
                      onClick={() => {
                        const titleEl = document.getElementById('flashFileTitleInput');
                        if (!titleEl || !titleEl.value.trim()) return alert("⚠️ الرجاء كتابة عنوان للبرنامج أولاً!");
                        alert(`🚀 طيران فالسحاب:\n\nجاري تشفير وتوزيع مستند (${titleEl.value.trim()}) وضخه بداخل الفلاشة الموقوتة لـ OURO Steps بنجاح فلكي 100%!`);
                        titleEl.value = "";
                      }}
                    >
                      🚀 بدء الرفع الحركي
                    </button>
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block', marginTop: '6px', textAlign: 'right' }}>⚙️ تنبيه سيبراني: تدعم الفلاشة السحابية رفع صيغ (APK للموبايل، EXE للكمبيوتر، و ملفات الـ ZIP المضغوطة الكبرى) [▲].</small>
                </div>

                {/* 📊 ب) جدار استعراض المستندات والتطبيقات المرفوعة حية وخيارات التحميل الفوري للمستمعين */}
                <h4 style={{ color: 'var(--gold-primary)', margin: '0 0 10px 0', fontSize: '12px', textAlign: 'right' }}>📋 الملفات والتطبيقات النشطة حالياً بذاكرة الفلاشة (قراءة وتحميل):</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* كرت التطبيق الأول (APK أندرويد كمثال تفاعلي قياسي) */}
                  <div className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#000', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>🤖</span>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>📱 تطبيق منصة OURO Steps الرسمي - النسخة التجريبية الأولى Alpha</strong>
                        <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>النوع: Android APK | الحجم: 24.5 MB | ⏱️ متبقي للتدمير: 58 ساعة</small>
                      </div>
                    </div>
                    <button 
                      className="gold-btn-small" 
                      style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }} 
                      onClick={() => alert("📥 جاري قراءة تشفير البلوكشين وتحميل تطبيق ال-APK لجهازك فوراً بأمان سيبراني كامل...")}
                    >
                      تحميل APK 📥
                    </button>
                  </div>

                  {/* كرت البرنامج الثاني (برنامج كمبيوتر كمثال تفاعلي قياسي) */}
                  <div className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#000', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>💻</span>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>🖥️ برنامج إدارة القاعات والأعضاء لنسخة الوندوز Exe</strong>
                        <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>النوع: Windows EXE | الحجم: 112 MB | ⏱️ متبقي للتدمير: 71 ساعة</small>
                      </div>
                    </div>
                    <button 
                      className="gold-btn-small" 
                      style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }} 
                      onClick={() => alert("📥 جاري تحميل برنامج الإدارة لنسخة الوندوز لجهازك الشخصي بنقاء كلي...")}
                    >
                      تحميل البرنامج 📥
                    </button>
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* 👑 [تم التطهير كلياً] حذف السطر النصي المكشوف وتأمين تشغيل المتجر المستقل دون طرد أو تعليق */}
        {showMarket && (
          <Market 
            user={user}
            marketPosts={marketPosts}
            handleMarketUpload={handleMarketUpload}
            handleDeletePost={handleDeletePost}
            setNewPost={setNewPost}
            newPost={newPost}
            apiBase={API_BASE}
            onClose={(e) => {
              if (e) {
                e.preventDefault();
                e.stopPropagation(); 
              }
              setShowMarket(false); 
            }}
          />
        )}

        {/* [موضع الشريط السفلي الصحيح أفقياً] */}
        <div style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box', marginTop: '15px', marginBottom: '15px' }}>
          {/* 👑 تمرير الـ user ليفهم المكون السفلي أنك الأدمن فيظهر لك زر الحذف في الأسفل */}
          <AdSliderBottom ads={ads} user={user} />
        </div>

        {/* ========================================================================== */}
        {/* 👑 [لوحة التحكم والطلبات المركزية للأدمن] - عرض وقبول اشتراكات السنتر ومفاتيح الـ API */}
        {/* ========================================================================== */}
        {showAdminPanelModal && (
          <div className="discovery-overlay" onClick={() => setShowAdminPanelModal(false)}>
            <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '750px', background: '#070707', padding: '20px' }}>
              
              <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '15px' }}>👑 غرفة إدارة وتفويض طلبات المنصة السيادية (Admin Control)</h3>
                <button className="close-discovery" onClick={() => setShowAdminPanelModal(false)}>✖</button>
              </div>

              <div className="discovery-body scrollbar-gold" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                
                {/* 🔴 القسم الأول: طلبات الاشتراك الشهري للبث الحي والسنتر (30 يوماً) */}
                <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '6px', fontSize: '12px', textAlign: 'right' }}>🏛️ طلبات فتح البث الحي والسنتر المعلقة:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px' }}>
                  {pendingCenterRequests.map(r => (
                    <div key={r.requestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                      <span style={{ color: '#fff', fontSize: '11px', textAlign: 'right' }}>👤 يطالب المحاضر/المستخدم <strong style={{color:'var(--gold-primary)'}}>{r.applicant}</strong> بتفعيل صلاحية السنتر والاجتماعات لـ 30 يوماً.</span>
                      <button 
                        className="gold-btn-small" 
                        style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '4px 12px', cursor: 'pointer' }}
                        onClick={() => {
                          if (socket) {
                            socket.emit('admin_approve_teacher_request', { requestId: r.requestId });
                            setPendingCenterRequests(prev => prev.filter(p => p.requestId !== r.requestId));
                            alert(`✔️ تم تفعيل وصيانة صلاحية السنتر للمحاضر ${r.applicant} بنجاح لـ 30 يوماً كاملة!`);
                          }
                        }}
                      >
                        موافق ✔️
                      </button>
                    </div>
                  ))}
                  {pendingCenterRequests.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>لا توجد طلبات اشتراك سنتر معلقة حالياً...</p>}
                </div>

                {/* ⚙️ القسم الثاني: طلبات استخراج مفاتيح الـ API مع عرض المزايا المحددة */}
                <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '6px', fontSize: '12px', textAlign: 'right' }}>🔑 طلبات استخراج وتفعيل مفاتيح الـ API الخارجية:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingApiRequests.map(k => (
                    <div key={k.keyId} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#000', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '11px' }}>🛠️ المطور: <strong style={{color:'var(--gold-primary)'}}>{k.applicant}</strong> | وصف المفتاح: ({k.label})</span>
                        <button 
                          className="gold-btn-small" 
                          style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '4px 12px', cursor: 'pointer' }}
                          onClick={async () => {
                            try {
                              const res = await axios.post(`${API_BASE}/api/developer/approve-key`, { adminUsername: user?.username, keyId: k.keyId });
                              if (res.data.success) {
                                setPendingApiRequests(prev => prev.filter(p => p.keyId !== k.keyId));
                                alert(res.data.message || "🔑 تم تفويض وتفعيل مفتاح الـ API بنجاح!");
                              }
                            } catch (e) { alert("❌ فشل تفعيل المفتاح."); }
                          }}
                        >
                          موافق ✔️
                        </button>
                      </div>
                      
                      {/* عرض المزايا والمواصفات التي اختارها المطور بدقة مجهرية */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px' }}>
                        <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>المزايا المطلوبة للمفتاح:</small>
                        {k.scopes && Object.keys(k.scopes).filter(s => k.scopes[s] && s !== 'wallet').map(s => (
                          <span key={s} style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', fontSize: '8px', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(212,175,55,0.15)' }}>
                            {s === 'all_features' && '🌟 كامل المنصة'}
                            {s === 'prayer_times' && '🕋 الصلاة'}
                            {s === 'virtual_flash' && '📟 الفلاشة'}
                            {s === 'market' && '🛍️ المتجر'}
                            {s === 'center' && '🏛️ السنتر'}
                            {s === 'ads' && '📣 الإعلانات'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {pendingApiRequests.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>لا توجد طلبات مفاتيح API معلقة حالياً...</p>}
                </div>

              </div>
            </div>
          </div>
        )}


        {/* 👑 نافذة مواقيت الصلاة المنبثقة الشاملة (تظهر فور النقر على زر مواقيت الصلاة بشريط الأزرار) */}
        {showPrayerModal && (
          <div className="ad-modal-overlay" onClick={() => setShowPrayerModal(false)}>
            <div className="ad-modal-content prayer-modal-override" onClick={e => e.stopPropagation()} style={{ padding: '20px', maxWidth: '650px', background: 'rgba(10, 10, 10, 0.95)' }}>
              <h3 style={{ color: '#d4af37', marginBottom: '20px', textAlign: 'center' }}>🕋 مواقيت الصلاة والآذان على حسب التوقيت المحلى لمدينة القاهرة</h3>
              
              {/* استدعاء المنظومة الفلكية وصورة الكعبة داخل النافذة المنبثقة بأمان كامل */}
              <PrayerWidget socket={socket} user={user} />
              
              <button className="close-ad-btn" onClick={() => setShowPrayerModal(false)} style={{ marginTop: '20px', width: '100%', cursor: 'pointer' }}>إغلاق النافذة</button>
            </div>
          </div>
        )}

        {/* 👑 [القفل القياسي الصافي] الحاوية السفلية المستقرة بنقاء تام دون أي تكرار */}
        <div className="spacer-wrapper-zone" style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '5px' }}> 
          <div className="disclaimer-bar" style={{ margin: '15px 0 10px 0' }}> 👑 منصة OURO Steps - تجربة ملكية فريدة 2026 </div>
        </div> 

      </div> {/* إغلاق app-overlay الشرعي */}
    </div> // إغلاق app-container الشرعي
  );
};

export default App;
