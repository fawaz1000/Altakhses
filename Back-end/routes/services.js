const express = require('express');
const router = express.Router();
const Service = require('../Models/Service');
const authenticateToken = require('../Middleware/authMiddleware');

// جلب جميع الخدمات
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    console.error('خطأ في جلب الخدمات:', err);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب البيانات' });
  }
});

// إضافة خدمة جديدة (يتطلب صلاحية)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  if (
    typeof title !== 'string' || !title.trim() ||
    typeof description !== 'string' || !description.trim()
  ) {
    return res.status(400).json({ message: 'العنوان والوصف مطلوبان ويجب أن يكونا نصاً.' });
  }

  try {
    const newService = new Service({ title: title.trim(), description: description.trim() });
    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    console.error('خطأ في حفظ الخدمة:', err);
    res.status(400).json({ message: 'تعذر حفظ الخدمة', error: err.message });
  }
});

module.exports = router;
