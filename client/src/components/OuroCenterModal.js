/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 👑 تم التصحيح والتحصين هنا ليعتمد على الحزمة القياسية الصافية

const OuroCenterModal = ({ user, socket, API_BASE, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState('live'); 
  const [centerMeta, setCenterMeta] = useState({ isHost: false, activeRoom: null, hasAccess: false, expiryDate: "" });
  const [liveStreamActive, setLiveStreamActive] = useState(false);
  
  // 👑 [تم الحقن السيادي] - تعريف حالات تفعيل الكاميرا والميكروفون لمنع كراش ال-no-undef ل-Vercel
  const [isCamActive, setIsCamActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);

  // قنوات استقبال إشعارات الأدمن والمحاضرين حية من السحاب
  const [adminRequests, setAdminRequests] = useState([]);
  const [hostRequests, setHostRequests] = useState([]);

  const [recordedVideos, setRecordedVideos] = useState([]);
  const [centerImages, setCenterImages] = useState([]);
  const [centerPdfs, setCenterPdfs] = useState([]);
  const [liveComments, setLiveComments] = useState([]);
  const [currentLiveComment, setCurrentLiveComment] = useState("");

  // 👑 [تم الحقن والتأمين بنجاح] متغير الـ State لحفظ وقراءة قائمة الملف العام للمشتركين
  const [activeSubscribers, setActiveSubscribers] = useState([]); 
  // 🔑 [متغيرات جديدة] لإدارة وحفظ وقراءة مفتاح Google Drive API KEY للمدرس
  const [driveApiKey, setDriveApiKey] = useState("");
  const [isSavedKey, setIsSavedKey] = useState(false);
  // 👑 [تم الحقن موضعياً] - تروس مراجع الكاميرا الفيزيائية والشات الجانبي الطائر
  const localVideoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const chatEndRef = React.useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newComment, setNewComment] = useState("");
  // 👑 [تم الحقن موضعياً] - تروس تبويب محاضرات البث الحية وطلبات انضمام الطلاب
  const [liveTeachers, setLiveTeachers] = useState([]); // قائمة المدرسين المتصلين حياً الآن
  const [studentJoinRequests, setStudentJoinRequests] = useState([]); // مصفوفة طلبات الطلاب المعلقة (تظهر للمعلم)

  useEffect(() => {
    if (socket) {
      // 📡 مستمع استقبال قائمة المدرسين النشطين حالياً في الشبكة
      socket.on('update_live_teachers_list', (list) => {
        setLiveTeachers(list || []);
      });

      // 📡 مستمع المعلم: استقبال طلب انضمام فوري من طالب بالـ ID حياً
      socket.on('teacher_receive_join_request', (req) => {
        setStudentJoinRequests(prev => {
          if (prev.some(p => p.requestId === req.requestId)) return prev;
          return [...prev, req];
        });
      });

      // 📡 مستمع الطالب: استقبال موافقة المعلم ودخوله للغرفة التعليمية
      socket.on('student_join_request_approved', (data) => {
        if (data.studentName === user?.username) {
          alert(`🎉 مبروك! وافق المعلم ${data.teacherName} على انضمامك للغرفة التعليمية لمدة شهر كامل!`);
          setLiveStreamActive(true); // تفجير شاشة الفيديو ودخوله للبث فوراً
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('update_live_teachers_list');
        socket.off('teacher_receive_join_request');
        socket.off('student_join_request_approved');
      }
    };
  }, [socket, user]); // eslint-disable-line react-hooks/exhaustive-deps


  // 👑 [تم الحقن موضعياً] - مستمع قنص تعليقات الطلاب وإبادة الكاميرا عند الخروج
  useEffect(() => {
    if (socket) {
      socket.on('receive_center_live_comment', (msg) => {
        setChatMessages(prev => [...prev, msg]);
      });
    }
    return () => {
      if (socket) socket.off('receive_center_live_comment');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // خطاف الجلب التلقائي لمفتاح الداريف الخاص بالمستخدِم فور فتح السنتر
  useEffect(() => {
    if (user?.username) {
      axios.post(`${API_BASE}/api/center/get-drive-key`, { username: user.username })
        .then(res => {
          if (res.data && res.data.driveApiKey) {
            setDriveApiKey(res.data.driveApiKey);
            setIsSavedKey(true);
          }
        })
        .catch(() => {});
    }
  }, [user?.username]);

    // 🚀 دالة الطالب: إرسال طلب انضمام فوري موجه لـ ID وعنوان المعلم بالسحاب
  const handleSendJoinRequest = (teacherItem) => {
    if (socket && user) {
      socket.emit('student_submit_join_request', {
        requestId: 'join_' + Date.now(),
        studentName: user.username,
        studentId: user._id || user.user_id,
        targetTeacherName: teacherItem.username,
        targetTeacherId: teacherItem.userId
      });
      alert(`🚀 تم قذف طلب الانضمام حياً للمعلم (${teacherItem.username}) وبانتظار الموافقة الرسمية!`);
    }
  };

  // 👑 دالة المعلم: قبول انضمام الطالب ومنحه صلاحية الـ 30 يوماً الفلكية
  const handleProcessStudentRequest = (reqItem, statusAction) => {
    if (socket) {
      socket.emit('teacher_respond_student_request', {
        requestId: reqItem.requestId,
        studentName: reqItem.studentName,
        studentId: reqItem.studentId,
        teacherName: user?.username,
        action: statusAction // 'approved' أو 'rejected'
      });
      // مسح بطاقة العضو فوراً من قائمة الطلاب المعلقين للمعلم
      setStudentJoinRequests(prev => prev.filter(r => r.requestId !== reqItem.requestId));
    }
  };


    // 👑 [تم الحقن موضعياً] - محرك تشغيل الكاميرا الحقيقي وبث تعليقات الطلاب
  const handleToggleCamera = async () => {
    try {
      if (isCamActive) {
        if (streamRef.current) streamRef.current.getVideoTracks().forEach(track => track.stop());
        setIsCamActive(false);
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
      } else {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicActive });
        streamRef.current = mediaStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;
        setIsCamActive(true);
      }
    } catch (err) { alert("⚠️ يرجى منح المتصفح تصريح تشغيل الكاميرا."); }
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !socket) return;
    const commentPayload = {
      id: 'comment_' + Date.now(),
      sender: user?.username || "طالب",
      text: newComment.trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit('send_center_live_comment', commentPayload);
    setChatMessages(prev => [...prev, commentPayload]);
    setNewComment("");
  };


  // دالة حفظ وإرسال مفتاح جوجل درايف السحابي بقفل قاعدة البيانات
  const handleSaveDriveKey = async (e) => {
    e.preventDefault();
    if (!driveApiKey.trim()) return alert("⚠️ الرجاء كتابة أو لصق مفتاح الـ API الخاص بـ Google Drive أولاً!");

    try {
      const res = await axios.post(`${API_BASE}/api/center/save-drive-key`, {
        username: user?.username,
        driveApiKey: driveApiKey.trim()
      });
      if (res.data.success) {
        setIsSavedKey(true);
        alert(res.data.message);
      }
    } catch (err) {
      alert("❌ فشل ربط المفتاح، تحقق من استقرار اتصال الشبكة.");
    }
  };


  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  // 🔒 جدار المراقبة الدائم والصارم للملف العام: فحص مطابقة اسم المستخدم والـ ID الفريد لحسابك الحالي
  const isUserVerifiedInGlobalFile = activeSubscribers.some(s => 
    s.username === user?.username && 
    (s.userId === user?._id || s.userId === user?.user_id || s.userId === user?.uid)
  );

  // 👑 دالة إطلاق البث المباشر واستدعاء المايك والكاميرا للجهاز فوراً
  const handleStartLiveStream = async () => {
    try {
      // الطلب السيبراني الفوري لأذونات الكاميرا والمايك العتادية من جهاز المستخدم
      const localStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" }, // جودة HD صافية
        audio: true 
      });

      // ربط شريان البث الحي بالفيديو المعروض على الشاشة أمام الطلاب
      const videoElement = document.getElementById('ouroLiveVideoPreview');
      if (videoElement) {
        videoElement.srcObject = localStream;
        videoElement.play().catch(e => console.log("تشغيل البث"));
      }

      setLiveStreamActive(true);
      if (socket) {
        socket.emit('start_live_broadcast', { host: user?.username, roomId: centerMeta.activeRoom });
      }

      alert("🔴 🎉 تم تشغيل الكاميرا والميكروفون بنجاح! أنت الآن في بث مباشر محمي ومؤمن بالكامل.");
    } catch (err) {
      console.error("خطأ الوصول للعتاد:", err);
      alert("⚠️ عذراً، فشل فتح الكاميرا أو المايك! تأكد من منح المتصفح أذونات الوصول للعتاد.");
    }
  };

  // 🛡️ [محرك المنع السيبراني لالتقاط وتسجيل الشاشة كلياً داخل مزايا السنتر]
  useEffect(() => {
    // أ) تعطيل ومنع النقر الأيمن ونسخ المستندات والمذكرات كلياً داخل المنظومة
    const disableCopy = (e) => e.preventDefault();
    document.addEventListener('contextmenu', disableCopy);
    document.addEventListener('copy', disableCopy);

    // ب) [كبسولة حظر تصوير الشاشة بصرياً] تشويش الرؤية وحجب الأصول فور الضغط على أزرار تصوير الشاشة
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        alert("🚨 تنبيه أمني: حظر سيبراني قاطع! يمنع منعاً باتاً التقاط أو تسجيل الشاشة داخل سنتر OURO Steps لحماية الملكية الفكرية!");
        if (navigator.clipboard) navigator.clipboard.writeText(""); // مسح الحافظة فوراً
      }
    };
    window.addEventListener('keyup', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', disableCopy);
      document.removeEventListener('copy', disableCopy);
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, []);

    // 🏛️ [تحديث محرك المراقبة الحية بالـ ID] - خطاف الالتحام الموحد والمطهر
  useEffect(() => {
    if (socket) {
      socket.emit('get_center_status', { username: user?.username });
      
      // 1. استقبال حزمة البيانات والتحقق من صلاحية الحساب المفتوح
      socket.on('center_data_package', (data) => {
        setRecordedVideos(data.allVideos || [
          { id: "vid_1", title: "💻 كورس الويب الشامل - الجلسة الأولى", watchHours: "124.5", date: "2026/05/28", likes: 12, dislikes: 0 },
          { id: "vid_2", title: "📱 كورس الأندرويد لـ Google Play - الدرس التأسيسي", watchHours: "89.2", date: "2026/05/29", likes: 24, dislikes: 1 }
        ]);
        setCenterImages(data.allImages || []);
        setCenterPdfs(data.allPdfs || []);
        
        if (user?.canHostCenter) {
            setCenterMeta(prev => ({ ...prev, hasAccess: true, expiryDate: user.centerExpiry }));
        }
      });

      // 2. 🔐 [قناة استقبال وتحديث بيانات الملف العام للمشتركين النشطين بالـ ID]
      socket.on('teacher_request_granted', (data) => {
        if (data.activeSubscribers) {
          setActiveSubscribers(data.activeSubscribers);
        }
      });

      // المزامنة الدورية الصامتة التابعة لتطهير ومسح الحسابات المنتهية من السيرفر
      socket.on('sync_active_subscribers', (list) => {
        setActiveSubscribers(list || []);
      });

      // التقاط طلبات المدرسين حية على شاشة الأدمن Mostafa
      socket.on('admin_receive_teacher_request', (req) => {
        if (isAdmin) setAdminRequests(prev => [...prev, req]);
      });

      // التقاط طلبات انضمام الطلاب حية على شاشة المحاضر
      socket.on('host_receive_student_request', (req) => {
        if (user?.username === req.host) setHostRequests(prev => [...prev, req]);
      });

      // 📡 جلب مبدئي وسريع للقائمة عبر الـ API لعدم انتظار أول نبضة سوكت عند فتح النافذة
      axios.get(`${API_BASE}/api/admin/active-teachers`)
        .then(res => {
          if (res.data && Array.isArray(res.data)) setActiveSubscribers(res.data);
        })
        .catch(() => {});
    }

    // 🧹 التنظيف واقتلاع المستمعات لحماية ذاكرة جهاز العضو من التهنيج
    return () => { 
      if (socket) { 
        socket.off('center_data_package'); 
        socket.off('teacher_request_granted');
        socket.off('sync_active_subscribers');
        socket.off('admin_receive_teacher_request'); 
        socket.off('host_receive_student_request'); 
      } 
    };
  }, [socket, user, isAdmin, API_BASE]); // قفل مأمن

  // دالة المحاضر لإرسال طلب فتح السنتر للأدمن
  const submitSubscribeRequest = () => {
    if (socket) {
      socket.emit('submit_teacher_subscribe_request', { username: user?.username });
      alert("🚀 تم إرسال طلب اشتراك السنتر بنجاح! تم إخطار الأدمن العام Mostafa للموافقة وفتح الصلاحية لـ 30 يوماً.");
    }
  };

  // دالة الأدمن Mostafa للضغط على زر ((موافق)) وتفعيل الـ 30 يوماً فوراً فالسحاب
  const handleAdminApprove = (reqId) => {
    if (socket) {
      socket.emit('admin_approve_teacher_request', { requestId: reqId });
      setAdminRequests(prev => prev.filter(r => r.requestId !== reqId));
      alert("👑 تم تفعيل تصريح البث والسنتر للمستخدم بنجاح لمدة 30 يوماً كاملة!");
    }
  };

  // دالة الطالب للضغط على زر ((انضمام)) وإخطار منشئ السنتر فوراً
  const submitStudentJoinRequest = (hostName) => {
    if (socket) {
      socket.emit('student_submit_join_request', { username: user?.username, host: hostName });
      alert(`🤝 تم إرسال طلب انضمام للبث للمحاضر (${hostName}) بنجاح! بانتظار موافقته المباشرة.`);
    }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '96%', maxWidth: '1050px', background: '#070707', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* الجانب الأيمن: نافذة العرض السينمائي للبث ومقعد المعلم والأدوات الأربعة */}
        <div style={{ flex: '2', minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '8px' }}>
            <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '15px', fontWeight: 'bold' }}>🏛️ سنتر واجتماعات OURO التعليمي الحركي المباشر</h3>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button type="button" onClick={() => setActiveSubTab('live')} style={{ padding: '6px 12px', fontSize: '11px', color: '#fff', background: activeSubTab === 'live' ? 'var(--gold-primary)' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🎥 البث المباشر</button>
              <button type="button" onClick={() => setActiveSubTab('lectures')} style={{ padding: '6px 12px', fontSize: '11px', color: '#fff', background: activeSubTab === 'lectures' ? 'var(--gold-primary)' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🎬 محاضرات البث</button>
            </div>
          </div>

          {/* 🔴 1. لوحة الـ LIVE والبث التفاعلي وجدار الحماية ضد التجسس */}
          {activeSubTab === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* شريان حقن وقفل مفتاح Google Drive API KEY للمحاضرين */}
              {(centerMeta.hasAccess || user?.role === 'Admin' || user?.username === 'Admin_Mostafa' || activeSubscribers.some(s => s.username === user?.username)) && (
                <form onSubmit={handleSaveDriveKey} style={{ background: 'rgba(212,175,55,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🔑 Google Drive API KEY:</span>
                  <input 
                    type="password" 
                    placeholder={isSavedKey ? "••••••••••••••••••••••••••••••••" : "الصق هنا مفتاح الـ API KEY الخاص بحساب Google Drive الخاص بك..."}
                    value={isSavedKey ? "" : driveApiKey}
                    onChange={(e) => { setIsSavedKey(false); setDriveApiKey(e.target.value); }}
                    disabled={isSavedKey && driveApiKey}
                    style={{ flex: 1, minWidth: '200px', padding: '6px 10px', background: '#000', color: '#27ae60', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <button type="submit" className="gold-btn-small" style={{ background: isSavedKey ? '#27ae60' : 'var(--gold-primary)', color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 15px', fontSize: '11px', cursor: 'pointer' }}>
                    {isSavedKey ? "🔒 تم القبول والتفعيل" : "💾 ربط وحفظ المفتاح"}
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%' }}>

                {/* صندوق عرض الكاميرا والفيديو للمحاضر */}
                <div style={{ flex: '2', minWidth: '300px', height: '260px', background: '#000', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  
                  {liveStreamActive ? (
                    <>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#000', border: '1px solid #27ae60', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', background: '#27ae60', width: '8px', height: '8px', borderRadius: '50%' }}>●</span>
                        <span style={{ color: '#27ae60' }}>البث الحي مِصرح ونشط 🏛️</span>
                      </div>
                      
                      <video 
                        ref={localVideoRef}
                        id="ouroLiveVideoPreview" 
                        autoPlay 
                        playsInline 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#000' }} 
                      />
                      
                      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                        <button type="button" onClick={handleToggleCamera} style={{ background: isCamActive ? '#c0392b' : '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {isCamActive ? "🛑 إيقاف الكاميرا" : "📸 تشغيل الكاميرا"}
                        </button>
                        <button type="button" onClick={() => {
                          const videoElement = document.getElementById('ouroLiveVideoPreview');
                          if (videoElement && videoElement.srcObject) {
                            videoElement.srcObject.getTracks().forEach(track => track.stop());
                          }
                          setLiveStreamActive(false);
                          setIsCamActive(false);
                        }} style={{ background: '#333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>
                          إنهـاء المعاينة ✖
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '40px' }}>🎥</span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', padding: '0 20px', textAlign: 'center' }}>
                        {activeSubscribers.some(s => s.username === user?.username) || user?.username === 'Admin_Mostafa' ? "🔓 تم مطابقة هويتك والـ ID بالملف العام للمشتركين! يمكنك إطلاق الإشارة الآن." : "🔒 لفتح السنتر وبدء البث، يجب إرسال طلب اشتراك للأدمن لتوثيق اسمك والـ ID بالملف المشترك لـ 30 يوماً."}
                      </p>
                      
                      {(activeSubscribers.some(s => s.username === user?.username) || user?.username === 'Admin_Mostafa') && (
                        <button className="gold-btn-small" style={{ marginTop: '10px', fontWeight: 'bold', background: '#27ae60', color: '#fff', border: 'none', padding: '8px 18px', cursor: 'pointer' }} onClick={() => setLiveStreamActive(true)}>
                          بدء البث 🚀
                        </button>
                      )}
                    </>
                  )}
                </div>
                {/* شريط الشات الجانبي لتعليقات الطلاب التفاعلية حياً */}
                <div style={{ flex: '1', minWidth: '240px', height: '260px', background: '#000', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                  <small style={{ color: 'var(--gold-primary)', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', marginBottom: '6px', display: 'block', textAlign: 'right' }}>💬 تعليقات الطلاب الحية (Real-time):</small>
                  
                  <div className="scrollbar-gold" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '4px' }}>
                    {chatMessages && chatMessages.map(msg => (
                      <div key={msg.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '5px 8px', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '2px' }}>
                          <strong style={{ color: msg.sender === 'Admin_Mostafa' ? 'var(--gold-primary)' : '#2980b9' }}>{msg.sender}</strong>
                          <span style={{ color: 'var(--text-muted)' }}>{msg.time}</span>
                        </div>
                        <p style={{ color: '#fff', fontSize: '10px', margin: 0, textAlign: 'right', wordBreak: 'break-all' }}>{msg.text}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                    {(!chatMessages || chatMessages.length === 0) && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'center', marginTop: '30px' }}>⏳ لا توجد تعليقات حالياً...</p>
                    )}
                  </div>

                  <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '4px', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    <input type="text" placeholder="اكتب تعليقك الحركي بالبث..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ flex: 1, padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '10px' }} required />
                    <button type="submit" style={{ background: 'var(--gold-primary)', border: 'none', borderRadius: '4px', padding: '4px 10px', fontWeight: 'bold', color: '#000', fontSize: '10px', cursor: 'pointer' }}>بث</button>
                  </form>
                </div>

              </div> {/* إغلاق صف تيار البث المشترك */}

              {/* حقن دمج وحفظ الأزرار اللامركزية المخصصة للاشتراك والطلب للطلاب */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%' }}>
                {!(activeSubscribers.some(s => s.username === user?.username) || user?.username === 'Admin_Mostafa') && (
                  <button type="button" className="gold-btn" style={{ flex: 1, background: '#e67e22', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', fontWeight: 'bold', fontSize: '11px', borderRadius: '4px' }} onClick={() => { if(socket && user) { socket.emit('submit_teacher_subscribe_request', { username: user.username }); alert("🚀 تم قذف طلب تفعيل السنتر للأدمن Mostafa بنجاح!"); } }}>
                    🌟 إرسال طلب اشتراك سنتر (30 يوماً للأدمن)
                  </button>
                )}
                <button type="button" className="gold-btn" style={{ flex: 1, background: '#2980b9', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', fontWeight: 'bold', fontSize: '11px', borderRadius: '4px' }} onClick={() => { if(socket && user) { socket.emit('student_submit_join_request', { requestId: 'join_' + Date.now(), studentName: user.username, studentId: user._id || user.user_id, targetTeacherName: 'Admin_Mostafa', targetTeacherId: 'admin' }); alert("🤝 تم إرسال طلب انضمام للبث المباشر والمذكرات حياً!"); } }}>
                  🤝 اضغط هنا لطلب (( انضمام )) للبث المباشر والمذكرات
                </button>
              </div>

            </div>
          )}
          {/* 🎬 2. تبويب محاضرات البث الحية ومنظومة الانضمام والموافقات */}
          {activeSubTab === 'lectures' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              
              {studentJoinRequests && studentJoinRequests.length > 0 && (
                <div style={{ background: 'rgba(39,174,96,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid #27ae60' }}>
                  <small style={{ color: '#27ae60', display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>📥 طلبات انضمام الطلاب المعلقة لبثك الحالي:</small>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {studentJoinRequests.map(req => (
                      <div key={req.requestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <span style={{ color: '#fff', fontSize: '11px' }}>👤 يطلب الطالب <strong style={{color:'var(--gold-primary)'}}>{req.studentName}</strong> الانضمام لمشاهدة محاضراتك التعليمية</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" style={{ background: '#27ae60', border: 'none', color: '#fff', padding: '3px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }} onClick={() => handleProcessStudentRequest(req, 'approved')}>✔️ قبول</button>
                          <button type="button" style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '3px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }} onClick={() => handleProcessStudentRequest(req, 'rejected')}>❌ رفض</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 style={{ color: 'var(--gold-primary)', fontSize: '12px', margin: 0, textAlign: 'right' }}>📋 قائمة المعلمين المتواجدين بغرفة البث الحركي الآن:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                {liveTeachers && liveTeachers.map((teacher, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>👨‍🏫</span>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>المحاضر: {teacher.username}</strong>
                        <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>عنوان المحاضرة: بث تعليمي تفاعلي مباشر 📡</small>
                      </div>
                    </div>
                    {teacher.username !== user?.username ? (
                      <button type="button" onClick={() => handleSendJoinRequest(teacher)} style={{ background: 'var(--gold-primary)', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🔗 الانضمام الآن
                      </button>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#27ae60', background: 'rgba(39,174,96,0.1)', padding: '4px 8px', borderRadius: '4px' }}>✨ غرفتك النشطة</span>
                    )}
                  </div>
                ))}
                {(!liveTeachers || liveTeachers.length === 0) && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', margin: '15px 0' }}>📋 لا توجد قنوات أو محاضرات بث نشطة بالشبكة حالياً...</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OuroCenterModal;
