import React from 'react';

const LoginBox = ({ isSignUp, setIsSignUp, user, setUser, password, setPassword, handleAction }) => {
  
  // دالة وسيطة للتأكد من أن الضغط يعمل
  const onFormSubmit = (e) => {
    e.preventDefault();
    console.log("الزر استجاب! البيانات المرسلة:", user.username, password);
    handleAction(e); // استدعاء الدالة الأصلية من App.js
  };

  return (
    <div className="login-box" style={{ zIndex: 100, position: 'relative' }}>
      <img src="/assets/logo.png" className="main-logo" alt="OURO" />
      <h2 style={{color: '#d4af37'}}>{isSignUp ? "إنشاء حساب جديد" : "دخول المنصة الملكية"}</h2>
      
      <form onSubmit={onFormSubmit}>
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            <input 
              type="text"
              placeholder="اسم المستخدم" 
              value={user.username || ''}
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
                value={user.role || ''} 
                onChange={e => setUser({...user, role: e.target.value})} 
                required
              >
                <option value="">اختر التخصص</option>
                <option value="مبرمج">💻 مبرمج</option>
                <option value="تاجر">💰 تاجر</option>
                <option value="other">✍️ أخرى</option>
              </select>
            )}

            <button 
              type="submit" 
              className="login-btn"
              style={{cursor: 'pointer', pointerEvents: 'auto'}}
            >
              {isSignUp ? "تأكيد التسجيل السحابي" : "دخول آمن للمنصة"}
            </button>
        </div>
      </form>

      <p onClick={() => setIsSignUp(!isSignUp)} style={{cursor:'pointer', color:'#d4af37', marginTop:'20px'}}>
        {isSignUp ? "لديك حساب؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ هويتك"}
      </p>
    </div>
  );
};

export default LoginBox;

