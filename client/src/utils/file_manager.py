import os
import json

def check_chat_size(file_path, max_mb=2):
    """التحقق من حجم ملف المحادثة قبل الكتابة فيه"""
    if not os.path.exists(file_path):
        return True
    
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    return file_size_mb <= max_mb

def update_friends_list(new_friend, filepath="data/friends.json"):
    """إضافة صديق جديد إلى ملف JSON المستقل"""
    # التأكد من وجود المجلد
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # قراءة البيانات الموجودة أو إنشاء قائمة جديدة
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"friends": []}

    # إضافة الصديق وحفظ الملف
    data["friends"].append(new_friend)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
