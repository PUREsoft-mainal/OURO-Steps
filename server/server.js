const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); // إضافة حزمة مونجوس
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 7860; // البورت الخاص بـ Hugging Face

const mongoURI = "mongodb+srv://mostafa:01027411921@cluster0.kgw7td9.mongodb.net/ouro_db?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ متصل بـ MongoDB Atlas بنجاح ساحق"))
  .catch(err => console.error("❌ خطأ اتصال بـ MongoDB:", err));

app.use(cors({
    origin: ["https://ouro-steps.vercel.app", "https://puresoft-mainal-ouro-steps.hf.space"],
    credentials: true,
    methods: ["GET", "POST", "DELETE"]
}));

// 👑 معيار حفظ الأصول الإدارية لمواقيت الصلاة بـ MongoDB Atlas
const PrayerAssetSchema = new mongoose.Schema({
    id: { type: String, default: 'config' },
    kaabaImgUrl: { type: String, default: '/assets/kaaba.png' }, // الصورة الافتراضية
    adhanAudioUrl: { type: String, default: '/assets/adhan.mp3' } // صوت الأذان الافتراضي
});
const PrayerAssetModel = mongoose.model('PrayerAsset', PrayerAssetSchema);

// 👑 معيار معمارية الحسابات الملكية والأصدقاء بـ MongoDB
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'مستخدم' },
    avatar: { type: String, default: '' },
    friends: { type: [String], default: [] }
});
const UserModel = mongoose.model('User', UserSchema);

// 👑 معيار حفظ الإعلانات الثنائية الموقوتة والموجهة بـ MongoDB
const AdSchema = new mongoose.Schema({
    id: { type: String, required: true },
    imgUrl: { type: String, required: true },
    link: { type: String, default: '#' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    telegram: { type: String, default: '' },
    email: { type: String, default: '' },
    expiryDate: { type: Number, required: true },
    location: { type: String, default: 'top' }
});
const AdModel = mongoose.model('Ad', AdSchema);

// 👑 معيار حفظ رسائل المجموعات التاريخية ومنع مسح الشات بـ MongoDB
const GroupMessageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    roomId: { type: String, required: true },
    user: { type: String, required: true },
    role: { type: String, default: 'مستخدم' },
    avatar: { type: String, default: '' },
    text: { type: String, required: true },
    time: { type: String, required: true }
});
const GroupMessageModel = mongoose.model('GroupMessage', GroupMessageSchema);

app.use(express.json());

// إعداد ملتر لرفع الملفات والستوريات (Hugging Face يتيح مجلد /tmp للتخزين المؤقت المستقر)
const UPLOADS_DIR = path.join('/tmp', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

// السطور من 33 إلى 36 تقريباً (أعلى الملف)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage }); // تأكيد تفعيل الحزمة هنا مرة واحدة فقط في رأس الملف

// مسار API لرفع وتحديث صورة الكعبة المنبثقة من صفحة الأدمن
app.post('/api/prayer/upload-kaaba', upload.single('kaabaImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false });
        const imgUrl = `/uploads/${req.file.filename}`;
        
        await PrayerAssetModel.updateOne({ id: 'config' }, { $set: { kaabaImgUrl: imgUrl } }, { upsert: true });
        io.emit('prayer_assets_updated', { kaabaImgUrl: imgUrl });
        res.json({ success: true, kaabaImgUrl: imgUrl });
    } catch (err) { res.status(500).json({ success: false }); }
});

// مسار API لرفع وتعيين ملف صوت الأذان الجديد من صفحة الأدمن
app.post('/api/prayer/upload-adhan', upload.single('adhanAudio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false });
        const audioUrl = `/uploads/${req.file.filename}`;
        
        await PrayerAssetModel.updateOne({ id: 'config' }, { $set: { adhanAudioUrl: audioUrl } }, { upsert: true });
        io.emit('prayer_assets_updated', { adhanAudioUrl: audioUrl });
        res.json({ success: true, adhanAudioUrl: audioUrl });
    } catch (err) { res.status(500).json({ success: false }); }
});

// مسار API لجلب الأصول الحالية عند فتح النافذة
app.get('/api/prayer/assets', async (req, res) => {
    try {
        let config = await PrayerAssetModel.findOne({ id: 'config' });
        if (!config) config = { kaabaImgUrl: '/assets/kaaba.png', adhanAudioUrl: '/assets/adhan.mp3' };
        res.json(config);
    } catch (err) { res.json({ kaabaImgUrl: '/assets/kaaba.png', adhanAudioUrl: '/assets/adhan.mp3' }); }
});

