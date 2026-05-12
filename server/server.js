const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors');
const fs = require('fs'); 
const path = require('path'); 

const app = express();
const server = http.createServer(app);

// --- [1] إعدادات السحاب (Cloudinary) ---
cloudinary.config({
  cloud_name: 'Root', 
  api_key: '613142389192978',
  api_secret: 'QCbBBUp-sKeKY12hyMS6gZ89PZI'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'OURO_PROJECT',
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mp3']
  },
});
const upload = multer({ storage });

// --- [2] الاتصال بقاعدة البيانات (MongoDB Atlas) ---
const mongoURI = "mongodb+srv://mostafa:01027411921@cluster0.kgw7td9.mongodb.net/ouro_db?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("✅ متصل بـ MongoDB Atlas")).catch(err => console.log("❌ خطأ اتصال:", err));

// --- [3] تعريف الجداول (Schemas) ---
const User = mongoose.model('User', { 
    username: String, 
    password: String, 
    role: String, 
    friends: [String] 
});
const Chat = mongoose.model('Chat', { user: String, role: String, text: String, time: String });
const Ad = mongoose.model('Ad', { imgUrl: String, phone: String, whatsapp: String, telegram: String, email: String });
const Group = mongoose.model('Group', { name: String, owner: String, members: [String], createdAt: { type: Date, default: Date.now } });

const MarketPost = mongoose.model('MarketPost', {
    uploader: String,
    images: [String], 
    description: String,
    price: String,
    createdAt: { type: Date, default: Date.now }
});

// 🆕 تعريف جدول المحادثات الفردية في MongoDB (لأرشفة ملفات JSON لاحقاً)
const PrivateChat = mongoose.model('PrivateChat', {
    participants: [String],
    messages: [{ sender: String, text: String, timestamp: { type: Date, default: Date.now } }]
});

// 🆕 إعدادات المسارات المحلية للملفات
const CHATS_DIR = path.join(__dirname, 'data', 'chats');
const FRIENDS_FILE = path.join(__dirname, 'data', 'friends.json');

// التأكد من وجود المجلدات محلياً
if (!fs.existsSync(CHATS_DIR)) {
    fs.mkdirSync(CHATS_DIR, { recursive: true });
}

