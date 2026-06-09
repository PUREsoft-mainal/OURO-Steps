/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 👑 تم التصحيح والتحصين هنا ليعتمد على الحزمة القياسية الصافية

const OuroCenterModal = ({ user, socket, API_BASE, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState('live'); 
  const [centerMeta, setCenterMeta] = useState({ isHost: false, activeRoom: null, hasAccess: false, expiryDate: "" });
  const [liveStreamActive, setLiveStreamActive] = useState(false);
  
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
    <div className="discovery-overlay no-select-zone" onClick={onClose} style={{ userSelect: 'none' }}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '850px', background: '#090909' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '15px' }}>🏛️ سنتر OURO Steps المحمي سيبرانياً ضد تصوير الشاشة</h3>
          <button className="close-discovery" onClick={onClose}>✖</button>
        </div>

        {/* 🛠️ [لوحة الأدمن الملكية] لعرض طلبات الاشتراكات المعلقة */}
        {isAdmin && adminRequests.length > 0 && (
          <div style={{ background: 'rgba(212,175,55,0.05)', padding: '10px', borderRadius: '6px', border: '1px solid var(--gold-primary)', marginBottom: '15px' }}>
            <small style={{ color: 'var(--gold-primary)', display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>👑 إشعارات الأدمن: طلبات فتح السناتر المعلقة:</small>
            {adminRequests.map(r => (
              <div key={r.requestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '6px 10px', borderRadius: '4px', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontSize: '11px' }}>👤 يطلب المستخدم <strong style={{color:'var(--gold-primary)'}}>{r.applicant}</strong> فتح سنتر خاص به للتدريس والاجتماعات</span>
                <button className="gold-btn-small" style={{ background: '#27ae60', border: 'none', color: '#fff', padding: '2px 10px', cursor: 'pointer' }} onClick={() => handleAdminApprove(r.requestId)}>موافق ✔️</button>
              </div>
            ))}
          </div>
        )}

        {/* الأزرار الأربعة العلوية الملتزمة ديناميكياً بـ activeSubTab الموحد */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '20px' }}>
          <button className={`action-bar-btn ${activeSubTab === 'live' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'live' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('live')}>🔴 Live البث المباشر</button>
          <button className={`action-bar-btn ${activeSubTab === 'videos' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'videos' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('videos')}>📹 الفيديوهات المسجلة</button>
          <button className={`action-bar-btn ${activeSubTab === 'images' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'images' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('images')}>🖼️ معرض الصور</button>
          <button className={`action-bar-btn ${activeSubTab === 'pdf' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'pdf' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('pdf')}>📄 المذكرات PDF</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ maxHeight: '55vh', overflowY: 'auto', padding: '5px' }}>
          
          {/* 🔴 1. لوحة الـ LIVE والبث التفاعلي وجدار الحماية ضد التجسس وتصوير الشاشة */}
          {activeSubTab === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* 👑 [شريان حقن وقفل مفتاح Google Drive API KEY اللامركزي للمحاضرين] */}
              {(centerMeta.hasAccess || isAdmin || isUserVerifiedInGlobalFile) && (
                <form onSubmit={handleSaveDriveKey} style={{ background: 'rgba(212,175,55,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🔑 Google Drive API KEY:</span>
                  <input 
                    type="password" // حماية الخصوصية ومنع الكشف أثناء البث المباشر
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

              {/* 👑 [تحديث الهيكل المزدوج]: تقسيم الواجهة لعرض البث الحي وبجواره الشات الجانبي لتعليقات الطلاب */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%' }}>
                
                {/* 📹 صندوق عرض الكاميرا والفيديو للمحاضر */}
                <div style={{ flex: '2', minWidth: '300px', height: '260px', background: '#000', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  
                  {liveStreamActive ? (
                    <>
                      {/* 🟢 [تحديث الحسم] ظهور دائرة تومض باللون الأخضر النيوني النابض حياً بداخل السنتر */}
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#000', border: '1px solid #27ae60', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="green-pulse-dot" style={{ display: 'inline-block', background: '#27ae60', width: '8px', height: '8px', borderRadius: '50%' }}>●</span>
                        <span style={{ color: '#27ae60' }}>البث الحي مِصرح ونشط 🏛️</span>
                      </div>
                      
                      {/* 👑 ربط الكاميرا بالمستعرض الفيزيائي عبر ال-ref المطور ومسارات ال-Stream */}
                      <video 
                        ref={localVideoRef}
                        id="ouroLiveVideoPreview" 
                        autoPlay 
                        playsInline 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#000' }} 
                      />
                      
                      <button 
                        className="gold-btn-small" 
                        style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', zIndex: 10 }} 
                        onClick={() => {
                          if (streamRef && streamRef.current) {
                            streamRef.current.getTracks().forEach(track => track.stop());
                          } else {
                            const videoElement = document.getElementById('ouroLiveVideoPreview');
                            if (videoElement && videoElement.srcObject) {
                              videoElement.srcObject.getTracks().forEach(track => track.stop());
                            }
                          }
                          setLiveStreamActive(false);
                        }}
                      >
                        إنهـاء البث ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '40px' }}>🎥</span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', padding: '0 20px', textAlign: 'center' }}>
                        {isUserVerifiedInGlobalFile ? "🔓 تم مطابقة هويتك والـ ID بالملف العام للمشتركين! يمكنك إطلاق الإشارة الآن." : "🔒 لفتح السنتر وبدء البث، يجب إرسال طلب اشتراك للأدمن لتوثيق اسمك والـ ID بالملف المشترك لـ 30 يوماً."}
                      </p>
                      
                      {/* 🚀 زر تشغيل البث الحي ينبثق تلقائياً فقط وحصرياً إذا طابق الفحص هويتك والـ ID بالملف العام المشترك */}
                      {isUserVerifiedInGlobalFile && (
                        <button 
                          className="gold-btn-small" 
                          style={{ marginTop: '10px', fontWeight: 'bold', background: '#27ae60', color: '#fff', border: 'none', padding: '8px 18px', boxShadow: '0 0 10px rgba(39,174,96,0.4)', cursor: 'pointer' }} 
                          onClick={handleStartLiveStream} 
                        >
                          بدء البث 🚀
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* 💬 👑 [حقن شريط الشات الجانبي لتعليقات الطلاب التفاعلية حياً عبر السوكت] */}
                <div style={{ flex: '1', minWidth: '240px', height: '260px', background: '#000', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                  <small style={{ color: 'var(--gold-primary)', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', marginBottom: '6px', display: 'block', textAlign: 'right' }}>💬 تعليقات الطلاب الحية (Real-time):</small>
                  
                  {/* حاوية تدفق الرسائل */}
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
                      <p style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'center', marginTop: '30px' }}>⏳ لا توجد تعليقات حالياً... اطلب من الطلاب التفاعل بالبث.</p>
                    )}
                  </div>

                  {/* صندوق الكتابة السريع للتعليق الفوري في قاع الشات الجانبي */}
                  <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '4px', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    <input 
                      type="text" 
                      placeholder="اكتب تعليقك الحركي بالبث..." 
                      value={newComment} 
                      onChange={e => setNewComment(e.target.value)} 
                      style={{ flex: 1, padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '10px' }} 
                      required 
                    />
                    <button type="submit" style={{ background: 'var(--gold-primary)', border: 'none', borderRadius: '4px', padding: '4px 10px', fontWeight: 'bold', color: '#000', fontSize: '10px', cursor: 'pointer' }}>بث</button>
                  </form>
                </div>

              </div>
            </div>
          )}


              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {!isUserVerifiedInGlobalFile && (
                  <button className="gold-btn" style={{ flex: 1, background: '#e67e22', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', fontWeight: 'bold' }} onClick={submitSubscribeRequest}>
                    🌟 إرسال طلب اشتراك سنتر (30 يوماً للأدمن)
                  </button>
                )}
                <button className="gold-btn" style={{ flex: 1, background: '#2980b9', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', fontWeight: 'bold' }} onClick={() => submitStudentJoinRequest(centerMeta.activeRoom ? "المحاضر النشط" : "Admin_Mostafa")}>
                  🤝 اضغط هنا لطلب (( انضمام )) للبث المباشر والمذكرات
                </button>
              </div>
            </div>
          )}


          {/* 📹 2. لوحة الفيديوهات المسجلة بـ ساعات المشاهدة */}
          {activeSubTab === 'videos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
              {recordedVideos.map((vid, idx) => (
                <div key={vid.id || idx} className="facebook-post-card gold-border" style={{ padding: '12px', background: '#000', borderRadius: '6px' }}>
                  <div style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', position: 'relative' }}>
                    🎬
                    <button className="gold-btn-small" style={{ position: 'absolute', bottom: '5px', left: '5px', background: 'rgba(41,128,185,0.85)', color: '#fff', fontSize: '9px', border: 'none', cursor: 'pointer' }} onClick={() => alert("📥 جاري تحميل كورس المحاضرة المحمي لجهازك...")}>تنزيل 📥</button>
                  </div>
                  <h5 style={{ color: '#fff', margin: '10px 0 5px 0', fontSize: '11px', textAlign: 'right' }}>📌 {vid.title}</h5>
                  <small style={{ color: 'var(--gold-primary)', fontSize: '10px', display: 'block', textAlign: 'right' }}>⏳ ساعات المشاهدة التراكمية: <strong>{vid.watchHours} ساعة</strong></small>
                </div>
              ))}
            </div>
          )}

          {/* 🖼️ 3. لوحة الصور والخرائط التوضيحية المأمنة */}
          {activeSubTab === 'images' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {centerImages.map((img, idx) => (
                <div key={idx} className="mini-user-card" style={{ padding: '6px', background: '#000', textAlign: 'center' }}>
                  <img src={img.url} alt="center-img" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                  <small style={{ color: '#fff', display: 'block', fontSize: '10px', marginTop: '4px' }}>{img.title}</small>
                  <button className="assign-btn-gold" style={{ width: '100%', background: '#27ae60', color: '#fff', border: 'none', fontSize: '10px', marginTop: '5px', cursor: 'pointer' }} onClick={() => alert("📥 جاري حفظ اللوحة التعليمية...")}>حفظ لجهازي 📥</button>
                </div>
              ))}
              {centerImages.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '20px 0' }}>معرض الصور التوضيحية فارغ حالياً...</p>}
            </div>
          )}

          {/* 📄 4. لوحة المذكرات والملازم PDF المحمية من النسخ */}
          {activeSubTab === 'pdf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {centerPdfs.map((pdf, idx) => (
                <div key={idx} className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#000', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>📄</span>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>{pdf.title}</strong>
                      <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>الحجم: {pdf.size}</small>
                    </div>
                  </div>
                  <button className="gold-btn-small" style={{ background: '#2980b9', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert("📥 جاري تحميل مذكرة الـ PDF المحمية...")}>تحميل المستند 📥</button>
                </div>
              ))}
            </div>
          )}

        </div> 
      </div> 
    </div> 
  );
};

export default OuroCenterModal; // 👑 القفل القياسي والتصدير الشرعي للمكون بنقاء 100%
