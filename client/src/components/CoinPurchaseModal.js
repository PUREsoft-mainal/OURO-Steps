/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState } from 'react';
import axios from 'axios';

const CoinPurchaseModal = ({ user, API_BASE, onClose, setOuroBalance }) => {
  const [transferData, setTransferData] = useState({ targetAddress: "", amount: "" });
  const [loading, setLoading] = useState(false);

  // دالة تشغيل التداول الداخلي الفوري بالمنصة بضريبة الـ 7% القياسية
  const handleInternalTransfer = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transferData.amount);
    
    if (!transferData.targetAddress.trim() || isNaN(amt) || amt <= 0) {
      return alert("⚠️ الرجاء إدخال عنوان محفظة المستقبل أو اسمه، وتحديد كمية صالحة للتحويل!");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/wallet/transfer`, {
        sender: user?.username,
        receiver: transferData.targetAddress.trim(), // يدعم الاسم أو عنوان المحفظة السحابية الموحد
        amount: amt
      });

      if (res.data.success) {
        setTransferData({ targetAddress: "", amount: "" });
        if (typeof setOuroBalance === 'function') setOuroBalance(res.data.newSenderBalance);
        alert(`💸⚡ [تداول داخلي ناجح]\n\nتم إرسال العملات فوراً للطرف المستقبل!\n💰 الكمية المرسلة: ${amt} OURO\n⚖️ ضريبة التحويل (7%): ${(amt * 0.07).toFixed(2)} OURO دُفعت للأدمن`);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "❌ فشل إتمام التداول، تحقق من كفاية رصيدك.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '550px', background: '#0a0a0a' }}>
        
        <div className="discovery-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0 }}>🪙 بوابة التداول والتحويل الداخلي لـ OURO Core</h3>
          <button className="close-discovery" onClick={onClose}>❌</button>
        </div>

        <div className="discovery-body scrollbar-gold" style={{ padding: '10px' }}>
          
          <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '12px', color: '#fff', lineHeight: '1.6', textAlign: 'right' }}>
            👑 مرحباً بك في شبكة تداول **OURO Coin** الداخلية؛ يمكنك هنا تحويل وإرسال العملات الرقمية لأي محفظة داخل المنصة فوراً عن طريق إدخال عنوان الحساب أو اسم المستخدم المستهدف مباشرة [▲].
          </div>

          <form className="market-upload-form gold-border" onSubmit={handleInternalTransfer}>
            <label style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '6px', fontSize: '12px' }}>🔗 عنوان المحفظة أو اسم المستخدم المستهدف:</label>
            <input 
              type="text" 
              placeholder="اكتب اسم الحساب أو عنوان المحفظة السحابية للمستقبل..." 
              value={transferData.targetAddress}
              onChange={e => setTransferData({ ...transferData, targetAddress: e.target.value })}
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px' }}
            />

            <label style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '6px', fontSize: '12px' }}>💰 كمية عملات OURO المراد تحويلها:</label>
            <input 
              type="number" 
              step="any"
              placeholder="حدد عدد العملات بدقة..." 
              value={transferData.amount}
              onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px' }}
            />

            <button type="submit" className="gold-btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? "جاري تشفير المعاملة سحابياً..." : "🚀 إطلاق وتحويل العملات فورا"}
            </button>
          </form>

          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
            ⚠️ تطبق ضريبة تدوير الشبكة (7%) وتُستقطع قسرياً لصالح خزينة الأدمن Mostafa لتأمين الأرصدة [▲].
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoinPurchaseModal;
