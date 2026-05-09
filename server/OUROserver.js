const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// 1. إعدادات الأمان والوصول (CORS) - مفتوحة بالكامل لمنع أي تعارض
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 2. إعدادات التخزين (الملفات والإعلانات)
const adsFilePath = path.join(__dirname, 'ads.json');
const usersFilePath = path.join(__dirname, 'users.json');
const chatFilePath = path.join(__dirname, 'chat.json');

// تأكد من استدعاء path في بداية الملف: const path = require('path');

// 1. تحديد مسار مجلد الرفع بشكل مطلق
const UPLOADS_PATH = path.join(__dirname, 'uploads');

// 2. التأكد من وجود المجلد (إذا لم يوجد سيقوم السيرفر بإنشائه فوراً)
if (!fs.existsSync(UPLOADS_PATH)) {
    fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

// 3. إعداد multer للتخزين في هذا المسار المحدد
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_PATH); // استخدام المسار المطلق هنا
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// 4. جعل المجلد متاحاً للواجهة (Static) بشكل صحيح
app.use('/uploads', express.static(UPLOADS_PATH));



// 3. السوكيت (Socket.io) - التوصيل والتحكم
const io = new Server(server, { cors: { origin: "*" } });

let activeUsers = 0;
let groups = [{ id: 'public', name: 'المجموعة العامة' }];

// دالات مساعدة لجلب البيانات
const getAds = () => { try { return JSON.parse(fs.readFileSync(adsFilePath)); } catch(e){ return []; } };
const getUsers = () => { try { return JSON.parse(fs.readFileSync(usersFilePath)); } catch(e){ return []; } };
const getChat = () => { try { return JSON.parse(fs.readFileSync(chatFilePath)); } catch(e){ return []; } };

io.on('connection', (socket) => {
    activeUsers++;
    io.emit('update_stats', { totalUsers: getUsers().length, activeUsers });

socket.on('join', (data) => {
    let users = getUsers();
    let user = users.find(u => u.username === data.username && u.password === data.password);

    // --- إضافة منقذ الأدمن (Admin Rescue) ---
    // إذا كنت أنت الأدمن ولم يجدك في الملف، سنقوم بتسجيلك فوراً
    if (!user && data.username === 'Admin_Mostafa' && data.password === '123') {
        user = { username: 'Admin_Mostafa', password: '123', role: 'Admin', id: Date.now() };
        users.push(user);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    }
    // --- نهاية الإضافة ---

    if (user) {
        socket.user = user;
        socket.join("public");
        socket.emit('init_data', { 
            ads: getAds(), 
            chatHistory: getChat(), 
            user, 
            stats: { totalUsers: users.length, activeUsers } 
        });
    } else {
        socket.emit('error_msg', 'خطأ في الاسم أو كلمة المرور!');
    }
});


    socket.on('sendMessage', (text) => {
        if (!socket.user) return;
        const msg = { id: Date.now(), user: socket.user.username, role: socket.user.role, text, time: new Date().toLocaleTimeString() };
        let history = getChat(); history.push(msg);
        fs.writeFileSync(chatFilePath, JSON.stringify(history, null, 2));
        io.emit('message', msg);
    });

    socket.on('create_group', (name) => {
        const newGroup = { id: 'grp_' + Date.now(), name };
        groups.push(newGroup);
        io.emit('new_group_added', newGroup);
    });

    socket.on('disconnect', () => { activeUsers--; io.emit('update_stats', { totalUsers: getUsers().length, activeUsers }); });
});

// 4. مسارات الرفع (API Routes) - تأكد من تطابق الروابط في الواجهة

// أ- رفع الملفات العامة
// أ- رفع الملفات العامة (الستوري)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('لم يتم اختيار ملف');
    // أضفنا التوقيت بدقة لترتيب الستوريات
    const fileInfo = { 
        name: req.file.originalname, 
        path: req.file.filename, 
        uploader: req.body.user, 
        timestamp: new Date().getTime() 
    };
    io.emit('new_file', fileInfo);
    res.json({ success: true });
});

// ب- رفع صور الإعلانات (تصحيح الرابط 127.0.0.1:5050)
app.post('/api/upload-ad', upload.single('adImage'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "لا توجد صورة" });

    // التصحيح: إضافة النقاط المفقودة، ورقم المنفذ :5050، ومجلد /uploads/
    const fullImageUrl = `http://127.0.0.1:5050/uploads/${req.file.filename}`;
    
    const newAd = { 
        id: Date.now(), 
        imgUrl: fullImageUrl, 
        link: fullImageUrl,
        phone: req.body.phone || '',
        email: req.body.email || '',
        whatsapp: req.body.whatsapp || '',
        telegram: req.body.telegram || '', 
        isActive: true 
    };

    try {
        let allAds = getAds();
        allAds.push(newAd);
        fs.writeFileSync(adsFilePath, JSON.stringify(allAds, null, 2));
        
        // تأكد أن App.js يستقبل هذا الحدث 'update_ads'
        io.emit('update_ads', allAds); 
        
        res.json({ success: true, ad: newAd });
    } catch (err) {
        console.error("Ad Upload Error:", err);
        res.status(500).json({ success: false });
    }
});

// 5. تشغيل السيرفر الموحد
server.listen(5050, "127.0.0.1", () => {
    console.log('🚀 OURO Steps Server is LIVE at http://127.0.0.1:5050');
});

