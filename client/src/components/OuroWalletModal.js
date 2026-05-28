import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OuroWalletModal = ({ user, API_BASE, onClose }) => {
  const [walletData, setWalletData] = useState({ ouroBalance: 0, publicAddress: "غير متصل", ethBalance: 0 });
  const [metaMaskAddress, setMetaMaskAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [smartContracts, setSmartContracts] = useState([]);
  
  // حقول الأدمن لإضافة عقد ذكي خارجي جديد للشبكة
  const [newContract, setNewContract] = useState({ name: "", address: "", symbol: "" });

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  // 1️⃣ جلب بيانات محفظة OURO السحابية والعقود الذكية المعتمدة من الـ MongoDB Atlas
  useEffect(() => {
    if (user?.username) {
      axios.post(`${API_BASE}/api/wallet/get-info`, { username: user.username })
        .then(res => {
          setWalletData(prev => ({ ...prev, ouroBalance: res.data.ouroBalance || 0 }));
          setSmartContracts(res.data.contracts || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.username, API_BASE]);

  // 🦊 2️⃣ دالة الربط والالتحام الفوري بمحفظة MetaMask العالمية واستقبال عنوانها
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        // طلب فتح الميتا ماسك والتقاط الحسابات النشطة سيبرانياً
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setMetaMaskAddress(address);

        // جلب رصيد الـ ETH الحالي للمعاينة البصرية
        const hexBalance = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
        const ethValue = parseInt(hexBalance, 16) / Math.pow(10, 18);

        setWalletData(prev => ({ ...prev, publicAddress: address, ethBalance: ethValue.toFixed(4) }));
        
        // حفظ وربط عنوان الميتا ماسك بحساب المستخدم سحابياً في الأطلس
        await axios.post(`${API_BASE}/api/wallet/link-metamask`, { username: user?.username, ethAddress: address });
        setLoading(false);
        alert("🦊 🎉 تم ربط محفظة MetaMask وتأمين قنوات الاستقبال الخارجية بنجاح!");
      } catch (err) {
        setLoading(false);
        alert("❌ تم رفض الاتصال بمحفظة MetaMask.");
      }
    } else {
      alert("🦊 عذراً، لم يتم العثور على إضافة MetaMask بمتصفحك! الرجاء تثبيتها أولاً.");
    }
  };

  // 📜 3️⃣ [صلاحية الأدمن الملكية] دالة زرع وإضافة عقد ذكي (Smart Contract) جديد للمنصة
  const handleAddContract = async (e) => {
    e.preventDefault();
    if (!newContract.name || !newContract.address || !newContract.symbol) return alert("⚠️ الرجاء ملء كافة حقول العقد الذكي!");

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
        alert(`📜 تم زرع العقد الذكي للعملة (${res.data.contract.symbol}) في الشبكة السحابية بنجاح!`);
      }
    } catch (err) {
      alert("❌ فشل زرع العقد، غير مصرح لك أو هناك مشكلة بالسحاب.");
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
          
          {/* لوحة عرض الأرصدة والعملة الرقمية للمنصة */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            
            <div className="facebook-post-card gold-border" style={{ padding: '15px', background: 'linear-gradient(135deg, #111 0%, #000 100%)', textAlign: 'center' }}>
              <span style={{ fontSize: '30px' }}>🪙</span>
              <h5 style={{ color: 'var(--text-muted)', margin: '5px 0' }}>رصيد عملة المنصة النشط</h5>
              <h2 style={{ color: 'var(--gold-primary)', margin: 0 }}>{walletData.ouroBalance} <small style={{ fontSize: '12px' }}>OURO</small></h2>
              <small style={{ color: '#27ae60', fontSize: '10px' }}>🔒 تشفير هجين (BTC/ETH/LTC/XMR Core)</small>
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

          {/* عرض العنوان العام للمحفظة المربوطة للنسخ */}
          <div style={{ background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '25px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>🔗 العنوان العام المعتمد للاستقبال الخارجي:</span>
            <code style={{ display: 'block', color: '#27ae60', fontSize: '11px', wordBreak: 'break-all', marginTop: '5px', userSelect: 'all' }}>{walletData.publicAddress}</code>
          </div>

          {/* 📜 [قسم الأدمن الملكي] لإضافة وعقد ذكي جديد للشبكة السحابية */}
          {isAdmin && (
            <form className="market-upload-form gold-border" onSubmit={handleAddContract} style={{ background: 'rgba(212,175,55,0.02)', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h4 style={{ color: 'var(--gold-primary)', margin: '0 0 12px 0' }}>🛠️ لوحة الأدمن: زرع عقد ذكي خارجي جديد بالمنصة (Smart Contract)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <input type="text" placeholder="اسم العملة (مثال: Tether)..." value={newContract.name} onChange={e => setNewContract({...newContract, name: e.target.value})} required />
                <input type="text" placeholder="العقد الذكي (0x...)..." value={newContract.address} onChange={e => setNewContract({...newContract, address: e.target.value})} required />
                <input type="text" placeholder="الرمز (USDT)..." value={newContract.symbol} onChange={e => setNewContract({...newContract, symbol: e.target.value})} required />
              </div>
              <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '12px', background: '#27ae60' }}>حقن وبناء العقد الذكي فالسحاب</button>
            </form>
          )}

          {/* لوحة عرض العملات الخارجية والعقود الذكية المضافة */}
          <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '5px' }}>📜 عقود العملات والشبكات المتاحة للاستقبال والتحويل</h4>
          <div className="users-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {smartContracts.map(c => (
              <div key={c.id || c.address} className="mini-user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '12px' }}>💎 {c.contractName} ({c.symbol})</strong>
                  <code style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', wordBreak: 'break-all' }}>عقد: {c.contractAddress}</code>
                </div>
                <span style={{ background: 'rgba(39,174,96,0.1)', color: '#27ae60', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(39,174,96,0.2)' }}>نشط ومتصل ✔️</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OuroWalletModal;
