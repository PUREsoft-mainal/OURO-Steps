import React from 'react';

const UploadSidebar = ({ onUpload, files }) => {
  
  // دالة لتحديد أيقونة الملف بناءً على النوع
  const getFileIcon = (fileName) => {
    if (fileName.match(/\.(zip|rar|7z)$/i)) return "📦";
    if (fileName.match(/\.(pdf)$/i)) return "📄";
    if (fileName.match(/\.(js|html|css|py|json)$/i)) return "💻";
    return "📁";
  };

  return (
    <aside className="sidebar left-side stories-sidebar">
      <h3>🎬 مشاركة الوسائط والملفات</h3>
      
      {/* زر الرفع الشامل */}
      <input 
        type="file" 
        id="sideUp" 
        hidden 
        accept="image/*,video/*,audio/*,.pdf,.zip,.rar,.7z,.js,.html,.css,.json" 
        onChange={onUpload} 
      />
      <button className="upload-trigger" onClick={() => document.getElementById('sideUp').click()}>
        ✨ رفع (صور/فيديو/ملفات/أكواد)
      </button>

      <div className="stories-container">
        {files.map((f, i) => {
          // ملاحظة: في السحاب نستخدم الرابط المباشر القادم من Cloudinary (f.url)
          const fileUrl = f.url; 
          const isVideo = f.name.match(/\.(mp4|webm|ogg)$/i);
          const isImage = f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

          return (
            <div key={i} className="story-card">
              <div className="story-user-info">
                <span className="user-dot">●</span> {f.uploader || "مستخدم"}
              </div>
              
              <div className="story-content">
                {/* عرض الصور */}
                {isImage && <img src={fileUrl} alt="media" className="story-media" />}
                
                {/* عرض الفيديوهات */}
                {isVideo && (
                  <video controls className="story-media">
                    <source src={fileUrl} type="video/mp4" />
                  </video>
                )}

                {/* عرض الملفات الأخرى (PDF, ZIP, Code) */}
                {!isImage && !isVideo && (
                  <div className="file-attachment">
                    <span className="file-icon">{getFileIcon(f.name)}</span>
                    <span className="file-name">{f.name}</span>
                  </div>
                )}
              </div>
              
              <div className="story-footer">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                  🔗 فتح / تحميل
                </a>
                <span className="story-time">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default UploadSidebar;
