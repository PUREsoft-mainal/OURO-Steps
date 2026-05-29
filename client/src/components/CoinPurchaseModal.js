/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoinPurchaseModal = ({ user, API_BASE, onClose, setOuroBalance }) => {
  const [transferData, setTransferData] = useState({ targetId: "", amount: "" });
  const [myOuroBalance, setMyOuroBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // حقول الأدمن لإضافة عقد ذكي خارجي جديد
  const [newContract, setNewContract] = useState({ name: "", address: "", symbol: "" });
  const [smartContracts, setSmartContracts] = useState([]);

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  // 1️⃣ جلب بيانات الرصيد الحالي والعقود الذكية المعتمدة من السحاب فوراً
  useEffect(() => {
    if (user?.username) {
      axios.post(`${API_BASE}/api/wallet/get-info`, { username: user.username })
        .then(res => {
          if (res.data.success) {
            setMyOuroBalance(res.data.ouroBalance);
            setSmartContracts(res.data.contracts || []);
            if (typeof setOuroBalance === 'function') setOuroBalance(res.data.ouroBalance);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.username, API_BASE, setOuroBalance]);

  // 2️⃣ دالة تشغيل التداول والتحويل الداخلي المباشر عبر الـ ID وبضريبة الـ 7%
  const handleInternalTransfer = async (e) => {
    e.preventDefault();
    const amt = parseInt(transferData.amount);
    if (!transferData.targetId.trim() || isNaN(amt) || amt <= 0) return alert("⚠️ الرجاء إدخال ID المستقبل وتحديد كمية صالحة!");

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/wallet/transfer`, {
        sender: user?.username,
        receiver: transferData.targetId.trim(), // الاستقبال المباشر بالـ ID الفريد للمستقبل
        amount: amt
      });

      if (res.data.success) {
        setTransferData({ targetId: "", amount: "" });
        setMyOuroBalance(res.data.newSenderBalance);
        if (typeof setOuroBalance === 'function') setOuroBalance(res.data.newSenderBalance);
        alert(`💸⚡ [تحويل ناجح بالـ ID]\n\n💰 الكمية المحولة: ${amt} OURO\n⚖️ الضريبة (7%): ${(amt * 0.07).toFixed(2)} OURO دُفعت للأدمن`);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "❌ فشل التحويل، تحقق من رصيدك أو الـ ID.");
    } finally {
      setLoading(false);
    }
  };

  // 📜 3️⃣ [صلاحية الأدمن فقط] دالة حقن وزرع عقد ذكي جديد بالصفحة المنبثقة للزر (+)
  const handleAddContract = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/wallet/admin/add-contract`, {
        username: user?.username,
        contractName: newContract.name,
        contractAddress: newContract.address,
        symbol: newContract.symbol
      });
      if (res.data.success) {
        setSmartContracts(prev => [...prev, res.data.contract]);
        setNewContract({ name: "", address: "", symbol: "" });
        alert(`📜 تم زرع العقد الذكي للعملة (${res.data.contract.symbol}) سحابياً بنجاح!`);
      }
    } catch (err) { alert("❌ فشل زرع العقد السحابي."); }
  };

/* eslint-disable react/jsx-no-comment-textnodes */
return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '580px', background: '#070707', padding: '20px' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* 👤 جـ) إظهار رصيد محفظة OURO والـ ID الفريد بجانب اسم المستخدم مباشرة بسقف الصفحة المنبثقة */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>👤 الحساب: <strong style={{ color: 'var(--gold-primary)' }}>{user?.username}</strong></span>
            <small style={{ color: '#27ae60', fontSize: '10px', fontFamily: 'monospace' }}>🆔 معرف الحساب الفريد: {user?._id || user?.id || "Ouro_User_ID"}</small>
            
            {/* 👑 [تعديل الحسم للملف المالي المستقل للقراءة فقط] عرض عدد العملات المستدعى سحابياً بنقاء كامل */}
            <span style={{ color: '#fff', fontSize: '12px' }}>
              🪙 رصيدك بالملف السحابي: <strong style={{ color: 'var(--gold-primary)', textShadow: '0 0 6px rgba(212,175,55,0.3)' }}>{user?.username === 'Admin_Mostafa' ? '21,000,000' : myOuroBalance} OURO</strong>
            </span>
          </div>
          <button className="close-discovery" onClick={onClose}>✖</button>
        </div>

        <div className="discovery-body scrollbar-gold">
          
          {/* فورم التداول السريع الموجه بالـ ID */}
          <form className="market-upload-form gold-border" onSubmit={handleInternalTransfer} style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '12px' }}>⚡ إرسال حوالة داخلية فورية بالـ ID الفريد للمستقبل</h4>
            
            <input 
              type="text" 
              placeholder="👤 أدخل الـ ID الخاص بالحساب المستلم بدقة..." 
              value={transferData.targetId}
              onChange={e => setTransferData({ ...transferData, targetId: e.target.value })}
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px' }}
            />

            <input 
              type="number" 
              placeholder="💰 عدد عملات OURO المراد إرسالها..." 
              value={transferData.amount}
              onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px' }}
            />

            <button type="submit" className="gold-btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? "جاري المعالجة الحية..." : "🚀 إطلاق وتحويل العملات بالـ ID فوراً"}
            </button>
          </form>

          {/* 📜 د) [مربع إدخال وصيانة العقود الذكية الخارجية] يظهر فى صفحة الأدمن فقط داخل الصفحة المنبثقة للزر (+) */}
          {isAdmin && (
            <form className="market-upload-form gold-border" onSubmit={handleAddContract} style={{ background: 'rgba(212,175,55,0.02)', padding: '15px', borderRadius: '8px', marginTop: '20px', borderColor: '#27ae60' }}>
              <h4 style={{ color: '#27ae60', margin: '0 0 12px 0', fontSize: '12px' }}>🛠️ لوحة الأدمن الملكية: ربط وحقن عقد ذكي خارجي للشبكة (Smart Contract)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                <input type="text" placeholder="اسم العملة (Tether)..." value={newContract.name} onChange={e => setNewContract({...newContract, name: e.target.value})} required style={{padding:'6px'}} />
                <input type="text" placeholder="العقد الذكي (0x...)..." value={newContract.address} onChange={e => setNewContract({...newContract, address: e.target.value})} required style={{padding:'6px'}} />
                <input type="text" placeholder="الرمز (USDT)..." value={newContract.symbol} onChange={e => setNewContract({...newContract, symbol: e.target.value})} required style={{padding:'6px'}} />
              </div>
              <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '10px', background: '#27ae60', padding:'6px' }}>حقن وبناء العقد الذكي فالسحاب</button>
            </form>
          )}

          {/* استعراض قائمة العقود الخارجية المحقونة تحت لوحة المطورين */}
          {smartContracts.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <small style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '5px' }}>📋 العقود الخارجية المتصلة بالمنصة:</small>
              {smartContracts.map(c => (
                <div key={c.id || c.address} style={{ display: 'flex', justifyContent: 'space-between', background: '#000', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px', fontSize: '11px' }}>
                  <span style={{ color: '#fff' }}>💎 {c.contractName || c.label} ({c.symbol})</span>
                  <code style={{ color: 'var(--text-muted)' }}>{c.contractAddress || c.apiKey}</code>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CoinPurchaseModal;
