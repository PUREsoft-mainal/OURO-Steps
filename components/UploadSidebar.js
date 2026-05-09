import React from 'react';

const UploadSidebar = ({ onUpload, files, serverUrl }) => {
  return (
    <aside className="sidebar left-side stories-sidebar">
      <h3>🎬 قصص المستخدمين (Stories)</h3>
      
      {/* زر الرفع المطور */}
      <input type="file" id="sideUp" hidden accept="image/*,video/*,audio/*" onChange={onUpload} />
      <button className="upload-trigger" onClick={() => document.getElementById('sideUp').click()}>
        ✨ مشاركة حالة جديدة
      </button>

      <div className="stories-container">
        {files.map((f, i) => {
          const fileUrl = `${serverUrl}/uploads/${f.path}`;
          const isVideo = f.name.match(/\.(mp4|webm|ogg)$/i);
          const isImage = f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

          return (
            <div key={i} className="story-card">
              <div className="story-user-info">
                <span className="user-dot">●</span> {f.uploader || "مستخدم"}
              </div>
              
              <div className="story-content">
                {isImage && <img src={fileUrl} alt="story" className="story-media" />}
                {isVideo && (
                  <video controls className="story-media">
                    <source src={fileUrl} type="video/mp4" />
                  </video>
                )}
              </div>
              
              <div className="story-footer">
                <a href={fileUrl} download className="download-link">💾 حفظ</a>
                <span className="story-time">منذ قليل</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default UploadSidebar;

