/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css'; 

const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

const PrayerWidget = ({ socket, user }) => { 
  // صب مواقيت الصلاة لمدينة القاهرة افتراضياً لمنع اختفاء الأرقام وتجميد الـ Grid نهائياً
  const [times, setTimes] = useState({ 
    fajr: '04:10', 
    dhuhr: '12:55', 
    asr: '16:30', 
    maghrib: '19:45', 
    isha: '21:15' 
  });
  const [currentAdhan, setCurrentAdhan] = useState(""); 
  const [volume, setVolume] = useState(0.8); 
  const [isMuted, setIsMuted] = useState(false); 
  
  const [assets, setAssets] = useState({ kaabaImgUrl: '/assets/kaaba.png', adhanAudioUrl: '/assets/adhan.mp3' });

  const audioRef = useRef(null);
  const isAdmin = user && user.username === 'Admin_Mostafa'; 

  useEffect(() => {
    const fetchTimesAndAssets = async () => {
      try {
        // جلب المواقيت بأمان مع وضع معالج أخطاء مدمج لعدم انهيار الواجهة لو انقطع الاتصال
        const resTimes = await axios.get(`${API_BASE}/api/prayer-times`).catch(() => null);
        if (resTimes && resTimes.data) setTimes(resTimes.data);
        
        // سحب أصول الكعبة والأذان من الذاكرة المحلية أولاً لكسر جدار الـ CORS المشوه كلياً
        const savedLocalKaaba = localStorage.getItem(`kaaba_image_${user?.username || 'global'}`);
        const savedLocalAdhan = localStorage.getItem(`adhan_audio_global`);

        setAssets({
          kaabaImgUrl: savedLocalKaaba || '/assets/kaaba.png',
          adhanAudioUrl: savedLocalAdhan || '/assets/adhan.mp3'
        });
      } catch (err) {
        console.log("استخدام مواقيت القاهرة الآمنة المدمجة بالذاكرة المؤقتة.");
      }
    };
    fetchTimesAndAssets();

    if (socket) {
      socket.on('trigger_adhan_broadcast', (data) => {
          setCurrentAdhan(data.prayerName);
          if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.volume = isMuted ? 0 : volume;
              audioRef.current.play().catch(e => console.log("تأمين تشغيل الأذان"));
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

  // 🕋 معالجة ورفع صورة الكعبة بتقنية الـ Base64 لكسر الـ CORS
  const handleKaabaUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result;
      localStorage.setItem(`kaaba_image_${user?.username || 'global'}`, base64Url);
      setAssets(prev => ({ ...prev, kaabaImgUrl: base64Url }));
      if (socket) socket.emit('update_kaaba_view', { imageUrl: base64Url });
      alert("🕋 🎉 تم تحديث وتوهج خلفية الكعبة المشرفة بنجاح وبشكل فوري!");
    };
    reader.readAsDataURL(file);
  };

  // 🎵 [تدمير حظر الـ CORS للأذان] معالجة ورفع الصوت فورياً بـ Base64 وحفظه مدى الحياة طيراناً بجهازك
  const handleAdhanUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result;
      try {
        localStorage.setItem(`adhan_audio_global`, base64Audio);
        setAssets(prev => ({ ...prev, adhanAudioUrl: base64Audio }));
        if (socket) socket.emit('update_adhan_audio', { audioUrl: base64Audio });
        alert("🎵 🎉 تم تحديث وصيانة صوت الأذان المركزي الموحد لجميع الزوار فوراً من جهازك!");
      } catch (err) {
        alert("⚠️ حجم ملف الصوت كبير جداً، الرجاء اختيار ملف أذان أصغر وأخف لتأمين الذاكرة.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : newVol;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) audioRef.current.volume = !isMuted ? 0 : volume;
  };

  return (
    <div className="prayer-widget-box">
      <audio 
        ref={audioRef} 
        src={assets.adhanAudioUrl} 
        onEnded={() => setCurrentAdhan("")} 
      />

      <div className="prayer-flex-container">
        <div className="kaaba-image-wrapper" style={{ position: 'relative' }}>
          {isAdmin && (
            <input type="file" id="kaabaImageUpInput" accept="image/*" hidden onChange={handleKaabaUpload} />
          )}
          <img 
            src={assets.kaabaImgUrl} 
            className={`kaaba-img-glow ${isAdmin ? 'admin-editable-asset' : ''}`} 
            alt="الكعبة المشرفة" 
            onClick={() => isAdmin && document.getElementById('kaabaImageUpInput').click()}
          />
        </div>

        <div className="prayer-content-side">
          <div className="prayer-widget-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <h4>🕋 مواقيت الصلاة والآذان اللحظي الموحد</h4>
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
              <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '14px' }}>-</span>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} className="gold-volume-slider" />
              <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '14px' }}>+</span>
            </div>

            {currentAdhan && (
              <button type="button" className="stop-adhan-btn" onClick={() => { audioRef.current?.pause(); setCurrentAdhan(""); }}>
                🛑 إيقاف الأذان
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerWidget;
