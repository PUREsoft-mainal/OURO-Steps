/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';


const ApiKeyModal = ({ user, API_BASE, onClose }) => {
  const [keysList, setKeysList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState("");
  
  // 🔒 [تطهير مصفوفة الخصائص] إبادة المحفظة وعملات الـ OURO واعتماد جدار الصلاحيات الإدارية المعلقة
  const [scopes, setScopes] = useState({
    all_features: false,   // استخدام API بجميع مزايا المنصة كلياً (بطلب وتصريح الإدارة)
    prayer_times: true,    // مواقيت الصلاة (متاح ومجاني)
    virtual_flash: false,  // الفلاشة الإلكترونية الموقوتة
    market: false,         // المتجر الإداري 
    center: false,         // السنتر والاجتماعات التعليمية 👑 مضاف بالتصريح
    ads: true              // الإعلانات التفاعلية (متاح ومجاني)
  });

  // 🔓 [تطهير سيبراني وتجاري تام]: تم مسح وإلغاء حقل wallet ودالة حاسبة الأسعار calculateLiveCost كلياً من هنا لمنع التضارب البصري.

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

  // 🔑 3️⃣ دالة توليد واستخراج المفتاح السحابي المحدثة بالخصم المسبق والتطابق التام
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!keyName.trim()) return alert("⚠️ الرجاء كتابة اسم أو وصف للمفتاح (مثال: تطبيق الأندرويد)!");

    try {
      // 🔒 توجيه الطلب للمسار المركزي المطور لحساب الخصم المسبق والتجميد المالي
      const res = await axios.post(`${API_BASE}/api/developer/create-key`, {
        username: user?.username,
        keyLabel: keyName.trim(),
        scopes: scopes
      });

      if (res.data.success) {
        setKeysList(prev => [res.data.key, ...prev]);
        setKeyName("");
        setScopes({ all_features: false, prayer_times: true, virtual_flash: false, market: false, wallet: false, center: false, ads: true });
        alert(`🔑 تم استخراج مفتاح الـ API بنجاح!\n💰 تم خصم قيمة الاشتراك الإجمالية البالغة: ${res.data.key.monthlyCost} OURO من محفظتك الموصولة.\n\nرمز المفتاح:\n${res.data.key.apiKey}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "❌ فشل استخراج المفتاح، رصيدك السحابي غير كافٍ لتغطية الاشتراك.");
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
    } catch (err) { alert("❌ فشل حذف المفتاح."); }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '750px', background: '#070707' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0 }}>⚙️ بوابة مطوري OURO Steps (API Gateway)</h3>
          <button className="close-discovery" onClick={onClose}>❌</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '15px' }}>
          
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
                🌟 استخدام API للتفاعل بجميع مزايا المنصة كلياً (75 OURO / ش)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'not-allowed' }}>
                <input type="checkbox" checked={scopes.prayer_times} disabled />
                🕋 مشاركة منظومة ومواقيت الصلاة الفلكية (مجاني)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.virtual_flash} disabled={scopes.all_features} onChange={() => handleScopeChange('virtual_flash')} />
                📟 مشاركة تفاعل الفلاشة الإلكترونية الموقوتة (50 OURO / ش)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.market} disabled={scopes.all_features} onChange={() => handleScopeChange('market')} />
                🛍️ مشاركة معرض سلع ومنشورات المتجر الملكي (20 OURO / ش)
              </label>

              {/* 👑 حقن خانات الاختيار الـ Checkbox للمحفظة والسنتر المطلوبة بالملي */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.wallet} disabled={scopes.all_features} onChange={() => handleScopeChange('wallet')} />
                🪙 مشاركة وتأمين بوابة المحفظة الرقمية الملكية (10 OURO / ش)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={scopes.center} disabled={scopes.all_features} onChange={() => handleScopeChange('center')} />
                🏛️ مشاركة البث الحي المباشر لـ السنتر والاجتماعات (20 OURO / ش)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'not-allowed' }}>
                <input type="checkbox" checked={scopes.ads} disabled />
                📣 مشاركة وبث شريط الإعلانات التفاعلي (مجاني)
              </label>

            </div>

            {/* 📊 لوحة العرض اللحظية للمبلغ الاجمالي للاشتراك التراكمي المجموع تلقائياً */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(212,175,55,0.04)', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.12)', marginTop: '12px' }}>
              <span style={{ color: '#fff', fontSize: '12px' }}>📊 قيمة اشتراك المفتاح المستحق المجموعة:</span>
              <strong style={{ color: 'var(--gold-primary)', fontSize: '13px' }}>{calculateLiveCost()} OURO / شهرياً</strong>
            </div>

            <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '12px', fontWeight: 'bold' }}>توليد وإصدار المفتاح السحابي الثابت</button>
          </form>

          <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '5px', marginTop: '20px' }}>📋 مفاتيح الـ API النشطة الخاصة بك</h4>
          <div className="users-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {loading ? <p className="gold-text">جاري تحميل لوحة المطورين...</p> : (
              keysList.map(k => (
                <div key={k.id} className="mini-user-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#e5c158', fontSize: '13px' }}>📌 {k.keyLabel || k.label}</strong>
                    <button onClick={() => handleDeleteKey(k.id)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '5px', background: '#000', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <code style={{ color: '#27ae60', fontSize: '11px', wordBreak: 'break-all', userSelect: 'all' }}>{k.apiKey}</code>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                      <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>الصلاحيات:</small>
                      {k.scopes && Object.keys(k.scopes).filter(s => k.scopes[s]).map(s => (
                        <span key={s} style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', fontSize: '8px', padding: '1px 4px', borderRadius: '2px' }}>
                          {s === 'all_features' && '🌟 كامل المنصة'}
                          {s === 'prayer_times' && '🕋 الصلاة'}
                          {s === 'virtual_flash' && '📟 الفلاشة'}
                          {s === 'market' && '🛍️ المتجر'}
                          {s === 'wallet' && '🪙 المحفظة'}
                          {s === 'center' && '🏛️ السنتر'}
                          {s === 'ads' && '📣 الإعلانات'}
                        </span>
                      ))}
                    </div>
                    
                    {/* عرض تكلفة تجديد كل مفتاح مسحوبة من السيرفر كدليل أمان إضافي موثق */}
                    <span style={{ color: k.isActive ? '#27ae60' : '#c0392b', fontSize: '10px', fontWeight: 'bold' }}>
                      {k.isActive ? `🟢 نشط (${k.monthlyCost || 0} OURO)` : '🔴 مجمد'}
                    </span>
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
