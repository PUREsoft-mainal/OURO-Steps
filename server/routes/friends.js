const fs = require('fs');
const path = require('path');

// دالة معالجة إضافة الصديق وحجم الملف
const handleFriendSetup = (req, res) => {
    const newFriend = req.body; // البيانات المرسلة من App.js
    const friendsPath = path.join(__dirname, '../data/friends.json');

    // 1. تحديث ملف الأصدقاء
    let friendsData = { friends: [] };
    if (fs.existsSync(friendsPath)) {
        friendsData = JSON.parse(fs.readFileSync(friendsPath, 'utf-8'));
    }
    friendsData.friends.push(newFriend);
    fs.writeFileSync(friendsPath, JSON.stringify(friendsData, null, 4));

    // 2. إنشاء ملف المحادثة الخاص به إذا لم يكن موجوداً
    const chatFilePath = path.join(__dirname, `../data/chats/${newFriend.id}.json`);
    if (!fs.existsSync(chatFilePath)) {
        fs.writeFileSync(chatFilePath, JSON.stringify({ messages: [] }));
    }

    res.status(200).send({ message: "تم إعداد الصديق والملفات بنجاح" });
};
