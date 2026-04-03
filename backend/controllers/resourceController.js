// backend/controllers/resourceController.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Resource = require('../models/Resource');
const Course = require('../models/Course');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// Middleware for single file upload
exports.uploadResourceFile = upload.single('file');

// @desc    Upload a resource file and create resource record
// @route   POST /api/courses/:courseId/resources
// @access  Private (Tutor of the course)
exports.createResource = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, fileType, category } = req.body;
    const course = courseId !== 'none' ? await Course.findById(courseId) : null;
    
    if (courseId !== 'none' && !course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    if (course && course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`; // relative URL to be served statically

    const resource = await Resource.create({
      title: title || req.file.originalname,
      description: description || '',
      fileUrl,
      fileType: fileType || 'other',
      category: category || 'lecture_material',
      course: courseId !== 'none' ? courseId : undefined,
      uploadedBy: req.user.id
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all resources for a course
// @route   GET /api/courses/:courseId/resources
// @access  Private (if enrolled or tutor)
exports.getCourseResources = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check access
    let canView = false;
    if (course.status === 'published') canView = true;
    if (req.user && (req.user.id === course.tutor.toString() || req.user.role === 'admin')) canView = true;
    if (req.user && req.user.role === 'student') {
      const Enrollment = require('../models/Enrollment');
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: courseId, status: 'active' });
      if (enrolled) canView = true;
    }
    if (!canView) return res.status(403).json({ success: false, message: 'Not authorized' });

    const resources = await Resource.find({ course: courseId }).sort('-createdAt');
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a resource (and remove file from disk)
// @route   DELETE /api/resources/:id
// @access  Private (Tutor of the course)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('course');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (resource.course && resource.course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete file from disk
    const filePath = path.join(uploadDir, path.basename(resource.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resource.deleteOne();
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment download count
// @route   PUT /api/resources/:id/download
// @access  Private
exports.incrementDownload = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    resource.downloads += 1;
    await resource.save();
    res.json({ success: true, downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a resource (title, description, category only)
// @route   PUT /api/resources/:id
// @access  Private (Tutor of the course)
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id).populate('course');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    
    // Check if user is the tutor of the course or an admin
    if (resource.course && resource.course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, category } = req.body;
    
    if (title) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (category) resource.category = category;

    await resource.save();
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all resources
// @route   GET /api/resources/common
// @access  Private
exports.getCommonResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort('-createdAt')
      .populate('uploadedBy', 'name');
    
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};