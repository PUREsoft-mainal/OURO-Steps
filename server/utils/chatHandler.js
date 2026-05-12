const fs = require('fs');
const path = require('path');

const saveMessage = (friendId, messageText) => {
    const chatFilePath = path.join(__dirname, `../data/chats/${friendId}.json`);
    const MAX_SIZE_MB = 2;

    // 1. فحص الحجم قبل أي إجراء
    if (fs.existsSync(chatFilePath)) {
        const stats = fs.statSync(chatFilePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

        if (fileSizeInMegabytes > MAX_SIZE_MB) {
            return { success: false, error: "ملف المحادثة ممتلئ، يرجى الأرشفة" };
        }
    }

    // 2. تجهيز كائن الرسالة مع التوقيت
    const newMessage = {
        sender_id: "me",
        text: messageText,
        timestamp: new Date().toISOString() // إضافة التوقيت الزمني هنا
    };

    // 3. تحديث الملف
    let chatData = { messages: [] };
    if (fs.existsSync(chatFilePath)) {
        chatData = JSON.parse(fs.readFileSync(chatFilePath, 'utf-8'));
    }
    
    chatData.messages.push(newMessage);
    fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 4));

    return { success: true, timestamp: newMessage.timestamp };
};

module.exports = { saveMessage };