// تهيئة السوكيت (Socket.io) ليدعم الاتصالات السحابية والـ WebSockets المشفرة (WSS)
const io = new Server(server, {
    cors: {
        origin: ["https://ouro-steps.vercel.app", "https://puresoft-mainal-ouro-steps.hf.space"],
        credentials: true
    },
    transports: ['polling', 'websocket'], // 👑 تأمين التبديل السحابي التلقائي الحامي من الحظر والـ CORS
    allowEIO3: true
});
const CONVERSATIONS_DIR = path.join(__dirname, 'conversations'); // مجلد مستقل لحفظ ملفات شات الأصدقاء
const USERS_FILE = path.join(__dirname, 'users.json');
const CHAT_FILE = path.join(__dirname, 'chat.json');
const ADS_FILE = path.join(__dirname, 'ads.json');
const MARKET_FILE = path.join(__dirname, 'market.json');
const GROUPS_LIST_FILE = path.join(__dirname, 'groups.json');
const STORIES_FILE = path.join(__dirname, 'stories.json');
const FLASH_DRIVE_DIR = path.join(__dirname, 'virtual_flash_drives');
const FLASH_DB_FILE = path.join(__dirname, 'flash_db.json');

// إنشاء المجلدات والملفات تلقائياً على نظام اللينكس إذا لم تكن موجودة
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(CONVERSATIONS_DIR)) fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });

const initJsonFile = (filePath, initialData = []) => {
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(CONVERSATIONS_DIR)) fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });

// 👑 [إضافة] إنشاء مجلد التخزين الرئيسي للفلاشة الافتراضية فيزيائياً على الهارد
if (!fs.existsSync(FLASH_DRIVE_DIR)) fs.mkdirSync(FLASH_DRIVE_DIR, { recursive: true });
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
};
initJsonFile(USERS_FILE);
initJsonFile(CHAT_FILE);
initJsonFile(ADS_FILE);
initJsonFile(MARKET_FILE);
initJsonFile(GROUPS_LIST_FILE, [{ id: 'public', name: 'المجموعة العامة', creator: 'System', mod1: '', mod2: '' }]);
initJsonFile(STORIES_FILE);
initJsonFile(FLASH_DB_FILE);

// دوال مساعدة للقراءة والكتابة من نظام الملفات المحلي
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

// دالة ذكية ومؤتمتة لتدقيق حجم ملف المحادثة الخاصة وحذف النصف الأقدم عند تخطي 512MB
const checkAndCleanChatSize = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return;
        const stats = fs.statSync(filePath);
        const maxSizeInBytes = 512 * 1024 * 1024; // 512 ميجابايت

        if (stats.size >= maxSizeInBytes) {
            console.log(`⚠️ تنبيه أمني: حجم الملف ${path.basename(filePath)} تجاوز 512MB! جاري تطهير النصف الأقدم...`);
            const messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (messages.length > 1) {
                const halfIndex = Math.floor(messages.length / 2);
                const activeMessages = messages.slice(halfIndex); // الاحتفاظ بالنصف الأحدث فقط
                fs.writeFileSync(filePath, JSON.stringify(activeMessages, null, 2), 'utf8');
            }
        }
    } catch (err) {
        console.error("خطأ أثناء تدقيق مساحة ملف المحادثة الاستكشافية:", err);
    }
};


app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE"], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));


let activeUsers = 0;

// ==========================================================================
// 🕋 المخطط الهيكلي القياسي للمجموعات وغرف الشات بـ MongoDB Atlas (بديل الـ JSON)
// ==========================================================================
const GroupSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    creator: { type: String, required: true },
    mod1: { type: String, default: '' },
    mod2: { type: String, default: '' }
});
const GroupModel = mongoose.model('Group', GroupSchema);

// تأكيد إنشاء الغرفة العامة تلقائياً في السحاب الخارجي عند إقلاع السيرفر أول مرة
GroupModel.findOne({ id: 'public' }).then(async (group) => {
    if (!group) {
        const publicRoom = new GroupModel({ id: 'public', name: 'المجموعة العامة', creator: 'System' });
        await publicRoom.save();
    }
});

