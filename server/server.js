const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 7860;

// الاتصال بـ MongoDB Atlas
const mongoURI = "mongodb+srv://mostafa:01027411921@cluster0.kgw7td9.mongodb.net/ouro_db?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ متصل بـ MongoDB Atlas بنجاح ساحق"))
  .catch(err => console.error("❌ خطأ اتصال بـ MongoDB:", err));

app.use(cors({
    origin: ["https://vercel.app", "https://hf.space"],
    credentials: true,
    methods: ["GET", "POST", "DELETE"]
}));

app.use(express.json());

// إعداد مجلد التخزين المؤقت المتوافق مع Hugging Face
const UPLOADS_DIR = path.join('/tmp', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 👑 تهيئة الاتصال بجوجل سحابياً (Google Cloud Storage) من المتغيرات البيئية
const storageGCS = new Storage({
    credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY ? process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
    }
});
const BUCKET_NAME = 'ouro-steps-bucket'; // اسم الحاوية السحابية الخاصة بك بجوجل
const bucket = storageGCS.bucket(BUCKET_NAME);

// ==========================================================================
// 🏛️ بناء وهيكلة جداول السحابة بـ MongoDB Atlas للأبد
// ==========================================================================

const MarketSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    uploader: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: String, default: 'غير محدد' },
    images: { type: [String], default: [] },
    time: { type: String, required: true },
    expiryDate: { type: Number, required: true }
});
const MarketModel = mongoose.model('Market', MarketSchema);

const OuroCenterRequestSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    applicant: { type: String, required: true },
    targetHost: { type: String },
    status: { type: String, default: 'pending' },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
const OuroCenterRequestModel = mongoose.model('OuroCenterRequest', OuroCenterRequestSchema);

const DeveloperKeySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    keyLabel: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    scopes: {
        all_features: { type: Boolean, default: false },
        prayer_times: { type: Boolean, default: true },
        virtual_flash: { type: Boolean, default: false },
        market: { type: Boolean, default: false },
        ads: { type: Boolean, default: true },
        wallet: { type: Boolean, default: false },
        center: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: false },
    approvedBy: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});
const DeveloperKeyModel = mongoose.models.DeveloperKey || mongoose.model('DeveloperKey', DeveloperKeySchema);

const PrayerAssetSchema = new mongoose.Schema({
    id: { type: String, default: 'config' },
    kaabaImgUrl: { type: String, default: '/assets/kaaba.png' },
    adhanAudioUrl: { type: String, default: '/assets/adhan.mp3' }
});
const PrayerAssetModel = mongoose.model('PrayerAsset', PrayerAssetSchema);

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'مستخدم' },
    avatar: { type: String, default: '' },
    friends: { type: [String], default: [] },
    friendRequests: { type: [String], default: [] }
});
const UserModel = mongoose.model('User', UserSchema);

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

const UserPermissionSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    isAuthorizedTeacher: { type: Boolean, default: false },
    isAuthorizedStudent: { type: Boolean, default: false },
    permissionExpiry: { type: Date },
    assignedBy: { type: String, default: 'Admin_Mostafa' },
    updatedAt: { type: Date, default: Date.now }
});
const UserPermissionModel = mongoose.models.UserPermission || mongoose.model('UserPermission', UserPermissionSchema);

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

const GroupSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    creator: { type: String, required: true },
    mod1: { type: String, default: '' },
    mod2: { type: String, default: '' },
    allowedUsers: { type: [String], default: [] }
});
const GroupModel = mongoose.model('Group', GroupSchema);

const PrivateMessageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    roomId: { type: String, required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true },
    participants: { type: [String], default: [] }
});
const PrivateMessageModel = mongoose.model('PrivateMessage', PrivateMessageSchema);

// 👑 [إصلاح الثغرة الهيكلية المفقودة] تعريف جدول السنتر والاجتماعات سحابياً
const OuroCenterSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    allVideos: { type: Array, default: [] },
    allImages: { type: Array, default: [] },
    allPdfs: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});
const OuroCenterModel = mongoose.model('OuroCenter', OuroCenterSchema);

