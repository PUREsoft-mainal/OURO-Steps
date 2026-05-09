FROM node:18
WORKDIR /app

# نسخ ملف الإعدادات من داخل مجلد السيرفر
COPY server/package*.json ./

# تثبيت المكتبات
RUN npm install

# نسخ كل ملفات المشروع
COPY . .

# تشغيل السيرفر من مساره الصحيح
# Hugging Face يستخدم بورت 7860 تلقائياً
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server/server.js"]

