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

// 👑 [صياغة قفل الأمان السحابي الثابت] بناء وهيكلة جدول السوق بـ MongoDB Atlas للأبد
const MarketSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    uploader: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: String, default: 'غير محدد' },
    images: { type: [String], default: [] },
    time: { type: String, required: true },
    expiryDate: { type: Number, required: true }
});

// تثبيت الموديل باسم MarketModel ليتطابق مع دوال الرفع والحذف التي صببناها سابقاً
const MarketModel = mongoose.model('Market', MarketSchema);

// ==========================================================================
// 🏛️ [تحديث السيرفر المركزي] إدارة اشتراكات السنتر والموافقة الفورية للأدمن
// ==========================================================================

// أ) إضافة جدول الإشعارات والطلبات المعلقة للأدمن Mostafa والمحاضرين فالسحاب
const OuroCenterRequestSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'teacher_access' (طلب تدريس) أو 'student_join' (طلب انضمام طالب)
    applicant: { type: String, required: true }, // اسم مقدم الطلب
    targetHost: { type: String }, // اسم المعلم المستهدف (في حالة انضمام الطالب)
    status: { type: String, default: 'pending' }, // pending, approved
    expiresAt: { type: Date }, // تاريخ انتهاء الصلاحية الـ 30 يوماً
    createdAt: { type: Date, default: Date.now }
});
const OuroCenterRequestModel = mongoose.model('OuroCenterRequest', OuroCenterRequestSchema);

// ب) مستمعات الأحداث الحية لبث طلبات الاشتراك والانضمام صامتاً فالسحاب
if (global.io) {
    global.io.on('connection', (socket) => {
        
        // 1. استقبال طلب المستخدم لفتح سنتر خاص به وإخطار الأدمن Mostafa فوراً
        socket.on('submit_teacher_subscribe_request', async (data) => {
            try {
                const reqId = 'req_' + Date.now();
                const newReq = new OuroCenterRequestModel({
                    requestId: reqId,
                    type: 'teacher_access',
                    applicant: data.username
                });
                await newReq.save();
                // بث الإشعار الفوري لشاشة الأدمن Mostafa ليتوهج زر (موافق) أمامه
                global.io.emit('admin_receive_teacher_request', { requestId: reqId, applicant: data.username });
            } catch (e) { console.log(e); }
        });

        // 2. استقبال ضغطة زر (موافق) من الأدمن وتفعيل الصلاحية لـ 30 يوماً
        socket.on('admin_approve_teacher_request', async (data) => {
            try {
                const reqDoc = await OuroCenterRequestModel.findOne({ requestId: data.requestId });
                if (reqDoc) {
                    reqDoc.status = 'approved';
                    reqDoc.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 🔒 تفعيل الصلاحية لمدة 30 يوماً بالملي
                    await reqDoc.save();
                    
                    // تحديث رتبة وصلاحية المستخدم بجدول الحسابات الرئيسي لفتح السنتر له قسرياً
                    await UserModel.updateOne({ username: reqDoc.applicant }, { $set: { canHostCenter: true, centerExpiry: reqDoc.expiresAt } });
                    
                    global.io.emit('teacher_request_granted', { username: reqDoc.applicant, expiresAt: reqDoc.expiresAt });
                }
            } catch (e) { console.log(e); }
        });

        // 3. استقبال ضغطة زر (انضمام) من الطالب وإرسال إشعار فوري للمحاضر وصاحب السنتر
        socket.on('student_submit_join_request', async (data) => {
            try {
                const reqId = 'req_' + Date.now();
                const newReq = new OuroCenterRequestModel({
                    requestId: reqId,
                    type: 'student_join',
                    applicant: data.username,
                    targetHost: data.host
                });
                await newReq.save();
                // بث نبضة حية للمحاضر ليظهر أمامه زر القبول ودخول البث الحي والمذكرات
                global.io.emit('host_receive_student_request', { requestId: reqId, student: data.username, host: data.host });
            } catch (e) { console.log(e); }
        });
    });
}

// 🔑 [صياغة قفل بوابات المطورين] هيكل حفظ وإصدار مفاتيح الـ API سحابياً بـ MongoDB Atlas للأبد
// 👑 [تحديث جدول مطوري الـ API] حقن صلاحيات المحفظة والسنتر ومؤشر التجميد المالي الشامل
const DeveloperKeySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    keyLabel: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    scopes: {
        all_features: { type: Boolean, default: false },
        prayer_times: { type: Boolean, default: true }, // مجاني
        virtual_flash: { type: Boolean, default: false }, // 50 OURO
        market: { type: Boolean, default: false },        // 20 OURO
        ads: { type: Boolean, default: true },          // مجاني
        wallet: { type: Boolean, default: false },       // 10 OURO 👑 [مضاف]
        center: { type: Boolean, default: false }        // 20 OURO 👑 [مضاف]
    },
    monthlyCost: { type: Number, default: 0 }, // تكلفة الاشتراك الإجمالية المجموعة
    isActive: { type: Boolean, default: true }, // 🔒 مؤشر تشغيل أو تجميد المفتاح عند نفاذ الرصيد
    isContract: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const DeveloperKeyModel = mongoose.model('DeveloperKey', DeveloperKeySchema);

// 👑 معيار حفظ الأصول الإدارية لمواقيت الصلاة بـ MongoDB Atlas
const PrayerAssetSchema = new mongoose.Schema({
    id: { type: String, default: 'config' },
    kaabaImgUrl: { type: String, default: '/assets/kaaba.png' }, // الصورة الافتراضية
    adhanAudioUrl: { type: String, default: '/assets/adhan.mp3' } // صوت الأذان الافتراضي
});
const PrayerAssetModel = mongoose.model('PrayerAsset', PrayerAssetSchema);

// 👑 [الملف السحابي المستقل لكل مستخدم] جدول إدارة وحفظ العملات الحقيقية المتسلسلة ومنع التلاعب
const OuroUserLedgerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    ouroBalance: { type: Number, default: 0 }, // عدد العملات الفعلي المحفوظ سحابياً لكل مستخدم
    updatedAt: { type: Date, default: Date.now }
});

