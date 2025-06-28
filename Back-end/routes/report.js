// Back-end/routes/report.js
const express = require('express');
const Report  = require('../Models/report');
const authenticateToken = require('../Middleware/authMiddleware');
const router  = express.Router();

// GET /api/reports?year=YYYY  → إرجاع التقرير للعام المطلوب (أو أحدث)
router.get('/', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    console.log(`طلب جلب تقرير للسنة: ${year}`);
    
    let report = await Report.findOne({ year });
    if (!report) {
      console.log(`لم يوجد تقرير للسنة ${year}`);
      return res.json([]);
    }
    
    console.log(`تم العثور على تقرير للسنة ${year}:`, report);
    res.json([report]);
  } catch (err) {
    console.error('خطأ جلب التقارير:', err);
    res.status(500).json({ message: 'فشل في تحميل التقارير' });
  }
});

// GET /api/reports/years → إرجاع السنوات المتاحة للعرض العام (بدون مصادقة)
router.get('/years', async (req, res) => {
  try {
    const reports = await Report.find({}, { year: 1, _id: 0 }).sort({ year: -1 });
    console.log('السنوات المتاحة للعرض العام:', reports);
    res.json(reports);
  } catch (err) {
    console.error('خطأ جلب السنوات المتاحة:', err);
    res.status(500).json({ message: 'فشل في تحميل السنوات المتاحة' });
  }
});

// GET /api/reports/all  → إرجاع جميع التقارير (لعرض السنوات المتاحة - يتطلب مصادقة للأدمن)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find({}, { year: 1, _id: 0 }).sort({ year: -1 });
    console.log('جميع السنوات المتاحة للأدمن:', reports);
    res.json(reports);
  } catch (err) {
    console.error('خطأ جلب جميع التقارير:', err);
    res.status(500).json({ message: 'فشل في تحميل قائمة التقارير' });
  }
});

// POST /api/reports  → حفظ تقرير جديد للعام المحدد أو تحديثه
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('البيانات المستلمة:', req.body);
    
    const { year, metrics } = req.body;
    
    // التحقق من وجود البيانات الأساسية
    if (!year || !Array.isArray(metrics)) {
      console.log('بيانات التقرير غير صحيحة:', { year, metrics });
      return res.status(400).json({ message: 'بيانات التقرير غير صحيحة' });
    }

    // التحقق من صحة السنة
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      console.log('السنة غير صحيحة:', year);
      return res.status(400).json({ message: 'السنة يجب أن تكون بين 2020 و 2030' });
    }

    // التحقق من صحة البيانات
    for (const metric of metrics) {
      if (!metric.label || typeof metric.count !== 'number' || metric.count < 0) {
        console.log('بيانات الإحصائيات غير صحيحة:', metric);
        return res.status(400).json({ message: `بيانات غير صحيحة للإحصائية: ${metric.label}` });
      }
    }

    console.log(`محاولة حفظ تقرير للسنة ${yearNum} مع البيانات:`, metrics);

    // إما أنشئ مستنداً جديداً أو حدّث الحالي للعام ذاته
    const report = await Report.findOneAndUpdate(
      { year: yearNum },
      { metrics },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    console.log('تم حفظ التقرير بنجاح:', report);
    res.json(report);
  } catch (err) {
    console.error('خطأ حفظ التقارير:', err);
    res.status(500).json({ message: 'فشل حفظ التقرير: ' + err.message });
  }
});

// DELETE /api/reports/:year  → حذف تقرير سنة معينة
router.delete('/:year', authenticateToken, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    console.log(`محاولة حذف تقرير للسنة: ${year}`);
    
    if (!year || year < 2020 || year > 2030) {
      return res.status(400).json({ message: 'السنة غير صحيحة' });
    }

    const deletedReport = await Report.findOneAndDelete({ year });
    
    if (!deletedReport) {
      console.log(`التقرير غير موجود للسنة ${year}`);
      return res.status(404).json({ message: 'التقرير غير موجود' });
    }

    console.log(`تم حذف تقرير السنة ${year} بنجاح`);
    res.json({ message: `تم حذف تقرير سنة ${year} بنجاح` });
  } catch (err) {
    console.error('خطأ حذف التقرير:', err);
    res.status(500).json({ message: 'فشل في حذف التقرير' });
  }
});

// GET /api/reports/:year  → إرجاع تقرير سنة محددة
router.get('/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    console.log(`طلب جلب تقرير محدد للسنة: ${year}`);
    
    if (!year || year < 2020 || year > 2030) {
      return res.status(400).json({ message: 'السنة غير صحيحة' });
    }

    const report = await Report.findOne({ year });
    
    if (!report) {
      console.log(`التقرير غير موجود للسنة ${year}`);
      return res.status(404).json({ message: 'التقرير غير موجود' });
    }

    console.log(`تم العثور على تقرير للسنة ${year}:`, report);
    res.json(report);
  } catch (err) {
    console.error('خطأ جلب التقرير:', err);
    res.status(500).json({ message: 'فشل في تحميل التقرير' });
  }
});

module.exports = router;