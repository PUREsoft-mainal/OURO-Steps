/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OuroSocialFeed = ({ user, socket, API_BASE }) => {
  const [feedPosts, setFeedPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [postFiles, setPostFiles] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [activeReactionMenu, setActiveMenuId] = useState(null);

  // مصفوفة التفاعلات السداسية الرسمية المطلوبة لسيادتك
  const reactionTypes = [
    { type: 'like', emoji: '👍', label: 'إعجاب' },
    { type: 'love', emoji: '❤️', label: 'أحببته' },
    { type: 'agree', emoji: '🤝', label: 'أتفق معه' },
    { type: 'normal', emoji: '😐', label: 'عادي' },
    { type: 'sad', emoji: '😢', label: 'أحزنني' },
    { type: 'angry', emoji: '😡', label: 'أغضبني' }
  ];

  // 1️⃣ المزامنة الحية واستقبال المنشورات عبر السوكت
  useEffect(() => {
    if (socket) {
      socket.on('init_social_posts', (posts) => setFeedPosts(posts || []));
      socket.on('new_social_post', (post) => setFeedPosts(prev => [post, ...prev]));
      socket.on('social_post_updated', (updatedPost) => {
        setFeedPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
      });
      socket.on('social_post_deleted', (postId) => {
        setFeedPosts(prev => prev.filter(p => p.id !== postId));
      });
      
      socket.emit('get_social_posts');
    }
    return () => {
      if (socket) {
        socket.off('init_social_posts');
        socket.off('new_social_post');
        socket.off('social_post_updated');
        socket.off('social_post_deleted');
      }
    };
  }, [socket]);

    // 2️⃣ محرك النشر الرئيسي (دفع الداتا والميديا للسيرفر السحابي)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() && postFiles.length === 0) return alert("⚠️ لا يمكن نشر منشور فارغ!");

    const formData = new FormData();
    formData.append('username', user?.username || 'مستخدم مجهول');
    formData.append('text', postText.trim());

    if (postFiles.length > 0) {
      postFiles.forEach(file => formData.append('postImages', file));
    }

    try {
      const res = await axios.post(`${API_BASE}/api/social/create-post`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setPostText("");
        setPostFiles([]);
        const fileInput = document.getElementById('socialFileInput');
        if (fileInput) fileInput.value = "";
      }
    } catch (err) {
      alert("❌ فشل إرسال المنشور السحابي.");
    }
  };

  // 3️⃣ محرك حقن التفاعلات السداسية (Reactions)
  const handleReaction = (postId, reactionType) => {
    if (socket && user) {
      socket.emit('submit_post_reaction', { postId, username: user.username, reaction: reactionType });
      setActiveMenuId(null);
    }
  };

  // 4️⃣ محرك بث التعليقات الفورية (Comments)
  const handleAddComment = (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId] || "";
    if (!text.trim() || !socket || !user) return;

    socket.emit('submit_post_comment', {
      postId,
      commentId: 'comm_' + Date.now(),
      sender: user.username,
      text: text.trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

    // 5️⃣ شريان المشاركة وإعادة النشر (Share System)
  const handleSharePost = (originalPost) => {
    if (!window.confirm("🔄 هل تود إعادة مشاركة هذا المنشور على صفحتك الشخصية الآن؟")) return;
    if (socket && user) {
      socket.emit('share_social_post', {
        originalPostId: originalPost.id,
        sharerUsername: user.username
      });
      alert("🎉 تم إعادة النشر بنجاح على التغذية الحية!");
    }
  };

  // 6️⃣ المحرك الفيزيائي العملاق لتنزيل المنشور كملف PDF شامل بكامل تفاصيله
  const handleDownloadPDF = (postId) => {
    const element = document.getElementById(`printable-post-card-${postId}`);
    if (!element || !window.html2pdf) return alert("❌ محرك الطباعة غير متوفر حالياً.");

    const opt = {
      margin: 10,
      filename: `منشور_Ouro_${postId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    const controlButtons = element.querySelectorAll('.feed-action-bar, .comment-form-zone');
    controlButtons.forEach(btn => btn.style.display = 'none');

    window.html2pdf().from(element).set(opt).save().then(() => {
      controlButtons.forEach(btn => btn.style.display = 'flex');
    });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm("⚠️ هل أنت متأكد من حذف هذا المنشور وإبادته نهائياً Momento؟")) return;
    if (socket) socket.emit('delete_social_post', { postId });
  };

  return (
    <main className="chat-area scrollbar-gold" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '15px', overflowY: 'auto', background: 'transparent' }}>
      
      {/* 📣 كابينة صياغة ونشر منشور جديد (فيسبوك ستايل) */}
      <form className="market-upload-form gold-border" onSubmit={handleCreatePost} style={{ background: 'rgba(10,10,10,0.85)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <h4 style={{ color: 'var(--gold-primary)', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>✍️ أنشئ منشوراً جديداً في ساحة OURO Steps</h4>
        <textarea 
          placeholder="بماذا تفكر الآن؟ صغ شروحاتك، أفكارك، أو أكوادك البرمجية وانشرها حياً..." 
          value={postText}
          onChange={e => setPostText(e.target.value)}
          style={{ width: '100%', minHeight: '80px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '12px', fontSize: '13px', resize: 'none', outline: 'none', direction: 'rtl' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <div className="file-input-wrapper-gold">
            <input 
              type="file" 
              id="socialFileInput"
              multiple 
              accept="image/*" 
              onChange={e => setPostFiles(Array.from(e.target.files || []))}
              style={{ fontSize: '12px', color: 'var(--gold-primary)' }}
            />
          </div>
          <button type="submit" className="gold-btn" style={{ padding: '8px 24px', fontSize: '12px', fontWeight: 'bold' }}>✨ مشاركة المنشور</button>
        </div>
      </form>

      {/* 📰 شريط التغذية الحية ومصنع الكروت (Facebook Feed) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {feedPosts.map(post => {
          const isMyPost = user && post.uploader === user.username;
          const isAdmin = user && (user.username === 'Admin_Mostafa' || user.role === 'Admin');
          const totalReactions = post.reactions ? Object.values(post.reactions).filter(Boolean).length : 0;

          return (
            <div 
              key={post.id} 
              id={`printable-post-card-${post.id}`}
              className="facebook-post-card gold-border" 
              style={{ background: 'rgba(12,12,12,0.95)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-glass)', color: '#fff', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px', background: 'rgba(212,175,55,0.1)', borderRadius: '50%', width: '38px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {post.isShared ? '🔄' : '👑'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                    <span className="fb-uploader-name" style={{ color: 'var(--gold-glow)', fontWeight: 'bold', fontSize: '13px' }}>
                      {post.uploader} {post.isShared && <small style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>(شارك منشوراً)</small>}
                    </span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '9px' }}>⏱️ {post.time}</small>
                  </div>
                </div>
                {(isMyPost || isAdmin) && (
                  <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '22px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                )}
              </div>

              <div style={{ textAlign: 'right', marginBottom: '12px', direction: 'rtl' }}>
                {post.isShared && post.originalOwner && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRight: '3px solid var(--gold-primary)', borderRadius: '4px', marginBottom: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    👤 المنشور الأصلي بواسطة: <strong>{post.originalOwner}</strong>
                  </div>
                )}
                <p style={{ color: '#fff', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }}>{post.text}</p>
                
                {post.images && post.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {post.images.map((img, idx) => (
                      <img key={idx} src={img.startsWith('http') ? img : `${API_BASE}${img}`} alt="post-img" style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'var(--text-muted)', direction: 'rtl' }}>
                <div><span>📊 {totalReactions} تفاعلات</span></div>
                <span>💬 {post.comments ? post.comments.length : 0} تعليقات</span>
              </div>

              <div className="feed-action-bar" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', gap: '5px' }}>
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button" 
                    style={{ fontSize: '11px', padding: '5px 10px', background: 'transparent', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer' }}
                    onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                  >
                    {post.reactions && post.reactions[user?.username] ? `🎭 ${reactionTypes.find(r => r.type === post.reactions[user.username])?.emoji} ${reactionTypes.find(r => r.type === post.reactions[user.username])?.label}` : '🎭 تفاعل'}
                  </button>

                  {activeMenuId === post.id && (
                    <div style={{ position: 'absolute', bottom: '35px', right: '0', background: '#0a0a0a', border: '1px solid var(--gold-primary)', borderRadius: '30px', padding: '5px 12px', display: 'flex', gap: '8px', zIndex: 100, boxShadow: '0 0 15px rgba(212,175,55,0.3)' }}>
                      {reactionTypes.map(r => (
                        <button 
                          key={r.type} 
                          type="button" 
                          title={r.label}
                          onClick={() => handleReaction(post.id, r.type)}
                          style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', transition: '0.2s', transform: 'scale(1)' }}
                          onMouseOver={e => e.target.style.transform = 'scale(1.3)'}
                          onMouseOut={e => e.target.style.transform = 'scale(1)'}
                        >
                          {r.emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => handleSharePost(post)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer' }}>🔄 مشاركة</button>
                <button onClick={() => handleDownloadPDF(post.id)} style={{ background: 'none', border: 'none', color: '#27ae60', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📄 حفظ كـ PDF</button>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {post.comments && post.comments.map(c => (
                    <div key={c.commentId} style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', textAlign: 'right', direction: 'rtl' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                        <strong style={{ color: 'var(--gold-primary)' }}>👤 {c.sender}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{c.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#e0e0e0' }}>{c.text}</p>
                    </div>
                  ))}
                </div>

                <form className="comment-form-zone" onSubmit={(e) => handleAddComment(e, post.id)} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <input 
                    type="text" 
                    placeholder="اكتب تعليقك الملكي المستقر هنا..." 
                    value={commentInputs[post.id] || ""}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    style={{ flex: 1, padding: '6px 10px', background: '#000', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '11px', direction: 'rtl' }}
                    required
                  />
                  <button type="submit" style={{ background: 'var(--gold-primary)', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>بث</button>
                </form>
              </div>
            </div>
          );
        })}
        {feedPosts.length === 0 && (
          <p className="empty-text-gold" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '30px 0' }}>مساحة المنشورات شاغرة... صغ منشورك الأول بالأعلى لحفر اسمك بالساحة!</p>
        )}
      </div>
    </main>
  );
};

export default OuroSocialFeed;
