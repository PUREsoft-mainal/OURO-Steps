from utils.file_manager import update_friends_list, check_chat_size
import os

# 1. تعريف بيانات صديق جديد كاختبار
new_friend = {
    "id": "101",
    "name": "عبدالله محمد",
    "chat_file": "data/chats/chat_101.json"
}

# 2. التأكد من أن مجلد المحادثات موجود
os.makedirs("data/chats", exist_ok=True)

# 3. حفظ الصديق في الملف المستقل
update_friends_list(new_friend)

# 4. فحص حجم ملف المحادثة الخاص به قبل البدء (مثال)
if check_chat_size(new_friend["chat_file"]):
    print(f"جاهز لبدء المحادثة مع {new_friend['name']}. الحجم آمن.")
else:
    print("تنبيه: ملف المحادثة ممتلئ، يرجى الأرشفة.")