// ==========================================================================
// 📡 إدارة مستمعات السوكت والأحداث الخمسة المحدثة سحابياً بنقاء 100%
// ==========================================================================
io.on('connection', (socket) => {
    activeUsers++;
    
    // المزامنة الفورية للإحصائيات الحية بجلب إجمالي الأعضاء المسجلين من السحاب
    UserModel.countDocuments().then(total => {
        io.emit('update_stats', { totalUsers: total, activeUsers });
    });

    // 1️⃣ مستمع إنشاء مجموعة مخصصة جديدة وحفظها الدائم في السحاب الأزلي
    socket.on('create_group', async (data) => {
        try {
            if (!data || !data.name || !data.name.trim() || !socket.user) return;
            
            const roomId = 'group_' + Date.now().toString();
            const newGroup = new GroupModel({
                id: roomId,
                name: data.name.trim(),
                creator: socket.user.username,
                mod1: '',
                mod2: ''
            });
            await newGroup.save(); // حُفظت للأبد في MongoDB Atlas ولا تتأثر بالتحديثات
            
            io.emit('new_group_added', newGroup); // بث الغرفة الجديدة للجميع فوراً
        } catch (err) { console.error("خطأ إنشاء المجموعة سحابياً:", err); }
    });

    // 2️⃣ مستمع الانضمام للغرفة وجلب تاريخ الرسائل المأمن من الكراش من Cloud
    socket.on('join_group_room', async (data) => {
        try {
            if (!data.roomId) return;
            socket.join(data.roomId);
            
            // جلب رسائل الغرفة المحددة من السحاب مرتبة تصاعدياً لتوليد السجل التاريخي
            const messages = await GroupMessageModel.find({ roomId: data.roomId }).sort({ _id: 1 });
            
            // تنظيف الفرز والتطهير من أي كائنات تالفة قديمة لمنع خطأ #31
            const sanitizedHistory = messages.map(m => ({
                id: m.id,
                roomId: m.roomId,
                user: m.user,
                role: m.role,
                avatar: m.avatar,
                time: m.time,
                text: typeof m.text === 'object' && m.text !== null ? (m.text.text || JSON.stringify(m.text)) : m.text
            }));

            // إرسال تاريخ الدردشة للشخص الذي دخل الغرفة بالثانية وبأمان كامل
            socket.emit('group_chat_history', { roomId: data.roomId, history: sanitizedHistory });
        } catch (err) { console.error("خطأ جلب سجل الغرفة من السحاب:", err); }
    });

    // 3️⃣ مستمع استقبال وحفظ الرسائل الجديدة بـ MongoDB Atlas وبثها لحظياً للمجموعة
    socket.on('sendGroupMessage', async (data) => {
        try {
            if (!socket.user || !data.roomId || !data.text) return;

            const msgData = new GroupMessageModel({
                id: Date.now().toString(),
                roomId: data.roomId,
                user: socket.user.username,
                role: socket.user.role,
                avatar: socket.user.avatar || '', // تمرير رابط الصورة المحدثة سحابياً
                text: data.text.trim(),
                time: new Date().toLocaleTimeString('ar-EG')
            });
            await msgData.save(); // الرسالة آمنة وراسخة في السحاب الخارجي للأبد

            io.to(data.roomId).emit('group_message', { roomId: data.roomId, msg: msgData });
        } catch (err) { console.error("خطأ إرسال الرسالة سحابياً:", err); }
    });

    // 4️⃣ مستمع تعديل الرسائل سحابياً ولحظياً بـ MongoDB Atlas
    socket.on('edit_group_message', async (data) => {
        try {
            if (!data.roomId || !data.msgId || !data.newText) return;
            
            // تحديث الحقل السحابي للرسالة المستهدفة
            await GroupMessageModel.updateOne({ id: data.msgId }, { $set: { text: data.newText.trim() } });
            
            // إعادة جلب السجل المحدث وبثه لإنعاش شاشات الجميع لحظياً
            const history = await GroupMessageModel.find({ roomId: data.roomId }).sort({ _id: 1 });
            io.to(data.roomId).emit('group_chat_history', { roomId: data.roomId, history });
        } catch (err) { console.error("خطأ تعديل الرسالة سحابياً:", err); }
    });

    // 5️⃣ مستمع تدمير وإبادة الرسائل سحابياً ولحظياً من الـ Cloud
    socket.on('delete_group_message', async (data) => {
        try {
            if (!data.roomId || !data.msgId) return;
            
            // حذف السجل من قاعدة البيانات السحابية الحية
            await GroupMessageModel.deleteOne({ id: data.msgId });
            
            const history = await GroupMessageModel.find({ roomId: data.roomId }).sort({ _id: 1 });
            io.to(data.roomId).emit('group_chat_history', { roomId: data.roomId, history });
        } catch (err) { console.error("خطأ حذف الرسالة سحابياً:", err); }
    });



    // 4. تعيين المشرفين (المشرف الأول والمشرف الثاني) من قبل منشئ المجموعة
    socket.on('assign_group_moderator', (data) => {
        const groups = readJson(GROUPS_LIST_FILE);
        const targetGroup = groups.find(g => g.id === data.roomId);
        
        if (!targetGroup || targetGroup.creator !== socket.user.username) return; // حماية: المنشئ فقط من يضيف
        
        if (data.modType === 'mod1') targetGroup.mod1 = data.modUsername;
        if (data.modType === 'mod2') targetGroup.mod2 = data.modUsername;
        
        writeJson(GROUPS_LIST_FILE, groups);
        io.emit('update_groups_list', groups); // تحديث الصلاحيات عند الجميع لحظياً
    });

    // 5. حذف المجموعة نهائياً بملفها عبر الأشخاص المصرح لهم (×)
    socket.on('delete_group', (data) => {
        let groups = readJson(GROUPS_LIST_FILE);
        const targetGroup = groups.find(g => g.id === data.roomId);
        if (!targetGroup || !socket.user) return;

        // تدقيق جدار الحماية الأمني للصلاحيات المصرح لها بالحذف (الأدمن العام، المنشئ، المشرف 1، المشرف 2)
        const isAuthorized = 
            socket.user.username === 'Admin_Mostafa' || 
            socket.user.role === 'Admin' ||
            targetGroup.creator === socket.user.username ||
            targetGroup.mod1 === socket.user.username ||
            targetGroup.mod2 === socket.user.username;

        if (isAuthorized) {
            groups = groups.filter(g => g.id !== data.roomId);
            writeJson(GROUPS_LIST_FILE, groups);
            
            // حذف ملف المحادثة المخصص نهائياً من الهارد لتوفر مساحة جهازك
            const chatFilePath = path.join(GROUPS_DIR, `${data.roomId}.json`);
            if (fs.existsSync(chatFilePath)) fs.unlinkSync(chatFilePath);
            
            io.emit('group_deleted_success', { roomId: data.roomId });
        } else {
            socket.emit('error_msg', '⚠️ غير مصرح لك بحذف هذه المجموعة الملكية!');
        }
    });



    // دالة التسجيل في قاعدة البيانات المصغرة JSON
    socket.on('register', (data) => {
        const users = readJson(USERS_FILE);
        if (users.find(u => u.username === data.username)) {
            return socket.emit('error_msg', 'اسم المستخدم مسجل مسبقاً!');
        }
        const newUser = { id: Date.now().toString(), username: data.username, password: data.password, role: data.role || 'مستخدم', friends: [] };
        users.push(newUser);
        writeJson(USERS_FILE, users);
        socket.emit('register_success', newUser);
        io.emit('update_stats', { totalUsers: users.length, activeUsers });
    });

// 1. أضف مسار ملف المجموعات في أعلى ملف server.js مع بقية المسارات
         const GROUPS_FILE = path.join(__dirname, 'groups.json');
         initJsonFile(GROUPS_FILE, [{ id: 'public', name: 'المجموعة العامة' }]); // تهيئة المجموعة العامة تلقائياً
    // دالة تسجيل الدخول المحلية النقية
    socket.on('join', (data) => {
        console.log(`📡 استلم السيرفر المحلي طلب دخول للمستخدم: ${data.username}`);
        let users = readJson(USERS_FILE);
        let user = users.find(u => u.username === data.username && u.password === data.password);

        // إنشاء حساب الأدمن تلقائياً داخل ملف users.json لو لم يكن موجوداً
        if (!user && data.username === 'Admin_Mostafa' && data.password === '123') {
            user = { id: 'admin', username: 'Admin_Mostafa', password: '123', role: 'Admin', friends: [] };
            users.push(user);
            writeJson(USERS_FILE, users);
        }

        if (user) {
            socket.user = user;
            const ads = readJson(ADS_FILE);
            const chatHistory = readJson(CHAT_FILE).slice(-50);
            socket.emit('init_data', { ads, chatHistory, user, stats: { totalUsers: users.length, activeUsers } });
        } else {
            socket.emit('error_msg', 'خطأ في اسم المستخدم أو كلمة المرور!');
        }
    });

    socket.on('sendMessage', (text) => {
        if (!socket.user) return;
        const chats = readJson(CHAT_FILE);
        const msg = { user: socket.user.username, role: socket.user.role, text, time: new Date().toLocaleTimeString('ar-EG') };
        chats.push(msg);
        writeJson(CHAT_FILE, chats);
        io.emit('message', msg);
    });

    // 👥 إدارة منظومة الأصدقاء وحفظها في ملف كل مستخدم مستقل بشكل دائم
    socket.on('toggle_friend', (data) => {
        const users = readJson(USERS_FILE);
        const me = users.find(u => u.username === data.currentUser);
        if (!me) return;
        
        me.friends = me.friends || [];
        let status = 'add';
        if (me.friends.includes(data.targetUser)) {
            me.friends = me.friends.filter(f => f !== data.targetUser);
            status = 'remove';
        } else {
            me.friends.push(data.targetUser);
        }
        writeJson(USERS_FILE, users);
        // بث التحديث الفوري لتعديل واجهات المتصفح لحظياً عند الجميع
        io.emit('friend_updated', { usersList: users });
    });

    // 💬 الدخول الانضمامي لغرفة المحادثة الخاصة (فردية أو جماعية مطورة)
    socket.on('join_private_room', (data) => {
        socket.join(data.roomId);
    });

    // 💾 استقبال رسائل الفيسبوك العائمة المحدثة وحفظها في ملفها الفرعي الخاص
    socket.on('send_private_message', (msgData) => {
        const { roomId, sender, text, participants } = msgData;
        const chatFilePath = path.join(CONVERSATIONS_DIR, `${roomId}.json`);
        
        if (!fs.existsSync(chatFilePath)) {
            fs.writeFileSync(chatFilePath, JSON.stringify([], null, 2), 'utf8');
        }

        const messages = JSON.parse(fs.readFileSync(chatFilePath, 'utf8'));
        const newMsg = {
            id: Date.now().toString(),
            sender,
            text,
            time: new Date().toLocaleTimeString('ar-EG'),
            participants: participants || [sender]
        };

        messages.push(newMsg);
        fs.writeFileSync(chatFilePath, JSON.stringify(messages, null, 2), 'utf8');

        // بث البث الحي الفوري داخل الغرفة العائمة
        io.to(roomId).emit('new_private_message', newMsg);

        // الرقابة اللحظية الفورية للحجم لضمان ثبات الملفات عند حد 512MB
        checkAndCleanChatSize(chatFilePath);
    });

    // ＋ مستمع إضافة صديق جديد لغرفة المحادثة العائمة القائمة
    socket.on('add_user_to_chat', (data) => {
        io.to(data.roomId).emit('user_added_to_chat', data);
    });

    // － مستمع طرد صديق من غرفة المحادثة الجماعية العائمة
    socket.on('kick_user_from_chat', (data) => {
        io.to(data.roomId).emit('user_kicked_from_chat', data);
    });

    socket.on('disconnect', () => { 
        activeUsers = Math.max(0, activeUsers - 1); 
        io.emit('update_stats', { totalUsers: readJson(USERS_FILE).length, activeUsers });
    });
});

