const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// ✅ Public routes
router.get('/', getAllCourses);        // Fetch all courses without token
router.get('/:id', getCourseById);     // Fetch one course without token

// 🔐 Protected routes
router.post('/', authMiddleware, createCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

module.exports = router;
