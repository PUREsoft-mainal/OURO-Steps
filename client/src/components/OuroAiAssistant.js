/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const OuroAiAssistant = ({ user, API_BASE, onClose }) => {
  // 🔒 أ) أقفال التراخيص السنوية ومصيدة التحقق من ترخيص ال-AI فالسحاب
  const [hasAiAccess, setHasAiAccess] = useState(false);
  const [requestPending, setRequestPending] = useState(false);

  // 💬 ب) مصفوفة كابينة الشات التفاعلي المتبادل وصندوق الرسائل الحية
  const [messages, setMessages] = useState([
    { id: 'genesis', sender: 'ai', text: `مرحباً بك يا صديقي الملكي 👑 أنا المساعد الذكي المطور لمنصة OURO Steps لعام 2026! كيف يمكنني صياغة البرمجيات أو أتمتة حساباتك ومصانعك الآن؟ 🤖✨` }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const isAdmin = user?.username === 'Admin_Mostafa' || user?.role === 'Admin';

  // ⏳ خطاف المراقبة وفحص صلاحية الاشتراك السنوي للذكاء الاصطناعي فور إقلاع الصفحة
  useEffect(() => {
    if (user) {
      // إذا كان الحساب يمتلك صلاحية canAccessAI المسجلة بـ Atlas أو كان هو الأدمن الكلي Mostafa
      if (user.canAccessAI || user.username === 'Admin_Mostafa' || user.role === 'Admin') {
        setHasAiAccess(true);
      }
    }
  }, [user]);

  // دحرجة وتمرير الشات تلقائياً لأسفل الرسائل المتدفقة حياً
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
    // 🚀 دالة العضو لإرسال طلب الاشتراك السنوي في ال-AI للأدمن Mostafa
  const handleRequestAiLicense = async () => {
    try {
      setRequestPending(true);
      // استخدام مسار الطلبات المركزي لإخطار لوحة تحكم الأدمن Mostafa حياً بالـ ID
      const res = await axios.post(`${API_BASE}/api/company/request-access`, { 
        username: user?.username,
        type: 'ai_system' 
      });
      if (res.data.success) {
        alert("🚀 طيران سحابي: تم إرسال طلب تفعيل المساعد الذكي السنوي للأدمن Mostafa بنجاح باهر!");
      }
    } catch (err) {
      alert("❌ فشل إرسال الطلب، تحقق من استقرار اتصال السيرفر.");
    } finally {
      setRequestPending(false);
    }
  };

  // 🎯 دالة صياغة وإرسال الرسالة الحية وقنص جواب ذكاء جوجل الاصطناعي طيراناً
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: inputPrompt.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentPrompt = inputPrompt.trim();
    setInputPrompt("");
    setIsLoading(true);

    try {
      // ضرب مسار معالجة ذكاء جوجل المباشر بالسيرفر دون تدوين ملفات على الهارد
      const res = await axios.post(`${API_BASE}/api/ai/chat`, {
        username: user?.username,
        prompt: currentPrompt
      });

      if (res.data.success) {
        setMessages(prev => [...prev, {
          id: 'reply_' + Date.now(),
          sender: 'ai',
          text: res.data.reply
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: res.data.message || "❌ فشل استدعاء مصفوفة جوجل، يرجى مراجعة الإدارة وتفعيل رخصتك."
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text: "❌ عذراً، تعذر الاتصال بمحرك الذكاء الاصطناعي السحابي، تحقق من السيرفر."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="discovery-overlay" onClick={onClose}>
      <div className="discovery-window gold-border scrollbar-gold" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '650px', background: '#070707', padding: '20px', borderRadius: '12px', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* ترويسة نافذة المساعد الذكي الملكي */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(155,89,182,0.3)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ color: '#9b59b6', margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Sovereign AI Assistant - المساعد الذكي الملكي لـ جوجل</h3>
              <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>🔐 مدعوم بمصفوفة محركات السحاب لـ Google Gemini 1.5 Flash 👑</small>
            </div>
          </div>
          <button className="close-discovery" onClick={onClose} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>

        {/* 🔒 جدار الحجب والتحقق من التراخيص والاشتراك السنوي المدفوع للذكاء الاصطناعي */}
        {!hasAiAccess && !isAdmin ? (
          <div style={{ textAlign: 'center', padding: '35px 20px', background: '#000', borderRadius: '8px', border: '1px solid #9b59b6', boxShadow: '0 0 15px rgba(155,89,182,0.1)' }}>
            <span style={{ fontSize: '50px' }}>🔒</span>
            <h4 style={{ color: '#fff', marginTop: '15px', fontSize: '14px' }}>عذراً، المساعد الذكي السحابي AI غير مفعل لحسابك الملكي!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', maxWidth: '480px', margin: '10px auto', lineHeight: '1.5' }}>
              لفتح بوابات شات الذكاء الاصطناعي، وتوليد الأكواد، وتلخيص المذكرات، يجب إرسال طلب ترخيص سنوي للأدمن لتوثيق صلاحية حسابك لمدة سنة كاملة (365 يوماً).
            </p>
            <button type="button" onClick={handleRequestAiLicense} disabled={requestPending} style={{ background: '#9b59b6', color: '#fff', fontWeight: 'bold', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 0 10px rgba(155,89,182,0.3)' }}>
              {requestPending ? "⏳ جاري إرسال طلب الترخيص..." : "🌟 إرسال طلب تفعيل سنوي للأدمن مصطفى"}
            </button>
          </div>
        ) : (
          /* صندوق الشات التفاعلي والرسائل المتدفقة حياً عند فتح الصلاحية */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="scrollbar-gold" style={{ width: '100%', height: '320px', background: '#000', borderRadius: '8px', border: '1px solid var(--border-glass)', padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{ maxWidth: '85%', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', lineHeight: '1.6', background: msg.sender === 'user' ? 'rgba(155,89,182,0.15)' : '#111', border: msg.sender === 'user' ? '1px solid rgba(155,89,182,0.3)' : '1px solid rgba(255,255,255,0.03)', color: '#fff', textAlign: 'right', direction: 'rtl', whiteSpace: 'pre-wrap' }}>
                    <small style={{ display: 'block', color: msg.sender === 'user' ? '#9b59b6' : 'var(--gold-primary)', fontWeight: 'bold', marginBottom: '3px' }}>{msg.sender === 'user' ? '👤 أنت:' : '🤖 المساعد الذكي AI:'}</small>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', alignSelf: 'flex-start' }}>
                  <span style={{ fontSize: '14px', animation: 'spin 1s infinite linear' }}>⏳</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>جاري طرق بوابات جوجل والتحليل الذكي حياً فالسحاب...</small>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* نموذج صندوق التعبئة والكتابة الفوري في قاع شات ال-AI السلس */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
              <input 
                type="text" 
                placeholder="اسأل المساعد الذكي عن أي شيء، صياغة ملازم، أو كتابة أكواد برمجية..."
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                disabled={isLoading}
                style={{ flex: 1, padding: '8px 12px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px', direction: 'rtl' }}
                required
              />
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ padding: '8px 16px', background: '#9b59b6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', boxShadow: '0 0 10px rgba(155,89,182,0.2)' }}
              >
                🎯 اسأل
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default OuroAiAssistant; // 👑 التصدير القياسي للمكون بنقاء ثبات فلكي 100%
