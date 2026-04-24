const checkSecurity = (req, res, next) => {
    const input = JSON.stringify(req.body);
    
    // أنماط هجوم معروفة (SQL Injection, XSS)
    const blackList = [/<script>/, /SELECT \* FROM/, /drop table/i];
    
    const isSuspicious = blackList.some(pattern => pattern.test(input));

    if (isSuspicious) {
        // استدعاء الجدار الذكي فوراً لتحليل الهجمة
        SmartFirewall.analyzeAttack(input, "Injection Attack");
        return res.status(403).send("محاولة غير مصرح بها - تم تسجيل بصمتك الرقمية.");
    }
    next();
};

