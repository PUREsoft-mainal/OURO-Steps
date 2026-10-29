/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

const OuroLoanCalculator = ({ user, onClose }) => {
  const [loanAmount, setLoanAmount] = useState(""); // قيمة القرض المطلوب
  const [interestRate, setInterestRate] = useState(""); // نسبة الفائدة السنوية %
  const [loanDuration, setLoanDuration] = useState(""); // مدة القرض بالشهور
  const [startDate, setStartDate] = useState(""); // تاريخ الاستلام (اختياري)
  const [clientName, setClientName] = useState(""); // 👈 👑 [تم الحقن] خانة إدخال اسم العميل الصارم
  
  const [activeLoans, setActiveLoans] = useState([]); // مصفوفة القروض المسجلة في هارد الجهاز

  // ⏳ جلب القروض المحفوظة محلياً فور إقلاع الواجهة لكسر جدار الوميض
  useEffect(() => {
    const savedLoans = localStorage.getItem(`ouro_loans_${user?.username || 'global'}`);
    if (savedLoans) setActiveLoans(JSON.parse(savedLoans));
  }, [user?.username]);

  // دالة الحفظ المركزي في الذاكرة المادية للجهاز
  const saveLoansToStorage = (loans) => {
    setActiveLoans(loans);
    localStorage.setItem(`ouro_loans_${user?.username || 'global'}`, JSON.stringify(loans));
  };

  // المحرك الرياضي وحساب الجدولة الزمنية للأقساط بشهر بشهر
  const handleCalculateLoan = (e) => {
    e.preventDefault();
    if (!clientName.trim()) return alert("⚠️ يرجى إدخال اسم العميل أولاً لتوثيق سجل القرض!"); // جدار تحقق لاسم العميل
    
    const principal = parseFloat(loanAmount);
    const yearlyRate = parseFloat(interestRate) / 100;
    const months = parseInt(loanDuration);

    if (isNaN(principal) || isNaN(yearlyRate) || isNaN(months) || months <= 0) {
      return alert("⚠️ الرجاء إدخال بيانات صالحة للعملية الحسابية!");
    }

    // 🧠 حساب الفائدة الإجمالية والقسط الشهري (معادلة الفائدة الثابتة المعتمدة للمصانع والشركات)
    const totalInterest = principal * yearlyRate * (months / 12);
    const totalRepayment = principal + totalInterest;
    const monthlyInstallment = totalRepayment / months;

    // تحديد تاريخ البداية (تاريخ اليوم كخط دفاع احتياطي لو حقل التاريخ فارغ)
    const baseDate = startDate ? new Date(startDate) : new Date();

    // صياغة قائمة تاريخ سداد كل قسط تفصيلياً (شهر بشهر)
    const schedule = [];
    for (let i = 1; i <= months; i++) {
      const nextPaymentDate = new Date(baseDate.getTime());
      nextPaymentDate.setMonth(baseDate.getMonth() + i);
      
      schedule.push({
        installmentNo: i,
        dueDate: nextPaymentDate.toLocaleDateString('en-CA'), // صيغة YYYY-MM-DD القياسية للمطابقة
        arabicDate: nextPaymentDate.toLocaleDateString('ar-EG'),
        isPaid: false
      });
    }

    // قنص تاريخ آخر قسط من نهاية المصفوفة بدقة فلكية
    const lastPaymentDateString = schedule[schedule.length - 1].arabicDate;

    const newLoanObject = {
      id: 'loan_' + Date.now(),
      clientName: clientName.trim(), // 👈 👑 [تم الحفظ] حفر اسم العميل بداخل كائن القرض بالسحاب
      principal: principal,
      monthlyPayment: monthlyInstallment,
      totalRepayment: totalRepayment,
      lastDueDate: lastPaymentDateString,
      schedule: schedule,
      createdAt: new Date().toLocaleDateString('ar-EG')
    };

    saveLoansToStorage([newLoanObject, ...activeLoans]);
    
    // تصفير الحقول بنعومة برمجية متزنة
    setLoanAmount("");
    setInterestRate("");
    setLoanDuration("");
    setStartDate("");
    setClientName(""); // 👈 تصفير الحقل
    alert("📊 🎉 تم احتساب القرض بنجاح وبث جدول الأقساط بالملي ثانية!");
  };

  // دالة تصفير وصعق إشعار القسط بعد نقر زر (تم السداد ✔️)
  const handleMarkAsPaid = (loanId, installmentNo) => {
    const updated = activeLoans.map(loan => {
      if (loan.id === loanId) {
        const updatedSchedule = loan.schedule.map(inst => {
          if (inst.installmentNo === installmentNo) return { ...inst, isPaid: true };
          return inst;
        });
        return { ...loan, schedule: updatedSchedule };
      }
      return loan;
    });
    saveLoansToStorage(updated);
    alert("✔️ تم توثيق السداد وصعق التنبيه بنجاح فخم!");
  };

  // إبادة وقذف القرض نهائياً من السيستم
  const handleDeleteLoan = (loanId) => {
    if (!window.confirm("🗑️ هل أنت متأكد من حذف هذا القرض وإبادة جميع سجلات أقساطه نهائياً؟")) return;
    const filtered = activeLoans.filter(l => l.id !== loanId);
    saveLoansToStorage(filtered);
  };

    // قنص الأقساط المستحقة لليوم الحالي لإظهارها في لوحة التنبيهات السيبرانية العليا
  const todayString = new Date().toLocaleDateString('en-CA');
return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '94%', maxWidth: '780px', background: '#070707', padding: '20px', borderRadius: '12px', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* ترويسة نافذة حاسبة ومتابع القروض الإدارية */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '15px', fontWeight: 'bold' }}>📊 حاسبة القروض ومستشار جدولة الأقساط الذكي</h3>
          <button className="close-discovery" onClick={onClose} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>

        {/* 🚨 لوحة التنبيهات السيبرانية والإشعارات الحية المترصدة لأقساط اليوم الحالي */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
          {activeLoans.map(loan => 
            loan.schedule.filter(inst => inst.dueDate === todayString && !inst.isPaid).map(inst => (
              <div key={`${loan.id}-${inst.installmentNo}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(192,57,43,0.1)', padding: '10px 15px', borderRadius: '6px', border: '1px solid #c0392b', boxShadow: '0 0 10px rgba(192,57,43,0.15)', direction: 'rtl' }}>
                <span style={{ fontSize: '11.5px', color: '#fff' }}>🔔 <strong>تنبيه قسط مستحق:</strong> العميل <strong style={{color:'var(--gold-glow)'}}>{loan.clientName}</strong> مستحق عليه اليوم القسط رقم ({inst.installmentNo}) بقيمة <strong style={{color:'var(--gold-primary)'}}>{loan.monthlyPayment.toFixed(2)} جنية</strong></span>
                <button type="button" onClick={() => handleMarkAsPaid(loan.id, inst.installmentNo)} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>✔️ تم السداد لإلغاء التنبيه</button>
              </div>
            ))
          )}
        </div>

        <div className="market-section-layout" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* فورم إدخال وصياغة معطيات القرض */}
          <form onSubmit={handleCalculateLoan} style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '13px' }}>📋 أدخل بيانات القرض المستهدف:</h4>
            
            {/* 👑 👤 حقن خانة إدخال اسم العميل الفاخرة بأعلى حقول الفورم بالملي */}
            <input 
              type="text" 
              placeholder="👤 اكتب اسم العميل الحقيقي المستلم للقرض..." 
              value={clientName} 
              onChange={e => setClientName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px', fontSize: '11px', direction: 'rtl' }}
            />

            <input 
              type="number" min="1" placeholder="💰 قيمة القرض المطلوب (مثال: 50000)..." 
              value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required 
              style={{ width: '100%', padding: '8px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px', fontSize: '11px' }}
            />
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="number" step="0.01" min="0" placeholder="📈 نسبة الفائدة السنوية %..." 
                value={interestRate} onChange={e => setInterestRate(e.target.value)} required 
                style={{ flex: 1, padding: '8px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px', fontSize: '11px' }}
              />
              <input 
                type="number" min="1" placeholder="⏳ مدة السداد بالشهور..." 
                value={loanDuration} onChange={e => setLoanDuration(e.target.value)} required 
                style={{ flex: 1, padding: '8px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <small style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'right' }}>📅 تاريخ استلام مبلغ القرض (اختياري):</small>
              <input 
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
                style={{ width: '100%', padding: '8px', background: '#000', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
              />
            </div>

            <button type="submit" className="gold-btn" style={{ width: '100%', marginTop: '5px', fontWeight: 'bold', fontSize: '12px' }}>💾 احتساب وجدولة القرض سحابياً</button>
          </form>
          {/* لوحة مراقبة وعرض القروض النشطة ومصفوفة التواريخ التابعة لها */}
          <div style={{ flex: '1.4', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '13px', borderBottom: '1px solid rgba(212,175,55,0.1)', paddingBottom: '4px', textAlign: 'right' }}>📋 ملفات القروض النشطة وجدول الأقساط:</h4>
            
            <div className="users-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {activeLoans.map(loan => (
                <div key={loan.id} className="mini-user-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-glass)', position: 'relative' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#27ae60', fontSize: '12px' }}>💰 القسط الشهري: {loan.monthlyPayment.toFixed(2)} جنية</strong>
                    <button onClick={() => handleDeleteLoan(loan.id)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </div>

                  {/* 👑 حقن طباعة هويّة واسم العميل بداخل الكارت المرئي القياسي بالسقوف */}
                  <div style={{ background: 'rgba(212,175,55,0.05)', padding: '4px 8px', borderRadius: '4px', border: '1px dashed var(--gold-primary)', fontSize: '11px', color: '#fff', textAlign: 'right' }}>
                    👤 اسم العميل المعتمد: <strong style={{color:'var(--gold-glow)'}}>{loan.clientName}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: '#000', padding: '8px', borderRadius: '4px', fontSize: '10.5px', textDirection: 'right', direction: 'rtl' }}>
                    <div style={{color:'#fff'}}>أصل المبلغ: <strong>{loan.principal}</strong></div>
                    <div style={{color:'#fff'}}>المبلغ الكلي بالفائدة: <strong>{loan.totalRepayment.toFixed(2)}</strong></div>
                    <div style={{color:'var(--gold-primary)', gridColumn:'1/-1', marginTop:'2px'}}>🏁 تاريخ سداد آخر قسط: <strong>{loan.lastDueDate}</strong></div>
                  </div>

                  {/* قائمة تواريخ استهلاك وسداد الأقساط التفصيلية */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '4px', maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {loan.schedule.map(inst => (
                      <div key={inst.installmentNo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', padding: '4px 6px', background: inst.isPaid ? 'rgba(39,174,96,0.05)' : 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.02)', direction: 'rtl' }}>
                        <span style={{ color: inst.isPaid ? '#27ae60' : '#fff' }}>📅 قسط {inst.installmentNo} تاريخ: {inst.arabicDate}</span>
                        {inst.isPaid ? (
                          <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '9px' }}>✔️ تـم السداد</span>
                        ) : (
                          <button type="button" onClick={() => handleMarkAsPaid(loan.id, inst.installmentNo)} style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', border: '1px solid var(--gold-primary)', fontSize: '8px', padding: '1px 5px', borderRadius: '2px', cursor: 'pointer' }}>تسديد 💵</button>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              ))}
              {activeLoans.length === 0 && <p className="empty-text-gold" style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px' }}>لا توجد قروض مسجلة للمتابعة حالياً...</p>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OuroLoanCalculator;


