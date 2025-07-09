const router = require('express').Router();
const { getMyCourses } = require('../controllers/mentorController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/my-courses', authMiddleware, getMyCourses);

module.exports = router;
