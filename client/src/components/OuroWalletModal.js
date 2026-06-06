/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState } from 'react';

const OuroWalletModal = ({ user, currentBalance, transactionHistory, socket, onClose }) => {
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!targetId.trim() || !amount || parseFloat(amount) <= 0) {
      return alert("⚠️ يرجى إدخل معرف المستقبل الصارم وقيمة تحويل صالحة!");
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
      <div className="discovery-window gold-border" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '480px', background: '#070707', padding: '20px', borderRadius: '12px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '14px' }}>🪙 محفظة التداول الرقمية لبلوكتشين OURO Steps</h3>
          <button className="close-discovery" onClick={onClose}>✖</button>
        </div>

        <div style={{ textAlign: 'center', background: '#000', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginBottom: '15px' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>المعرف الفريد الخاص بمحفظتك (ID):</small>
          <strong style={{ color: 'var(--gold-primary)', fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.5px', wordBreak: 'break-all' }}>{user?._id || user?.user_id}</strong>
          
          <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#fff' }}>رصيدك المعتمد بالسحاب:</span>
            <h2 style={{ color: '#27ae60', margin: '2px 0 0 0', fontSize: '22px' }}>{currentBalance.toFixed(2)} <span style={{fontSize:'12px'}}>OURO</span></h2>
          </div>
        </div>

        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <input 
              type="text" 
              placeholder="👤 الصق هنا ال-ID الصارم للحساب المراد التحويل له..."
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="number" 
              step="0.01"
              min="0.01"
              placeholder="🪙 عدد العملات..."
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }}
              required
            />
            <button type="submit" className="gold-btn-small" style={{ padding: '8px 16px', background: 'var(--gold-primary)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
              🚀 تحويل
            </button>
          </div>
          <small style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'right', margin: 0 }}>⚠️ سيتم استقطاع ضريبة معالجة موازية 5% لصالح محفظة الإدارة تلقائياً.</small>
        </form>

        {/* 📜 👑 [شريان عرض قائمة المعاملات المحدثة بأسفل المحفظة] */}
        <h4 style={{ color: '#fff', fontSize: '12px', margin: '15px 0 8px 0', textAlign: 'right' }}>📋 سجل المعاملات والحوالات الأخيرة:</h4>
        <div className="scrollbar-gold" style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(transactionHistory || []).map((tx) => (
            <div key={tx.txId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#fff', display: 'block' }}>
                  {tx.type === 'in' && `📥 من: ${tx.counterparty}`}
                  {tx.type === 'out' && `📤 إلى: ${tx.counterparty}`}
                  {tx.type === 'tax' && `💰 ضريبة من: ${tx.counterparty}`}
                </span>
                <small style={{ color: 'var(--text-muted)', fontSize: '8px' }}>{tx.time}</small>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: tx.type === 'in' || tx.type === 'tax' ? '#27ae60' : '#c0392b' }}>
                  {tx.type === 'in' || tx.type === 'tax' ? '+' : '-'}{tx.amount.toFixed(2)}
                </span>
                {tx.type === 'out' && (
                  <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', display: 'block' }}>رسوم: {tx.tax.toFixed(2)}</small>
                )}
              </div>
            </div>
          ))}
          {(!transactionHistory || transactionHistory.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'center', margin: '10px 0' }}>سجل الحوالات شاغر حالياً... لا توجد معاملات مودعة.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default OuroWalletModal;
