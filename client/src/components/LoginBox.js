import React from 'react';
import '../App.css'; // استدعاء ملف التنسيق الشامل ليعمل على هذا الصندوق فوراً

const LoginBox = ({ isSignUp, setIsSignUp, user, setUser, password, setPassword, handleAction }) => {
  
  // دالة وسيطة للتأكد من أن الضغط يعمل واختبار المدخلات محلياً
  const onFormSubmit = (e) => {
    e.preventDefault();
    console.log("🚀 تم الضغط على زر الدخول المحلي! البيانات المستهدفة:", user.username);
    handleAction(e); // استدعاء الدالة الأصلية من App.js لتوجيه إشارة السوكيت المحلي
  };

  return (
    <div className="login-box-wrapper">
    <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} className="main-logo" alt="OURO" style={{ width: '320px', height: 'auto', display: 'block', margin: '0 auto 20px' }} />      <h2 className="login-title">{isSignUp ? "إنشاء حساب ملكي جديد" : "دخول المنصة المحلية"}</h2>
      
      <form onSubmit={onFormSubmit}>
        <div className="login-fields-container">
            <input 
              type="text"
              placeholder="اسم المستخدم" 
              value={user?.username || ''}
              onChange={e => setUser({...user, username: e.target.value})} 
              required 
            />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              value={password || ''}
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            
            {isSignUp && (
              <select 
                value={user?.role || ''} 
                onChange={e => setUser({...user, role: e.target.value})} 
                required
              >
                <option value="">اختر التخصص</option>
                <option value="مبرمج">💻 مبرمج</option>
                <option value="تاجر">💰 تاجر</option>
                <option value="مستخدم">✍️ مستخدم عام</option>
              </select>
            )}

            <button 
              type="submit" 
              className="login-btn"
            >
              {isSignUp ? "تأكيد التسجيل المحلي" : "دخول آمن للمنصة"}
            </button>
        </div>
      </form>

      <p onClick={() => setIsSignUp(!isSignUp)} className="login-toggle-text">
        {isSignUp ? "لديك حساب بالفعل؟ سجل دخولك من هنا" : "ليس لديك حساب؟ أنشئ هويتك الآن"}
      </p>
    </div>
  );
};

export default LoginBox;