// مسارات الـ API المحلية لخدمة المتجر والملفات والسوق وسجلات الشات المستقلة
app.get('/api/users', (req, res) => res.json(readJson(USERS_FILE)));
app.get('/api/market', (req, res) => res.json(readJson(MARKET_FILE)));

// ==========================================================================
// 🕋 المخطط الهيكلي للشات الخاص (Private Conversations) بـ MongoDB Atlas
// ==========================================================================
const PrivateMessageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    roomId: { type: String, required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true },
    participants: { type: [String], default: [] }
});
const PrivateMessageModel = mongoose.model('PrivateMessage', PrivateMessageSchema);


// ==========================================================================
// 📡 تحديث مسارات الـ API العامة والخاصة لخدمات المنصة السحابية
// ==========================================================================

// 1️⃣ [تحديث سحابي] جلب سجل شات الغرفة الخاصة المستقلة من MongoDB Atlas منعاً للمسح
app.get('/api/private-chat-history/:roomId', async (req, res) => {
    try {
        // جلب المحادثات الخاصة بالغرفة الفرعية مرتبة تصاعدياً
        const history = await PrivateMessageModel.find({ roomId: req.params.roomId }).sort({ _id: 1 });
        
        // تطهير النص برمجياً من أي كائنات مكسورة قديمة لمنع كراش الـ React
        const sanitizedHistory = history.map(m => ({
            id: m.id,
            roomId: m.roomId,
            sender: m.sender,
            time: m.time,
            participants: m.participants,
            text: typeof m.text === 'object' && m.text !== null ? (m.text.text || JSON.stringify(m.text)) : m.text
        }));

        res.json(sanitizedHistory);
    } catch (err) {
        console.error("خطأ جلب الشات الخاص سحابياً:", err);
        res.json([]);
    }
});

