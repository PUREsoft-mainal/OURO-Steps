/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';

const OuroDocEngine = ({ user, onClose }) => {
  // 🔒 أ) بيانات الورقة الأولى والغلاف الرسمي للمستند أو الملزمة التعليمية
  const [docTitle, setDocTitle] = useState(""); // عنوان المستند
  const [docAuthor, setDocAuthor] = useState(""); // اسم الكاتب أو المحاضر
  const [docSubject, setDocSubject] = useState(""); // القسم أو المادة الدراسية
  
  // 📄 ب) كبسولة تخزين محتويات الأوراق المتعددة الترتيبية
  // كل ورقة تحتوي على حقل للنصوص، ومصفوفة جداول محقونة، وشفرات صور
  const [pages, setPages] = useState([
    { id: 1, textContent: "", tables: [], images: [] }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // 🎛️ ج) حقول التحكم الفرعية لإنشاء الجداول الميكانيكية المرنة
  const [gridRows, setGridRows] = useState(3);
  const [gridCols, setGridCols] = useState(3);
  const [showGridCreator, setShowGridCreator] = useState(false);

  // 📸 محرك التقاط وقراءة الصور وتحويلها لشفرة طائرة Base64 دون حشو هارد السيرفر
  const handleUploadImageToPage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPages(pages.map((p, idx) => idx === activePageIndex ? {
          ...p,
          images: [...p.images, { id: 'img_' + Date.now(), src: reader.result, width: 150 }]
        } : p));
        alert("📸 تم حقن وتثبيت الصورة الميكانيكية داخل الورقة النشطة بنجاح باهر!");
      };
      reader.readAsDataURL(file);
    }
  };

  // ➕ دالة توليد وصياغة ورقة جديدة إضافية بداخل الملزمة
  const handleAddNewPage = () => {
    setPages([...pages, { id: pages.length + 1, textContent: "", tables: [], images: [] }]);
    setActivePageIndex(pages.length);
  };
  // 📊 دالة صياغة وحقن الجدول المرن داخل الورقة النشطة بالشركة
  const handleInjectGrid = (e) => {
    e.preventDefault();
    const rows = parseInt(gridRows) || 1;
    const cols = parseInt(gridCols) || 1;
    
    // توليد مصفوفة الهيكل الداخلي للجدول المرن
    const generatedGrid = Array(rows).fill(null).map(() => Array(cols).fill(""));
    
    setPages(pages.map((p, idx) => idx === activePageIndex ? {
      ...p,
      tables: [...p.tables, { id: 'grid_' + Date.now(), structure: generatedGrid }]
    } : p));
    
    setShowGridCreator(false);
    alert(`📊 تم حقن جدول مرن بمقاس (${rows} × ${cols}) داخل الورقة النشطة!`);
  };

  // 🗑️ دالة حذف الورقة النشطة
  const handleRemovePage = (index) => {
    if (pages.length > 1) {
      const updated = pages.filter((_, idx) => idx !== index);
      setPages(updated);
      setActivePageIndex(Math.max(0, index - 1));
    }
  };

  // 🏆 خاصية الحفظ كملف PDF الملكية المباشرة للملازم التعليمية
  const exportDocToPDF = () => {
    const element = document.getElementById('ouroMasterPrintableZone');
    const opt = {
      margin: 0,
      filename: `مستند_${docTitle || 'Ouro'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().from(element).set(opt).save();
  };

  // 🖨️ خاصية الطباعة الفورية الصافية المتوافقة مع طابعات الورق والبرواز
  const handlePrintDoc = () => {
    const printContent = document.getElementById('ouroMasterPrintableZone').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="background:#fff; color:#000; padding:0; margin:0; direction:rtl; text-align:right;">
        ${printContent}
      </div>
    `;
    window.print();
    window.location.reload(); // إعادة الإقلاع الفوري لاستعادة نبض الفرونت إند
  };
  return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '97%', maxWidth: '1100px', background: '#070707', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* الجانب الأيمن: لوحة صياغة المدخلات وحقن الأدوات اللوجستية للشركة */}
        <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '14px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '6px' }}>⚙️ محرك صياغة المستندات والملازم الملكي</h3>
          
          {/* كابينة الورقة الأولى (بيانات الغلاف الرسمي للشركة) */}
          <div style={{ background: 'rgba(212,175,55,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.1)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <small style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '11px' }}>📄 بيانات الغلاف الرئيسي (تظهر بالورقة الأولى فقط):</small>
            <input type="text" placeholder="📝 عنوان المستند أو الملزمة..." value={docTitle} onChange={e => setDocTitle(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="👤 اسم المدرس / الكاتب..." value={docAuthor} onChange={e => setDocAuthor(e.target.value)} style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
              <input type="text" placeholder="📚 المادة / القسم الدراسي..." value={docSubject} onChange={e => setDocSubject(e.target.value)} style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            </div>
          </div>

          {/* محرر محتويات الورقة النشطة الحالية */}
          <div style={{ background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <small style={{ color: '#fff', fontSize: '11px' }}>✍️ محتوى الورقة النشطة رقم ({activePageIndex + 1}):</small>
              <button type="button" onClick={() => handleRemovePage(activePageIndex)} disabled={pages.length === 1} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}>حذف هذه الورقة ×</button>
            </div>
            <textarea 
              placeholder="اكتب نصوص وشروحات المحاضرة هنا باللغة العربية..." 
              value={pages[activePageIndex]?.textContent || ""} 
              onChange={e => setPages(pages.map((p, idx) => idx === activePageIndex ? { ...p, textContent: e.target.value } : p))} 
              style={{ width: '100%', height: '120px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', padding: '8px', fontSize: '12px', resize: 'none', direction: 'rtl' }}
            />
          </div>

          {/* أزرار حقن الوسائط والجداول اللامركزية */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <input type="file" id="ouroDocImgInput" accept="image/*" hidden onChange={handleUploadImageToPage} />
            <button type="button" onClick={() => document.getElementById('ouroDocImgInput').click()} style={{ flex: 1, background: '#e67e22', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📸 حقن صورة بالورقة</button>
            <button type="button" onClick={() => setShowGridCreator(!showGridCreator)} style={{ flex: 1, background: '#2980b9', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📊 حقن جدول مرن</button>
          </div>

          {showGridCreator && (
            <form onSubmit={handleInjectGrid} style={{ background: '#000', padding: '8px', borderRadius: '6px', border: '1px solid #2980b9', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <small style={{ color: '#2980b9', fontSize: '10px' }}>أفقياً:</small>
              <input type="number" min="1" max="10" value={gridCols} onChange={e => setGridCols(e.target.value)} style={{ width: '40px', padding: '4px', background: '#111', color: '#fff', border: '1px solid #333' }} />
              <small style={{ color: '#2980b9', fontSize: '10px' }}>رأسياً:</small>
              <input type="number" min="1" max="15" value={gridRows} onChange={e => setGridRows(e.target.value)} style={{ width: '40px', padding: '4px', background: '#111', color: '#fff', border: '1px solid #333' }} />
              <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '10px', borderRadius: '3px', cursor: 'pointer' }}>إدراج الجدول</button>
            </form>
          )}

          {/* فاحص التنقل الحركي بين صفحات وملازم المستند */}
          <div style={{ display: 'flex', gap: '4px', background: '#000', padding: '5px', borderRadius: '6px', overflowX: 'auto' }}>
            {pages.map((_, idx) => (
              <button key={idx} onClick={() => setActivePageIndex(idx)} style={{ padding: '4px 10px', fontSize: '10px', background: idx === activePageIndex ? 'var(--gold-primary)' : '#111', color: idx === activePageIndex ? '#000' : '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>ورقة {idx + 1}</button>
            ))}
            <button onClick={handleAddNewPage} style={{ padding: '4px 10px', fontSize: '10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>➕ ورقة جديدة</button>
          </div>

          {/* حزمة أزرار التصدير والطباعة الخماسية الفخمة */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '5px' }}>
            <button type="button" onClick={exportDocToPDF} style={{ background: '#c0392b', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>📄 حفظ كـ PDF</button>
            <button type="button" onClick={handlePrintDoc} style={{ background: 'var(--gold-primary)', color: '#000', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🖨️ طباعة المستند فورا</button>
            <button type="button" onClick={onClose} style={{ gridColumn: '1 / -1', background: '#333', color: '#fff', padding: '6px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>إغلاق منشئ الملازم ✖</button>
          </div>
        </div>
        {/* الجانب الأيسر: المعاينة الحية للأوراق المتعددة مجهزة ومحاطة بالبرواز الملكي والترقيم */}
        <div style={{ flex: '1.3', minWidth: '350px', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '75vh', overflowY: 'auto' }}>
          <div id="ouroMasterPrintableZone" style={{ background: '#fff', color: '#000', padding: '0', margin: '0' }}>
            
            {/* توليد وحلقة رسم الأوراق المتتالية حركياً داخل ال-PDF والطباعة */}
            {pages.map((page, index) => (
              <div key={page.id} style={{ width: '210mm', minHeight: '296mm', padding: '20mm 15mm', boxSizing: 'border-box', background: '#fff', position: 'relative', pageBreakAfter: 'always', border: '1px solid #eee' }}>
                
                {/* 👑 البرواز الملكي المذهب الفخم المحيط بكافة حواف صفحة المستند */}
                <div style={{ position: 'absolute', top: '10mm', bottom: '15mm', left: '10mm', right: '10mm', border: '3px double var(--gold-primary)', pointerEvents: 'none', boxSizing: 'border-box' }} />
                
                {/* 📋 الورقة الأولى فقط: حقن كابينة بيانات الغلاف والمادة والكاتب */}
                {index === 0 && (
                  <div style={{ textAlign: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid var(--gold-primary)', direction: 'rtl' }}>
                    <h1 style={{ color: 'var(--gold-primary)', margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>{docTitle || "عنوان المستند الكلي"}</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', color: '#333', marginTop: '10px' }}>
                      <span>👤 الكاتب/المحاضر: <strong>{docAuthor || "........................"}</strong></span>
                      <span>📚 المادة/القسم: <strong>{docSubject || "........................"}</strong></span>
                    </div>
                  </div>
                )}

                {/* عرض المحتوى النصي المخطط داخل الورقة الحالية */}
                <div style={{ direction: 'rtl', textAlign: 'right', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#000', minHeight: '180mm', fontFamily: 'sans-serif', padding: '0 5mm' }}>
                  {page.textContent || (index === 0 ? "اكتب محتويات الغلاف والملزمة بداخل اللوحة اليمنى..." : "محتوى الورقة الإضافية المعلقة...")}
                  
                  {/* رصد وحقن الصور الميكانيكية بداخل قلب الصفحة الحالية */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px', justifyContent: 'center' }}>
                    {page.images && page.images.map(img => (
                      <img key={img.id} src={img.src} alt="doc-img" style={{ width: `${img.width}px`, objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', padding: '4px' }} />
                    ))}
                  </div>

                  {/* رصد ورسم الجداول المرنة والمطاطية بداخل الصفحة الحالية */}
                  {page.tables && page.tables.map(table => (
                    <table key={table.id} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', direction: 'rtl', fontSize: '12px' }}>
                      <tbody>
                        {table.structure.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((_, cIdx) => (
                              <td key={cIdx} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', background: 'rgba(0,0,0,0.01)' }}>
                                <input type="text" placeholder="..." style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '11px', color: '#000' }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                </div>

                {/* 🔗 🖨️ تذليل الصفحة: طباعة رابط الموقع ورقم الورقة الترتيبي أسفل البرواز بدقة */}
                <div style={{ position: 'absolute', bottom: '6mm', left: '15mm', right: '15mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontFamily: 'monospace', color: '#555', borderTop: '1px solid #eee', paddingTop: '4px' }}>
                  <span>🌐 رابط المنصة الموثق: ouro-steps.vercel.app</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--gold-primary)' }}>صفحة رقم ({index + 1})</span>
                </div>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};

export default OuroDocEngine; // 👑 القفل القياسي والتصدير النهائي للمحرك بنقاء 100%
