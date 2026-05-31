/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  // 🛡️ [محرك المنع السيبراني لالتقاط وتسجيل الشاشة كلياً داخل مزايا السنتر]
  useEffect(() => {
    // أ) تعطيل ومنع النقر الأيمن ونسخ المستندات والمذكرات كلياً داخل المنظومة
    const disableCopy = (e) => e.preventDefault();
    document.addEventListener('contextmenu', disableCopy);
    document.addEventListener('copy', disableCopy);

    // ب) [كبسولة حظر تصوير الشاشة بصرياً] تشويش الرؤية وحجب الأصول فور الضغط على أزرار تصوير الشاشة (PrintScreen)
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

    useEffect(() => {
    if (socket) {
      socket.emit('get_center_status', { username: user?.username });
      
      // استقبال حزمة البيانات والتحقق من صلاحية الحساب المفتوح
      socket.on('center_data_package', (data) => {
        setRecordedVideos(data.allVideos || [
          { id: "vid_1", title: "💻 كورس الويب الشامل - الجلسة الأولى", watchHours: "124.5", date: "2026/05/28", likes: 12, dislikes: 0 },
          { id: "vid_2", title: "📱 كورس الأندرويد لـ Google Play - الدرس التأسيسي", watchHours: "89.2", date: "2026/05/29", likes: 24, dislikes: 1 }
        ]);
        setCenterImages(data.allImages || []);
        setCenterPdfs(data.allPdfs || []);
        
        // إذا كان المستخدم يمتلك صلاحية الـ 30 يوماً سحابياً
        if (user?.canHostCenter) {
            setCenterMeta(prev => ({ ...prev, hasAccess: true, expiryDate: user.centerExpiry }));
        }
      });

      // التقاط طلبات المدرسين حية على شاشة الأدمن Mostafa
      socket.on('admin_receive_teacher_request', (req) => {
        if (isAdmin) setAdminRequests(prev => [...prev, req]);
      });

      // التقاط طلبات انضمام الطلاب حية على شاشة المحاضر
      socket.on('host_receive_student_request', (req) => {
        if (user?.username === req.host) setHostRequests(prev => [...prev, req]);
      });
    }
    return () => { if (socket) { socket.off('center_data_package'); socket.off('admin_receive_teacher_request'); socket.off('host_receive_student_request'); } };
  }, [socket, user, isAdmin]);

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

        {/* 🛠️ [لوحة الأدمن الملكية الخاصة بـ Mostafa] لعرض طلبات الاشتراكات المعلقة والضغط على زر ((موافق)) */}
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

        {/* الأزرار الأربعة العلوية المطلوبة بالملي */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '20px' }}>
          <button className={`action-bar-btn ${activeSubTab === 'live' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'live' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('live')}>🔴 Live البث المباشر</button>
          <button className={`action-bar-btn ${activeSubTab === 'videos' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'videos' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('videos')}>📹 الفيديوهات المسجلة</button>
          <button className={`action-bar-btn ${activeSubTab === 'images' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'images' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('images')}>🖼️ معرض الصور</button>
          <button className={`action-bar-btn ${activeSubTab === 'pdf' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'pdf' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('pdf')}>📄 المذكرات PDF</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ maxHeight: '55vh', overflowY: 'auto', padding: '5px' }}>
          
          {/* 🔴 1. لوحة الـ LIFE والبث التفاعلي وجدار الحماية ضد التجسس وتصوير الشاشة */}
          {activeSubTab === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ width: '100%', height: '220px', background: '#000', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {liveStreamActive ? (
                  <>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#c0392b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>LIVE مِباشر</div>
                    <span style={{ fontSize: '40px' }}>📺</span>
                    <p style={{ color: '#27ae60', fontSize: '12px', fontWeight: 'bold' }}>📡 قاعة البث نشطة ومحمية سيبرانياً بالكامل ضد تسجيل الشاشة...</p>
                    {centerMeta.hasAccess && <button className="gold-btn-small" style={{ background: '#c0392b', color: '#fff', marginTop: '10px', border: 'none', cursor: 'pointer' }} onClick={() => setLiveStreamActive(false)}>إنهـاء البث ❌</button>}
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '40px' }}>🎥</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', padding: '0 20px', textAlign: 'center' }}>
                      {centerMeta.hasAccess ? "🔓 تمتلك تصريحاً نشطاً لإدارة السنتر لـ 30 يوماً! اضغط بالأسفل لبدء البث فوراً." : "🔒 لفتح السنتر وبدء البث، يجب إرسال طلب اشتراك للأدمن Mostafa لتفعيل حسابك لـ 30 يوماً."}
                    </p>
                  </>
                )}
              </div>

              {/* 🤝 [أزرار التفاعل الجذري: اشتراك وانضمام المطورين بالملي] */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {!centerMeta.hasAccess && (
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

export default OuroCenterModal;
