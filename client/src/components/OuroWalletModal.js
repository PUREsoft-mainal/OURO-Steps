/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OuroWalletModal = ({ user, API_BASE, onClose, ouroBalance, setOuroBalance }) => {
  const [walletData, setWalletData] = useState({ ouroBalance: 0, publicAddress: "غير متصل", ethBalance: 0 });
  const [metaMaskAddress, setMetaMaskAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [smartContracts, setSmartContracts] = useState([]);
  
  const [transferData, setTransferData] = useState({ receiver: "", amount: "" });

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  // 1️⃣ استدعاء وقراءة بيانات الملف المالي المستقل والعقد الذكي لـ OURO Coin من السحاب فوراً
  useEffect(() => {
    if (user?.username) {
      axios.post(`${API_BASE}/api/wallet/get-info`, { username: user.username })
        .then(res => {
          if (res.data.success) {
            setWalletData(prev => ({ ...prev, ouroBalance: res.data.ouroBalance }));
            setSmartContracts(res.data.contracts || []);
            if (typeof setOuroBalance === 'function') setOuroBalance(res.data.ouroBalance);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.username, API_BASE, setOuroBalance]);

  // 🦊 2️⃣ الربط والالتحام بمحفظة MetaMask العالمية
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setMetaMaskAddress(address);

        const hexBalance = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
        const ethValue = parseInt(hexBalance, 16) / Math.pow(10, 18);

        setWalletData(prev => ({ ...prev, publicAddress: address, ethBalance: ethValue.toFixed(4) }));
        
        await axios.post(`${API_BASE}/api/wallet/link-metamask`, { username: user?.username, ethAddress: address });
        setLoading(false);
        alert("🦊 🎉 تم ربط محفظة MetaMask وتأمين قنوات الاستقبال بنجاح!");
      } catch (err) {
        setLoading(false);
        alert("❌ تم رفض الاتصال بمحفظة MetaMask.");
      }
    } else {
      alert("🦊 عذراً، لم يتم العثور على إضافة MetaMask بمتصفحك! الرجاء تثبيتها أولاً.");
    }
  };

  // ⚡ 3️⃣ دالة تشغيل التداول المالي من داخل لوحة المحفظة ومطابقة حقل الـ receiver بنقاء 100%
  const handleTransferOuro = async (e) => {
    e.preventDefault();
    const amt = parseInt(transferData.amount);
    if (!transferData.receiver.trim() || isNaN(amt) || amt <= 0) return alert("⚠️ الرجاء كتابة الـ ID وتحديد كمية صالحة!");

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/wallet/transfer`, {
        sender: user?.username,
        receiver: transferData.receiver.trim(), // مطابقة صارمة 
        amount: amt
      });

      if (res.data.success) {
        setTransferData({ receiver: "", amount: "" });
        if (typeof setOuroBalance === 'function') setOuroBalance(res.data.newSenderBalance);
        setWalletData(prev => ({ ...prev, ouroBalance: res.data.newSenderBalance }));
        alert(`💸 تم تحويل العملات بنجاح بالـ ID!\n\n💰 الكمية المرسلة: ${amt} OURO\n⚖️ ضريبة التحويل (7%): ${(amt * 0.07).toFixed(2)} OURO دُفعت للأدمن`);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "❌ فشل التحويل، تحقق من رصيدك أو الـ ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '800px', background: '#070707' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0 }}>👑 محفظة OURO الملكية المشفرة (Web3 Ecosystem)</h3>
          <button className="close-discovery" onClick={onClose}>❌ إغلاق</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div className="facebook-post-card gold-border" style={{ padding: '15px', background: 'linear-gradient(135deg, #111 0%, #000 100%)', textAlign: 'center' }}>
              <span style={{ fontSize: '30px' }}>🪙</span>
              <h5 style={{ color: 'var(--text-muted)', margin: '5px 0' }}>رصيدك بالملف السحابي الموثق</h5>
              <h2 style={{ color: 'var(--gold-primary)', margin: 0 }}>{user?.username === 'Admin_Mostafa' ? '21,000,000' : walletData.ouroBalance} <small style={{ fontSize: '12px' }}>OURO</small></h2>
              <small style={{ color: '#27ae60', fontSize: '10px' }}>🔒 ملف مقفل للقراءة فقط - محصن سيبرانياً</small>
            </div>

            <div className="facebook-post-card gold-border" style={{ padding: '15px', background: 'linear-gradient(135deg, #111 0%, #000 100%)', textAlign: 'center' }}>
              <img src="https://githubusercontent.com" alt="metamask" style={{ height: '35px', objectFit: 'contain' }} />
              <h5 style={{ color: 'var(--text-muted)', margin: '5px 0' }}>رصيد الحساب الخارجي المربوط</h5>
              <h2 style={{ color: '#e67e22', margin: 0 }}>{walletData.ethBalance} <small style={{ fontSize: '12px', color: '#fff' }}>ETH</small></h2>
              <button onClick={connectMetaMask} className="gold-btn-small" style={{ background: '#e67e22', color: '#fff', border: 'none', marginTop: '10px', fontSize: '11px', width: '100%' }}>
                {metaMaskAddress ? "🦊 تم الربط سيبرانياً" : "🦊 ربط بمحفظة MetaMask"}
              </button>
            </div>
          </div>

          {/* فورم التحويل المطور بالـ ID والمطابق للسيرفر بالملي */}
          <form className="market-upload-form gold-border" onSubmit={handleTransferOuro} style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
            <h4 style={{ color: 'var(--gold-primary)', margin: '0 0 12px 0' }}>💸 تحويل عملات OURO لأي محفظة بالـ ID الفريد</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="👤 اكتب الـ ID أو اسم الحساب المستلم..." 
                value={transferData.receiver} 
                onChange={e => setTransferData({ ...transferData, receiver: e.target.value })} 
                required 
                style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)' }}
              />
              <input 
                type="number" 
                placeholder="💰 عدد العملات..." 
                value={transferData.amount} 
                onChange={e => setTransferData({ ...transferData, amount: e.target.value })} 
                required 
                style={{ width: '150px', padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)' }}
              />
              <button type="submit" className="gold-btn-small" style={{ background: 'var(--gold-primary)', color: '#000', border: 'none', fontWeight: 'bold' }}>إرسال ⚡</button>
            </div>
          </form>

          <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '5px' }}>📜 عقود العملات والشبكات المتصلة بالعقد الذكي الرئيسي</h4>
          <div className="users-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {smartContracts.map(c => (
              <div key={c.id || c.address} className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '12px' }}>💎 {c.contractName} ({c.symbol})</strong>
                  <code style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', wordBreak: 'break-all' }}>عقد: {c.contractAddress}</code>
                </div>
                <span style={{ background: 'rgba(39,174,96,0.1)', color: '#27ae60', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(39,174,96,0.2)' }}>متصل بالعقد الرئيسي ✔️</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OuroWalletModal;
