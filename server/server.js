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
    console.log("📡 مستخدم جديد حاول الاتصال...");

    // 1. تسجيل الدخول والاشتراك
    socket.on('join', async (data) => {
        console.log(`🔑 محاولة دخول للمستخدم: ${data.username}`);
        let user = await User.findOne({ username: data.username, password: data.password });
        
        if (!user && data.username === 'Admin_Mostafa' && data.password === '123') {
            user = await User.create({ username: 'Admin_Mostafa', password: '123', role: 'Admin' });
        }

        if (user) {
            socket.user = user; // تخزين بيانات المستخدم في جلسة السوكيت
            console.log(`✅ تم تأكيد هوية: ${user.username}`);
            
            const ads = await Ad.find();
            const chatHistory = await Chat.find().limit(50);
            const totalUsers = await User.countDocuments();
            const userGroups = await Group.find({ members: user.username });

            socket.emit('login_success', user); 
            socket.emit('init_data', { ads, chatHistory, user, stats: { totalUsers, activeUsers }, groups: userGroups });
            io.emit('update_stats', { totalUsers, activeUsers }); // تحديث الجميع بالعدد الجديد
        } else {
            socket.emit('error_msg', 'خطأ في اسم المستخدم أو كلمة السر!');
        }
    });

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
                console.log(`🆕 مستخدم جديد سجل في المنصة: ${newUser.username}`);
                socket.emit('register_success', newUser); 
                const totalUsers = await User.countDocuments();
                io.emit('update_stats', { totalUsers, activeUsers });
            }
        } catch (err) {
            socket.emit('error_msg', 'حدث خطأ فني أثناء التسجيل');
        }
    });
    // 3. إنشاء شات جديد (نسخة مطورة ومضمونة التفاعل)
    socket.on('create_group', async (data) => {
        console.log("🛠 استلام طلب إنشاء مجموعة باسم:", data.groupName);
        try {
            let currentUser = socket.user;

            // إجراء احتياطي: إذا فقد السوكيت بيانات المستخدم، نحاول استعادتها
            if (!currentUser) {
                console.log("⚠️ بيانات الجلسة مفقودة، نحاول البحث عن المستخدم...");
                // نفترض أنك سترسل اسم المستخدم مع الطلب في المرات القادمة لزيادة الأمان
                // لكن حالياً سنخبر المستخدم بالمشكلة بدلاً من الصمت
                return socket.emit('error_msg', 'انتهت جلسة الدخول، يرجى إعادة تحميل الصفحة.');
            }

            const newGroup = await Group.create({
                name: data.groupName,
                owner: currentUser.username,
                members: [currentUser.username]
            });

            console.log(`✅ نجاح الإنشاء في MongoDB: ${newGroup.name}`);
            
            // جعل المنشئ ينضم للغرفة برمجياً
            socket.join(newGroup._id.toString());
            
            // إرسال النجاح للمنشئ
            socket.emit('new_group_success', newGroup);
            
            // تحديث القائمة عند الجميع فوراً ليروا المجموعة الجديدة
            io.emit('added_to_group', { 
                groupId: newGroup._id, 
                groupName: newGroup.name, 
                targetUser: currentUser.username 
            });

        } catch (err) {
            console.error("❌ خطأ في السيرفر أثناء الإنشاء:", err);
            socket.emit('error_msg', 'فشل تقني في إنشاء المجموعة');
        }
    });

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
        io.emit('update_stats', { activeUsers }); // تحديث العدد عند الجميع عند الخروج
    });
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
    } catch (err) { 
        res.status(500).json({ success: false }); 
    }
});

const PORT = process.env.PORT || 7860; 
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 السيرفر يعمل الآن على بورت ${PORT}`);
});
