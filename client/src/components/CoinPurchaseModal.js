/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoinPurchaseModal = ({ user, API_BASE, onClose, setOuroBalance }) => {
  const [transferData, setTransferData] = useState({ targetAddress: "", amount: "" });
  const [myWalletInfo, setMyWalletInfo] = useState({ balance: 0, address: "جاري توليد عنوان محفظتك الفريد..." });
  const [loading, setLoading] = useState(true);

  // 1️⃣ استدعاء وقراءة ملف محفظتك الفريدة وعنوان البلوكشين المخصص لك من السحاب فوراً
  useEffect(() => {
    if (user?.username) {
      axios.post(`${API_BASE}/api/wallet/get-info`, { username: user.username })
        .then(res => {
          if (res.data.success) {
            setMyWalletInfo({
              balance: res.data.ouroBalance,
              address: res.data.publicAddress
            });
            if (typeof setOuroBalance === 'function') setOuroBalance(res.data.ouroBalance);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.username, API_BASE, setOuroBalance]);

  // 2️⃣ دالة تشغيل التداول المالي الداخلي المشفر بضريبة الـ 7% القياسية
  const handleInternalTransfer = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transferData.amount);
    
    if (!transferData.targetAddress.trim() || isNaN(amt) || amt <= 0) {
      return alert("⚠️ الرجاء إدخال عنوان محفظة المستقبل بدقة، وتحديد كمية صالحة للتحويل!");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/wallet/transfer`, {
        sender: user?.username,
        receiver: transferData.targetAddress.trim(), // السيرفر يدعم الاستقبال بالاسم أو العنوان السحابي الموحد
        amount: amt
      });

      if (res.data.success) {
        setTransferData({ targetAddress: "", amount: "" });
        setMyWalletInfo(prev => ({ ...prev, balance: res.data.newSenderBalance }));
        if (typeof setOuroBalance === 'function') setOuroBalance(res.data.newSenderBalance);
        alert(`💸⚡ [معاملة مالية مشفرة ناجحة]\n\nتم إرسال العملات فوراً عبر الشبكة!\n💰 الكمية المحولة: ${amt} OURO\n⚖️ ضريبة التحويل (7%): ${(amt * 0.07).toFixed(2)} OURO دُفعت للأدمن`);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "❌ فشل إتمام التداول، رصيدك الحالي غير كافٍ أو العنوان خاطئ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '580px', background: '#070707', padding: '20px', borderRadius: '12px' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '15px' }}>🪙 شبكة تداول ومحافظ OURO Coin الداخلية</h3>
          <button className="close-discovery" onClick={onClose} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '22px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ padding: '0 5px' }}>
          
          {/* 🪙 أ) مربع رصيد محفظة OURO الملكية اللامع المتموضع في سقف الصفحة العائمة */}
          <div className="facebook-post-card gold-border" style={{ padding: '15px', background: 'linear-gradient(135deg, #151515 0%, #000000 100%)', textAlign: 'center', marginBottom: '15px', borderRadius: '8px' }}>
            <h5 style={{ color: 'var(--text-muted)', margin: '0 0 5px 0', fontSize: '11px', letterSpacing: '1px' }}>رصيد محفظتك الرقمية الحالي</h5>
            <h1 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '28px', fontWeight: 'bold', textShadow: '0 0 10px rgba(212,175,55,0.4)' }}>
              {user?.username === 'Admin_Mostafa' ? '21,000,000' : myWalletInfo.balance} <small style={{ fontSize: '12px', color: '#fff' }}>OURO</small>
            </h1>
            <small style={{ color: '#27ae60', fontSize: '9px', display: 'block', marginTop: '4px' }}>🔒 ملف مالي محمي أزلياً - غير قابل للتزوير سيبرانياً</small>
          </div>

          {/* 🔗 ب) مربع عرض عنوان المحفظة الفريد والمشفر للمستخدم الحالي (قراءة فقط) أسفل الرصيد مباشرة */}
          <div style={{ background: '#000000', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.15)', marginBottom: '20px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>🔑 عنوان محفظتك الرقمية الفريد داخل البلوكشين (قراءة فقط):</span>
            <code style={{ display: 'block', color: '#27ae60', fontSize: '11px', wordBreak: 'break-all', marginTop: '6px', userSelect: 'all', fontWeight: '500', fontFamily: 'monospace' }}>
              {myWalletInfo.address}
            </code>
          </div>

          {/* فورم التحويل والتداول المباشر بين العناوين والمحافظ */}
          <form className="market-upload-form gold-border" onSubmit={handleInternalTransfer} style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>💸 إطلاق وإرسال حوالة مالية داخلية فورية</h4>
            
            <label style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold' }}>👤 عنوان محفظة الطرف المستقبل (أو اسم حسابه الموحد):</label>
            <input 
              type="text" 
              placeholder="أدخل عنوان محفظة المستقبل بدقة (0xOuro...)..." 
              value={transferData.targetAddress}
              onChange={e => setTransferData({ ...transferData, targetAddress: e.target.value })}
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
            />

            <label style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold' }}>💰 كمية عملات OURO المراد تحويلها قسرياً:</label>
            <input 
              type="number" 
              step="any"
              placeholder="حدد عدد العملات المراد إرسالها..." 
              value={transferData.amount}
              onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
            />

            <button type="submit" className="gold-btn" style={{ width: '100%', fontWeight: 'bold', fontSize: '13px', paddingTop: '10px', paddingBottom: '10px' }} disabled={loading}>
              {loading ? "جاري فحص وتوقيع المعاملة بالهاش المشفر..." : "🚀 بث وتحويل العملات عبر السحاب فورا"}
            </button>
          </form>

          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '9px', color: 'var(--text-muted)' }}>
            ⚙️ نظام حرق الشبكة الانكماشي: يتم استقطاع ضريبة ثابتة بقيمة 7% تُوجه آلياً لخزينة الأدمن Mostafa [▲].
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoinPurchaseModal;
