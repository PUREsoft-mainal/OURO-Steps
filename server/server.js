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

// 1. إعدادات السحاب (Cloudinary)
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

// 2. الاتصال بقاعدة البيانات (MongoDB)
const mongoURI = "mongodb+srv://mostafa:01027411921@cluster0.kgw7td9.mongodb.net/ouro_db?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("✅ متصل بـ MongoDB Atlas")).catch(err => console.log("❌ خطأ اتصال:", err));

// 3. تعريف "الجداول" (Schemas)
const User = mongoose.model('User', { username: String, password: String, role: String });
const Chat = mongoose.model('Chat', { user: String, role: String, text: String, time: String });
const Ad = mongoose.model('Ad', { imgUrl: String, phone: String, whatsapp: String, telegram: String, email: String });

// تعريف جدول المجموعات الخاصة
const Group = mongoose.model('Group', { 
    name: String, 
    owner: String, 
    members: [String], 
    createdAt: { type: Date, default: Date.now } 
});

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
});

let activeUsers = 0;

io.on('connection', async (socket) => {
    activeUsers++;
    console.log("📡 مستخدم متصل بالسيرفر");

    // 1. تسجيل الدخول والاشتراك
    socket.on('join', async (data) => {
        let user = await User.findOne({ username: data.username, password: data.password });
        
        if (!user && data.username === 'Admin_Mostafa' && data.password === '123') {
            user = await User.create({ username: 'Admin_Mostafa', password: '123', role: 'Admin' });
        }

        if (user) {
            socket.user = user;
            const ads = await Ad.find();
            const chatHistory = await Chat.find().limit(50);
            const totalUsers = await User.countDocuments();
            
            // جلب المجموعات التي يكون المستخدم عضواً فيها
            const userGroups = await Group.find({ members: user.username });

            socket.emit('login_success', user); 
            socket.emit('init_data', { ads, chatHistory, user, stats: { totalUsers, activeUsers }, groups: userGroups });
        } else {
            socket.emit('error_msg', 'خطأ في اسم المستخدم أو كلمة السر!');
        }
    });

    // 2. كود تسجيل الحسابات الجديدة
    socket.on('register', async (data) => {
        try {
            const existingUser = await User.findOne({ username: data.username });
            if (existingUser) return socket.emit('error_msg', 'عذراً، هذا الاسم محجوز مسبقاً!');

            const newUser = await User.create({ 
                username: data.username, 
                password: data.password, 
                role: data.role || 'مستخدم' 
            });

            if (newUser) {
                socket.emit('register_success', newUser); 
                const totalUsers = await User.countDocuments();
                io.emit('update_stats', { totalUsers, activeUsers });
            }
        } catch (err) {
            socket.emit('error_msg', 'حدث خطأ فني أثناء التسجيل');
        }
    });

    // 3. إنشاء شات جديد (تم نقله للمكان الصحيح)
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
        } catch (err) {
            socket.emit('error_msg', 'فشل إنشاء المجموعة');
        }
    });

    // 4. إضافة مستخدم لشات موجود (تم نقله للمكان الصحيح)
    socket.on('add_member', async (data) => {
        try {
            const group = await Group.findById(data.groupId);
            if (group && !group.members.includes(data.targetUser)) {
                group.members.push(data.targetUser);
                await group.save();
                
                io.emit('added_to_group', { groupId: group._id, groupName: group.name, targetUser: data.targetUser });
                socket.emit('error_msg', `تمت إضافة ${data.targetUser} بنجاح!`);
            }
        } catch (err) {
            socket.emit('error_msg', 'فشل إضافة العضو');
        }
    });

    // 5. إرسال الرسائل
    socket.on('sendMessage', async (data) => {
        if (!socket.user) return;
        const msgText = typeof data === 'string' ? data : data.text;
        const msg = { 
            user: socket.user.username, 
            role: socket.user.role, 
            text: msgText, 
            time: new Date().toLocaleTimeString() 
        };
        await Chat.create(msg);
        io.emit('message', msg);
    });

    socket.on('disconnect', () => { 
        activeUsers--; 
    });
});

// 6. مسارات الرفع السحابية (رفع الإعلانات)
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
    } catch (err) { 
        res.status(500).json({ success: false }); 
    }
});

// 7. تشغيل السيرفر
const PORT = process.env.PORT || 7860; 
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 السيرفر يعمل الآن على بورت ${PORT}`);
});