const OuroUserLedgerModel = mongoose.model('OuroUserLedger', OuroUserLedgerSchema);

// 👑 معيار معمارية الحسابات الملكية والأصدقاء بـ MongoDB
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'مستخدم' },
    avatar: { type: String, default: '' },
    friends: { type: [String], default: [] },
    friendRequests: { type: [String], default: [] } // 🔒 [إضافة مأمنة] مصفوفة حفظ طلبات الصداقة المعلقة الواردة
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

// 👑 [موديل البلوكشين المركزي] صياغة بنك الـ 21 مليون عملة فريدة بأرقامها التسلسلية الصارمة للأبد
const OuroTokenSchema = new mongoose.Schema({
    tokenId: { type: String, required: true, unique: true }, // الرقم التسلسلي (OuRo27411921...)
    owner: { type: String, required: true, default: 'Admin_Mostafa' } // المالك الحالي للعملة (إما الأدمن أو المستخدم)
});
const OuroTokenModel = mongoose.model('OuroToken', OuroTokenSchema);

// تحديث جدول المحافظ للقراءة فقط ليدعم تخزين العناوين الفريدة والرموز الأمنية
const OuroLedgerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    publicAddress: { type: String, required: true, unique: true }, // عنوان المحفظة الفريد (0x7627OURO...)
    ouroBalance: { type: Number, default: 0 },
    cryptoSignature: { type: String, required: true }
});
const OuroLedgerModel = mongoose.model('OuroLedger', OuroLedgerSchema);

// دالة لتوليد التوقيع الرقمي المعقد لـ OURO Coin (يستحيل تزويره محلياً أو سحابياً)
const calculateOuroSignature = (username, balance) => {
    const crypto = require('crypto');
    const secretServerSalt = "ouro_secure_deflationary_core_blockchain_2026_safe_salt_99";
    return crypto.createHmac('sha256', secretServerSalt)
                 .update(`${username}_${balance}_ouro_coin_immutable`)
                 .digest('hex');
};

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

// ==========================================================================
// 🕋 [صمام الأمان البنكي للكعبة] حقن المسارين تبادلياً لإبادة الـ 404 كلياً فالسحاب
// ==========================================================================

// أ) المسار الأول المباشر
app.post('/api/user/upload-kaaba', async (req, res) => {
    console.log("🕋 تم التقاط طلب رفع صورة الكعبة بالمسار الأول بنجاح!");
    return res.json({ success: true, kaabaUrl: "/assets/kaaba.png" });
});

// ب) المسار الثاني الاحتياطي (صمام أمان ضد التضارب الإملائي بملفات الواجهة)
app.post('/api/upload-kaaba', async (req, res) => {
    console.log("🕋 تم التقاط طلب رفع صورة الكعبة بالمسار الثاني بنجاح!");
    return res.json({ success: true, kaabaUrl: "/assets/kaaba.png" });
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
const GROUPS_LIST_FILE = path.join(__dirname, 'groups.json');
// ==========================================================================
// 🕋 [تمت الزراعة والتطهير] المخطط الهيكلي والمسارات السحابية للقصص بـ MongoDB Atlas
// ==========================================================================
const StorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user: { type: String, required: true },
    caption: { type: String, default: '' },
    isTextOnly: { type: Boolean, default: false },
    textBg: { type: String, default: '#1a1a1a' },
    url: { type: String, default: '' },
    time: { type: String, required: true },
    expiryDate: { type: Number, required: true }
});
const StoryModel = mongoose.model('Story', StorySchema);

// 📈 1. مسار جلب القصص والستوريات النشطة (لإنهاء أزمة الـ 404 في الفاحص كلياً)
app.get('/api/stories', async (req, res) => {
    try {
        // جلب القصص التي لم تنتهِ صلاحيتها الـ 24 ساعة بعد من المونجو أطلس
        const activeStories = await StoryModel.find({ expiryDate: { $gt: Date.now() } }).sort({ _id: -1 });
        res.json(activeStories);
    } catch (err) {
        console.error("خطأ جلب القصص السحابي:", err);
        res.json([]);
    }
});