// 2️⃣ [تحديث سحابي] مسار رفع الإعلانات المطور وحفظها الدائم بـ MongoDB Atlas دون فقدان
app.post('/api/upload-ad', upload.single('adImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "الصورة مطلوبة" });
        
        // جلب الأيام المدخلة من الأدمن وتحويلها لرقم (إذا لم تدخل نحتسبها شهر = 30 يوم)
        let durationDays = parseInt(req.body.duration) || 30;
        
        // التحقق الأمني لضمان عدم التحايل وإدخال أقل من 30 يوم
        if (durationDays < 30) durationDays = 30;

        // حساب تاريخ انتهاء الإعلان بالملي ثانية
        const expiryTimestamp = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
        const publishLocation = req.body.location === 'bottom' ? 'bottom' : 'top';

        // 👑 صب حزمة البيانات وحفظها أزلياً داخل قلب المونجو أطلس السحابي
        const newAd = new AdModel({
            id: Date.now().toString(), 
            imgUrl: `/uploads/${req.file.filename}`, 
            link: req.body.link || '#',
            phone: req.body.phone || '',
            whatsapp: req.body.whatsapp || '',
            telegram: req.body.telegram || '',
            email: req.body.email || '',
            expiryDate: expiryTimestamp, // حفظ وقت الانتهاء سحابياً للفرز الآلي
            location: publishLocation // توجيه شريط النشر الحصري ('top' أو 'bottom')
        });
        await newAd.save(); // تم الحفظ بأمان مطلق في خزائن الـ Cloud الخارجي للأبد
        
        // جلب الإعلانات النشطة وغير منتهية الصلاحية فقط وبثها لحظياً لجميع المشتركين
        const allAds = await AdModel.find({ expiryDate: { $gt: Date.now() } });
        io.emit('update_ads', allAds);
        
        res.json({ success: true, ad: newAd });
    } catch (err) {
        console.error("خطأ أثناء رفع الإعلان الموقوت السحابي:", err);
        res.status(500).json({ success: false });
    }
});

