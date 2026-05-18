import React from 'react';
import '../App.css';

const ActionBar = ({ setShowDiscovery, setDiscoveryTab }) => {
  
  // دالة ذكية للتحكم في فتح النافذة وتوجيه التبويب في نفس اللحظة
  const handleButtonClick = (tabName) => {
    setDiscoveryTab(tabName);
    setShowDiscovery(true);
  };

  return (
    <div className="ouro-action-bar">
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('friends')}
      >
        🔍 إضافة أصدقاء
      </button>
      
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('friends')}
      >
        🤝 الأصدقاء
      </button>
      
      <button 
        className="action-bar-btn gold-glow-btn" 
        onClick={() => handleButtonClick('market')}
      >
        🛍️ السوق الملكي
      </button>
    </div>
  );
};

export default ActionBar;