// 🆕 دالة جلب المستخدمين من ملف JSON المحلي
const getUsersFromFile = () => {
    try {
        if (fs.existsSync(FRIENDS_FILE)) {
            const data = fs.readFileSync(FRIENDS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (err) {
        console.error("❌ خطأ في قراءة ملف friends.json:", err);
        return [];
    }
};

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  allowEIO3: true
});

let activeUsers = 0;

io.on('connection', async (socket) => {
    activeUsers++;
    
    socket.on('join', async (data) => {
        let user = await User.findOne({ username: data.username, password: data.password });
        if (!user && data.username === 'Admin_Mostafa' && data.password === '123') {
            user = await User.create({ username: 'Admin_Mostafa', password: '123', role: 'Admin', friends: [] });
        }
        if (user) {
            socket.user = user;
            const ads = await Ad.find();
            const chatHistory = await Chat.find().limit(50);
            const totalUsers = await User.countDocuments();
            const userGroups = await Group.find({ members: user.username });
            const marketPosts = await MarketPost.find().sort({ createdAt: -1 });

            socket.emit('login_success', user); 
            socket.emit('init_data', { ads, chatHistory, user, stats: { totalUsers, activeUsers }, groups: userGroups, marketPosts });
        }
    });

    // 🆕 منطق إرسال رسالة خاصة وحفظها في ملف مع فحص الحجم
    socket.on('sendPrivateMessage', async (data) => {
        if (!socket.user) return;
        const { targetFriend, text } = data;
        const chatFileName = [socket.user.username, targetFriend].sort().join('_') + '.json';
        const filePath = path.join(CHATS_DIR, chatFileName);
        const MAX_SIZE_MB = 2;

        // 1. فحص الحجم
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size / (1024 * 1024) > MAX_SIZE_MB) {
                return socket.emit('error_msg', 'حجم ملف المحادثة ممتلئ، سيتم الأرشفة قريباً');
            }
        }

        // 2. هيكلة الرسالة مع التوقيت
        const newMessage = {
            sender: socket.user.username,
            text: text,
            timestamp: new Date().toISOString()
        };

        // 3. الحفظ في ملف JSON مستقل لكل صديقين
        let chatData = { messages: [] };
        if (fs.existsSync(filePath)) {
            chatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        chatData.messages.push(newMessage);
        fs.writeFileSync(filePath, JSON.stringify(chatData, null, 4));

        // 4. إرسال للطرف الآخر إذا كان متصلاً (اختياري)
        io.emit(`private_msg_${targetFriend}`, newMessage);
    });

    socket.on('create_group', async (data) => {
        try {
            if (!socket.user) return;
            const newGroup = await Group.create({
                name: data.groupName,
                owner: socket.user.username,
                members: [socket.user.username]
            });
            socket.join(newGroup._id.toString());
            socket.emit('new_group_success', newGroup);
        } catch (err) { socket.emit('error_msg', 'فشل إنشاء المجموعة'); }
    });

    socket.on('toggle_friend', async (data) => {
        try {
            if (!socket.user) return;
            const currentUser = await User.findOne({ username: socket.user.username });
            const targetUser = data.targetUser;

            if (currentUser.friends.includes(targetUser)) {
                currentUser.friends = currentUser.friends.filter(name => name !== targetUser);
                await currentUser.save();
                socket.emit('friend_updated', { targetUser, status: 'add', message: 'تم إلغاء الصداقة' });
            } else {
                currentUser.friends.push(targetUser);
                await currentUser.save();
                socket.emit('friend_updated', { targetUser, status: 'remove', message: 'تمت إضافة الصديق' });
            }
        } catch (err) { console.error(err); }
    });

    socket.on('sendMessage', async (data) => {
        if (!socket.user) return;
        const msg = { user: socket.user.username, role: socket.user.role, text: data.text || data, time: new Date().toLocaleTimeString() };
        await Chat.create(msg);
        io.emit('message', msg);
    });

    socket.on('disconnect', () => { activeUsers--; });
});

// --- [4] مسارات الـ API ---
app.get('/api/users', async (req, res) => {
    try {
        const fileUsers = getUsersFromFile();
        const dbUsers = await User.find({}, 'username role friends');
        const allUsersMap = new Map();
        fileUsers.forEach(u => allUsersMap.set(u.username, { ...u, friends: u.friends || [] }));
        dbUsers.forEach(u => allUsersMap.set(u.username, u));
        const finalUsers = Array.from(allUsersMap.values());
        res.json(finalUsers);
    } catch (err) {
        res.status(500).json({ error: "فشل جلب المستخدمين" });
    }
});

// 🆕 مسار جلب المحادثة الخاصة بملف JSON
app.get('/api/private-chat/:friendName', async (req, res) => {
    const { friendName } = req.params;
    const { currentUser } = req.query;
    const chatFileName = [currentUser, friendName].sort().join('_') + '.json';
    const filePath = path.join(CHATS_DIR, chatFileName);

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        res.json(JSON.parse(data));
    } else {
        res.json({ messages: [] });
    }
});

app.post('/api/market/upload', upload.array('marketImages', 5), async (req, res) => {
    try {
        const imageUrls = req.files.map(file => file.path); 
        const newPost = await MarketPost.create({
            uploader: req.body.username,
            images: imageUrls,
            description: req.body.description,
            price: req.body.price
        });
        res.json({ success: true, post: newPost });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ success: false }); 
    }
});

const PORT = process.env.PORT || 7860; 
server.listen(PORT, "0.0.0.0", () => { console.log(`🚀 السيرفر يعمل على بورت ${PORT}`); });