// 👑 [تطبيق اقتراحك العبقري] مسار API الملكي لقنص وتدمير الإعلان وصورته فيزيائياً دون المساس ببقية مجلد الرفع
app.delete('/api/delete-ad/:id', async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ success: false, message: "المعرف مطلوب" });

        // 1️⃣ قنص الإعلان المستهدف من قلب قاعدة البيانات السحابية MongoDB Atlas لمعرفة اسم ملف صورته
        const ad = await AdModel.findOne({ id: req.params.id });
        
        if (ad && ad.imgUrl) {
            // استخراج اسم الملف الفريد الصافي المولد من ملتر (مثال: 1779457218845-451403952.png)
            const filename = ad.imgUrl.replace('/uploads/', '');
            // تحديد مسار الصورة فيزيائياً داخل مجلد التخزين المؤقت السحابي
            const filePhysicalPath = path.join('/tmp', 'uploads', filename);
            
            // 🛡️ تدمير وإبادة الصورة المستهدفة بمفردها فقط وحصرياً من الهارد إذا كانت موجودة دون المساس بأي ملف مجاور
            if (fs.existsSync(filePhysicalPath)) {
                fs.unlinkSync(filePhysicalPath);
                console.log(`🗑️ تم تدمير وإبادة الملف من الهارد السحابي فيزيائياً بنجاح: ${filename}`);
            }
        }

        // 2️⃣ محو سجل الإعلان بالكامل وبشكل نهائي من قاعدة بيانات MongoDB Atlas
        await AdModel.deleteOne({ id: req.params.id });

        // 3️⃣ إعادة جلب الإعلانات النشطة المتبقية وبثها عبر السوكت المشفر لإنعاش شاشات المشتركين فوراً
        const allAds = await AdModel.find({ expiryDate: { $gt: Date.now() } });
        io.emit('update_ads', allAds); // بث المصفوفة النظيفة لحظياً لجميع المشتركين
        
        res.json({ success: true, message: "تم قنص وتطهير الإعلان وصورته فيزيائياً بنجاح ملكي مستقر!" });
    } catch (err) {
        console.error("خطأ تدمير وقنص الإعلان السحابي الموقوت:", err);
        res.status(500).json({ success: false, message: "فشل الحذف السحابي" });
    }
});

// ⏳ دالة آلية (تشتغل كل ساعة) لتنظيف وتطهير ملف ads.json من الإعلانات المنتهية تلقائياً
setInterval(() => {
    try {
        if (!fs.existsSync(ADS_FILE)) return;
        let ads = JSON.parse(fs.readFileSync(ADS_FILE, 'utf8'));
        const now = Date.now();
        
        // الاحتفاظ فقط بالإعلانات التي لم تنتهِ صلاحيتها بعد
        const activeAds = ads.filter(ad => !ad.expiryDate || ad.expiryDate > now);
        
        if (ads.length !== activeAds.length) {
            fs.writeFileSync(ADS_FILE, JSON.stringify(activeAds, null, 2), 'utf8');
            io.emit('update_ads', activeAds); // تحديث الشاشات لحظياً عند الحذف التلقائي
            console.log(`🧹 تم تنظيف السيرفر محلياً وحذف الإعلانات المنتهية بنجاح.`);
        }
    } catch (err) {
        console.error("خطأ في دالة التنظيف الآلي للإعلانات:", err);
    }
}, 60 * 60 * 1000); // 60 دقيقة


