import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiKeyModal = ({ user, API_BASE, onClose }) => {
  const [keysList, setKeysList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState("");
  
  // 🔒 مصفوفة الخصائص والصلاحيات المتاحة للمطورين في منصة OURO Steps
  const [scopes, setScopes] = useState({
    all_features: false, // استخدام API للتفاعل مع الوجهة بجميع مزايا المنصة
    prayer_times: false, // مواقيت الصلاة
    virtual_flash: false, // الفلاشة الإلكترونية
    market: false,        // المتجر
    ads: false            // الإعلانات
  });

  // 1️⃣ جلب قائمة المفاتيح المستخرجة المخزنة للمستخدم الحالي سحابياً
  useEffect(() => {
    if (user?.username) {
      axios.post(`${API_BASE}/api/developer/keys-list`, { username: user.username })
        .then(res => {
          setKeysList(res.data.keys || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.username, API_BASE]);

  // 2️⃣ خاصية تبديل علامات الصح (Checkbox) للخصائص المرادة
  const handleScopeChange = (scopeKey) => {
    setScopes(prev => ({ ...prev, [scopeKey]: !prev[scopeKey] }));
  };

  // 🔑 3️⃣ دالة توليد واستخراج المفتاح السحابي الثابت الجديد
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!keyName.trim()) return alert("⚠️ الرجاء كتابة اسم أو وصف للمفتاح (مثال: تطبيق الأندرويد)!");

    try {
      const res = await axios.post(`${API_BASE}/api/developer/generate-key`, {
        username: user?.username,
        keyLabel: keyName,
        scopes: scopes
      });

      if (res.data.success) {
        setKeysList(prev => [res.data.newKey, ...prev]);
        setKeyName("");
        // تصفير الخصائص بعد النجاح
        setScopes({ all_features: false, prayer_times: false, virtual_flash: false, market: false, ads: false });
        alert(`🔑 تم استخراج مفتاح الـ API بنجاح! احتفظ به سراً لمشاركته في تطبيقك:\n\n${res.data.newKey.apiKey}`);
      }
    } catch (err) {
      alert("❌ فشل استخراج المفتاح من السحاب، تأكد من اتصال قاعدة البيانات.");
    }
  };

  // 🗑️ 4️⃣ دالة إبادة وحذف المفتاح نهائياً لمنع برامج الموبايل الخارجية من الدخول
  const handleDeleteKey = async (keyId) => {
    if (!window.confirm("🗑️ هل أنت متأكد من حذف هذا المفتاح؟ ستتوقف جميع التطبيقات المرتبطة به فوراً!")) return;
    try {
      const res = await axios.post(`${API_BASE}/api/developer/delete-key`, { username: user?.username, keyId });
      if (res.data.success) {
        setKeysList(prev => prev.filter(k => k.id !== keyId));
        alert("🗑️ تم حذف المفتاح وتطهير الصلاحيات السيبرانية بنجاح.");
      }
    } catch (err) {
      alert("❌ فشل حذف المفتاح.");
    }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '750px' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0 }}>⚙️ بوابة مطوري OURO Steps (API Gateway)</h3>
          <button className="close-discovery" onClick={onClose}>❌ إغلاق</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '15px' }}>
          
          {/* فورم استخراج مفتاح جديد ومطابقة الخصائص كالفيس بوك تماماً */}
          <form className="market-upload-form gold-border" onSubmit={handleGenerateKey} style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>🔑 استخراج مفتاح API جديد للموبايل والتطبيقات</h4>
            <input 
              type="text" 
              placeholder="📌 اكتب اسماً للمفتاح (مثال: تطبيق مبيعات الأندرويد)..." 
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              required 
              style={{ width: '100%', padding: '8px', marginBottom: '15px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px' }}
            />
            
            <h5 style={{ color: 'var(--gold-primary)', margin: '0 0 10px 0' }}>🛡️ حدد الصلاحيات والخصائص المراد مشاركتها للمفتاح:</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.1)' }}>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.all_features} onChange={() => handleScopeChange('all_features')} />
                🌟 استخدام API للتفاعل مع الوجهة بجميع مزايا المنصة كلياً
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.prayer_times} onChange={() => handleScopeChange('prayer_times')} />
                🕋 مشاركة منظومة ومواقيت الصلاة الفلكية
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.virtual_flash} onChange={() => handleScopeChange('virtual_flash')} />
                📟 مشاركة تفاعل الفلاشة الإلكترونية الموقوتة
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.market} onChange={() => handleScopeChange('market')} />
                🛍️ مشاركة معرض سلع ومنشورات المتجر الملكي
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.ads} onChange={() => handleScopeChange('ads')} />
                📣 مشاركة وبث شريط الإعلانات التفاعلي
              </label>

            </div>
            <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '12px' }}>توليد وإصدار المفتاح السحابي الثابت</button>
          </form>

          {/* لوحة إدارة وعرض المفاتيح الحالية المستخرجة للمستخدم */}
          <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '5px' }}>📋 مفاتيح الـ API النشطة الخاصة بك</h4>
          <div className="users-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {loading ? <p className="gold-text">جاري تحميل لوحة المطورين...</p> : (
              keysList.map(k => (
                <div key={k.id} className="mini-user-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#e5c158', fontSize: '13px' }}>📌 {k.label}</strong>
                    <button onClick={() => handleDeleteKey(k.id)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </div>
                  
                  {/* عرض الرمز السري للمفتاح بأمان مع إمكانية تحديده */}
                  <div style={{ display: 'flex', gap: '5px', background: '#000', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <code style={{ color: '#27ae60', fontSize: '11px', wordBreak: 'break-all', userSelect: 'all' }}>{k.apiKey}</code>
                  </div>
                  
                  {/* شريط عرض الصلاحيات المختومة للمفتاح الحركي */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>الصلاحيات النشطة:</small>
                    {Object.keys(k.scopes).filter(s => k.scopes[s]).map(s => (
                      <span key={s} style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', fontSize: '9px', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(212,175,55,0.2)' }}>
                        {s === 'all_features' && '🌟 كامل المنصة'}
                        {s === 'prayer_times' && '🕋 مواقيت الصلاة'}
                        {s === 'virtual_flash' && '📟 الفلاشة'}
                        {s === 'market' && '🛍️ المتجر'}
                        {s === 'ads' && '📣 الإعلانات'}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
            {!loading && keysList.length === 0 && <p className="empty-text-gold" style={{ textAlign: 'center', fontSize: '11px' }}>لا تمتلك أي مفاتيح API مستخرجة حالياً... قُم بإصدار مفتاحك الأول بالأعلى!</p>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