// 👑 [إصلاح الثغرة الهيكلية المفقودة] تعريف جدول الفلاشة الإلكترونية سحابياً
const FlashFileSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    owner: { type: String, required: true },
    originalName: { type: String, required: true },
    gcsUrl: { type: String, required: true },
    size: { type: String, required: true },
    uploadTime: { type: String, required: true },
    expiryDate: { type: Number, required: true }
});
const FlashFileModel = mongoose.model('FlashFile', FlashFileSchema);

// تهيئة وإعداد السوكت للاتصالات السحابية المشفرة
const io = new Server(server, {
    cors: {
        origin: ["https://vercel.app", "https://hf.space"],
        credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true
});
global.io = io;

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

let activeUsers = 0;

// تفعيل المجموعة العامة تلقائياً بقاعدة البيانات السحابية
GroupModel.findOne({ id: 'public' }).then(async (group) => {
    if (!group) {
        const publicRoom = new GroupModel({ id: 'public', name: 'المجموعة العامة', creator: 'System' });
        await publicRoom.save();
    }
});

// 👑 دالة الرفع السحابية الذكية لضخ الملفات والبرامج الكبرى مباشرة لخزائن جوجل
const uploadToGoogleCloud = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) reject("الملف غير موجود رقمياً");
        const gcsFileName = `${Date.now()}-${file.originalname}`;
        const blob = bucket.file(gcsFileName);
        const blobStream = blob.createWriteStream({
            resumable: true,
            gzip: true,
            metadata: { contentType: file.mimetype }
        });
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => {
            const publicUrl = `https://googleapis.com{bucket.name}/${blob.name}`;
            resolve(publicUrl);
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
        fs.createReadStream(file.path).pipe(blobStream);
    });
};

