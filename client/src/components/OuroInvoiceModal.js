/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const OuroInvoiceModal = ({ user, onClose }) => {
  // 🔒 states لوحة التحكم بالهوية البصرية والبيانات الحركية للفاتورة وعروض الأسعار
  const [companyName, setCompanyName] = useState(""); // اسم الشركة المصدرة الحرة
  const [companyAddress, setCompanyAddress] = useState(""); // عنوان فرع الشركة الحر
  const [companyLogo, setCompanyLogo] = useState(""); // شفرة اللوجو اللامركزية الطائرة Base64
  
  const [clientName, setClientName] = useState("");
  const [invoiceType, setInvoiceType] = useState("فاتورة بيع رقمية"); 
  const [items, setItems] = useState([{ id: 1, name: "", qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(0); 
  const [discount, setDiscount] = useState(0); 

  // 📸 محرك قراءة وتحويل اللوجو الفيزيائي لشفرة نصية مشفرة محلياً دون استهلاك مساحات مادية
  const handleLogoChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result); // حقن شفرة الصورة الطائرة بالذاكرة المؤقتة للفرونت إند
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), name: "", qty: 1, price: 0 }]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  // المعادلات الحسابية الدقيقة للفاتورة حياً
  const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
  const taxAmount = subTotal * (parseFloat(taxRate || 0) / 100);
  const finalTotal = Math.max(0, subTotal + taxAmount - parseFloat(discount || 0));
  // 🏆 1. خاصية الحفظ كملف PDF الملكية المباشرة للتحميل لجهاز العميل
  const exportToPDF = () => {
    const element = document.getElementById('ouroPrintedInvoiceZone');
    const opt = {
      margin: 10,
      filename: `${invoiceType}_${clientName || 'Ouro'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().from(element).set(opt).save();
  };

  // 🏆 2 + 3. خاصية لقطة الشاشة والحفظ كصورة فوتوغرافية واضحة بدقة HD
  const exportToImage = () => {
    const element = document.getElementById('ouroPrintedInvoiceZone');
    window.html2canvas(element, { scale: 2, backgroundColor: '#000' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `${invoiceType}_${clientName || 'Ouro'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // 🏆 4. خاصية الحفظ كمستند نصي مرن للتداول والتحرير بصيغة Doc (Word)
  const exportToDoc = () => {
    const element = document.getElementById('ouroPrintedInvoiceZone');
    const htmlContent = element.innerHTML;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceType}_${clientName || 'Ouro'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 🏆 5. خاصية الطباعة الفورية الصافية عبر طابعات الكمبيوتر أو الهواتف الذكية
  const handlePrint = () => {
    const printContent = document.getElementById('ouroPrintedInvoiceZone').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="background:#fff; color:#000; padding:30px; font-family:sans-serif; direction:rtl; text-align:right;">
        ${printContent}
      </div>
    `;
    window.print();
    window.location.reload(); // إعادة تحميل الصفحة لاستعادة واجهة ال-React ونبضها حياً
  };
  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '950px', background: '#070707', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* الجانب الأيمن: لوحة إدخال وتعبئة البيانات للتأجر والشركة والمحاضر */}
        <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '14px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '6px' }}>⚙️ لوحة صياغة الفواتير وعروض الأسعار الفورية</h3>
          
          {/* 👑 [توطين حقول الشركة المصدرة المضافة بالملي] */}
          <div style={{ background: 'rgba(212,175,55,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 'bold' }}>🏛️ بيانات الشركة / المدرس المصدر للمستند:</span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="🏛️ اسم شركتك أو اسمك الخاص..." value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
              <input type="text" placeholder="📍 المقر أو عنوان فرعك..." value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            </div>

            {/* زر رفع اللوجو وحفظه سحابياً طيراناً دون استهلاك مساحة */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="file" id="ouroInvoiceLogoInput" accept="image/*" hidden onChange={handleLogoChange} />
              <button type="button" onClick={() => document.getElementById('ouroInvoiceLogoInput').click()} style={{ background: '#e67e22', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📸 اختيار شعار / لوجو الشركة</button>
              {companyLogo && <small style={{ color: '#27ae60', fontSize: '10px' }}>✔️ تم قنص وتثبيت الشعار بنجاح</small>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }}>
              <option value="فاتورة بيع رقمية">🧾 فاتورة بيع رقمية</option>
              <option value="عرض سعر فوري">📊 عرض سعر فوري</option>
              <option value="سند قبض مالي">💰 سند قبض مالي</option>
            </select>
            <input type="text" placeholder="👤 اسم العميل المستهدف الحقيقي..." value={clientName} onChange={e => setClientName(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
          </div>

          <div style={{ background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><small style={{ color: '#fff', fontSize: '11px' }}>📝 الأصناف والخدمات المطلوبة:</small></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '140px', overflowY: 'auto' }}>
              {items.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <input type="text" placeholder="اسم الصنف/الخدمة..." value={item.name} onChange={e => handleUpdateItem(item.id, 'name', e.target.value)} style={{ flex: 2, padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <input type="number" placeholder="الكمية" min="1" value={item.qty} onChange={e => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 0)} style={{ width: '45px', padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <input type="number" placeholder="السعر" min="0" value={item.price} onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)} style={{ width: '65px', padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <button type="button" onClick={() => handleRemoveItem(item.id)} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 7px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddItem} style={{ marginTop: '6px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', border: '1px solid var(--gold-primary)', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', width: '100%', fontWeight: 'bold' }}>➕ إضافة صنف جديد</button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}><small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>📊 الضريبة المضافة (%):</small><input type="number" min="0" placeholder="0" value={taxRate} onChange={e => setTaxRate(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} /></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}><small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>📉 قيمة الخصم (جنية):</small><input type="number" min="0" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} /></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '5px' }}>
            <button type="button" onClick={exportToPDF} style={{ background: '#c0392b', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>📄 حفظ كمستند PDF</button>
            <button type="button" onClick={exportToImage} style={{ background: '#27ae60', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🖼️ حفظ كصورة فوتوغرافية</button>
            <button type="button" onClick={exportToDoc} style={{ background: '#2980b9', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>📝 حفظ كمستند Word</button>
            <button type="button" onClick={handlePrint} style={{ background: 'var(--gold-primary)', color: '#000', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🖨️ طباعة الفاتورة فورا</button>
            <button type="button" onClick={onClose} style={{ gridColumn: '1 / -1', background: '#333', color: '#fff', padding: '6px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>إغلاق النافذة ✖</button>
          </div>
        </div>
        {/* الجانب الأيسر: المعاينة الحية للفاتورة وحقن اللوجو الحر للشركة مع تثبيت اسم منصة OURO بالسقف */}
        <div style={{ flex: '1.2', minWidth: '350px', background: '#000', padding: '15px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 15px rgba(212,175,55,0.1)' }}>
          <div id="ouroPrintedInvoiceZone" style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'sans-serif', padding: '15px', background: '#000', color: '#fff' }}>
            
            {/* 👑 🏛️ [سقف التوثيق السيادي للمنصة] - تثبيت اسم وشعار منصة OURO Steps أعلى الفاتورة دائماً كضامن رسمي */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(212,175,55,0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
              <h2 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}> مستند موثق عبر منصة OURO Steps 👑</h2>
            </div>

            {/* ترويسة الفاتورة المرنة وحقن الهوية البصرية اللامركزية والحرّة للشركة المستخدمة */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--gold-primary)', paddingBottom: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* رسم اللوجو الحر للشركة المصدرة إن وُجد، أو وضع أيقونة افتراضية فخمة */}
                {companyLogo ? (
                  <img src={companyLogo} alt="company-logo" style={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.2)' }} />
                ) : (
                  <span style={{ fontSize: '28px' }}>💼</span>
                )}
                <div>
                  {/* اسم الشركة وعنوانها يتغيرون بحرية كاملة حسب إدخال المستخدم */}
                  <h3 style={{ color: 'var(--gold-primary)', margin: '0 0 2px 0', fontSize: '14px', fontWeight: 'bold' }}>{companyName || "اسم الشركة المصدرة..."}</h3>
                  <small style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>📍 المقر: {companyAddress || "العنوان غير محدد..."}</small>
                  <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px' }}>تاريخ المعاملة: {new Date().toLocaleDateString('ar-EG')}</small>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '12px', fontWeight: 'bold' }}>{invoiceType}</h3>
                <small style={{ color: 'var(--text-muted)', fontSize: '8px' }}>الرقم المرجعي: #{Date.now().toString().slice(-6)}</small>
              </div>
            </div>

            {/* بيانات العميل المستهدف */}
            <div style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--gold-primary)', display: 'block', fontWeight: 'bold' }}>👤 السيد / شركة (العميل المستلم):</span>
              <strong style={{ fontSize: '12px', color: '#fff' }}>{clientName || "................................................"}</strong>
            </div>

            {/* جدول عرض الأصناف والخدمات المنظم للمتصفحات وطابعات ال-PDF */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '12px' }}>
              <thead>
                <tr style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold-primary)' }}>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textAlign: 'right' }}>الصنف / الخدمة المطلوبة</th>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textAlign: 'center' }}>الكمية</th>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textAlign: 'center' }}>السعر</th>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textAlign: 'center' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px' }}>{item.name || "صنف تجريبي معلق..."}</td>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px', textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px', textAlign: 'center' }}>{parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px', textAlign: 'center', color: 'var(--gold-primary)' }}>{(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* الحسابات التلقائية المذهبة بالأسفل */}
            <div style={{ width: '65%', marginRight: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>المجموع الفرعي:</span><span>{subTotal.toFixed(2)} جنية</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>الضريبة المضافة ({taxRate}%):</span><span>+{taxAmount.toFixed(2)} جنية</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>قيمة الخصم الممنوح:</span><span style={{ color: '#c0392b' }}>-{parseFloat(discount || 0).toFixed(2)} جنية</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(39,174,96,0.1)', padding: '6px', borderRadius: '4px', marginTop: '4px', border: '1px solid #27ae60' }}>
                <strong style={{ color: '#27ae60' }}>الإجمالي الكلي النهائي:</strong>
                <strong style={{ color: '#27ae60', fontSize: '12px', fontFamily: 'monospace' }}>{finalTotal.toFixed(2)} جنية مصري</strong>
              </div>
            </div>

            {/* الأختام والتوثيقات الموحدة لـ OURO Steps */}
            <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px' }}>
              <small style={{ color: 'var(--gold-primary)', fontSize: '9px', fontFamily: 'monospace', display: 'block' }}>👑 تم توليد وتأمين هذا المستند عبر محرك الفواتير السحابي الموحد لـ OURO Steps 2026 🏛️</small>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OuroInvoiceModal; // 👑 إغلاق وتصدير نهائي نقي وصافي 100%
