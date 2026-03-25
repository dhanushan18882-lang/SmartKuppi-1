const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'video', 'image', 'link', 'other'], default: 'other' },
  category: { 
    type: String, 
    enum: ['lecture_material', 'past_paper', 'paper_discussion', 'other'], 
    default: 'lecture_material' 
  },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Removed required: true
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);