// ==========================================================================
// 📡 إدارة مستمعات السوكت والأحداث الحية للأعضاء والمجموعات
// ==========================================================================
io.on('connection', (socket) => {
    activeUsers++;
    
    UserModel.countDocuments().then(total => {
        io.emit('update_stats', { totalUsers: total, activeUsers });
    });

    socket.on('register', async (data) => {
        try {
            if (!data || !data.username || !data.password) return socket.emit('error_msg', '⚠️ البيانات المرسلة غير مكتملة');
            const userExists = await UserModel.findOne({ username: data.username });
            if (userExists) return socket.emit('error_msg', '⚠️ اسم المستخدم مسجل مسبقاً في السحاب!');

            const newUserId = new mongoose.Types.ObjectId();
            const newUser = new UserModel({
                _id: newUserId,
                username: data.username.trim(),
                password: data.password,
                role: data.role || 'مستخدم'
            });
            await newUser.save();

            const initialExpiry = new Date(Date.now());
            const newPermission = new UserPermissionModel({
                username: data.username.trim(),
                isAuthorizedTeacher: (newUser.username === 'Admin_Mostafa'),
                isAuthorizedStudent: (newUser.username === 'Admin_Mostafa'),
                permissionExpiry: initialExpiry,
                assignedBy: 'Admin_Mostafa'
            });
            await newPermission.save();

            socket.emit('register_success', { username: newUser.username, role: newUser.role });
            const total = await UserModel.countDocuments();
            io.emit('update_stats', { totalUsers: total, activeUsers });
        } catch (err) { socket.emit('error_msg', '⚠️ فشل تدوير وتسجيل الحساب بالسحاب'); }
    });

    socket.on('join', async (data) => {
        try {
            if (!data || !data.username || !data.password) return socket.emit('error_msg', 'البيانات المرسلة غير مكتملة');

            if (data.username === 'Admin_Mostafa' && data.password === '123') {
                let adminCheck = await UserModel.findOne({ username: 'Admin_Mostafa' });
                if (!adminCheck) {
                    adminCheck = new UserModel({ username: 'Admin_Mostafa', password: '123', role: 'Admin' });
                    await adminCheck.save();
                }
            }
            let user = await UserModel.findOne({ username: data.username });
            let isMatch = false;
            if (user) {
                if (user.password === data.password) {
                    isMatch = true;
                } else {
                    try {
                        const bcrypt = require('bcryptjs');
                        isMatch = await bcrypt.compare(data.password, user.password);
                    } catch (e) { isMatch = false; }
                }
            }

            if (user && isMatch) {
                socket.user = user;
                const userPermission = await UserPermissionModel.findOne({ username: user.username });
                const updatedUserObj = {
                    ...user.toObject(),
                    isAuthorizedTeacher: userPermission ? userPermission.isAuthorizedTeacher : (user.username === 'Admin_Mostafa'),
                    isAuthorizedStudent: userPermission ? userPermission.isAuthorizedStudent : (user.username === 'Admin_Mostafa'),
                    permissionExpiry: userPermission ? userPermission.permissionExpiry : null
                };

                const ads = await AdModel.find({});
                const messages = await GroupMessageModel.find({ roomId: 'public' }).sort({ _id: 1 }).limit(50);
                const localGroups = await GroupModel.find({});
                const total = await UserModel.countDocuments();
                const usersList = await UserModel.find({}, { password: 0 }).sort({ username: 1 });

                socket.emit('init_data', {
                    ads,
                    chatHistory: messages,
                    user: updatedUserObj,
                    groups: localGroups,
                    usersList,
                    stats: { totalUsers: total, activeUsers }
                });
                socket.emit('init_users_data', usersList);
            } else {
                socket.emit('error_msg', '⚠️ خطأ في اسم المستخدم أو كلمة المرور!');
            }
        } catch (err) { socket.emit('error_msg', 'فشل الاتصال بقاعدة البيانات السحابية'); }
    });

    socket.on('create_group', async (data) => {
        try {
            if (!data || !data.name || !data.name.trim() || !socket.user) return;
            const roomId = 'group_' + Date.now().toString();
            const newGroup = new GroupModel({
                id: roomId,
                name: data.name.trim(),
                creator: socket.user.username,
                allowedUsers: [socket.user.username, 'Admin_Mostafa']
            });
            await newGroup.save();
            io.emit('new_group_added', newGroup);
        } catch (err) { console.log(err); }
    });

    socket.on('join_group_room', async (data) => {
        try {
            if (!data.roomId || !socket.user) return;
            const group = await GroupModel.findOne({ id: data.roomId });
            if (group && data.roomId !== 'public' && socket.user.username !== 'Admin_Mostafa' && socket.user.username !== group.creator) {
                if (!group.allowedUsers || !group.allowedUsers.includes(socket.user.username)) {
                    return socket.emit('error_msg', '🛑 عذراً، هذه الغرفة مغلقة ومحمية سيبرانياً!');
                }
            }
            socket.join(data.roomId);
            const messages = await GroupMessageModel.find({ roomId: data.roomId }).sort({ _id: 1 });
            socket.emit('group_chat_history', { roomId: data.roomId, history: messages });
        } catch (err) { console.log(err); }
    });

    socket.on('sendGroupMessage', async (data) => {
        try {
            if (!socket.user || !data.roomId || !data.text) return;
            const msgData = new GroupMessageModel({
                id: Date.now().toString(),
                roomId: data.roomId,
                user: socket.user.username,
                role: socket.user.role,
                avatar: socket.user.avatar || '',
                text: data.text.trim(),
                time: new Date().toLocaleTimeString('ar-EG')
            });
            await msgData.save();
            io.to(data.roomId).emit('group_message', { roomId: data.roomId, msg: msgData });
        } catch (err) { console.log(err); }
    });

    socket.on('send_friend_request', async (data) => {
        try {
            await UserModel.updateOne({ username: data.targetUser }, { $addToSet: { friendRequests: data.currentUser } });
            const updatedUsers = await UserModel.find({}, { password: 0 }).sort({ username: 1 });
            io.emit('friend_updated', { usersList: updatedUsers });
        } catch (err) { console.log(err); }
    });
    socket.on('accept_friend_request', async (data) => {
        try {
            await UserModel.updateOne({ username: data.currentUser }, { $addToSet: { friends: data.targetUser }, $pull: { friendRequests: data.targetUser } });
            await UserModel.updateOne({ username: data.targetUser }, { $addToSet: { friends: data.currentUser } });
            const updatedUsers = await UserModel.find({}, { password: 0 }).sort({ username: 1 });
            io.emit('friend_updated', { usersList: updatedUsers });
        } catch (err) { console.log(err); }
    });

    socket.on('submit_teacher_subscribe_request', async (data) => {
        try {
            const reqId = 'req_' + Date.now();
            const newReq = new OuroCenterRequestModel({ requestId: reqId, type: 'teacher_access', applicant: data.username });
            await newReq.save();
            io.emit('admin_receive_teacher_request', { requestId: reqId, applicant: data.username });
        } catch (e) { console.log(e); }
    });

    socket.on('admin_approve_teacher_request', async (data) => {
        try {
            const reqDoc = await OuroCenterRequestModel.findOne({ requestId: data.requestId });
            if (reqDoc) {
                reqDoc.status = 'approved';
                reqDoc.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                await reqDoc.save();
                await UserPermissionModel.updateOne({ username: reqDoc.applicant }, { $set: { isAuthorizedTeacher: true, permissionExpiry: reqDoc.expiresAt } }, { upsert: true });
                io.emit('teacher_request_granted', { username: reqDoc.applicant, expiresAt: reqDoc.expiresAt });
            }
        } catch (e) { console.log(e); }
    });

    // 👑 [إصلاح ثغرة الـ Disconnect الحية] جلب الإجمالي الفعلي من MongoDB Atlas
    socket.on('disconnect', async () => {
        activeUsers = Math.max(0, activeUsers - 1);
        const total = await UserModel.countDocuments();
        io.emit('update_stats', { totalUsers: total, activeUsers });
    });
});