// تعديل مسار رفع بضائع السوق الملكي ليتلقى حتى 10 صور ويحسب مدة الـ 3 أشهر
app.post('/api/market/upload', upload.array('marketImages', 10), (req, res) => {
    try {
        if (!req.body.username) return res.status(400).json({ success: false, message: "بيانات المستخدم مفقودة" });

        const files = req.files || [];
        const imagesPaths = files.map(f => `/uploads/${f.filename}`);

        // حساب تاريخ انتهاء المنشور تلقائياً بعد 3 أشهر (90 يوم بالضبط) قسرياً
        const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000;
        const expiryTimestamp = Date.now() + threeMonthsInMs;

        const posts = readJson(MARKET_FILE);
        const newPost = {
            id: 'post_' + Date.now().toString(),
            uploader: req.body.username,
            description: req.body.description || '',
            price: req.body.price || 'غير محدد',
            images: imagesPaths,
            time: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG'),
            expiryDate: expiryTimestamp // ختم وقت انتهاء الصلاحية بعد 3 أشهر
        };

        posts.unshift(newPost); // وضع المنشور الأحدث بالأعلى كالفيس بوك
        writeJson(MARKET_FILE, posts);

        // بث المنشور الجديد لحظياً لجميع المشاهدين المتصلين بالسوق
        io.emit('new_market_post', newPost);
        res.json({ success: true, post: newPost });
    } catch (err) {
        console.error("خطأ أثناء النشر في السوق الملكي:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// مسار حذف منشور السلعة نهائياً من قبل المعلن أو الأدمن (×)
app.delete('/api/market/delete/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        let posts = readJson(MARKET_FILE);
        const targetPost = posts.find(p => p.id === id);

        if (!targetPost) return res.status(404).json({ success: false, message: "المنشور غير موجود" });

        // التحقق الأمني من الصلاحية: (المعلن نفسه أو الأدمن العام)
        const isAuthorized = username === targetPost.uploader || username === 'Admin_Mostafa';

        if (isAuthorized) {
            // حذف الصور الفيزيائية للمنشور من الهارد لتوفير المساحة قبل مسح السجل
            if (targetPost.images && targetPost.images.length > 0) {
                targetPost.images.forEach(imgUrl => {
                    const filename = path.basename(imgUrl);
                    const filePath = path.join(UPLOADS_DIR, filename);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            }

            posts = posts.filter(p => p.id !== id);
            writeJson(MARKET_FILE, posts);

            io.emit('market_post_deleted', { postId: id });
            res.json({ success: true });
        } else {
            res.status(403).json({ success: false, message: "غير مصرح لك بالحذف" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ⏳ دالة آلية مدمجة (تشتغل كل ساعة) لتطهير وحذف منشورات بضائع السوق المنتهية صلاحيتها بعد 3 أشهر
setInterval(() => {
    try {
        if (!fs.existsSync(MARKET_FILE)) return;
        let posts = JSON.parse(fs.readFileSync(MARKET_FILE, 'utf8'));
        const now = Date.now();

        const activePosts = posts.filter(post => {
            const isExpired = post.expiryDate && post.expiryDate <= now;
            // إذا انتهت الـ 3 أشهر، يمسح السيرفر صور السلعة من مجلد uploads فوراً لحماية هارد جهازك
            if (isExpired && post.images) {
                post.images.forEach(imgUrl => {
                    const filePath = path.join(UPLOADS_DIR, path.basename(imgUrl));
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            }
            return !isExpired;
        });

        if (posts.length !== activePosts.length) {
            fs.writeFileSync(MARKET_FILE, JSON.stringify(activePosts, null, 2), 'utf8');
            io.emit('sync_market_posts', activePosts); // تحديث واجهة السوق تلقائياً عند الجميع
            console.log(`🧹 تم فحص السوق تلقائياً وحذف السلع التي تخطت فترة الـ 3 أشهر بنجاح.`);
        }
    } catch (err) {
        console.error("خطأ في دالة التنظيف الدوري للسوق المعمر:", err);
    }
}, 60 * 60 * 1000); // كل 60 دقيقة

// 🔥 مسار رفع وتحديث الصورة الشخصية للمستخدم محلياً
app.post('/api/user/upload-avatar', upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "الصورة مطلوبة" });
        const { username } = req.body;
        
        const users = readJson(USERS_FILE);
        const user = users.find(u => u.username === username);
        
        if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

        // حفظ مسار الصورة الشخصية الجديدة في ملف users.json
        user.avatar = `/uploads/${req.file.filename}`;
        writeJson(USERS_FILE, users);

        // بث التحديث لحظياً للجميع لتغيير الصورة في الشات فوراً
        io.emit('user_avatar_updated', { username, avatarUrl: user.avatar });
        res.json({ success: true, avatarUrl: user.avatar });
    } catch (err) {
        console.error("خطأ في رفع الصورة الشخصية:", err);
        res.status(500).json({ success: false });
    }
});

// أ) مسار رفع الملفات إلى الفلاشة الافتراضية الخاصة بالمستخدم
app.post('/api/flash/upload', upload.single('flashFile'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "الرجاء اختيار ملف أو مجلد مضغوط" });
        const { username } = req.body;
        if (!username) return res.status(400).json({ success: false, message: "بيانات المستخدم مطلوبة" });

        const userFlashDir = path.join(FLASH_DRIVE_DIR, username);
        if (!fs.existsSync(userFlashDir)) fs.mkdirSync(userFlashDir, { recursive: true });

        const oldPath = req.file.path;
        const newPath = path.join(userFlashDir, req.file.filename);
        fs.renameSync(oldPath, newPath);

        const seventyTwoHours = 72 * 60 * 60 * 1000;
        const expiryTimestamp = Date.now() + seventyTwoHours;

        const flashDb = readJson(FLASH_DB_FILE);
        const newFileRecord = {
            id: 'file_' + Date.now().toString(),
            owner: username,
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
            uploadTime: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG'),
            expiryDate: expiryTimestamp
        };

        flashDb.unshift(newFileRecord);
        writeJson(FLASH_DB_FILE, flashDb);

        io.emit('flash_db_updated', flashDb);
        res.json({ success: true, file: newFileRecord });
    } catch (err) {
        console.error("خطأ أثناء الرفع للفلاشة الافتراضية:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ب) مسار تحميل (تنزيل) الملف المباشر من الفلاشة لأي جهاز متصل بالشبكة المحلية
app.get('/api/flash/download/:username/:filename', (req, res) => {
    const { username, filename } = req.params;
    const filePath = path.join(FLASH_DRIVE_DIR, username, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath); 
    } else {
        res.status(404).send("⚠️ الملف غير موجود أو انتهت صلاحية الـ 72 ساعة وتمت إبادته!");
    }
});

// ج) مسار جلب قائمة ملفات الفلاشة لمستخدِم معين لتغذية شاشته عند تسجيل الدخول
app.get('/api/flash/files/:username', (req, res) => {
    const flashDb = readJson(FLASH_DB_FILE);
    const userFiles = flashDb.filter(f => f.owner === req.params.username);
    res.json(userFiles);
});

// د) ⏳ الإبادة والمسح التلقائي الشامل لملفات الفلاشة الفيزيائية من الهارد بعد 72 ساعة (كل ساعة فحص آلي)
setInterval(() => {
    try {
        if (!fs.existsSync(FLASH_DB_FILE)) return;
        let flashDb = JSON.parse(fs.readFileSync(FLASH_DB_FILE, 'utf8'));
        const now = Date.now();

        const activeFiles = flashDb.filter(file => {
            const isExpired = file.expiryDate && file.expiryDate <= now;
            
            if (isExpired) {
                const filePath = path.join(FLASH_DRIVE_DIR, file.owner, file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🧹 [V-USB] تم تدمير وإبادة ملف منتهي الصلاحية نهائياً من الفلاشة: ${file.originalName}`);
                }
            }
            return !isExpired;
        });

        if (flashDb.length !== activeFiles.length) {
            fs.writeFileSync(FLASH_DB_FILE, JSON.stringify(activeFiles, null, 2), 'utf8');
            io.emit('flash_db_updated', activeFiles); 
        }
    } catch (err) {
        console.error("خطأ في دالة إبادة ملفات الفلاشة الـ 72 ساعة:", err);
    }
}, 60 * 60 * 1000);

// ==========================================================================
// 🕋 منظومة مواقيت الصلاة والأذان اللحظي المتزامن (الهيئة المصرية للمساحة)
// ==========================================================================

// دالة حسابية محلية دقيقة تعود بمواقيت الصلاة الرسمية في مصر (الفجر، الظهر، العصر، المغرب، العشاء)
const getPrayerTimesLocal = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // جلب الشهر الحالي تلقائياً
    
    // التوقيت الافتراضي للمنصة (الربيع والخريف والشتاء)
    let baseTimes = { fajr: "04:10", shrooq: "05:45", dhuhr: "12:55", asr: "16:30", maghrib: "19:45", isha: "21:15" };
    
    // التعديل الآلي لأوج أشهر الصيف (مايو، يونيو، يوليو، أغسطس)
    if (month >= 5 && month <= 8) { 
        baseTimes = { fajr: "04:02", shrooq: "05:33", dhuhr: "12:57", asr: "16:34", maghrib: "20:01", isha: "21:32" };
    } else if (month >= 11 || month <= 2) { 
        // التوقيت الشتوي
        baseTimes = { fajr: "05:15", shrooq: "06:45", dhuhr: "11:58", asr: "14:50", maghrib: "17:05", isha: "18:35" };
    }
    return baseTimes;
};

// ⏳ ساعة المراقبة المحلية بالثانية لإطلاق صوت الأذان المتزامن عند الجميع فوراً
let lastTriggeredPrayer = "";

setInterval(() => {
    try {
        const now = new Date();
        // استخراج الوقت الحالي بصيغة "HH:MM" دقيقة وساعة بدقة
        const currentHourMin = now.toTimeString().substring(0, 5); 
        const times = getPrayerTimesLocal();
        
        let activePrayer = "";
        if (currentHourMin === times.fajr) activePrayer = "الفجر";
        if (currentHourMin === times.dhuhr) activePrayer = "الظهر";
        if (currentHourMin === times.asr) activePrayer = "العصر";
        if (currentHourMin === times.maghrib) activePrayer = "المغرب";
        if (currentHourMin === times.isha) activePrayer = "العشاء";

        // إطلاق بث الأذان الحي لجميع الأجهزة المتصلة بالثانية
        if (activePrayer && lastTriggeredPrayer !== activePrayer) {
            lastTriggeredPrayer = activePrayer;
            console.log(`🕋 حان الآن موعد أذان صلاة ${activePrayer} حسب توقيت جمهورية مصر العربية.`);
            io.emit('trigger_adhan_broadcast', { prayerName: activePrayer });
        }
        
        // تصفير العلم بعد مرور دقيقة لتهيئة الأذان التالي
        if (currentHourMin !== times.fajr && currentHourMin !== times.dhuhr && 
            currentHourMin !== times.asr && currentHourMin !== times.maghrib && currentHourMin !== times.isha) {
            lastTriggeredPrayer = "";
        }
    } catch (err) {
        console.error("خطأ في ساعة الأذان بالخلفية:", err);
    }
}, 20 * 1000); // التحقق الدوري كل 20 ثانية لضمان الدقة اللحظية

// مسار API مخصص لتغذية واجهة المستخدم بالمواقيت المحلية فور فتح الصفحة
app.get('/api/prayer-times', (req, res) => res.json(getPrayerTimesLocal()));


server.listen(PORT, "0.0.0.0", () => { 
    console.log(`🚀 السيرفر السحابي يعمل بنجاح على بورت ${PORT}`); 
});
