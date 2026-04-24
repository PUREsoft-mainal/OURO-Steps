const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ['websocket', 'polling']
});

// مسارات الملفات
const adsFilePath = path.join(__dirname, 'ads.json');
const usersFilePath = path.join(__dirname, 'users.json');
const chatFilePath = path.join(__dirname, 'chat.json');
const uploadsDir = './uploads';

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static('uploads'));

// متغيرات الحالة
let activeUsers = 0;
let groups = [{ id: 'public', name: 'المجموعة العامة' }];
let roomMessages = { 'public': [] };

// --- الدوال المساعدة ---
const getUsers = () => {
    try {
        if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, '[]');
        return JSON.parse(fs.readFileSync(usersFilePath));
    } catch (e) { return []; }
};

const getAdsFromFile = () => {
    try {
        if (!fs.existsSync(adsFilePath)) fs.writeFileSync(adsFilePath, '[]');
        return JSON.parse(fs.readFileSync(adsFilePath));
    } catch (e) { return []; }
};

const saveMessage = (msg, roomId = 'public') => {
    if (!roomMessages[roomId]) roomMessages[roomId] = [];
    roomMessages[roomId].push(msg);
    // اختياري: حفظ في ملف chat.json لضمان الاستمرارية
};

const aiSecurityCheck = (data) => {
    const suspiciousPatterns = /<script|drop table|select|union/i;
    return suspiciousPatterns.test(JSON.stringify(data));
};

// --- منطق Socket.io ---
io.on('connection', (socket) => {
    activeUsers++;
    
    // تحديث الإحصائيات للجميع
    const updateAllStats = () => {
        io.emit('update_stats', {
            totalUsers: getUsers().length,
            activeUsers: activeUsers
        });
    };

    updateAllStats();

    socket.on('join', (loginData) => {
        const users = getUsers();
        const foundUser = users.find(u => u.username === 
    // ... كود البحث عن المستخدم ...
    if (foundUser) {
        socket.user = foundUser;
        socket.join("public"); // هذا السطر ضروري جداً لاستقبال الرسائل
        
        socket.emit('init_data', { 
            ads: getAdsFromFile(), 
            chatHistory: roomMessages['public'] || [], 
            user: foundUser,
            stats: { totalUsers: getUsers().length, activeUsers: activeUsers }
        });
    }
});

            });
        } else {
            socket.emit('error_msg', 'خطأ في البيانات!');
        }
    });

    socket.on('register', (newData) => {
        const users = getUsers();
        if (users.find(u => u.username === newData.username)) {
            socket.emit('error_msg', 'الاسم موجود!');
        } else {
            const newUser = { ...newData, user_id: '#' + Math.floor(10000 + Math.random() * 90000) };
            users.push(newUser);
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
            socket.emit('register_success', newUser);
            updateAllStats();
        }
    });

// ابحث عن sendMessage في server.js واستبدلها بهذا:
socket.on('sendMessage', (data) => {
    if (!socket.user) return;
    
    // فحص إذا كانت البيانات نصاً فقط أو كائن يحتوي على text
    const messageText = typeof data === 'string' ? data : data.text;
    const targetRoom = data.roomId || 'public'; // إذا لم يتم تحديد غرفة، نرسل للعامة

    if (aiSecurityCheck(messageText)) {
        socket.emit('security_alert', "محاولة اختراق مكتشفة!");
        return;
    }

    const msg = {
        id: Date.now(),
        user: socket.user.username,
        user_id: socket.user.user_id,
        role: socket.user.role,
        text: messageText,
        roomId: targetRoom,
        time: new Date().toLocaleTimeString()
    };

    saveMessage(msg, targetRoom);
    
    // إرسال للغرفة المحددة + إرسال نسخة للمرسل نفسه للتأكيد
    io.to(targetRoom).emit('message', msg);
    
    // لضمان الظهور في "المجموعة العامة" دائماً إذا كان المستخدم لم ينضم لغرف بعد
    if (targetRoom === 'public') {
        socket.broadcast.emit('message', msg); 
    }
});


// --- مسارات الرفع API ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/', upload.single('adImage'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "لا توجد صورة" });
    const fullImageUrl = `http://127.0.0{req.file.filename}`;
    try {
        let allAds = getAdsFromFile();
        const newAd = { id: Date.now(), imgUrl: fullImageUrl, link: fullImageUrl, isActive: true };
        allAds.push(newAd);
        fs.writeFileSync(adsFilePath, JSON.stringify(allAds, null, 2));
        io.emit('update_ads', allAds); // تحديث فوري للواجهة
        res.json({ success: true, ad: newAd });
    } catch (err) { res.status(500).send("خطأ"); }
});

server.listen(5050, "127.0.0.1", () => {
    console.log('🚀 Server running on http://127.0.0.1:5050');
});