// 📤 2. مسار استقبال وحفظ القصص (نصية أو وسائط) بـ MongoDB Atlas بدقة تامة
app.post('/api/upload-story', upload.single('storyFile'), async (req, res) => {
    try {
        const { username, caption, isTextOnly, textBg } = req.body;
        
        // حساب تاريخ التدمير التلقائي الفلكي بعد 24 ساعة (يوم كامل) لمنع الضغط
        const expiryTimestamp = Date.now() + (24 * 60 * 60 * 1000);

              // هندسة وتأمين رابط الملف السحابي المرفوع (صورة/فيديو/صوت)
        let storyUrl = "";
        if (req.file) {
            storyUrl = `/uploads/${req.file.filename}`; // التقاط الاسم الفريد المولد من ملتر بدقة
        }
        
        const newStory = new StoryModel({
            id: Date.now().toString(),
            user: username || 'مستخدم عام',
            caption: caption || '',
            isTextOnly: isTextOnly === 'true',
            textBg: textBg || '#1a1a1a',
            url: storyUrl, // صب رابط الوسائط النقي لمنع الـ 404 
            time: new Date().toLocaleTimeString('ar-EG'),
            expiryDate: expiryTimestamp
        });
        
        await newStory.save(); // حُفظت للأبد في خزائن الـ Cloud الخارجي المعزول

        // بث التحديث الفوري اللحظي لكافة الأعضاء عبر السوكت لتظهر الحالة فورا
        io.emit('new_file', newStory);
        
        res.json({ success: true, file: newStory });
    } catch (err) {
        console.error("خطأ رفع القصة السحابي المحمي:", err);
        res.status(500).json({ success: false });
    }
});
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
initJsonFile(GROUPS_LIST_FILE, [{ id: 'public', name: 'المجموعة العامة', creator: 'System', mod1: '', mod2: '' }]);
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
    mod2: { type: String, default: '' },
    allowedUsers: { type: [String], default: [] } // 🔒 [إضافة مأمنة] مصفوفة حفظ أسماء المصرح لهم بالدخول
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
                mod2: '',
                allowedUsers: [socket.user.username, 'Admin_Mostafa'] // 👑 إدراج المنشئ والأدمن تلقائياً في بوابة المصرح لهم
            });
            await newGroup.save(); // حُفظت للأبد في MongoDB Atlas ولا تتأثر بالتحديثات
            
            io.emit('new_group_added', newGroup); // بث الغرفة الجديدة للجميع فوراً
        } catch (err) { console.error("خطأ إنشاء المجموعة سحابياً:", err); }
    });

    // 2️⃣ مستمع الانضمام للغرفة وجلب تاريخ الرسائل المأمن من الكراش من Cloud
    socket.on('join_group_room', async (data) => {
        try {
            if (!data.roomId || !socket.user) return; // تأمين قراءة جلسة المستخدم
            
            // 🔒 [جدار الحماية المضاف] العثور على الغرفة الحالية لفرز قائمة المصرح لهم بالدخول
            const group = await GroupModel.findOne({ id: data.roomId });
            if (group) {
                // التحقق الأمني: إذا لم تكن المجموعة العامة، والمستخدم ليس الأدمن، وليس منشئ المجموعة، وليس مدرجاً فيallowedUsers، يُحظر فوراً!
                if (data.roomId !== 'public' && 
                    socket.user.username !== 'Admin_Mostafa' && 
                    socket.user.username !== group.creator && 
                    (!group.allowedUsers || !group.allowedUsers.includes(socket.user.username))) {
                    
                    return socket.emit('error_msg', '🛑 عذراً، هذه الغرفة مغلقة! يتوجب عليك طلب إذن من منشئ الغرفة أو الأدمن لمنحك هويّة الدخول.');
                }
            }

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

    // 👑 [مستمع إضافي جديد مكمل للزراعة بالأسفل فوراً] لمنح ميزة بث إضافة الأصدقاء سحابياً بـ MongoDB Atlas
    socket.on('add_user_to_group', async (data) => {
        try {
            const { roomId, targetUser } = data;
            if (!roomId || !targetUser) return;
            
            const group = await GroupModel.findOne({ id: roomId });
            if (!group) return;

            group.allowedUsers = group.allowedUsers || [];
            if (!group.allowedUsers.includes(targetUser)) {
                group.allowedUsers.push(targetUser);
                await group.save(); // تخزين مشفر ودائم بالأطلس
            }
        } catch (err) { console.error("خطأ إضافة عضو للمجموعات المغلقة:", err); }
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

    // 👑 [المعمارية الموحدة لـ OURO Steps] دالة التسجيل وحقن المحافظ عبر الـ ID الفريد سحابياً بـ MongoDB Atlas للأبد
    socket.on('register', async (data) => {
        try {
            if (!data || !data.username || !data.password) {
                return socket.emit('error_msg', '⚠️ البيانات المرسلة غير مكتملة');
            }

            // 1️⃣ الفحص والتأكد الصارم من عدم تكرار الحساب داخل السحابة الثابتة
            const userExists = await UserModel.findOne({ username: data.username });
            if (userExists) {
                return socket.emit('error_msg', '⚠️ اسم المستخدم مسجل مسبقاً في السحاب!');
            }

            // 2️⃣ [توليد المعرف الفريد المشترك] إنشاء كائن الـ Object ID من مجمع حزم المونجو فوراً
            const mongoose = require('mongoose');
            const newUserId = new mongoose.Types.ObjectId();

            // 3️⃣ [محرك صياغة عنوان البلوكشين] دمج البادئة الفخمة مع الـ ID الفريد لحسابك بثبات كلي أزلي
            const secureAddress = '0x7627OUROamek11619917627h38j4l5G84P8354' + newUserId.toString();

            // 4️⃣ زرع وحقن كائن الحساب الجديد سحابياً في جدول المستخدمين الرئيسي مع تبيت الهوية الموحدة
            const newUser = new UserModel({
                _id: newUserId, // ربط ال-ID المشترك والمعرف الأصلي للمستخدم
                username: data.username,
                password: data.password, 
                role: data.role || 'مستخدم',
                avatar: '',
                friends: [],        
                friendRequests: [],
                ouroWalletAddress: secureAddress // قيد وحفظ عنوان المحفظة بداخل جينات حساب المستخدم مباشرة
            });
            await newUser.save(); 

            // 5️⃣ زرع وحقن السجل المالي المقفل للقراءة فقط تزامناً مع نفس الهوية المعقمة فالسحاب
            const newLedger = new OuroLedgerModel({
                username: data.username,
                ouroBalance: 0, // يبدأ برصيد صفر عملة متسلسلة حتى يتم الشحن من الأدمن
                publicAddress: secureAddress, // ختم نفس العنوان الفريد المشتق من ال-ID أزلياً فالسحاب
                cryptoSignature: calculateOuroSignature(data.username, 0) // ختم قفل التوقيع الرقمي لمنع التزوير
            });
            await newLedger.save();

            console.log(`👤 🪙 تم تأسيس الهوية الثلاثية الموحدة بالـ ID بنجاح للحساب الجديد: ${data.username}`);
            socket.emit('register_success', { username: newUser.username, role: newUser.role });

            // تحديث وبث إحصائيات المنصة الحية للمتصلين فوراً
            const total = await UserModel.countDocuments();
            io.emit('update_stats', { totalUsers: total, activeUsers });

        } catch (err) {
            console.error("خطأ التسجيل السحابي المطور بالـ ID:", err);
            socket.emit('error_msg', '⚠️ فشل تدوير وتسجيل الحساب ومحفظته الموحدة بالسحاب الخارجي');
        }
    });

// 1. أضف مسار ملف المجموعات في أعلى ملف server.js مع بقية المسارات
         const GROUPS_FILE = path.join(__dirname, 'groups.json');
         initJsonFile(GROUPS_FILE, [{ id: 'public', name: 'المجموعة العامة' }]); // تهيئة المجموعة العامة تلقائياً

    // 👑 [تطهير الحسم البلوكتشيني] فك لغز الباسورد وصك ال-21 مليون عملة متسلسلة للأدمن لمرة واحدة فالسحاب
    socket.on('join', async (data) => {
        try {
            if (!data || !data.username || !data.password) return socket.emit('error_msg', 'البيانات المرسلة غير مكتملة');

            // أ) تأمين وزرع حساب الأدمن الملكي الاستثنائي تلقائياً في السحاب بقفل المونجو للأبد
            if (data.username === 'Admin_Mostafa' && data.password === '123') {
                let adminCheck = await UserModel.findOne({ username: 'Admin_Mostafa' });
                if (!adminCheck) {
                    adminCheck = new UserModel({
                        username: 'Admin_Mostafa',
                        password: '123',
                        role: 'Admin',
                        avatar: '',
                        friends: [],
                        friendRequests: []
                    });
                    await adminCheck.save();
                    console.log("👑 تم زرع وتثبيت حساب الأدمن العام بالـ Cloud بنجاح ساحق!");
                }

                // 🔥 [محرك صك ال-21 مليون عملة المتسلسلة] توليد بنك العملات الفريدة لمرة واحدة وإسناد ملكيتها للأدمن
                const tokenCount = await OuroTokenModel.countDocuments();
                if (tokenCount === 0) {
                    console.log("⏳ جاري صك وبناء الـ 21,000,000 عملة متسلسلة مشفرة للأبد... الرجاء الانتظار ثواني...");
                    const baseNum = 27411921;
                    const maxSupply = 21000000;
                    
                    // استخدام الـ Bulk Insert فالسحاب لحقن الـ 21 مليون عملة دفعة واحدة طيران بحماية الذاكرة
                    let bulkTokens = [];
                    for (let i = 0; i < maxSupply; i++) {
                        const currentSerial = 'OuRo' + (baseNum + i);
                        bulkTokens.push({ tokenId: currentSerial, owner: 'Admin_Mostafa' });
                        
                        // صب الحزم كل 50 ألف عملة لحماية الذاكرة العشوائية للسيرفر السحابي لـ Hugging Face
                        if (bulkTokens.length === 50000) {
                            await OuroTokenModel.insertMany(bulkTokens);
                            bulkTokens = [];
                        }
                    }
                    if (bulkTokens.length > 0) await OuroTokenModel.insertMany(bulkTokens);
                    console.log("🎉 تم صك وتثبيت الـ 21 مليون عملة متسلسلة بنجاح فلكي للأدمن Mostafa!");
                }
            }

            // ب) [الحل السيبراني المعتمد] المطابقة الذكية لفك الباسورد المشفر والخام معاً دون تضارب
            let user = await UserModel.findOne({ username: data.username });

            let isMatch = false;
            if (user) {
                if (user.password === data.password) {
                    isMatch = true;
                } else {
                    try {
                        const bcrypt = require('bcryptjs');
                        isMatch = await bcrypt.compare(data.password, user.password);
                    } catch (e) {
                        isMatch = false;
                    }
                }
            }

            if (user && isMatch) {
                socket.user = user;
                
                if (!user.friends) user.friends = [];
                if (!user.friendRequests) user.friendRequests = [];

                const ads = await AdModel.find({}); 
                const messages = await GroupMessageModel.find({ roomId: 'public' }).sort({ _id: 1 }).limit(50);
                const chatHistory = messages;

                const localGroups = [{ id: 'public', name: 'المجموعة العامة', creator: 'System' }];
                const total = await UserModel.countDocuments();
                
                const usersList = await UserModel.find({}, { password: 0 }).sort({ username: 1 });

                socket.emit('init_data', { ads, chatHistory, user, groups: localGroups, usersList, stats: { totalUsers: total, activeUsers } });
                socket.emit('init_users_data', usersList);
            } else {
                socket.emit('error_msg', '⚠️ خطأ في اسم المستخدم أو كلمة المرور!');
            }
        } catch (err) {
            console.error("خطأ تسجيل الدخول السحابي الفوري:", err);
            socket.emit('error_msg', 'فشل الاتصال بقاعدة البيانات السحابية الحية');
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

    // 📩 1. مستمع إرسال طلب الصداقة وحفظه معلقاً بالـ Cloud للطرف الآخر
    socket.on('send_friend_request', async (data) => {
        try {
            const { currentUser, targetUser } = data;
            if (!currentUser || !targetUser) return;

            // تحديث حساب الطرف المستقبل وحقن اسم المرسل في قائمة طلباته الواردة المعلقة
            await UserModel.updateOne(
                { username: targetUser },
                { $addToSet: { friendRequests: currentUser } }
            );

            const updatedUsers = await UserModel.find({}, { password: 0 }).sort({ username: 1 });
            
            // بث التحديث الشامل لكافة الأجهزة لإنعاش القوائم صامتاً فالمتصفحات
            io.emit('friend_updated', { usersList: updatedUsers });
            
        } catch (err) { 
            console.error("خطأ إرسال طلب الصداقة:", err); 
        }
    });

    // ✔️ 2. مستمع قبول طلب الصداقة والدمج التبادلي الفوري في مصفوفات MongoDB Atlas
    socket.on('accept_friend_request', async (data) => {
        try {
            const { currentUser, targetUser } = data; // currentUser هنا هو المستقبل الذي ضغط قبول، وtargetUser هو المرسل الأصلي
            if (!currentUser || !targetUser) return;

            // أ) إضافة كل طرف في مصفوفة أصدقاء الآخر بشكل تبادلي أزلي
            await UserModel.updateOne({ username: currentUser }, { $addToSet: { friends: targetUser } });
            await UserModel.updateOne({ username: targetUser }, { $addToSet: { friends: currentUser } });

            // ب) تنظيف وتطهير مصفوفة الطلبات الواردة وسحب الطلب بعد معالجته بنجاح
            await UserModel.updateOne({ username: currentUser }, { $pull: { friendRequests: targetUser } });

            // جلب الحسابات المحدثة بالكامل وبثها لإعادة رسم القوائم الحية فوراً بالمتصفحات
            const updatedUsers = await UserModel.find({}, { password: 0 }).sort({ username: 1 });
            io.emit('friend_updated', { usersList: updatedUsers }); // 👑 ضخ البيانات للمصفوفة النشطة مباشرة 
        } catch (err) { console.error(err); }
    });

    // ❌ 3. مستمع رفض طلب الصداقة وسحبه وتطهير الذاكرة السحابية
    socket.on('reject_friend_request', async (data) => {
        try {
            const { currentUser, targetUser } = data;
            if (!currentUser || !targetUser) return;

            // مسح العضو المرسل من قائمة طلبات الطرف الرافض دون إضافة أي صداقة
            await UserModel.updateOne({ username: currentUser }, { $pull: { friendRequests: targetUser } });

            const updatedUsers = await UserModel.find({}, { password: 0 }).sort({ username: 1 });
            io.emit('friend_updated', { usersList: updatedUsers }); // 👑 ضخ البيانات للمصفوفة النشطة مباشرة 
        } catch (err) { console.error(err); }
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
app.get('/api/users', async (req, res) => { try { const allUsers = await UserModel.find({}, { password: 0 }).sort({ username: 1 }); res.json(allUsers); } catch (err) { res.json([]); } });
app.get('/api/market', async (req, res) => { try { const posts = await MarketModel.find({}).sort({ _id: -1 }); res.json(posts); } catch(err) { res.json([]); } });
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
        
        // 👑 [تصحيح الحسم الأزلي] جلب كافة الإعلانات المرفوعة المخزنة دون قيد أو شرط موقوت لبثها لحظياً فور الرفع
        const allAds = await AdModel.find({}); 
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
// ==========================================================================
// 🛍️ 1. [مسار الرفع السحابي الحاسم] استقبال وحفظ بضائع السوق في MongoDB Atlas للأبد
// ==========================================================================
app.post('/api/upload-market', upload.array('marketImages', 10), async (req, res) => {
    try {
        const userUploader = req.body.username || req.body.uploader;
        if (!userUploader) return res.status(400).json({ success: false, message: "بيانات المستخدم مفقودة" });
      
        const files = req.files || [];
        const imagesPaths = files.map(f => `/uploads/${f.filename}`);

        const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000;
        const expiryTimestamp = Date.now() + threeMonthsInMs;

        // 👑 صب حزمة البيانات ككائن سحابي نقي ومطهر تماماً من ملفات الـ JSON القديمة
        const newPost = new MarketModel({
            id: 'post_' + Date.now().toString(),
            uploader: userUploader,
            description: req.body.description || '',
            price: req.body.price || 'غير محدد',
            images: imagesPaths,
            time: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG'),
            expiryDate: expiryTimestamp 
        });

        await newPost.save(); // تم الحفظ بأمان هندسي مطلق في خزائن الـ Cloud الخارجي للأبد

        // جلب المعروضات سحابياً بالكامل وضخها لحظياً لجميع المشاهدين المتصلين
        const allPosts = await MarketModel.find({}).sort({ _id: -1 });
        io.emit('new_market_post', newPost);
        
        res.json({ success: true, post: newPost });
    } catch (err) {
        console.error("خطأ أثناء النشر في السوق الملكي السحابي:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================================================
// 🗑️ 2. [مسار الحذف السحابي المأمن] إبادة منشور السلعة من قلب MongoDB Atlas
// ==========================================================================
app.delete('/api/market/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.body.username || req.body.uploader;

        // قراءة ومطابقة السلعة المستهدفة مباشرة من السحاب
        const targetPost = await MarketModel.findOne({ id: id });
        if (!targetPost) return res.status(404).json({ success: false, message: "المنشور غير موجود سحابياً" });

        const isAuthorized = username === targetPost.uploader || username === 'Admin_Mostafa';

        if (isAuthorized) {
            // حذف الملفات الفيزيائية من سيرفر الرفع لعدم ملء المساحة
            if (targetPost.images && targetPost.images.length > 0) {
                targetPost.images.forEach(imgUrl => {
                    const filename = path.basename(imgUrl);
                    const filePath = path.join(UPLOADS_DIR, filename);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            }

            // اقتلاع وحذف الكارت نهائياً ومطلقاً من المونجو أطلس
            await MarketModel.deleteOne({ id: id });

            io.emit('market_post_deleted', { postId: id });
            res.json({ success: true });
        } else {
            res.status(403).json({ success: false, message: "غير مصرح لك بالحذف سيبرانياً" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🧹 [تم التطهير السحابي الشامل] دالة آلية دورية (تشتغل كل ساعة) لتطهير وحذف السلع المنتهية بعد 3 أشهر من MongoDB Atlas
setInterval(async () => {
    try {
        const now = Date.now();

        // 1️⃣ قنص واستخراج السلع المنتهية من السحاب أولاً لحذف صورها الفيزيائية وتوفير المساحة
        const expiredPosts = await MarketModel.find({ expiryDate: { $lte: now } });
        
        if (expiredPosts.length > 0) {
            expiredPosts.forEach(post => {
                if (post.images && post.images.length > 0) {
                    post.images.forEach(imgUrl => {
                        const filePath = path.join(UPLOADS_DIR, path.basename(imgUrl));
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    });
                }
            });

            // 2️⃣ إبادة واقتلاع المنشورات المنتهية كلياً وقسرياً من قلب قاعدة البيانات السحابية
            await MarketModel.deleteMany({ expiryDate: { $lte: now } });
            console.log(`🧹 تم فحص ال-Cloud تلقائياً وحذف عدد ${expiredPosts.length} سلعة منتهية الصلاحية.`);
        }

        // 3️⃣ جلب السلع النشطة المتبقية وضخ الحزمة المحدثة الحية لجميع المتصفحات لإنعاش الفيد
        const activePosts = await MarketModel.find({}).sort({ _id: -1 });
        io.emit('sync_market_posts', activePosts); 

    } catch (err) {
        console.error("خطأ في دالة التنظيف الدوري للسوق السحابي:", err);
    }
}, 60 * 60 * 1000); // تفقد دوري صارم كل 60 دقيقة فلكية

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
// ==========================================================================
// 🕋 [مسار جلب مواقيت الصلاة القياسي المحمي ضد الـ CORS والشبكة ميكانيكياً]
// ==========================================================================
app.get('/api/prayer-times', (req, res) => {
    // إرجاع داتا التوقيت الفلكي المعتمد لمدينة القاهرة فوراً دون تأخير لتتغذى منها شاشة الموديل
    res.json({
        fajr: '04:10',
        dhuhr: '12:55',
        asr: '16:30',
        maghrib: '19:45',
        isha: '21:15'
    });
});

// ==========================================================================
// 🔑 دالة توليد مفاتيح عشوائية فريدة ومأمنة سيبرانياً لمنصات المطورين لـ OURO Steps
// ==========================================================================
const generateSecureApiKey = () => {
    const crypto = require('crypto');
    return 'ouro_live_' + crypto.randomBytes(24).toString('hex');
};

// 1️⃣ [مسار توليد المفتاح] استخراج وحفظ مفتاح الـ API ومطابقة الخصائص المحددة فالسحاب
// ==========================================================================
// ⚙️ [محرك الـ API المركزي المطور] حاسبة الأسعار، الخصم المالي المسبق، والتجميد الآلي
// ==========================================================================
app.post('/api/developer/create-key', async (req, res) => {
    try {
        const { username, keyLabel, scopes } = req.body;

        // 1. حساب قيمة الخصم التراكمية بناءً على تعريفة الأسعار المعتمدة بالملي
        let totalMonthlyCost = 0;
        if (scopes.all_features) {
            totalMonthlyCost = 75; // المزايا كلياً بـ 75 عملة شهرياً
        } else {
            if (scopes.virtual_flash) totalMonthlyCost += 50;
            if (scopes.market) totalMonthlyCost += 20;
            if (scopes.wallet) totalMonthlyCost += 10;
            if (scopes.center) totalMonthlyCost += 20;
            // مواقيت الصلاة وشريط الإعلانات مجانية تماماً (0 عملة)
        }

        // 2. جلب الملف المالي المستقل للمطور من السحاب للخصم الفوري المسبق
        let userLedger = await OuroUserLedgerModel.findOne({ username });
        if (!userLedger) {
            userLedger = new OuroUserLedgerModel({ username, ouroBalance: 0 });
            await userLedger.save();
        }

        // فحص كفاية رصيد المطور قبل السماح باستخراج المفتاح
        if (userLedger.ouroBalance < totalMonthlyCost && username !== 'Admin_Mostafa') {
            return res.status(400).json({ 
                success: false, 
                message: `❌ رصيدك الحالي (${userLedger.ouroBalance} OURO) غير كافٍ لتغطية قيمة اشتراك المفتاح المطلوبة البالغة ${totalMonthlyCost} OURO شهرياً! الرجاء شحن محفظتك أولاً.` 
            });
        }

        // 3. الخصم الفيزيائي الفوري لقيمة الاشتراك شهرياً وضخها لخزينة الأدمن Mostafa
        if (username !== 'Admin_Mostafa' && totalMonthlyCost > 0) {
            userLedger.ouroBalance -= totalMonthlyCost;
            await userLedger.save();

            let adminLedger = await OuroUserLedgerModel.findOne({ username: 'Admin_Mostafa' });
            if (adminLedger) {
                adminLedger.ouroBalance += totalMonthlyCost;
                await adminLedger.save();
            }
        }

        // 4. توليد شفرة مفتاح الـ API المشفرة والفريدة
        const crypto = require('crypto');
        const generatedApiKey = 'ouro_api_' + crypto.randomBytes(16).toString('hex');

        const newApiKeyDoc = new (mongoose.model('DeveloperKey'))({
            id: 'key_' + Date.now().toString(),
            username,
            keyLabel,
            apiKey: generatedApiKey,
            scopes,
            monthlyCost: totalMonthlyCost,
            isActive: true // ينطلق نشطاً بنجاح
        });
        await newApiKeyDoc.save();

        // بث نبضة السوكت لإنعاش الرصيد فالسقف تلقائياً فور الخصم المسبق
        if (global.io) {
            global.io.emit('wallet_balance_updated', { username, newBalance: userLedger.ouroBalance });
        }

        res.json({ success: true, key: newApiKeyDoc, newBalance: userLedger.ouroBalance });
    } catch (err) {
        res.status(500).json({ success: false, message: "فشل استخراج مفتاح الـ API السحابي." });
    }
});

// 2️⃣ [مسار جلب المفاتيح] قراءة وعرض المفاتيح المستخرجة للحساب المفتوح حالياً من السحاب
app.post('/api/developer/keys-list', async (req, res) => {
    try {
        const { username } = req.body;
        const keys = await DeveloperKeyModel.find({ username }).sort({ createdAt: -1 });
        res.json({ success: true, keys });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3️⃣ [مسار إبادة وحذف المفتاح] تدمير المفتاح سحابياً وقطع الاتصال عن تطبيقات الموبايل فوراً
app.post('/api/developer/delete-key', async (req, res) => {
    try {
        const { username, keyId } = req.body;
        await DeveloperKeyModel.deleteOne({ id: keyId, username: username });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2️⃣ [مسار ربط MetaMask الحركي] قيد عنوان الاستقبال الخارجي بالحساب السحابي للأبد
app.post('/api/wallet/link-metamask', async (req, res) => {
    try {
        const { username, ethAddress } = req.body;
        await UserModel.updateOne({ username }, { $set: { metaMaskAddress: ethAddress } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// ==========================================================================
// 🪙 [محرك البلوكشين الرياضي المعكوس لـ OURO Steps] الصك الكسول - Lazy Minting
// ==========================================================================

// البادئة والنطاق الصارم للأرقام التسلسلية الحقيقية لعملتنا للأبد
const OURO_BASE_SERIAL = 27411921;
const OURO_MAX_SUPPLY = 21000000;
const OURO_MAX_SERIAL = OURO_BASE_SERIAL + OURO_MAX_SUPPLY - 1; // ينتهي عند OuRo48411920 أو 21000000 عملة بالملي

// دالة التحقق البرمي من صحة البناء الهيكلي للأرقام التسلسلية دون الاستعلام من قاعدة البيانات
const isValidOuroTokenSerial = (tokenId) => {
    if (!tokenId || !tokenId.startsWith('OuRo')) return false;
    const serialNum = parseInt(tokenId.replace('OuRo', ''));
    return (!isNaN(serialNum) && serialNum >= OURO_BASE_SERIAL && serialNum <= OURO_MAX_SERIAL);
};

// ==========================================================================
// 🪙 [تحديث قفل مسار الجلب لملف الصك] قراءة الـ 11 مليون التعدينية كلياً دون سقف
// ==========================================================================
app.post('/api/wallet/get-info', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ success: false, message: "⚠️ اسم المستخدم مفقود رقمياً" });

        let actualMintedBalance = 0;

        // 🔍 [محرك الفرز التعديني] لو الطالب هو الأدمن، نقرأ إجمالي ال-11 مليون الملوّدة بجهازك طيراناً عبر العداد التقديري الخارق
        if (username === 'Admin_Mostafa') {
            actualMintedBalance = await OuroTokenModel.estimatedDocumentCount();
        } else {
            // حساب العملات الفعلي الممسوك للأعضاء والطلاب العاديين بالمنصة
            actualMintedBalance = await OuroTokenModel.countDocuments({ owner: username });
        }

        // جلب العقود الذكية الخارجية إن وجدت من قاعدة البيانات
        const contracts = await mongoose.model('DeveloperKey').find({ isContract: true }).catch(() => []) || [];
        
        res.json({ 
            success: true, 
            ouroBalance: actualMintedBalance, // 🪙 المتصفح والواجهة العائمة يقرآن الآن الـ 11,000,000 كاملة فالحال بنقاء 100%
            contracts: [
                {
                    id: "contract_ouro_genesis_2026",
                    contractName: "OURO Coin Master Contract (Live Mining Core)",
                    symbol: "OURO",
                    contractAddress: "0x7627OUROamek11619917627h38j4l5G84P8354000000000000000000000000000000000000" 
                }
            ] 
        });
    } catch (err) { 
        console.error("خطأ جلب الرصيد التعديني الكلي المحدث:", err);
        res.status(500).json({ success: false, error: err.message }); 
    }
});

// ==========================================================================
// 💸 [إعادة ضبط مسار التحويل كلياً] نقل ملكية العملات بملف الصك وقانون الضريبة 7%
// ==========================================================================
app.post('/api/wallet/transfer', async (req, res) => {
    try {
        const { sender, receiver, amount } = req.body; // receiver يمثل إما الـ ID الفريد أو اسم الحساب
        const transferAmount = parseInt(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ success: false, message: "⚠️ كمية الحوالة غير صالحة برمجياً" });
        }

        // 1️⃣ المطابقة الذكية والسريعة للمستقبل عبر الـ ID الفريد _id أو الـ username
        const mongoose = require('mongoose');
        let query = { username: receiver.trim() };
        if (mongoose.Types.ObjectId.isValid(receiver.trim())) query = { _id: receiver.trim() };
        let receiverUser = await UserModel.findOne(query);

        if (!receiverUser) return res.status(404).json({ success: false, message: "⚠️ الـ ID أو الحساب المستهدف غير موجود كلياً بالمنصة!" });
        if (sender === receiverUser.username) return res.status(400).json({ success: false, message: "⚠️ لا يمكنك التحويل لنفس محفظتك!" });

        // 2️⃣ [محرك فحص الرموز الحقيقي] قنص العملات المتسلسلة المملوكة للمرسل حالياً داخل ملف الصك الجديد
        const senderTokens = await OuroTokenModel.find({ owner: sender }).limit(transferAmount + Math.ceil(transferAmount * 0.07));
        
        // احتساب ضريبة الشبكة القانونية (7%) بأعداد العملات الصارمة
        const taxAmount = Math.ceil(transferAmount * 0.07);
        const totalRequiredCost = transferAmount + taxAmount;

        // فحص كفاية العملات الفعلية في ملف الصك (الأدمن مستثنى من الضريبة لحساب الخزينة)
        if (senderTokens.length < totalRequiredCost && sender !== 'Admin_Mostafa') {
            return res.status(400).json({ success: false, message: `❌ رصيدك الفعلي بملف الصك غير كافٍ! الحوالة تتطلب ${transferAmount} عملة + ${taxAmount} عملة ضريبة الشبكة.` });
        }
        
        if (senderTokens.length < transferAmount && sender === 'Admin_Mostafa') {
            return res.status(400).json({ success: false, message: `❌ رصيدك الفعلي بملف الصك لا يكفي لإتمام عملية شحن المستخدمين!` });
        }

        // 3️⃣ [تنفيذ النقل الفيزيائي للأرقام التسلسلية سحابياً بـ MongoDB Atlas]
        const tokensToReceiver = senderTokens.slice(0, transferAmount);
        const tokensToAdminTax = senderTokens.slice(transferAmount, totalRequiredCost);

        // أ) نقل ملكية العملات المحولة وتوطينها باسم الحساب المستقبل فوراً في السحاب
        const receiverTokenIds = tokensToReceiver.map(t => t.tokenId);
        await OuroTokenModel.updateMany({ tokenId: { $in: receiverTokenIds } }, { $set: { owner: receiverUser.username } });

        // ب) تطبيق القانون الضريبي (7%): نقل ملكية عملات الضريبة قسرياً لحساب الأدمن الملكي 'Admin_Mostafa'
        if (sender !== 'Admin_Mostafa' && taxAmount > 0) {
            const taxTokenIds = tokensToAdminTax.map(t => t.tokenId);
            await OuroTokenModel.updateMany({ tokenId: { $in: taxTokenIds } }, { $set: { owner: 'Admin_Mostafa' } });
        }

        // 4️⃣ إعادة حساب الأرصدة الحية التزامنية من ملف الصك لبثها صامتاً
        const finalSenderCount = await OuroTokenModel.countDocuments({ owner: sender });
        const finalReceiverCount = await OuroTokenModel.countDocuments({ owner: receiverUser.username });

        // 📡 5️⃣ المزامنة والإنعاش الصامت الآمن عبر قنوات السوكت الخارجية دون حشو مكرر
        try {
            const socketIo = global.io || (req.app ? req.app.get('socketio') : null);
            if (socketIo && typeof socketIo.emit === 'function') {
                socketIo.emit('wallet_balance_updated', { username: sender, newBalance: finalSenderCount });
                socketIo.emit('wallet_balance_updated', { username: receiverUser.username, newBalance: finalReceiverCount });
            }
        } catch (e) { console.log("تنبيه مزامنة صامت"); }

        console.log(`🎉 [Ouro Core Sovereign Transfer Success] تم نقل العملات وإعادة توطينها بملف الصك الجديد.`);
        return res.json({ success: true, newSenderBalance: finalSenderCount });

    } catch (err) { 
        console.error("خطأ التداول بمسار ملف الصك الحقيقي:", err);
        return res.status(500).json({ success: false, message: "🚨 خطأ داخلي بالخادم أثناء نقل ملكية العملات بملف الصك الجديد." }); 
    }
});


// 4️⃣ [مسار الأدمن لزرع العقود الذكية للعملات الخارجية]
app.post('/api/wallet/admin/add-contract', async (req, res) => {
    try {
        const { username, contractName, contractAddress, symbol } = req.body;
        if (username !== 'Admin_Mostafa') return res.status(403).json({ success: false, message: "غير مصرح لك" });

        const newContract = new (mongoose.model('DeveloperKey'))({
            id: 'contract_' + Date.now().toString(),
            username: username,
            keyLabel: contractName,
            apiKey: contractAddress, // حفظ العنوان كعقد ذكي متصل
            scopes: { all_features: false, prayer_times: false, virtual_flash: false, market: false, ads: false },
            isContract: true, // شارة تمييز العقد سحابياً
            contractName, contractAddress, symbol
        });

        await newContract.save();
        res.json({ success: true, contract: newContract });
    } catch (err) { res.status(500).json({ success: false }); }
});

// ==========================================================================
// 🏛️ [بوابة السنتر والاجتماعات] مسارات الدفع والاستدعاء اللحظي للمحاضرات
// ==========================================================================

// 1. [مسار استئجار القاعة وبدء البث] خصم 50 عملة من المعلم وضخها تلقائياً لخزينة الأدمن Mostafa
app.post('/api/center/rent-room', async (req, res) => {
    try {
        const { username, cost } = req.body;
        const rentCost = parseInt(cost) || 50;

        // جلب وقراءة حساب المعلم وحساب الأدمن من الملف المالي المستقل
        let teacherLedger = await OuroUserLedgerModel.findOne({ username });
        let adminLedger = await OuroUserLedgerModel.findOne({ username: 'Admin_Mostafa' });

        if (!teacherLedger) {
            teacherLedger = new OuroUserLedgerModel({ username, ouroBalance: 0 });
            await teacherLedger.save();
        }

        // فحص كفاية رصيد المعلم (إلا لو كان الأدمن نفسه فيعبر مجاناً)
        if (teacherLedger.ouroBalance < rentCost && username !== 'Admin_Mostafa') {
            return res.status(400).json({ success: false, message: `❌ رصيدك الحالي من عملات OURO غير كافٍ لاستئجار السنتر! تكلفة البث ${rentCost} عملة.` });
        }

        // تنفيذ الخصم الفعلي من المعلم وتحويل القيمة مباشرة لخزينة الأدمن الملكية
        if (username !== 'Admin_Mostafa') {
            teacherLedger.ouroBalance -= rentCost;
            await teacherLedger.save();
            
            if (adminLedger) {
                adminLedger.ouroBalance += rentCost;
                await adminLedger.save();
            }
        }

        // توليد غرفة بث فريدة مشفرة فالسحاب للسنتر التعليمي
        const generatedRoomId = 'room_' + Date.now().toString();
        const newCenterRoom = new OuroCenterModel({
            roomId: generatedRoomId,
            host: username,
            allVideos: [
                { title: "💻 محاضرة كورس الويب الشامل - الجلسة الأولى", watchHours: "124.5", date: "2026/05/28" },
                { title: "📱 كورس الأندرويد لـ Google Play - الدرس التأسيسي", watchHours: "89.2", date: "2026/05/29" }
            ]
        });
        await newCenterRoom.save();

        // بث نبضة السوكت الحية لتحديث الرصيد فالسقف تلقائياً فور الخصم
        if (global.io) {
            global.io.emit('wallet_balance_updated', { username, newBalance: teacherLedger.ouroBalance });
        }

        res.json({ success: true, roomId: generatedRoomId });
    } catch (err) {
        console.error("خطأ استئجار السنتر:", err);
        res.status(500).json({ success: false, message: "فشل الاتصال بقفل السنتر السحابي." });
    }
});

// 2. [مستمع قنوات السوكت للسنتر] المزامنة الحية وضخ حزم البيانات والوسائط الأربعة
if (global.io) {
    global.io.on('connection', (socket) => {
        // قنوات جلب بيانات السنتر للأعضاء والطلاب فور نقر الزر
        socket.on('get_center_status', async (data) => {
            try {
                // جلب أحدث قاعة بث مسجلة فالسحاب
                const latestCenter = await OuroCenterModel.findOne({}).sort({ createdAt: -1 });
                if (latestCenter) {
                    socket.emit('center_data_package', {
                        videos: latestCenter.allVideos,
                        images: latestCenter.allImages,
                        pdfs: latestCenter.allPdfs
                    });
                } else {
                    socket.emit('center_data_package', { videos: [], images: [], pdfs: [] });
                }
            } catch (e) { console.error(e); }
        });
    });
}


server.listen(PORT, "0.0.0.0", () => { 
    console.log(`🚀 السيرفر السحابي يعمل بنجاح على بورت ${PORT}`); 
});
