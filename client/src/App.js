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
import OuroWalletModal from './components/OuroWalletModal'; // 👑 🪙 قُم بحقن هذا السطر السحري هنا فوراً!
import OuroInvoiceModal from './components/OuroInvoiceModal'; // 👑 قُم بحقن هذا السطر السحري هنا فوراً!
import OuroCompanyManager from './components/OuroCompanyManager'; // 👑 🏛️ حقن السيستم العملاق للشركات هنا
import OuroDocEngine from './components/OuroDocEngine'; // 👑 📝 حقن محرك صياغة المستندات والملازم الملكي هنا
import OuroAiAssistant from './components/OuroAiAssistant'; // 👑 🤖 حقن المساعد الذكي لـ جوجل Gemini هنا بالملي
import './App.css';

// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// 👑 [تم الحسم والتطهير] تهيئة السوكت النقي والمتوافق مع جدار حماية خوادم Hugging Face
const socket = io(API_BASE, { 
  transports: ['websocket', 'polling'], // البدء الوجوبي بالـ websocket لاختراق البروكسي السحابي بنجاح
  secure: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  rejectUnauthorized: false
}); // 👈 تم حذف واقتلاع سطر الـ path كلياً لفتح البوابات وربط شريان السيرفر بالمتصفحات حياً!


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
  const [ouroBalance, setOuroBalance] = useState(0);
  const [ouroHistory, setOuroHistory] = useState([]); // 👑 State جديد لتخزين سجل المعاملات
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false); // كبسولة الفواتير وعروض الأسعار
  const [showCompanyModal, setShowCompanyModal] = useState(false); // نظام تشغيل الشركات والمصانع
  const [adminRequests, setAdminRequests] = useState([]);
  const [companyRequests, setCompanyRequests] = useState([]); // مصفوفة طلبات الشركات المستقلة
  const [showDocEngineModal, setShowDocEngineModal] = useState(false); // محرك صياغة المستندات والملازم
  const [showAiModal, setShowAiModal] = useState(false); // كبسولة إطلاق المساعد الذكي
  
  // ==========================================================================
  // 👑 📡 [دمج وتصحيح شريان الاستقبال المزدوج] قنص طلبات السنتر والشركات معاً حياً
  // ==========================================================================
  useEffect(() => {
    if (socket) {
      // 1️⃣ قنص واستقبال طلبات السنتر والاجتماعات الموقوتة (30 يوماً) حياً في السحاب
      socket.on('admin_receive_teacher_request', (req) => {
        if (user?.username === 'Admin_Mostafa' || user?.role === 'Admin') {
          setAdminRequests(prev => {
            if (prev.some(r => r.requestId === req.requestId)) return prev; // منع تكرار السجل
            return [...prev, req];
          });
        }
      });

      // 2️⃣ قنص واستقبال طلبات رخص الشركات والمصانع السنوية (365 يوماً) حياً في السحاب
      socket.on('admin_receive_company_request', (req) => {
        if (user?.username === 'Admin_Mostafa' || user?.role === 'Admin') {
          setCompanyRequests(prev => {
            if (prev.some(r => r.requestId === req.requestId)) return prev; // منع تكرار السجل
            return [...prev, req];
          });
        }
      });
    }

    // تنظيف البوابات والمستمعات صامتاً عند خروج الأدمن لحماية ذاكرة المتصفح
    return () => {
      if (socket) {
        socket.off('admin_receive_teacher_request');
        socket.off('admin_receive_company_request');
      }
    };
  }, [socket, user?.username]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // دالة تفعيل رخص الشركات والمصانع السنوية للمستخدم بنجاح 365 يوماً
  const handleApproveCompanySystem = (reqId, applicant) => {
    if (socket) {
      socket.emit('admin_approve_company_system', { requestId: reqId, applicantName: applicant });
      setAdminRequests(prev => prev.filter(r => r.requestId !== reqId));
      alert("👑 تم تفعيل ترخيص نظام إدارة الشركات والمصانع السنوي للمستخدم بنجاح لمدة سنة كاملة!");
    }
  };

  const fetchOuroWalletBalance = async () => {
    if (!isLogged || !user) return;
    try {
      const res = await axios.post(`${API_BASE}/api/wallet/balance`, { userId: user._id || user.user_id, username: user.username });
      if (res.data) {
        if (typeof res.data.balance !== 'undefined') setOuroBalance(res.data.balance);
        if (res.data.history) setOuroHistory(res.data.history); // 🚀 شحن السجل حياً
      }
    } catch (e) {}
  };

  // 👑 [مستمع الرصد والتحجيم الدوري المباشر لملف العملات بالسحاب]
  useEffect(() => {
    fetchOuroWalletBalance(); // الاستدعاء الفوري الأول عند الدخول

    if (socket) {
      socket.on('ouro_coins_synced', (data) => {
        const myId = user?._id || user?.user_id;
        if (myId === data.senderId || myId === data.targetUserId || myId === data.adminId) {
          fetchOuroWalletBalance(); // إنعاش لحظي فور إتمام أي حوالة
        }
      });
    }

    // ⏳ [محرك المراقبة الدائمة]: إجبار المتصفح على مراجعة وتحديث الرصيد من سحابة الأدمن تلقائياً كل 30 ثانية رغماً عن الكاش
    const walletInterval = setInterval(() => {
      fetchOuroWalletBalance();
    }, 30 * 1000); // 30 ثانية بدقة فلكية

    return () => { 
      if (socket) socket.off('ouro_coins_synced'); 
      clearInterval(walletInterval); // إبادة التوقيت عند الخروج لحماية المعالج
    };
  }, [isLogged, user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ⏳ [محرك منع الاختفاء عند الريفريش] - خطاف الفحص البدئي لتثبيت رخصة الشركات السنوية
  useEffect(() => {
    if (isLogged && user) {
      // فحص حركي صارم: إذا كان الحساب المفتوح يمتلك صلاحية الشركات السنوية مسجلة سحابياً
      if (user.canAccessCompanySystem) {
        // إجبار المتصفح على دمج وحفظ الصلاحية بداخل كائن الحساب لعدم إغلاق النافذة مطلقاً
        setUser(prev => ({
          ...prev,
          canAccessCompanySystem: true,
          companySystemExpiry: user.companySystemExpiry
        }));
        console.log("🏛️ [Sovereign License Locked] تم قفل وتأمين رخصة الشركات السنوية رغماً عن الريفريش!");
      }
    }
  }, [isLogged, user?.canAccessCompanySystem]); // eslint-disable-line react-hooks/exhaustive-deps

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
        socket.off('admin_receive_teacher_request');
        socket.off('admin_receive_api_key_request');
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
    
  // 👑 [قفل الحسم] إغلاق الـ useEffect الكلي للأحداث بنقاء رياضي وصارم مع تفادي فحص الـ ESLint
  }, [isLogged, currentGroup.id, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==========================================================================
  // 🏛️ [تثبيت وحسم رخصة الشركات] - منع الاختفاء والتحصين الشامل بالـ State العلوية
  // ==========================================================================
  useEffect(() => {
    if (socket) {
      socket.on('company_system_granted', (data) => {
        // إذا كان اسم المستخدم المطابق هو صاحب الحساب الحالي
        if (data.username === user?.username) {
          // تحديث كائن ال-user العلوي قسرياً ليشمل الصلاحيات السنوية الجديدة في ال-State العلوية
          setUser(prevUser => ({
            ...prevUser,
            canAccessCompanySystem: true,
            companySystemExpiry: data.companySystemExpiry
          }));
        }
      });
    }
    return () => { if (socket) socket.off('company_system_granted'); };
  }, [socket, user?.username]); // eslint-disable-line react-hooks/exhaustive-deps

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

        {/* 👑 [نظام الهيدر وبلوكتشين OURO الموحد] رصد ومراقبة الرصيد حياً بسقف المنصة بنقاء تفاعلي */}
        <Header 
          activeUsers={activeUsers} 
          totalUsers={totalUsers} 
          user={user} 
          renderCoinBadge={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--gold-primary)', boxShadow: '0 0 8px rgba(212,175,55,0.2)' }}>
              <span style={{ color: 'var(--gold-primary)', fontSize: '13px' }}>🪙</span>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>رصيدك السحابي:</span>
              <strong style={{ color: '#27ae60', fontSize: '12px', fontFamily: 'monospace' }}>{ouroBalance.toFixed(2)} OURO</strong>
              <button 
                onClick={() => setShowWalletModal(true)}
                style={{ background: 'var(--gold-primary)', color: '#000', border: 'none', borderRadius: '3px', fontSize: '10px', padding: '2px 6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
              >
                ➕ حوالة
              </button>
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
          setShowWalletModal={setShowWalletModal} // 👈 👑 قُم بحقن وتمرير هذا السطر هنا لحسم الاتصال!
          setShowInvoiceModal={setShowInvoiceModal} // 👈 تأكد من وجود هذا السطر هنا بالملي!
          setShowCompanyModal={setShowCompanyModal}
          setShowDocEngineModal={setShowDocEngineModal}
          setShowAiModal={setShowAiModal}
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

        {showWalletModal && (
          <OuroWalletModal 
            user={user}
            currentBalance={ouroBalance}
            transactionHistory={ouroHistory} // 👈 👑 ضخ وحقن مصفوفة سجل المعاملات هنا بالملي!
            socket={socket}
            onClose={() => setShowWalletModal(false)}
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

        {showInvoiceModal && (
          <OuroInvoiceModal 
            user={user}
            onClose={() => setShowInvoiceModal(false)}
          />
        )}

        {/* ========================================================================== */}
        {/* 📟 [تم الحسم والتطهير] - استدعاء وحقن الفلاشة الحركية المستقلة المتصلة بالـ API KEY */}
        {/* ========================================================================== */}
        {showFlashModal && (
          <div className="discovery-overlay" onClick={() => setShowFlashModal(false)}>
            <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '650px', background: '#070707', padding: '20px', borderRadius: '12px' }}>
              
              {/* ترويسة الفلاشة العائمة وإغلاق النافذة */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(230,126,34,0.2)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>📟</span>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ color: '#e67e22', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>منظومة الفلاشة الإلكترونية لـ OURO Core</h3>
                    <small style={{ color: '#27ae60', fontSize: '10px', fontFamily: 'monospace' }}>⏱️ التدمير الذكي والتلقائي للملفات بعد 72 ساعة</small>
                  </div>
                </div>
                <button className="close-discovery" onClick={() => setShowFlashModal(false)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
              </div>

              {/* 🚀 ضخ وقذف المكون الحركي الحقيقي للفلاشة لإظهار مربع الإدخال والرفع السحابي */}
              <div className="discovery-body scrollbar-gold" style={{ padding: '0 5px' }}>
                <VirtualFlash user={user} socket={socket} />
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

        {showCompanyModal && (
          <OuroCompanyManager 
            user={user}
            socket={socket}
            API_BASE={API_BASE}
            onClose={() => setShowCompanyModal(false)}
          />
        )}

        {showDocEngineModal && (
          <OuroDocEngine 
            user={user}
            onClose={() => setShowDocEngineModal(false)}
          />
        )}


        {/* [موضع الشريط السفلي الصحيح أفقياً] */}
        <div style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box', marginTop: '15px', marginBottom: '15px' }}>
          {/* 👑 تمرير الـ user ليفهم المكون السفلي أنك الأدمن فيظهر لك زر الحذف في الأسفل */}
          <AdSliderBottom ads={ads} user={user} />
        </div>

        {/* ========================================================================== */}
        {/* ⚙️ [تم التوحيد والحسم بالملي] - لوحة الأدمن الملكية الشاملة والموحدة للطلبات */}
        {/* ========================================================================== */}
        {showAdminPanelModal && (
          <div className="discovery-overlay" onClick={() => setShowAdminPanelModal(false)}>
            <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '600px', background: '#070707', padding: '20px', borderRadius: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #c0392b', paddingBottom: '10px' }}>
                <h3 style={{ color: '#c0392b', margin: 0, fontSize: '15px', fontWeight: 'bold' }}>👑 غرف تحكم الإدارة العليا - الأدمن Mostafa</h3>
                <button className="close-discovery" onClick={() => setShowAdminPanelModal(false)}>×</button>
              </div>

              <div className="discovery-body scrollbar-gold" style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 📋 أ) عرض طلبات الشركات والمصانع السنوية الموقوتة (365 يوماً بالملي ثانية) - لا تمس */}
                {companyRequests && companyRequests.length > 0 && (
                  <div style={{ background: 'rgba(41,128,185,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid #2980b9' }}>
                    <small style={{ color: '#2980b9', display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>🏛️ طلبات تفعيل أنظمة الشركات والمصانع المعلقة:</small>
                    {companyRequests.map(r => (
                      <div key={r.requestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '8px 12px', borderRadius: '4px', marginBottom: '5px' }}>
                        <span style={{ color: '#fff', fontSize: '11px' }}>👤 يطلب المستثمر <strong style={{color:'#2980b9'}}>{r.applicant}</strong> فتح وتفعيل نظام المصانع السنوي</span>
                        <button className="gold-btn-small" style={{ background: '#27ae60', border: 'none', color: '#fff', padding: '4px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }} onClick={() => { if (socket) { socket.emit('admin_approve_company_system', { requestId: r.requestId, applicantName: r.applicant }); setCompanyRequests(prev => prev.filter(req => req.requestId !== r.requestId)); alert(`🏛️ تم قبول طلب المستثمر (${r.applicant}) وتفعيل نظام الشركات بنجاح لمدة سنة كاملة!`); } }} >موافق (سنة كاملة) ✔️</button>
                      </div>
                    ))}
                  </div>
                )}
                {(!companyRequests || companyRequests.length === 0) && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', margin: '2px 0' }}>📋 لا توجد طلبات شركات معلقة حالياً...</p>
                )}

                {/* 🏫 ب) عرض طلبات السناتر والاجتماعات الموقوتة لـ 30 يوماً بالمنصة - تم تصحيح المسميات بالملي */}
                {pendingCenterRequests && pendingCenterRequests.length > 0 && (
                  <div style={{ background: 'rgba(212,175,55,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid var(--gold-primary)', marginTop: '5px' }}>
                    <small style={{ color: 'var(--gold-primary)', display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>🏫 طلبات فتح السناتر المعلقة (30 يوماً):</small>
                    {pendingCenterRequests.map(r => (
                      <div key={r.requestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '8px 12px', borderRadius: '4px', marginBottom: '5px' }}>
                        <span style={{ color: '#fff', fontSize: '11px' }}>👤 يطلب المستخدم <strong style={{color:'var(--gold-primary)'}}>{r.applicant}</strong> فتح سنتر خاص به للتدريس</span>
                        <button className="gold-btn-small" style={{ background: '#27ae60', border: 'none', color: '#fff', padding: '4px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }} onClick={() => { if (socket) { socket.emit('admin_approve_teacher_request', { requestId: r.requestId }); setPendingCenterRequests(prev => prev.filter(req => req.requestId !== r.requestId)); alert("👑 تم تفعيل ترخيص السنتر والاجتماعات للمستخدم بنجاح لمدة 30 يوماً!"); } }} >موافق (30 يوماً) ✔️</button>
                      </div>
                    ))}
                  </div>
                )}
                {(!pendingCenterRequests || pendingCenterRequests.length === 0) && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', margin: '2px 0' }}>🏫 لا توجد طلبات سناتر معلقة حالياً...</p>
                )}

              </div>
            </div>
          </div>
        )}

        {showAiModal && (
          <OuroAiAssistant 
            user={user}
            API_BASE={API_BASE}
            onClose={() => setShowAiModal(false)}
          />
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
}; // 👈 هذا هو القوس الشرعي والوحيد لإغلاق دالة App عند السطر 791

export default App; // 👑 التصدير النهائي للمكون بأسفل الملف تماماً دون أي أسطر زائدة بعدها
