/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://hf.space";

const PrayerWidget = ({ socket, user }) => { 
  const [times, setTimes] = useState({ fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' });
  const [currentAdhan, setCurrentAdhan] = useState(""); 
  const [volume, setVolume] = useState(0.8); 
  const [isMuted, setIsMuted] = useState(false); 
  
  // 🕋 أصول الرفع السحابية المستلمة حية من قاعدة البيانات
  const [assets, setAssets] = useState({ kaabaImgUrl: '/assets/kaaba.png', adhanAudioUrl: '/assets/adhan.mp3' });

  const audioRef = useRef(null);
  const isAdmin = user && user.username === 'Admin_Mostafa'; // جدار حماية الأدمن الصارم

  useEffect(() => {
    const fetchTimesAndAssets = async () => {
      try {
        const resTimes = await axios.get(`${API_BASE}/api/prayer-times`);
        setTimes(resTimes.data || {});
        
        // جلب آخر صور وأصوات أذان تم رفعها وتخزينها
        const resAssets = await axios.get(`${API_BASE}/api/prayer/assets`);
        if (resAssets.data) {
          // جلب الصورة محلياً لو مخزنة بـ Base64 لمنع الـ 404
          const savedLocalKaaba = localStorage.getItem(`kaaba_image_${user?.username || 'global'}`);
          setAssets({
            kaabaImgUrl: savedLocalKaaba || resAssets.data.kaabaImgUrl || '/assets/kaaba.png',
            adhanAudioUrl: resAssets.data.adhanAudioUrl || '/assets/adhan.mp3'
          });
        }
      } catch (err) {
        console.error("خطأ جلب البيانات السحابية لمواقيت الصلاة:", err);
      }
    };
    fetchTimesAndAssets();

    // 🔊 الاستماع اللحظي لإشارة البث الفوري وتشغيل الأذان تلقائياً
    if (socket) {
      socket.on('trigger_adhan_broadcast', (data) => {
          setCurrentAdhan(data.prayerName);
          if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.volume = isMuted ? 0 : volume;
              audioRef.current.play().catch(e => console.log("نقرة المستخدم تضمن تفعيل تشغيل الأذان تلقائياً."));
          }
      });

      socket.on('prayer_assets_updated', (updatedData) => {
          setAssets(prev => ({ ...prev, ...updatedData }));
      });
    }

    return () => {
        if (socket) {
          socket.off('trigger_adhan_broadcast');
          socket.off('prayer_assets_updated');
        }
    };
  }, [socket, isMuted, volume, user?.username]);

  // 🕋 [تعديل الحسم الجذري] دالة معالجة وقراءة الصورة فورياً بـ Base64 وحفظ الرابط بنقاء دون كراش الـ 404 السحابي
  const handleKaabaUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      try {
        // حفظ الرابط المشفر صامتاً بجهازك
        localStorage.setItem(`kaaba_image_${user?.username || 'global'}`, base64Url);
        setAssets(prev => ({ ...prev, kaabaImgUrl: base64Url }));
        
        // إخطار السوكت المركزي لتحديث العرض فوراً أمام الجميع
        if (socket) {
          socket.emit('update_kaaba_view', { username: user?.username, imageUrl: base64Url });
        }
        
        alert("🕋 🎉 تم رفع وتحديث خلفية الكعبة المشرفة بنجاح وبأعلى دقة بكسل صافية!");
      } catch (err) {
        alert("❌ عذراً، حجم الصورة كبير جداً، الرجاء اختيار صورة أصغر لتأمين الحفظ السحابي.");
      }
    };
    reader.readAsDataURL(file);
  };

  // 🎵 دالة رفع وتعيين صوت الآذان السحابي الموحد للأدمن
  const handleAdhanUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const formData = new FormData();
    formData.append('adhanAudio', file);

    try {
      const res = await axios.post(`${API_BASE}/api/prayer/upload-adhan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("👑 🎉 تم تحديث وصيانة صوت الأذان المركزي الموحد لجميع الزوار فوراً!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ فشل رفع ملف صوت الأذان الجديد.");
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVol;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  return (
    <div className="prayer-widget-box">
      <audio 
        ref={audioRef} 
        src={assets.adhanAudioUrl.startsWith('http') || assets.adhanAudioUrl.startsWith('data:') ? assets.adhanAudioUrl : `${API_BASE}${assets.adhanAudioUrl}`} 
        onEnded={() => setCurrentAdhan("")} 
      />

      <div className="prayer-flex-container">
        <div className="kaaba-image-wrapper" style={{ position: 'relative' }}>
          {isAdmin && (
            <input 
              type="file" 
              id="kaabaImageUpInput" 
              accept="image/*" 
              hidden 
              onChange={handleKaabaUpload} 
            />
          )}
          <img 
            src={assets.kaabaImgUrl.startsWith('http') || assets.kaabaImgUrl.startsWith('data:') ? assets.kaabaImgUrl : `${API_BASE}${assets.kaabaImgUrl}`} 
            className={`kaaba-img-glow ${isAdmin ? 'admin-editable-asset' : ''}`} 
            alt="الكعبة المشرفة" 
            onClick={() => isAdmin && document.getElementById('kaabaImageUpInput').click()}
            title={isAdmin ? "👑 حساب ملكي: انقر هنا لرفع وتعديل الصورة الجانبية فوراً" : ""}
          />
        </div>

        <div className="prayer-content-side">
          <div className="prayer-widget-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <h4>🕋 مواقيت الصلاة والآذان اللحظي التلقائي</h4>
            {isAdmin && (
              <div className="admin-audio-trigger-zone">
                <input type="file" id="adhanAudioUpInput" accept="audio/*" hidden onChange={handleAdhanUpload} />
                <button type="button" className="assign-btn-gold" style={{ fontSize: '10px', padding: '4px 10px', cursor: 'pointer' }} onClick={() => document.getElementById('adhanAudioUpInput').click()}>
                  🎵 تعيين صوت الآذان
                </button>
              </div>
            )}
          </div>

          {currentAdhan && <div className="adhan-live-neon">⚡ حان الآن موعد رفع آذان صلاة {currentAdhan} بـ OURO Steps...</div>}

          <div className="prayer-times-grid">
            <div className="prayer-time-card"><span>الفجر</span><strong>{times.fajr}</strong></div>
            <div className="prayer-time-card"><span>الظهر</span><strong>{times.dhuhr}</strong></div>
            <div className="prayer-time-card"><span>العصر</span><strong>{times.asr}</strong></div>
            <div className="prayer-time-card"><span>المغرب</span><strong>{times.maghrib}</strong></div>
            <div className="prayer-time-card"><span>العشاء</span><strong>{times.isha}</strong></div>
          </div>

          <div className="audio-control-panel">
            <button type="button" className={`mute-btn-gold ${isMuted ? 'muted-active' : ''}`} onClick={toggleMute}>
              {isMuted ? "🔇 صامت" : "🔊 كتم الصوت"}
            </button>
            
            <div className="volume-slider-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="volume-sign-indicator subtract-vol-icon" style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '14px', userSelect: 'none' }}>-</span>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} className="gold-volume-slider" />
              <span className="volume-sign-indicator add-vol-icon" style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '14px', userSelect: 'none' }}>+</span>
            </div>

            {currentAdhan && (
              <button type="button" className="stop-adhan-btn" onClick={() => { audioRef.current?.pause(); setCurrentAdhan(""); }}>
                🛑 إيقاف الأذان الحالي
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerWidget;