// ==========================================================================
// 🏛️ مسارات الـ API وبوابات الرفع والمعالجة السحابية لجوجل أطلس
// ==========================================================================

app.get('/api/users', async (req, res) => {
    const allUsers = await UserModel.find({}, { password: 0 }).sort({ username: 1 });
    res.json(allUsers);
});

app.get('/api/market', async (req, res) => {
    const posts = await MarketModel.find({}).sort({ _id: -1 });
    res.json(posts);
});

app.get('/api/stories', async (req, res) => {
    const activeStories = await StoryModel.find({ expiryDate: { $gt: Date.now() } }).sort({ _id: -1 });
    res.json(activeStories);
});

app.post('/api/upload-story', upload.single('storyFile'), async (req, res) => {
    try {
        let storyUrl = "";
        if (req.file) storyUrl = `/uploads/${req.file.filename}`;
        const newStory = new StoryModel({
            id: Date.now().toString(),
            user: req.body.username || 'مستخدم عام',
            caption: req.body.caption || '',
            isTextOnly: req.body.isTextOnly === 'true',
            textBg: req.body.textBg || '#1a1a1a',
            url: storyUrl,
            time: new Date().toLocaleTimeString('ar-EG'),
            expiryDate: Date.now() + (24 * 60 * 60 * 1000)
        });
        await newStory.save();
        io.emit('new_file', newStory);
        res.json({ success: true, file: newStory });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/upload-market', upload.array('marketImages', 10), async (req, res) => {
    try {
        const files = req.files || [];
        const imagesPaths = files.map(f => `/uploads/${f.filename}`);
        const newPost = new MarketModel({
            id: 'post_' + Date.now().toString(),
            uploader: req.body.username || req.body.uploader,
            description: req.body.description || '',
            price: req.body.price || 'غير محدد',
            images: imagesPaths,
            time: new Date().toLocaleDateString('ar-EG'),
            expiryDate: Date.now() + (90 * 24 * 60 * 60 * 1000)
        });
        await newPost.save();
        io.emit('new_market_post', newPost);
        res.json({ success: true, post: newPost });
    } catch (err) { res.status(500).json({ success: false }); }
});
app.delete('/api/market/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.body.username || req.body.uploader;
        const targetPost = await MarketModel.findOne({ id: id });
        if (!targetPost) return res.status(404).json({ success: false, message: "المنشور غير موجود سحابياً" });

        if (username === targetPost.uploader || username === 'Admin_Mostafa') {
            if (targetPost.images && targetPost.images.length > 0) {
                targetPost.images.forEach(imgUrl => {
                    const filePath = path.join(UPLOADS_DIR, path.basename(imgUrl));
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            }
            await MarketModel.deleteOne({ id: id });
            io.emit('market_post_deleted', { postId: id });
            return res.json({ success: true });
        }
        res.status(403).json({ success: false, message: "غير مصرح لك بالحذف" });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 👑 [تصحيح مسار الـ Avatar سحابياً بالكامل] وإلغاء تضارب الـ JSON القديم
app.post('/api/user/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "الصورة مطلوبة" });
        const { username } = req.body;
        const avatarUrl = `/uploads/${req.file.filename}`;
        
        const updatedUser = await UserModel.findOneAndUpdate(
            { username: username },
            { $set: { avatar: avatarUrl } },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

        io.emit('user_avatar_updated', { username, avatarUrl });
        res.json({ success: true, avatarUrl });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 👑 [مسار الفلاشة المطور] رفع البرامج والملفات الكبرى وتوجيهها مباشرة لـ Google Cloud
app.post('/api/flash/upload', upload.single('flashFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "الرجاء اختيار ملف" });
        const { username } = req.body;

        // ضخ الملف فوراً لخزائن جوجل السحابية للأبد
        const googleCloudUrl = await uploadToGoogleCloud(req.file);
        const seventyTwoHours = 72 * 60 * 60 * 1000;

        const newFileRecord = new FlashFileModel({
            id: 'file_' + Date.now().toString(),
            owner: username,
            originalName: req.file.originalname,
            gcsUrl: googleCloudUrl,
            size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
            uploadTime: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG'),
            expiryDate: Date.now() + seventyTwoHours
        });
        await newFileRecord.save();

        const allFiles = await FlashFileModel.find({});
        io.emit('flash_db_updated', allFiles);
        res.json({ success: true, file: newFileRecord });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/flash/files/:username', async (req, res) => {
    const userFiles = await FlashFileModel.find({ owner: req.params.username });
    res.json(userFiles);
});

app.get('/api/prayer-times', (req, res) => {
    res.json({ fajr: '04:10', dhuhr: '12:55', asr: '16:30', maghrib: '19:45', isha: '21:15' });
});
app.post('/api/developer/create-key', async (req, res) => {
    try {
        const { username, keyLabel, scopes } = req.body;
        const crypto = require('crypto');
        const generatedApiKey = 'ouro_api_' + crypto.randomBytes(16).toString('hex');

        const newApiKeyDoc = new DeveloperKeyModel({
            id: 'key_' + Date.now().toString(),
            username,
            keyLabel,
            apiKey: generatedApiKey,
            scopes,
            isActive: false
        });
        await newApiKeyDoc.save();

        io.emit('admin_receive_api_key_request', { 
            keyId: newApiKeyDoc.id, applicant: username, label: keyLabel, scopes
        });
        res.json({ success: true, key: newApiKeyDoc });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/developer/approve-key', async (req, res) => {
    try {
        const { adminUsername, keyId } = req.body;
        const adminUserDoc = await UserModel.findOne({ username: adminUsername });
        const isAuthorized = adminUsername === 'Admin_Mostafa' || (adminUserDoc && ['Admin', 'Moderator'].includes(adminUserDoc.role));

        if (!isAuthorized) return res.status(403).json({ success: false, message: "🚨 حظر سيبراني!" });

        const updatedKey = await DeveloperKeyModel.findOneAndUpdate(
            { id: keyId }, { $set: { isActive: true, approvedBy: adminUsername } }, { new: true }
        );
        io.emit('developer_key_activated', { username: updatedKey.username, keyId: updatedKey.id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/developer/keys-list', async (req, res) => {
    const keys = await DeveloperKeyModel.find({ username: req.body.username }).sort({ createdAt: -1 });
    res.json({ success: true, keys });
});

// 👑 [تعديل بوابة السنتر] لرفع الفيديوهات مباشرة وضخها بسحاب جوجل المأمن
app.post('/api/center/upload-video', upload.single('centerVideo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "الفيديو مطلوب" });
        const googleCloudUrl = await uploadToGoogleCloud(req.file);
        const { username, videoTitle } = req.body;

        const updatedCenter = await OuroCenterModel.findOneAndUpdate(
            { host: username },
            { $push: { allVideos: { title: videoTitle || "محاضرة جديدة", videoUrl: googleCloudUrl, date: new Date().toLocaleDateString('ar-EG') } } },
            { new: true, upsert: true }
        );
        io.emit('center_data_updated', updatedCenter);
        res.json({ success: true, videoUrl: googleCloudUrl });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/center/rent-room', async (req, res) => {
    try {
        const { username } = req.body;
        const permissionDoc = await UserPermissionModel.findOne({ username: username.trim() });
        if (username !== 'Admin_Mostafa') {
            if (!permissionDoc || !permissionDoc.isAuthorizedTeacher || new Date() > permissionDoc.permissionExpiry) {
                return res.status(403).json({ success: false, message: "🔒 عذراً، قاعة البث مغلقة!" });
            }
        }
        const generatedRoomId = 'room_' + Date.now().toString();
        const newCenterRoom = new OuroCenterModel({ roomId: generatedRoomId, host: username });
        await newCenterRoom.save();
        res.json({ success: true, roomId: generatedRoomId });
    } catch (err) { res.status(500).json({ success: false }); }
});
// ==========================================================================
// 🧹 دوال التطهير الدوري المؤتمتة والشاملة لقاعدة البيانات السحابية (MongoDB)
// ==========================================================================

setInterval(async () => {
    try {
        const now = Date.now();
        // 1. تنظيف السوق السحابي والملفات الفيزيائية الملحقة به
        const expiredPosts = await MarketModel.find({ expiryDate: { $lte: now } });
        expiredPosts.forEach(post => {
            if (post.images) {
                post.images.forEach(img => {
                    const p = path.join(UPLOADS_DIR, path.basename(img));
                    if (fs.existsSync(p)) fs.unlinkSync(p);
                });
            }
        });
        await MarketModel.deleteMany({ expiryDate: { $lte: now } });

        // 2. تنظيف الإعلانات المنتهية سحابياً
        await AdModel.deleteMany({ expiryDate: { $lte: now } });
        const remainingAds = await AdModel.find({});
        io.emit('update_ads', remainingAds);

        // 3. تنظيف ملفات الفلاشة الإلكترونية المنتهية من قاعدة البيانات
        await FlashFileModel.deleteMany({ expiryDate: { $lte: now } });
    } catch (err) { console.error("🧹 خطأ في المكنسة التلقائية السحابية:", err); }
}, 60 * 60 * 1000);

// ساعة المراقبة لإطلاق صوت الأذان المتزامن حياً عند الجميع في مصر
let lastTriggeredPrayer = "";
setInterval(() => {
    const now = new Date();
    const currentHourMin = now.toTimeString().substring(0, 5);
    const month = now.getMonth() + 1;
    let times = { fajr: "04:10", dhuhr: "12:55", asr: "16:30", maghrib: "19:45", isha: "21:15" };

    if (month >= 5 && month <= 8) times = { fajr: "04:02", dhuhr: "12:57", asr: "16:34", maghrib: "20:01", isha: "21:32" };
    else if (month >= 11 || month <= 2) times = { fajr: "05:15", dhuhr: "11:58", asr: "14:50", maghrib: "17:05", isha: "18:35" };

    let activePrayer = "";
    if (currentHourMin === times.fajr) activePrayer = "الفجر";
    if (currentHourMin === times.dhuhr) activePrayer = "الظهر";
    if (currentHourMin === times.asr) activePrayer = "العصر";
    if (currentHourMin === times.maghrib) activePrayer = "المغرب";
    if (currentHourMin === times.isha) activePrayer = "العشاء";

    if (activePrayer && lastTriggeredPrayer !== activePrayer) {
        lastTriggeredPrayer = activePrayer;
        io.emit('trigger_adhan_broadcast', { prayerName: activePrayer });
    }
    if (![times.fajr, times.dhuhr, times.asr, times.maghrib, times.isha].includes(currentHourMin)) lastTriggeredPrayer = "";
}, 20 * 1000);

server.listen(PORT, "0.0.0.0", () => { console.log(`🚀 السيرفر السحابي يعمل بنجاح على بورت ${PORT}`); });
