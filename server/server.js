const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// --- إعدادات السحاب (Cloudinary) ---
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

// --- الاتصال بقاعدة البيانات (MongoDB) ---
const mongoURI = "mongodb+srv://mostafa:01027411921@cluster0.kgw7td9.mongodb.net/ouro_db?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("✅ متصل بـ MongoDB Atlas")).catch(err => console.log("❌ خطأ اتصال:", err));

// --- تعريف الجداول (Schemas) ---
const User = mongoose.model('User', { 
    username: String, 
    password: String, 
    role: String, 
    friends: [String] // مصفوفة لأسماء الأصدقاء
});
const Chat = mongoose.model('Chat', { user: String, role: String, text: String, time: String });
const Ad = mongoose.model('Ad', { imgUrl: String, phone: String, whatsapp: String, telegram: String, email: String });
const Group = mongoose.model('Group', { name: String, owner: String, members: [String], createdAt: { type: Date, default: Date.now } });

// جدول السوق الجديد
const MarketPost = mongoose.model('MarketPost', {
    uploader: String,
    imgUrl: String,
    description: String,
    price: String,
    createdAt: { type: Date, default: Date.now }
});

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  allowEIO3: true
});

let activeUsers = 0;

io.on('connection', async (socket) => {
    activeUsers++;
    
    // --- [1] نظام الدخول والبيانات ---
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

    // --- [2] نظام المجموعات (تعديل الانتقال التلقائي) ---
    socket.on('create_group', async (data) => {
        try {
            if (!socket.user) return;
            const newGroup = await Group.create({
                name: data.groupName,
                owner: socket.user.username,
                members: [socket.user.username]
            });
            socket.join(newGroup._id.toString());
            // نرسل الـ Group كامل للمنشئ ليعمل الانتقال في App.js
            socket.emit('new_group_success', newGroup);
        } catch (err) { socket.emit('error_msg', 'فشل إنشاء المجموعة'); }
    });

    // --- [3] نظام الأصدقاء (جديد) ---
    socket.on('toggle_friend', async (data) => {
        try {
            if (!socket.user) return;
            const currentUser = await User.findOne({ username: socket.user.username });
            const targetUser = data.targetUser;

            if (currentUser.friends.includes(targetUser)) {
                // إلغاء الصداقة
                currentUser.friends = currentUser.friends.filter(name => name !== targetUser);
                await currentUser.save();
                socket.emit('friend_updated', { targetUser, status: 'add', message: 'تم إلغاء الصداقة' });
            } else {
                // إضافة صديق
                currentUser.friends.push(targetUser);
                await currentUser.save();
                socket.emit('friend_updated', { targetUser, status: 'remove', message: 'تمت إضافة الصديق' });
            }
        } catch (err) { console.error(err); }
    });

    // ... (بقية أكواد الرسائل كما هي) ...
    socket.on('sendMessage', async (data) => {
        if (!socket.user) return;
        const msg = { user: socket.user.username, role: socket.user.role, text: data.text || data, time: new Date().toLocaleTimeString() };
        await Chat.create(msg);
        io.emit('message', msg);
    });

    socket.on('disconnect', () => { activeUsers--; });
});

// --- [4] مسارات الـ API للسوق والمستخدمين ---
app.get('/api/users', async (req, res) => {
    const users = await User.find({}, 'username role friends');
    res.json(users);
});

app.post('/api/market/upload', upload.single('marketImage'), async (req, res) => {
    try {
        const newPost = await MarketPost.create({
            uploader: req.body.username,
            imgUrl: req.file.path,
            description: req.body.description,
            price: req.body.price
        });
        res.json({ success: true, post: newPost });
    } catch (err) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 7860; 
server.listen(PORT, "0.0.0.0", () => { console.log(`🚀 السيرفر يعمل على بورت ${PORT}`); });
