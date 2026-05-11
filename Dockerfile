FROM node:18
WORKDIR /app

# نسخ كل ملفات المشروع (سيقوم بنسخ package.json وكل المجلدات)
COPY . .

# تثبيت المكتبات (سيبحث عن package.json في المجلد الرئيسي)
RUN npm install

# إعدادات البورت
ENV PORT=7860
EXPOSE 7860

# أمر التشغيل المباشر
# تأكد أن ملفك اسمه server.js وموجود داخل مجلد اسمه server
CMD ["node", "server/server.js"]
