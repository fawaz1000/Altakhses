// Back-end/routes/report.js
const express = require('express');
const Report  = require('../Models/report');
const authenticateToken = require('../Middleware/authMiddleware');
const router  = express.Router();

// GET /api/reports?year=YYYY  → إرجاع التقرير للعام المطلوب (أو أحدث)
router.get('/', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    let report = await Report.findOne({ year });
    if (!report) {
      // إذا لم يوجد التقرير لهذا العام، يمكن إرجاع مصفوفة فارغة
      return res.json([]);
    }
    res.json([report]);
  } catch (err) {
    console.error('خطأ جلب التقارير:', err);
    res.status(500).json({ message: 'فشل في تحميل التقارير' });
  }
});

// POST /api/reports  → حفظ تقرير جديد للعام الحالي أو تحديثه
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { year, metrics } = req.body;
    if (!year || !Array.isArray(metrics)) {
      return res.status(400).json({ message: 'بيانات التقرير غير صحيحة' });
    }

    // إما أنشئ مستنداً جديداً أو حدّث الحالي للعام ذاته
    const report = await Report.findOneAndUpdate(
      { year },
      { metrics },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(report);
  } catch (err) {
    console.error('خطأ حفظ التقارير:', err);
    res.status(400).json({ message: 'فشل حفظ التقرير' });
  }
});

module.exports = router;
