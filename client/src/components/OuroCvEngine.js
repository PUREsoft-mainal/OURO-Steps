/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const OuroCvEngine = ({ user, onClose }) => {
  // 🔒 أ) الحقول الأساسية لمالك السيرة الذاتية أو المنشأة
  const [profileType, setProfileType] = useState("person"); // person, company, factory, workshop, shop, office
  const [fullName, setFullName] = useState(""); // اسم الشخص أو المنشأة
  const [identityNo, setIdentityNo] = useState(""); // الرقم القومي أو السجل التجاري
  const [contactPhone, setContactPhone] = useState(""); // رقم التواصل
  const [contactEmail, setContactEmail] = useState(""); // البريد الإلكتروني
  const [locationAddress, setLocationAddress] = useState(""); // العنوان بالتفصيل
  const [aboutText, setAboutText] = useState(""); // نبذة مختصرة القانونية

  // 📄 ب) كتل تخزين مصفوفات المهارات والخبرات والعقود التفاعلية
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const [experiences, setExperiences] = useState([]);
  const [expEntity, setExpEntity] = useState(""); // الجهة التي عمل لها
  const [contractStart, setContractStart] = useState(""); // بداية العقد
  const [contractEnd, setContractEnd] = useState(""); // نهاية العقد
  const [isCurrentContract, setIsCurrentContract] = useState(false); // هل العقد قائم؟
  const [jobTitle, setJobTitle] = useState(""); // المسمى الوظيفي أو طبيعة العمل

  // دالة حقن المهارات الديناميكية بداخل المصفوفة المفرزة
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!currentSkill.trim()) return;
    setSkills([...skills, currentSkill.trim()]);
    setCurrentSkill("");
  };

  // دالة حقن الخبرات والتوثيق العقدي بالتواريخ الصارمة
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expEntity.trim() || !jobTitle.trim() || !contractStart) {
      return alert("⚠️ يرجى إدخال اسم الجهة، المسمى الوظيفي، وتاريخ بداية العقد!");
    }

    const newExp = {
      id: 'exp_' + Date.now(),
      entity: expEntity.trim(),
      title: jobTitle.trim(),
      start: new Date(contractStart).toLocaleDateString('ar-EG'),
      end: isCurrentContract ? "قائم ومستمر حتى الآن" : new Date(contractEnd).toLocaleDateString('ar-EG'),
      isCurrent: isCurrentContract
    };

    setExperiences([newExp, ...experiences]);
    setExpEntity("");
    setJobTitle("");
    setContractStart("");
    setContractEnd("");
    setIsCurrentContract(false);
  };

  // 🏆 محرك تصدير الـ PDF السينمائي المباشر لورق A4
  const handleExportPDF = () => {
    const element = document.getElementById('ouroCvPrintableZone');
    if (!element || !window.html2pdf) return alert("❌ محرك تصدير PDF غير متوفر حالياً بالمتصفح.");

    const opt = {
      margin: 0,
      filename: `CV_${fullName || 'Ouro'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().from(element).set(opt).save();
  };

  // 🖨️ محرك الطباعة المادية الفورية الصافية وعزل الـ DOM
  const handlePrintDoc = () => {
    const printContent = document.getElementById('ouroCvPrintableZone').innerHTML;
    
    document.body.innerHTML = `
      <div style="background:#fff; color:#000; padding:0; margin:0; direction:rtl; text-align:right;">
        ${printContent}
      </div>
    `;
    window.print();
    window.location.reload(); 
  };

   return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '97%', maxWidth: '1150px', background: '#070707', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* الجانب الأيمن: كابينة إدخال وحياكة البيانات والخبرات القانونية */}
        <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '14px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '6px' }}>⚙️ لوحة صياغة محرك السيرة الذاتية والملفات التعريفية</h3>
          
          {/* كتل الهوية الأساسية للمستهدف */}
          <div style={{ background: 'rgba(212,175,55,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.1)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <select value={profileType} onChange={e => setProfileType(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }}>
              <option value="person">👤 سيرة ذاتية لشخص (فردي)</option>
              <option value="company">🏛️ ملف تعريفي لشركة (Company Profile)</option>
              <option value="factory">🏭 ملف تعريفي لمصنع متكامل</option>
              <option value="workshop">🛠️ ملف تعريفي لورشة فنية</option>
              <option value="shop">📦 ملف تعريفي لمحل تجاري</option>
              <option value="office">💼 ملف تعريفي لمكتب استشاري</option>
            </select>
            
            <input type="text" placeholder="📝 الاسم الكامل للشخص أو المنشأة..." value={fullName} onChange={e => setFullName(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
             setIdentityNo(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="📞 هاتف التواصل..." value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
              <input type="email" placeholder="📧 البريد الإلكتروني..." value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            </div>
            <input type="text" placeholder="📍 العنوان بالتفصيل..." value={locationAddress} onChange={e => setLocationAddress(e.target.value)} style={{ padding: '6px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            <textarea placeholder="⚖️ نبذة مختصرة للمستهدف (رؤية قانونية، أهداف، طبيعة النشاط)..." value={aboutText} onChange={e => setAboutText(e.target.value)} style={{ width: '100%', height: '50px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', padding: '6px', fontSize: '11px', resize: 'none' }} />
          </div>

          {/* كابينة حقن المهارات */}
          <div style={{ background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <small style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '4px' }}>🎯 حقن المهارات والمزايا الحيوية:</small>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="اكتب مهارة أو ميزة (مثال: البرمجة بـ Node.js)..." value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} style={{ flex: 1, padding: '6px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
              <button type="button" onClick={handleAddSkill} style={{ background: 'var(--gold-primary)', color: '#000', border: 'none', padding: '4px 12px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>+ حقن</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {skills.map((s, idx) => <span key={idx} style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>🔹 {s}</span>)}
            </div>
          </div>

          {/* كابينة حقن الخبرات والتوثيق العقدي القانوني */}
          <div style={{ background: '#000', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <small style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>💼 سجل الخبرات والتعاقدات السابقة والقائمة:</small>
            <input type="text" placeholder={profileType === 'person' ? "الشركة / الجهة التي عملت بها..." : "العميل / المشروع الذي نفذته المنشأة..."} value={expEntity} onChange={e => setExpEntity(e.target.value)} style={{ padding: '6px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            <input type="text" placeholder="المسمى الوظيفي أو طبيعة التعاقد..." value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={{ padding: '6px', background: '#111', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px' }} />
            
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}><small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>بداية العقد:</small><input type="date" value={contractStart} onChange={e => setContractStart(e.target.value)} style={{ width: '100%', padding: '4px', background: '#111', color: '#fff', border: '1px solid #333', fontSize: '10px' }} /></div>
              <div style={{ flex: 1 }}><small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>نهاية العقد:</small><input type="date" value={contractEnd} onChange={e => setContractEnd(e.target.value)} disabled={isCurrentContract} style={{ width: '100%', padding: '4px', background: '#111', color: '#fff', border: '1px solid #333', fontSize: '10px' }} /></div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '11px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isCurrentContract} onChange={() => setIsCurrentContract(!isCurrentContract)} />
              ⏳ هذا تعاقد قائم ونشط حالياً (مستمر للآن)
            </label>
            <button type="button" onClick={handleAddExperience} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>💾 توثيق العقد والخبرة داخل السجل</button>
          </div>

          {/* أزرار الحفظ والإبراق الخماسية الفخمة */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '5px' }}>
            <button type="button" onClick={handleExportPDF} style={{ background: '#c0392b', color: '#fff', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>📄 حفظ كـ PDF</button>
            <button type="button" onClick={handlePrintDoc} style={{ background: 'var(--gold-primary)', color: '#000', fontWeight: 'bold', padding: '8px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🖨️ طباعة السيرة فوراً</button>
            <button type="button" onClick={onClose} style={{ gridColumn: '1 / -1', background: '#333', color: '#fff', padding: '6px', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>إغلاق منشئ السير الذاتية ✖</button>
          </div>
        </div>

        {/* الجانب الأيسر: المعاينة الحية الاحترافية الحاضنة للبرواز التناظري ورق A4 */}
        <div style={{ flex: '1.3', minWidth: '350px', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '75vh', overflowY: 'auto' }}>
          <div id="ouroCvPrintableZone" style={{ width: '210mm', minHeight: '296mm', padding: '20mm 15mm', boxSizing: 'border-box', background: '#fff', color: '#000', position: 'relative', border: '1px solid #eee' }}>
            
            {/* البرواز الإمبراطوري المذهب المحيط بكافة الحواف */}
            <div style={{ position: 'absolute', top: '10mm', bottom: '15mm', left: '10mm', right: '10mm', border: '3px double var(--gold-primary)', pointerEvents: 'none', boxSizing: 'border-box' }} />
            
            {/* الترويسة الرئيسية الحركية */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--gold-primary)', paddingBottom: '12px', marginBottom: '20px', direction: 'rtl' }}>
              <h1 style={{ color: 'var(--gold-primary)', margin: '0 0 6px 0', fontSize: '24px', fontWeight: 'bold' }}>{fullName || "اسم الشخص أو المنشأة المستهدفة"}</h1>
              <span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold' }}>
                {profileType === 'person' && "📄 سيرة ذاتية مهنية موثقة رسمياً"}
                {profileType === 'company' && "🏛️ ملف تعريفي معتمد للشركات الكبرى"}
                {profileType === 'factory' && "🏭 السجل الفني واللوجستي المعتمد للمصانع"}
                {profileType === 'workshop' && "🛠️ الملف التعريفي والتقني المعتمد للورش"}
                {profileType === 'shop' && "📦 السجل التجاري والتعريفي للمحلات والسلع"}
                {profileType === 'office' && "💼 الملف التعريفي المهني للمكاتب الاستشارية"}
              </span>
            </div>

            {/* شبكة البيانات الصافية المتوافقة مع الطابعات والـ PDF */}
            <div style={{ direction: 'rtl', textAlign: 'right', fontSize: '12px', lineHeight: '1.6', color: '#000', fontFamily: 'sans-serif', padding: '0 5mm' }}>
              
              {/* قسم البيانات القانونية للاتصال */}
              <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid #ddd', paddingBottom: '3px', margin: '0 0 8px 0', fontSize: '13px' }}>📌 البيانات الأساسية والمستندات القانونية:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '15px', background: 'rgba(0,0,0,0.01)', padding: '8px', borderRadius: '4px' }}>
                <div>📍 العنوان: <strong>{locationAddress || "...................................."}</strong></div>
                <div>📞 الهاتف: <strong>{contactPhone || "...................................."}</strong></div>
                <div>📧 البريد: <strong>{contactEmail || "...................................."}</strong></div>
                <div>🆔 التوثيق القانوني: <strong>{identityNo || "...................................."}</strong></div>
              </div>

              {/* قسم النبذة التأسيسية */}
              <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid #ddd', paddingBottom: '3px', margin: '15px 0 6px 0', fontSize: '13px' }}>💡 نبذة مختصرة عن المستهدف:</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '11.5px', textIndent: '10px', color: '#2c3e50', whiteSpace: 'pre-wrap' }}>{aboutText || "اكتب نبذة مختصرة للمستهدف بداخل اللوحة اليمنى ليتم صبها هنا بالملي..."}</p>

              {/* قسم المهارات والمزايا */}
              <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid #ddd', paddingBottom: '3px', margin: '15px 0 8px 0', fontSize: '13px' }}>🌟 القدرات والمهارات الفنية الجوهرية:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                {skills.map((s, idx) => (
                  <span key={idx} style={{ background: '#f5f6fa', border: '1px solid #dcdde1', color: '#2f3640', fontSize: '11px', padding: '3px 10px', borderRadius: '4px', fontWeight: 'bold' }}>✓ {s}</span>
                ))}
                {skills.length === 0 && <span style={{ color: '#7f8c8d' }}>لم يتم تدوين مهارات فيزيائية حتى الآن...</span>}
              </div>

              {/* قسم التعاقدات والخبرات المتسلسلة التواريخ */}
              <h4 style={{ color: 'var(--gold-primary)', borderBottom: '1px solid #ddd', paddingBottom: '3px', margin: '15px 0 8px 0', fontSize: '13px' }}>💼 السجل التاريخي للتعاقدات والخبرات السابقة:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {experiences.map(exp => (
                  <div key={exp.id} style={{ background: '#fcfcfc', padding: '10px', borderRadius: '6px', borderRight: '3px solid var(--gold-primary)', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#2c3e50', marginBottom: '4px' }}>
                      <span>🏢 الجهة/العميل: {exp.entity}</span>
                      <span style={{ fontSize: '11px', color: exp.isCurrent ? '#27ae60' : '#7f8c8d' }}>⏳ {exp.start} ⬅️ {exp.end}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#34495e' }}>طبيعة العمل والتعاقد: <strong>{exp.title}</strong></div>
                  </div>
                ))}
                {experiences.length === 0 && <p style={{ color: '#7f8c8d', fontSize: '11px' }}>لم يتم إدراج تعاقدات أو خبرات قانونية بجدول العمل حتى الآن...</p>}
              </div>

              {/* سياج الإقرار والضمان القانوني الموحد */}
              <div style={{ marginTop: '30px', borderTop: '1px dashed #ddd', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: '#7f8c8d' }}>
                ⚖️ <strong>إقرار قانوني موحد:</strong> نقر ونشهد بصحة كافة البيانات والقدرات والمستندات المدونة أعلاه تحت طائلة المسؤولية المدنية والمهنية الكاملة لعام 2026 م.
              </div>
            </div>

            {/* ترويسة تذيل الورقة وتثبيت التتر القياسي */}
            <div style={{ position: 'absolute', bottom: '6mm', left: '15mm', right: '15mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#7f8c8d', borderTop: '1px solid #eee', paddingTop: '4px', fontFamily: 'monospace' }}>
              <span>🌐 صياغة وتوثيق سيادي عبر منصة: OURO Steps</span>
              <strong>صفحة رقم (1)</strong>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OuroCvEngine;
