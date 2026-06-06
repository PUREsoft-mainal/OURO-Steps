/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const OuroInvoiceModal = ({ user, onClose }) => {
  // states البيانات الأساسية والسيادية للفاتورة الرقمية وعروض الأسعار
  const [clientName, setClientName] = useState("");
  const [invoiceType, setInvoiceType] = useState("فاتورة بيع رقمية"); 
  const [items, setItems] = useState([{ id: 1, name: "", qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(0); // نسبة الضريبة المضافة لعام 2026 %
  const [discount, setDiscount] = useState(0); // قيمة الخصم المباشر بالعملة المحلية

  // ➕ دالة إضافة صنف أو خدمة جديدة للفاتورة ديناميكياً
  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), name: "", qty: 1, price: 0 }]);
  };

  // 📝 دالة تحديث بيانات الصنف حياً فور الكتابة (الاسم، السعر، أو الكمية)
  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // 🗑️ دالة حذف صنف معين من القائمة
  const handleRemoveItem = (id) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  // 📊 المعادلات الرياضية الحسابية الدقيقة للفاتورة بشكل فوري حركي
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
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '900px', background: '#070707', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* الجانب الأيمن: لوحة إدخال وتعبئة البيانات للتأجر والشركة والتعليم */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '15px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '8px' }}>⚙️ لوحة صياغة الفواتير وعروض الأسعار الفورية</h3>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '12px' }}>
              <option value="فاتورة بيع رقمية">🧾 فاتورة بيع رقمية</option>
              <option value="عرض سعر فوري">📊 عرض سعر فوري</option>
              <option value="سند قبض مالي">💰 سند قبض مالي</option>
            </select>
            <input type="text" placeholder="👤 اسم العميل / الشركة..." value={clientName} onChange={e => setClientName(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '12px' }} />
          </div>

          <div style={{ background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><small style={{ color: '#fff', fontSize: '11px' }}>📝 الأصناف والخدمات المطلوبة:</small></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {items.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="text" placeholder="اسم الصنف/الخدمة..." value={item.name} onChange={e => handleUpdateItem(item.id, 'name', e.target.value)} style={{ flex: 2, padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <input type="number" placeholder="الكمية" min="1" value={item.qty} onChange={e => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <input type="number" placeholder="السعر" min="0" value={item.price} onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)} style={{ width: '70px', padding: '5px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
                  <button type="button" onClick={() => handleRemoveItem(item.id)} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddItem} style={{ marginTop: '8px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', border: '1px solid var(--gold-primary)', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', width: '100%', fontWeight: 'bold' }}>➕ إضافة صنف جديد</button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}><small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>📊 الضريبة المضافة (%):</small><input type="number" min="0" placeholder="0" value={taxRate} onChange={e => setTaxRate(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} /></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}><small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>📉 قيمة الخصم (جنية):</small><input type="number" min="0" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} /></div>
          </div>
          
          {/* حزمة أزرار التصدير والطباعة الخماسية */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={exportToPDF} style={{ background: '#c0392b', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>📄 حفظ كمستند PDF</button>
            <button type="button" onClick={exportToImage} style={{ background: '#27ae60', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🖼️ حفظ كصورة فوتوغرافية</button>
            <button type="button" onClick={exportToDoc} style={{ background: '#2980b9', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>📝 حفظ كمستند Word</button>
            <button type="button" onClick={handlePrint} style={{ background: 'var(--gold-primary)', color: '#000', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🖨️ طباعة الفاتورة فورا</button>
            <button type="button" onClick={onClose} style={{ gridColumn: '1 / -1', background: '#333', color: '#fff', padding: '6px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>إغلاق النافذة ✖</button>
          </div>
        </div>
        {/* الجانب الأيسر: العرض التفاعلي الحي المباشر لشكل الفاتورة المذهبة قبل التصدير */}
        <div style={{ flex: '1.2', minWidth: '340px', background: '#000', padding: '15px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 15px rgba(212,175,55,0.1)' }}>
          <div id="ouroPrintedInvoiceZone" style={{ direction: 'rtl', textalign: 'right', fontFamily: 'sans-serif', padding: '15px', background: '#000', color: '#fff' }}>
            
            {/* ترويسة الفاتورة المذهبة واللوجو */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--gold-primary)', paddingBottom: '10px', marginBottom: '15px' }}>
              <div>
                <h2 style={{ color: 'var(--gold-primary)', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>منصة OURO Core Steps 🏛️</h2>
                <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>تاريخ المعاملة: {new Date().toLocaleDateString('ar-EG')}</small>
              </div>
              <div style={{ textalign: 'left' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{invoiceType}</h3>
                <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>الرقم المرجعي: #{Date.now().toString().slice(-6)}</small>
              </div>
            </div>

            {/* بيانات العميل */}
            <div style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--gold-primary)', display: 'block', fontWeight: 'bold' }}>👤 السيد / شركة:</span>
              <strong style={{ fontSize: '13px', color: '#fff' }}>{clientName || "................................................"}</strong>
            </div>

            {/* جدول عرض الأصناف النقي والمنظم للمتصفحات */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '15px' }}>
              <thead>
                <tr style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold-primary)' }}>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textalign: 'right' }}>الصنف / الخدمة المطلوبة</th>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textalign: 'center' }}>الكمية</th>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textalign: 'center' }}>السعر</th>
                  <th style={{ border: '1px solid rgba(212,175,55,0.3)', padding: '6px', textalign: 'center' }}>العائد</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px' }}>{item.name || "صنف تجريبي معلق..."}</td>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px', textalign: 'center' }}>{item.qty}</td>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px', textalign: 'center' }}>{parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '6px', textalign: 'center', color: 'var(--gold-primary)' }}>{(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* المجموع والضرائب والخصم والإجمالي النهائي الفخم */}
            <div style={{ width: '60%', marginRight: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>المجموع الفرعي:</span><span>{subTotal.toFixed(2)} جنية</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>الضريبة المضافة ({taxRate}%):</span><span>+{taxAmount.toFixed(2)} جنية</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>قيمة الخصم الممنوح:</span><span style={{ color: '#c0392b' }}>-{parseFloat(discount || 0).toFixed(2)} جنية</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(39,174,96,0.1)', padding: '6px', borderRadius: '4px', marginTop: '4px', border: '1px solid #27ae60' }}>
                <strong style={{ color: '#27ae60' }}>الإجمالي الكلي النهائي:</strong>
                <strong style={{ color: '#27ae60', fontSize: '13px', fontFamily: 'monospace' }}>{finalTotal.toFixed(2)} جنية مصري</strong>
              </div>
            </div>

            {/* التذليل والأختام والتوثيقات */}
            <div style={{ marginTop: '25px', textalign: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <small style={{ color: 'var(--gold-primary)', fontSize: '9px', fontFamily: 'monospace', display: 'block' }}>👑 تم توليد وتأمين هذا المستند عبر محرك الفواتير السحابي الموحد لـ OURO Steps 2026 🏛️</small>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OuroInvoiceModal; // 👑 التصدير القياسي للمكون بنقاء ثبات فلكي 100%
