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

// 1. إعدادات Cloudinary
cloudinary.config({
  cloud_name: 'Root', 
  api_key: '613142389192978',
  api_secret: 'QCbBBUp-sKeKY12hyMS6gZ89PZI'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'OURO_PROJECT',
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mp3', 'pdf', 'zip', 'rar']
  },
});
const upload = multer({ storage });

// 2. الاتصال بـ MongoDB
const mongoURI = "mongodb+srv://mostafa:01027411921@cluster0.kgw7td9.mongodb.net/ouro_db?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("✅ متصل بـ MongoDB Atlas")).catch(err => console.log("❌ خطأ اتصال:", err));

// 3. تعريف الجداول
const User = mongoose.model('User', { username: String, password: String, role: String });
const Chat = mongoose.model('Chat', { user: String, role: String, text: String, time: String });
const Ad = mongoose.model('Ad', { imgUrl: String, phone: String, whatsapp: String, telegram: String, email: String });
const Story = mongoose.model('Story', { name: String, url: String, uploader: String, time: { type: Date, default: Date.now } });

app.use(cors());
app.use(express.json());

// 4. تعريف الـ Socket.io
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ['websocket'] 
});

let activeUsers = 0;

// 5. مسارات الرفع (API Routes)
app.post('/api/upload-story', upload.single('file'), async (req, res) => {
    try {
        const newStory = await Story.create({
            name: req.file.originalname,
            url: req.file.path,
            uploader: req.body.uploader
        });
        io.emit('new_story', newStory); 
        res.json({ success: true, story: newStory });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/upload-ad', upload.single('adImage'), async (req, res) => {
    try {
        const newAd = await Ad.create({
            imgUrl: req.file.path,
            phone: req.body.phone,
            whatsapp: req.body.whatsapp,
            telegram: req.body.telegram,
            email: req.body.email
        });
        const allAds = await Ad.find();
        io.emit('update_ads', allAds);
        res.json({ success: true, ad: newAd });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 6. منطق الـ Socket Connection
io.on('connection', async (socket) => {
    activeUsers++;
    
    socket.on('join', async (data) => {
        let user = await User.findOne({ username: data.username, password: data.password });
        if (!user && data.username === 'Admin_Mostafa' && data.password === '123') {
            user = await User.create({ username: 'Admin_Mostafa', password: '123', role: 'Admin' });
        }
        if (user) {
            socket.user = user;
            const ads = await Ad.find();
            const chatHistory = await Chat.find().limit(50);
            const stories = await Story.find().sort({ time: -1 }).limit(20);
            const totalUsers = await User.countDocuments();
            
            socket.emit('login_success', user); 
            socket.emit('init_data', { ads, chatHistory, stories, user, stats: { totalUsers, activeUsers } });
        } else {
            socket.emit('error_msg', 'خطأ في البيانات!');
        }
    });

    socket.on('register', async (data) => {
        try {
            const existingUser = await User.findOne({ username: data.username });
            if (existingUser) return socket.emit('error_msg', 'الاسم موجود!');
            const newUser = await User.create({ username: data.username, password: data.password, role: 'مستخدم' });
            socket.emit('register_success', newUser);
            const totalUsers = await User.countDocuments();
            io.emit('update_stats', { totalUsers, activeUsers });
        } catch (err) { socket.emit('error_msg', 'فشل التسجيل'); }
    });

    socket.on('sendMessage', async (text) => {
        if (!socket.user) return;
        const msg = { user: socket.user.username, role: socket.user.role, text, time: new Date().toLocaleTimeString() };
        await Chat.create(msg);
        io.emit('message', msg);
    });

    socket.on('disconnect', () => { activeUsers--; });
});

// 7. تشغيل السيرفر
const PORT = process.env.PORT || 7860;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 السيرفر يعمل على بورت ${PORT}`);
});
