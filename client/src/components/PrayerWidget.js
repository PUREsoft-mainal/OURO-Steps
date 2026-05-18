import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const PrayerWidget = ({ socket }) => {
// 👑 ربط الواجهة الأمامية بالسيرفر السحابي المباشر على Hugging Face
const API_BASE = "https://puresoft-mainal-ouro-steps.hf.space";

// تفعيل اتصال السوكت المشفر (WSS) ليعمل مع جدار الحماية السحابي
const socket = io(API_BASE, { 
  transports: ['polling', 'websocket'],
  secure: true,
  rejectUnauthorized: false
});
  
  const [times, setTimes] = useState({ fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' });
  const [currentAdhan, setCurrentAdhan] = useState(""); 
  const [volume, setVolume] = useState(0.8); 
  const [isMuted, setIsMuted] = useState(false); 

  const audioRef = useRef(null);

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/prayer-times`);
        setTimes(res.data || {});
      } catch (err) {
        console.error("خطأ جلب المواقيت الفلكية:", err);
      }
    };
    fetchTimes();

    // 🔊 الاستماع اللحظي لإشارة البث الفوري وتشغيل الأذان عند الجميع معاً
    socket.on('trigger_adhan_broadcast', (data) => {
        setCurrentAdhan(data.prayerName);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.volume = isMuted ? 0 : volume;
            audioRef.current.play().catch(e => console.log("نقرة المستخدم تضمن تفعيل تشغيل الأذان تلقائياً."));
        }
    });

    return () => {
        socket.off('trigger_adhan_broadcast');
    };
  }, [socket, isMuted, volume]);

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
    <div className="prayer-widget-box gold-border">
      
      {/* مشغل صوت الأذان المدمج التفاعلي */}
      <audio ref={audioRef} src="/assets/adhan.mp3" onEnded={() => setCurrentAdhan("")} />

      {/* 🕋 الهيكل المرن: دمج صورة الكعبة مع حقول الأوقات والتحكم */}
      <div className="prayer-flex-container">
        
        {/* جهة اليمين: صورة الكعبة بارتفاع 120px وعرض متناسب ثابت */}
        <div className="kaaba-image-wrapper">
          <img src="/assets/kaaba.png" className="kaaba-img-glow" alt="الكعبة المشرفة" />
        </div>

        {/* جهة اليسار: جدول الصلوات وأزرار التحكم خفض ورفع الصوت */}
        <div className="prayer-content-side">
          <div className="prayer-widget-header">
            <h4>🕋 مواقيت الصلاة والآذان اللحظي التلقائي</h4>
            {currentAdhan && <div className="adhan-live-neon">⚡ حان الآن موعد رفع آذان صلاة {currentAdhan} بـ OURO Steps...</div>}
          </div>

          <div className="prayer-times-grid">
            <div className="prayer-time-card"><span>الفجر</span><strong>{times.fajr}</strong></div>
            <div className="prayer-time-card"><span>الظهر</span><strong>{times.dhuhr}</strong></div>
            <div className="prayer-time-card"><span>العصر</span><strong>{times.asr}</strong></div>
            <div className="prayer-time-card"><span>المغرب</span><strong>{times.maghrib}</strong></div>
            <div className="prayer-time-card"><span>العشاء</span><strong>{times.isha}</strong></div>
          </div>

          <div className="audio-control-panel">
            <button type="button" className={`mute-btn-gold ${isMuted ? 'muted-active' : ''}`} onClick={toggleMute}>
              {isMuted ? "🔇 صامت الآن" : "🔊 كتم الصوت"}
            </button>
            
            <div className="volume-slider-wrapper">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>مستوى الصوت:</span>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} className="gold-volume-slider" />
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

// 🔥 [السطر الجوهري لحل مشكلة الـ undefined واختفاء الخطأ كلياً]
export default PrayerWidget; 

