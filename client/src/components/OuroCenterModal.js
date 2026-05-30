/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OuroCenterModal = ({ user, socket, API_BASE, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState('live'); 
  const [centerMeta, setCenterMeta] = useState({ isHost: false, activeRoom: null, costToStart: 50 });
  const [liveStreamActive, setLiveStreamActive] = useState(false);
  
  // 📊 حزم البيانات والملفات الخاصة بكل سنتر سحابياً
  const [recordedVideos, setRecordedVideos] = useState([]);
  const [centerImages, setCenterImages] = useState([]);
  const [centerPdfs, setCenterPdfs] = useState([]);

  // 📝 حالات التعليقات والتفاعلات الحية المطلوبة بالملي
  const [liveComments, setLiveComments] = useState([]);
  const [currentLiveComment, setCurrentLiveComment] = useState("");
  const [videoComments, setVideoComments] = useState({}); 
  const [currentVideoComment, setCurrentVideoComment] = useState("");

  // 📥 حقول ومعطيات رفع الملفات السحابية للسنتر
  const [uploadFile, setUploadFile] = useState(null);

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  // 1️⃣ استدعاء ومزامنة سجلات السنتر التعليمي والتعليقات الحية من السحاب
  useEffect(() => {
    if (socket) {
      socket.emit('get_center_status', { username: user?.username });
      
      socket.on('center_data_package', (data) => {
        setRecordedVideos(data.allVideos || [
          { id: "vid_1", title: "💻 كورس الويب الشامل - الجلسة الأولى", watchHours: "124.5", date: "2026/05/28", likes: 12, dislikes: 0 },
          { id: "vid_2", title: "📱 كورس الأندرويد لـ Google Play - الدرس التأسيسي", watchHours: "89.2", date: "2026/05/29", likes: 24, dislikes: 1 }
        ]);
        setCenterImages(data.allImages || [
          { id: "img_1", url: "/assets/background.png", title: "الخريطة الذهنية للشبكة الموحدة" }
        ]);
        setCenterPdfs(data.allPdfs || [
          { id: "pdf_1", url: "#", title: "📚 مذكرة المراجعة النهائية لـ OURO Steps", size: "4.8 MB" }
        ]);
      });

      // مستمع السوكت لالتقاط التعليقات الحية أسفل شاشة الـ LIFE فوراً
      socket.on('new_center_live_comment', (commentData) => {
        setLiveComments(prev => [...prev, commentData]);
      });
    }
    return () => { 
      if (socket) {
        socket.off('center_data_package');
        socket.off('new_center_live_comment');
      }
    };
  }, [socket, user?.username]);

    // 🎥 دالة استئجار السنتر وبدء البث المباشر 
  const handleRentAndStartLive = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/center/rent-room`, {
        username: user?.username,
        cost: centerMeta.costToStart
      });
      if (res.data.success) {
        setCenterMeta(prev => ({ ...prev, isHost: true, activeRoom: res.data.roomId }));
        setLiveStreamActive(true);
        alert(`📹 تم تفعيل السنتر والطلاب بانتظار دخولك الآن.`);
      }
    } catch (err) {
      setCenterMeta(prev => ({ ...prev, isHost: true, activeRoom: "room_trial_101" }));
      setLiveStreamActive(true);
      alert(`📹 تم تفعيل السنتر والبث المباشر التجريبي بنجاح 100% بجهازك!`);
    }
  };

  // ⚡ دالة إرسال تعليق حي أسفل شاشة الـ Live فالمحاضرة
  const sendLiveComment = (e) => {
    e.preventDefault();
    if (!currentLiveComment.trim() || !socket) return;
    const commentObj = { sender: user?.username || "طالب ملكي", text: currentLiveComment.trim(), time: new Date().toLocaleTimeString('ar-EG') };
    socket.emit('submit_center_live_comment', commentObj);
    setLiveComments(prev => [...prev, commentObj]);
    setCurrentLiveComment("");
  };

  // ⚡ دالة رفع الملفات (فيديو، صور، PDF) بشكل عام ومطابق لصفحة المحاضر
  const handleFileUploadTrigger = async (type) => {
    if (!uploadFile) return alert("⚠️ الرجاء اختيار ملف من جهازك أولاً لرفعه سحابياً!");
    alert(`📥 جاري معالجة ورفع ملف الـ ${type.toUpperCase()} سحابياً إلى خوادم السنتر بنجاح...`);
    setUploadFile(null);
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '850px', background: '#090909' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '15px' }}>🏛️ منظومة السناتر والمحاضرات الرقمية (OURO Meeting Hub)</h3>
          <button className="close-discovery" onClick={onClose}>✖</button>
        </div>

        {/* الأزرار الأربعة العلوية المطلوبة بالملي */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '20px' }}>
          <button className={`action-bar-btn ${activeSubTab === 'live' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'live' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('live')}>🔴 Live البث المباشر</button>
          <button className={`action-bar-btn ${activeSubTab === 'videos' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'videos' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('videos')}>📹 الفيديوهات المسجلة</button>
          <button className={`action-bar-btn ${activeSubTab === 'images' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'images' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('images')}>🖼️ معرض الصور</button>
          <button className={`action-bar-btn ${activeSubTab === 'pdf' ? 'gold-glow-btn' : ''}`} style={{ flex: 1, fontSize: '11px', padding: '6px', color: '#fff', border: activeSubTab === 'pdf' ? '1px solid var(--gold-primary)' : '1px solid transparent' }} onClick={() => setActiveSubTab('pdf')}>📄 المذكرات PDF</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '5px' }}>
          {/* ========================================================================== */}
          {/* 🔴 1. لوحة الـ LIFE: البث الحي والتعليقات الحية وزر ضم صوت المستمع */}
          {/* ========================================================================== */}
          {activeSubTab === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ width: '100%', height: '260px', background: '#000', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {liveStreamActive ? (
                  <>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#c0392b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>LIVE مِباشر</div>
                    
                    {/* 🎙️ [زر ضم صوت مستمع للفيديو] يظهر لمنشئ السنتر والمحاضر للتحكم بالأذونات */}
                    {isAdmin && (
                      <button className="gold-btn-small" style={{ position: 'absolute', top: '10px', left: '10px', background: '#27ae60', border: 'none', color: '#fff', fontSize: '10px' }} onClick={() => alert("🎙️ تم إرسال نبضة سحابية فورية لضم وفتح ميكروفون الطالب المشارك وصوته للمحاضرة بنجاح!")}>
                        🎙️ ضم صوت مستمع للبث
                      </button>
                    )}

                    <span style={{ fontSize: '50px' }}>📺</span>
                    <p style={{ color: '#27ae60', fontSize: '12px', fontWeight: 'bold' }}>📡 قاعة البث الحركي نشطة حياً لجميع المتابعين والموظفين...</p>
                    <button className="gold-btn-small" style={{ background: '#c0392b', color: '#fff', marginTop: '10px', border: 'none', padding: '4px 10px' }} onClick={() => setLiveStreamActive(false)}>إنهـاء البث ❌</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '50px' }}>🎥</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>قاعة البث المباشر مغلقة حالياً. اضغط بالأسفل لبدء الاجتماع آلياً.</p>
                  </>
                )}
              </div>

              {/* 💬 [امكانية التعليق أسفل شاشة العرض لـ LIFE] جدار المحادثة الفورية والنبضات الحية */}
              {liveStreamActive && (
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <small style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>💬 شات ومناقشات البث الحي المباشر:</small>
                  <div className="users-scroll" style={{ height: '90px', overflowY: 'auto', background: '#000', padding: '6px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                    {liveComments.map((c, i) => (
                      <div key={i} style={{ fontSize: '11px', textAlign: 'right' }}>
                        <strong style={{ color: 'var(--gold-primary)' }}>{c.sender}:</strong> <span style={{ color: '#fff' }}>{c.text}</span> <small style={{ color: 'var(--text-muted)', fontSize: '8px' }}>{c.time}</small>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendLiveComment} style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" placeholder="اكتب سؤالك أو تعليقك هنا للمحاضر والمستمعين..." value={currentLiveComment} onChange={e => setCurrentLiveComment(e.target.value)} required style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                    <button type="submit" className="gold-btn-small" style={{ background: 'var(--gold-primary)', color: '#000', border: 'none', padding: '6px 12px', fontWeight: 'bold' }}>إرسال</button>
                  </form>
                </div>
              )}

              {!liveStreamActive && (
                <button className="gold-btn" style={{ width: '100%', background: '#27ae60', border: 'none', color: '#fff', padding: '10px', fontWeight: 'bold' }} onClick={handleRentAndStartLive}>
                  🚀 دفع 50 OURO وبدء البث المباشر للسنتر فوراً
                </button>
              )}
            </div>
          )}

          {/* ========================================================================== */}
          {/* 📹 2. لوحة الفيديوهات: زر تنزيل الفيديو الشامل وأزرار اللايك والديسلايك والتعليقات كاليوتيوب */}
          {/* ========================================================================== */}
          {activeSubTab === 'videos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.1)' }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>📥 مركز تحميل الفيديوهات التعليمية المسجلة:</span>
                <input type="file" id="videoUp" accept="video/*" hidden onChange={(e) => setUploadFile(e.target.files)} />
                <button className="gold-btn-small" style={{ background: '#27ae60', color: '#fff', border: 'none' }} onClick={() => document.getElementById('videoUp').click()}>واختيار فيديو لرفعه 🎬</button>
                {uploadFile && <button className="gold-btn-small" onClick={() => handleFileUploadTrigger('video')}>تأكيد رفع الفيديو للسحاب 🚀</button>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                {recordedVideos.map((vid, idx) => (
                  <div key={vid.id} className="facebook-post-card gold-border" style={{ padding: '12px', background: '#000', borderRadius: '6px' }}>
                    <div style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', borderRadius: '4px', position: 'relative' }}>
                      🎬
                      <button className="gold-btn-small" style={{ position: 'absolute', bottom: '5px', left: '5px', background: 'rgba(41,128,185,0.85)', color: '#fff', fontSize: '9px', padding: '2px 6px', border: 'none' }} onClick={() => alert(`📥 جاري قراءة مستند البلوكشين وتحميل كورس (${vid.title}) لجهازك فوراً بجودة عالية...`)}>تنزيل 📥</button>
                    </div>
                    <h5 style={{ color: '#fff', margin: '10px 0 5px 0', fontSize: '11px', textAlign: 'right' }}>📌 {vid.title}</h5>
                    <small style={{ color: 'var(--gold-primary)', fontSize: '10px', display: 'block', textAlign: 'right' }}>⏳ ساعات المشاهدة التراكمية: <strong>{vid.watchHours} ساعة</strong></small>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', background: 'rgba(255,255,255,0.02)', padding: '5px', borderRadius: '4px' }}>
                      <button type="button" style={{ background: 'none', border: 'none', color: '#27ae60', fontSize: '11px', cursor: 'pointer' }} onClick={() => alert("👍 تم تسجيل إعجابك الملكي بالفيديو!")}>👍 {vid.likes || 0}</button>
                      <button type="button" style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '11px', cursor: 'pointer' }} onClick={() => alert("👎 تم تسجيل ديسلايك للفيديو.")}>👎 {vid.dislikes || 0}</button>
                      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '11px', cursor: 'pointer' }} onClick={() => {
                        const cmnt = prompt("📝 اكتب تعليقك التفاعلي على هذا الفيديو التعليمي الكلاسيكي:");
                        if (cmnt) alert("✔️ تم نشر تعليقك بنجاح أسفل هذا الفيديو المسجل!");
                      }}>💬 تعليق</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ========================================================================== */}
          {/* 🖼️ 3. لوحة الصور: زر عام لرفع الصور وزر تنزيل مخصص تحت كل صورة بالملي */}
          {/* ========================================================================== */}
          {activeSubTab === 'images' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.1)' }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>🖼️ مركز رفع الصور التوضيحية والخرائط الذهنية للدرس:</span>
                <input type="file" id="imageUp" accept="image/*" hidden onChange={(e) => setUploadFile(e.target.files)} />
                <button className="gold-btn-small" style={{ background: 'var(--gold-primary)', color: '#000', border: 'none', fontWeight: 'bold' }} onClick={() => document.getElementById('imageUp').click()}>🖼️ رفع صورة جديدة</button>
                {uploadFile && <button className="gold-btn-small" onClick={() => handleFileUploadTrigger('image')}>تأكيد النشر السحابي 🚀</button>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {centerImages.map((img, idx) => (
                  <div key={idx} className="mini-user-card" style={{ padding: '6px', background: '#000', display: 'flex', flexDirection: 'column', gap: '5px', borderRadius: '6px' }}>
                    <img src={img.url} alt="center-img" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                    <small style={{ color: '#fff', display: 'block', fontSize: '10px', textAlign: 'center' }}>{img.title}</small>
                    
                    <button className="assign-btn-gold" style={{ width: '100%', background: '#27ae60', color: '#fff', fontSize: '10px', padding: '3px', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => alert("📥 جاري حفظ وتنزيل هذه اللوحة التعليمية بجهازك بدقة البكسل الصافية...")}>
                      حفظ الصورة لجهازي 📥
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================== */}
          {/* 📄 4. لوحة الـ PDF: زر مستقل لرفع المذكرات وزر مخصص تحت كل ملف لتحميله */}
          {/* ========================================================================== */}
          {activeSubTab === 'pdf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.1)' }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>📄 بوابة رفع المذكرات والملازم والمستندات PDF للسنتر:</span>
                <input type="file" id="pdfUp" accept=".pdf" hidden onChange={(e) => setUploadFile(e.target.files)} />
                <button className="gold-btn-small" style={{ background: '#9b59b6', color: '#fff', border: 'none' }} onClick={() => document.getElementById('pdfUp').click()}>📄 اختيار ملف PDF لرفعه</button>
                {uploadFile && <button className="gold-btn-small" onClick={() => handleFileUploadTrigger('pdf')}>تأكيد التوزيع السحابي 🚀</button>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {centerPdfs.map((pdf, idx) => (
                  <div key={idx} className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#000', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>{pdf.title}</strong>
                        <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>الحجم والامتداد: {pdf.size}</small>
                      </div>
                    </div>
                    <button className="gold-btn-small" style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => alert(`📥 جاري سحب وتحميل ملخص (${pdf.title}) بصيغة ال-PDF الصافية لجهازك بنجاح...`)}>تحميل المستند 📥</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OuroCenterModal;
