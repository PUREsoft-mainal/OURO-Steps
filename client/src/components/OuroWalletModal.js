import React, { useState } from 'react';

const OuroWalletModal = ({ user, currentBalance, socket, onClose }) => {
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!targetId.trim() || !amount || parseFloat(amount) <= 0) {
      return alert("⚠️ يرجى إدخال معرف المستقبل الصارم وقيمة تحويل صالحة!");
    }
    
    if (parseFloat(amount) * 1.05 > currentBalance) {
      return alert("🛑 عذراً، رصيدك الحالي غير كافٍ لتغطية قيمة الحزم وضريبة البلوكتشين 5%!");
    }

    if (socket && user) {
      socket.emit('transfer_ouro_coins', {
        senderId: user._id || user.user_id,
        senderName: user.username,
        targetUserId: targetId.trim(),
        amount: amount
      });
      setTargetId("");
      setAmount("");
    }
  };

  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '450px', background: '#070707', padding: '20px', borderRadius: '12px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '14px' }}>🪙 محفظة التداول الرقمية لبلوكتشين OURO Steps</h3>
          <button className="close-discovery" onClick={onClose}>✖</button>
        </div>

        <div style={{ textAlign: 'center', background: '#000', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginBottom: '15px' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>المعرف الفريد الخاص بمحفظتك (ID):</small>
          <strong style={{ color: 'var(--gold-primary)', fontSize: '13px', fontFamily: 'monospace', letterSpacing: '1px' }}>{user?._id || user?.user_id}</strong>
          
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#fff' }}>رصيدك المعتمد بالسحاب:</span>
            <h2 style={{ color: '#27ae60', margin: '4px 0 0 0', fontSize: '24px' }}>{currentBalance.toFixed(2)} <span style={{fontSize:'12px'}}>OURO</span></h2>
          </div>
        </div>

        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--gold-primary)' }}>👤 معرف المستقبل (Target User ID):</label>
            <input 
              type="text" 
              placeholder="الصق هنا ال-ID الصارم للحساب المراد التحويل له..."
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '12px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--gold-primary)' }}>🪙 عدد العملات المراد شحنها:</label>
            <input 
              type="number" 
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '12px' }}
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'right' }}>⚠️ سيتم استقطاع ضريبة معالجة موازية 5% لصالح محفظة الإدارة تلقائياً.</small>
          </div>

          <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '5px', padding: '10px', fontSize: '12px' }}>
            🚀 تأكيد إطلاق وحوالة العملات حياً
          </button>
        </form>

      </div>
    </div>
  );
};

export default OuroWalletModal;
