FROM node:18
WORKDIR /app

# نسخ كل الملفات
COPY . .

# تثبيت المكتبات
RUN npm install

# إعدادات البورت
ENV PORT=7860
EXPOSE 7860

# أمر تشغيل مرن: سيبحث عن server.js في المجلد الرئيسي أولاً، ثم داخل مجلد server
CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; else node server/server.js; fi"]
