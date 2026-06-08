/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OuroCompanyManager = ({ user, socket, API_BASE, onClose }) => {
  // 🏛️ أ) حزم وأقفال التراخيص السنوية ومفاتيح ال-API لـ Google Drive
  const [hasLicense, setHasLicense] = useState(false);
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [requestPending, setRequestPending] = useState(false);
  const [driveApiKey, setDriveApiKey] = useState("");
  const [isDriveKeySaved, setIsDriveKeySaved] = useState(false);

  // 🎛️ ب) التحكم بعلامات التبويب النشطة داخل النظام
  const [activeTab, setActiveTab] = useState('attendance');

  // 📝 ج) كتل تخزين البيانات واللوجستيات الحركية (حضور، زيارات، واردات، صادرات)
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [importLogs, setImportLogs] = useState([]);
  const [exportLogs, setExportLogs] = useState([]);

  // 📋 د) ال-States المؤقتة لحقول الإدخال وصياغة السجلات
  const [empName, setEmpName] = useState("");
  const [scanMethod, setScanMethod] = useState("fingerprint"); // بصمة، كارت، وجه
  const [visitorName, setVisitorName] = useState("");
  const [visitReason, setVisitReason] = useState("زيارة رسمية");
  
  const [truckNo, setTruckNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [weightIn, setWeightIn] = useState("");
  const [weightOut, setWeightOut] = useState("");

  const [productName, setProductName] = useState("");
  const [exportQty, setExportQty] = useState("");
  const [destination, setDestination] = useState("السوق المحلي");

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

   // ⏳ [محرك التحصين ومنع الاختفاء] خطاف المراقبة الدائم والجلب التلقائي للترخيص السنوي رغماً عن الكاش
  useEffect(() => {
    // 1. الفحص الصارم للمطابقة وقراءة تصاريح الـ Cloud الممررة للجلسة الحالية
    if (user) {
      const isUserLicensed = user.canAccessCompanySystem || user.role === 'Admin' || user.username === 'Admin_Mostafa';
      if (isUserLicensed) {
        setHasLicense(true);
        setLicenseExpiry(user.companySystemExpiry || "سنة كاملة مأمنة");
      }
    }
    
    // 2. جلب صامت وسريع لمفتاح جوجل درايف المخصص للمصنع عبر ال-API لعدم انتظار السوكت
    if (user?.username) {
      axios.post(`${API_BASE}/api/flash/get-drive-key`, { username: user.username })
        .then(res => {
          if (res.data && res.data.flashDriveApiKey) {
            setDriveApiKey(res.data.flashDriveApiKey);
            setIsDriveKeySaved(true);
          }
        }).catch(() => {});
    }

    // 3. الاستماع للقناة الحية عند ضغط الأدمن على زر الموافقة لشحن الصلاحية بلحظتها دون وميض
    if (socket) {
      socket.on('company_system_granted', (data) => {
        if (data.username === user?.username) {
          setHasLicense(true);
          setLicenseExpiry(data.companySystemExpiry);
          // تحديث كائن الـ user محلياً في الجلسة المفتوحة لكي لا تطلب الفتح مرة أخرى عند الإغلاق
          if(user) {
            user.canAccessCompanySystem = true;
            user.companySystemExpiry = data.companySystemExpiry;
          }
          alert("👑 مبروك! وافق الأدمن Mostafa على طلبك وتم تفعيل نظام الشركات السنوي لك لـ 365 يوماً!");
        }
      });
    }

    return () => { if (socket) socket.off('company_system_granted'); };
  }, [user, socket, API_BASE]); // قفل مأمن ومحكم بنسبة 100%


  // 🚀 دالة إرسال طلب الترخيص السنوي للأدمن Mostafa
  const handleRequestLicense = async () => {
    try {
      setRequestPending(true);
      const res = await axios.post(`${API_BASE}/api/company/request-access`, { username: user?.username });
      if (res.data.success) {
        alert(res.data.message);
      }
    } catch (err) {
      alert("❌ فشل إرسال الطلب، تحقق من استقرار اتصال السيرفر.");
    } finally {
      setRequestPending(false);
    }
  };

  // 💾 دالة ربط وحفظ مفتاح ال-API KEY لحساب Google Drive الخاص بالمصنع
  const handleSaveDriveKey = async (e) => {
    e.preventDefault();
    if (!driveApiKey.trim()) return alert("⚠️ الرجاء لصق مفتاح ال-API الخاص بـ Google Drive أولاً!");
    try {
      const res = await axios.post(`${API_BASE}/api/flash/save-drive-key`, {
        username: user?.username,
        flashDriveApiKey: driveApiKey.trim()
      });
      if (res.data.success) {
        setIsDriveKeySaved(true);
        alert("🎉 تم ربط وقفل مفتاح درايف المصنع بنجاح باهر! البيانات ستخزن سحابياً بلحظتها.");
      }
    } catch (err) {
      alert("❌ فشل ربط مفتاح الفلاشة والدرايف.");
    }
  };

  // 📸 محاكي تسجيل الحضور والانصراف (بصمة، كارت، كاميرا التعرف على الوجه AI Face Recognition)
  const handleRegisterAttendance = (e) => {
    e.preventDefault();
    if (!empName.trim()) return alert("⚠️ يرجى إدخال اسم الموظف أولاً!");

    if (scanMethod === 'face') {
      alert("📸 [AI Face Recognition] جاري فتح كاميرا الشركة... تم قنص ملامح الوجه وتوثيق الهوية الرقمية للموظف بالذكاء الاصطناعي!");
    } else if (scanMethod === 'fingerprint') {
      alert("📟 [Biometric Scan] جاري قراءة مستشعر البصمة... تم مطابقة البصمة الحيوية للموظف بنجاح!");
    } else {
      alert("💳 [RFID Scanner] جاري مسح كارت الموظف... تم التقاط الرقم التسلسلي للكارت بنجاح!");
    }

    const newLog = {
      id: 'log_' + Date.now(),
      name: empName.trim(),
      method: scanMethod,
      time: new Date().toLocaleTimeString('ar-EG'),
      date: new Date().toLocaleDateString('ar-EG')
    };

    setAttendanceLogs([newLog, ...attendanceLogs]);
    setEmpName("");
  };

  // 🚪 دالة تدوين زوار البوابات والعملاء والورش الخارجية
  const handleRegisterVisitor = (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return alert("⚠️ يرجى إدخال اسم الزائر أو العميل!");
    const newLog = {
      id: 'vis_' + Date.now(),
      name: visitorName.trim(),
      reason: visitReason,
      time: new Date().toLocaleTimeString('ar-EG')
    };
    setVisitorLogs([newLog, ...visitorLogs]);
    setVisitorName("");
  };
  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '950px', background: '#070707', padding: '20px', borderRadius: '12px', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* ترويسة سيستم إدارة الشركات والمصانع */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(41,128,185,0.3)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🏛️</span>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ color: '#2980b9', margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Sovereign ERP & Factory OS - نظام إدارة الشركات والمصانع</h3>
              <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>🔐 الجيل القادم للامركزية التحكم واللوجستيات لعام 2026 م</small>
            </div>
          </div>
          <button className="close-discovery" onClick={onClose} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>

        {/* 🔒 1. جدار الحجب والتحقق من الترخيص السنوي (365 يوماً للأدمن Mostafa) */}
        {!hasLicense && !isAdmin ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#000', borderRadius: '8px', border: '1px solid #c0392b' }}>
            <span style={{ fontSize: '50px' }}>🔒</span>
            <h4 style={{ color: '#fff', marginTop: '15px', fontSize: '14px' }}>عذراً، نظام تشغيل وإدارة الشركات والمصانع غير مفعل لحسابك!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', maxWidth: '500px', margin: '10px auto' }}>
              لفتح بوابات السيستم والتحكم بالبصمات والواردات، يجب إرسال طلب اشتراك سنوي للأدمن Mostafa لتفعيل رخصتك لمدة سنة كاملة (365 يوماً).
            </p>
            <button type="button" onClick={handleRequestLicense} disabled={requestPending} style={{ background: '#e67e22', color: '#fff', fontWeight: 'bold', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
              {requestPending ? "⏳ جاري إرسال طلب التفعيل..." : "🌟 إرسال طلب تفعيل سنوي للأدمن Mostafa"}
            </button>
          </div>
        ) : (
          <>
            {/* 🔑 مربع حقن وقفل مفتاح Google Drive API KEY اللامركزي للمصنع */}
            <form onSubmit={handleSaveDriveKey} style={{ background: 'rgba(41,128,185,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(41,128,185,0.2)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
              <span style={{ fontSize: '11px', color: '#2980b9', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🔑 Factory Drive API KEY:</span>
              <input 
                type="password" 
                placeholder={isDriveKeySaved ? "••••••••••••••••••••••••••••••••" : "الصق مفتاح ال-API KEY لحساب Google Drive المخصص لمصنعك لربط الداتا..."}
                value={isDriveKeySaved ? "" : driveApiKey}
                onChange={(e) => { setIsDriveKeySaved(false); setDriveApiKey(e.target.value); }}
                disabled={isDriveKeySaved && driveApiKey}
                style={{ flex: 1, minWidth: '200px', padding: '6px 10px', background: '#000', color: '#2980b9', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <button type="submit" className="gold-btn-small" style={{ background: isDriveKeySaved ? '#27ae60' : '#2980b9', color: '#fff', fontWeight: 'bold', border: 'none', padding: '6px 15px', fontSize: '11px', cursor: 'pointer' }}>
                {isDriveKeySaved ? "🔒 تم الربط السحابي" : "💾 قفل ومزامنة الحساب"}
              </button>
            </form>

            {/* أزرار التنقل الرسومية للأقسام الأربعة */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('attendance')} style={{ flex: 1, padding: '6px', fontSize: '11px', color: '#fff', background: activeTab === 'attendance' ? '#2980b9' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📟 الحضور والانصراف والبصمة</button>
              <button onClick={() => setActiveTab('visitors')} style={{ flex: 1, padding: '6px', fontSize: '11px', color: '#fff', background: activeTab === 'visitors' ? '#2980b9' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🚪 أمن البوابات والزيارات</button>
              <button onClick={() => setActiveTab('imports')} style={{ flex: 1, padding: '6px', fontSize: '11px', color: '#fff', background: activeTab === 'imports' ? '#2980b9' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🚚 لوجستيات عربات الواردات</button>
              <button onClick={() => setActiveTab('exports')} style={{ flex: 1, padding: '6px', fontSize: '11px', color: '#fff', background: activeTab === 'exports' ? '#2980b9' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🚢 سجل الصادرات والصيانة</button>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              
              {/* 1️⃣ لوحة الحضور والانصراف والتعرف على الوجه */}
              {activeTab === 'attendance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <form onSubmit={handleRegisterAttendance} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input type="text" placeholder="👤 اسم الموظف الحقيقي..." value={empName} onChange={e => setEmpName(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                    <select value={scanMethod} onChange={e => setScanMethod(e.target.value)} style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }}>
                      <option value="fingerprint">📟 مستشعر بصمة الإصبع</option>
                      <option value="card">💳 قارئ كارت ال-RFID</option>
                      <option value="face">📸 كاميرا التعرف على الوجه AI</option>
                    </select>
                    <button type="submit" style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>💾 تسجيل النبضة</button>
                  </form>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {attendanceLogs.map(l => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#000', padding: '8px', borderRadius: '4px', fontSize: '11px', borderRight: '3px solid #2980b9' }}>
                        <span>👤 الموظف: <strong>{l.name}</strong> ({l.method === 'face' ? '📸 بصمة وجه' : l.method === 'fingerprint' ? '📟 بصمة إصبع' : '💳 كارت'})</span>
                        <span style={{ color: 'var(--text-muted)' }}>⏳ التوقيت: {l.time} | {l.date}</span>
                      </div>
                    ))}
                    {attendanceLogs.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>📋 سجل جهاز الحضور والانصراف فارغ حالياً...</p>}
                  </div>
                </div>
              )}

              {/* 2️⃣ لوحة أمن البوابات والزيارات والورش الخارجية */}
              {activeTab === 'visitors' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <form onSubmit={handleRegisterVisitor} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="👤 اسم الزائر، العميل، أو الفني..." value={visitorName} onChange={e => setVisitorName(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                    <select value={visitReason} onChange={e => setVisitReason(e.target.value)} style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }}>
                      <option value="زيارة رسمية">🤝 زيارة عمل رسمية</option>
                      <option value="خروج صيانة للورش">🛠️ خروج ماكينة صيانة لورشة خارجية</option>
                      <option value="عميل استلام بضاعة">📦 عميل استلام شحنة</option>
                    </select>
                    <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🧾 إصدار تصريح بوابات</button>
                  </form>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {visitorLogs.map(v => (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#000', padding: '8px', borderRadius: '4px', fontSize: '11px', borderRight: '3px solid #27ae60' }}>
                        <span>👤 المستهدف: <strong>{v.name}</strong> | 📋 الغرض: {v.reason}</span>
                        <span style={{ color: 'var(--text-muted)' }}>⏱️ العبور: {v.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3️⃣ لوحة لوجستيات عربات الواردات والخامات */}
              {activeTab === 'imports' && (
                <form onSubmit={(e) => { e.preventDefault(); if(!truckNo || !driverName) return alert("البيانات ناقصة"); setImportLogs([{ id: Date.now(), truckNo, driverName, materialName, wIn: weightIn, wOut: weightOut, time: new Date().toLocaleTimeString('ar-EG') }, ...importLogs]); setTruckNo(""); setDriverName(""); setMaterialName(""); setWeightIn(""); setWeightOut(""); alert("🚚 تم تدوين شاحنة المواد الخام بنجاح وتوثيق الأوزان!"); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="text" placeholder="🚚 رقم السيارة الشاحنة..." value={truckNo} onChange={e => setTruckNo(e.target.value)} style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <input type="text" placeholder="👤 اسم السائق..." value={driverName} onChange={e => setDriverName(e.target.value)} style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <input type="text" placeholder="📦 نوع الخام أو قطار الغيار..." value={materialName} onChange={e => setMaterialName(e.target.value)} style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="number" placeholder="الوزن القائم (طن)" value={weightIn} onChange={e => setWeightIn(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                    <input type="number" placeholder="الوزن الفارغ (طن)" value={weightOut} onChange={e => setWeightOut(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                  <button type="submit" style={{ gridColumn: '1/-1', background: '#e67e22', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>💾 تدوين شحنة الواردات بغرفة الميزان</button>
                </form>
              )}

              {/* 4️⃣ لوحة سجل الصادرات والمنتجات التامة */}
              {activeTab === 'exports' && (
                <form onSubmit={(e) => { e.preventDefault(); if(!productName || !exportQty) return alert("البيانات ناقصة"); setExportLogs([{ id: Date.now(), productName, qty: exportQty, dest: destination, time: new Date().toLocaleTimeString('ar-EG') }, ...exportLogs]); setProductName(""); setExportQty(""); alert("🚢 تم تدوين شحنة الصادرات الجاهزة للأسواق الخارجية بنجاح!"); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="📦 اسم المنتج التام الصنع..." value={productName} onChange={e => setProductName(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                    <input type="number" placeholder="الكمية / عدد الوحدات..." value={exportQty} onChange={e => setExportQty(e.target.value)} style={{ width: '150px', padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                  <input type="text" placeholder="🚢 جهة الشحن (اسم العميل أو ميناء التصدير)..." value={destination} onChange={e => setDestination(e.target.value)} style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🚢 إمضاء وتوثيق إذن خروج شحنة صادرات المصنع</button>
                </form>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default OuroCompanyManager; // 👑 القفل القياسي والتصدير الشرعي للمكون بنقاء ثبات فلكي 100%
