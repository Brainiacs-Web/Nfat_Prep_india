const Course = require('../models/Course');
const slugify = require('slugify');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { name, description, thumbnail } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const slug = slugify(name, { lower: true });

    const existing = await Course.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Course with this name already exists' });
    }

    const course = await Course.create({
      name,
      description,
      thumbnail,
      slug,
    });

    res.status(201).json(course);
  } catch (err) {
    console.error('Create Course Error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Get all courses (public route)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error('Get Courses Error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get a course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error('Get Course By ID Error:', err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { name, description, thumbnail } = req.body;

    const slug = slugify(name, { lower: true });

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { name, description, thumbnail, slug },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update Course Error:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(204).send(); // No content
  } catch (err) {
    console.error('Delete Course Error:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};
