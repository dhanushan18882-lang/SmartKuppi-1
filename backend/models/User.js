const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, required: true },
  role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
  status: { type: String, enum: ['pending', 'approved', 'suspended', 'active'],
    default: function() { return this.role === 'tutor' ? 'pending' : 'active'; } },
  profilePicture: { type: String, default: 'default.jpg' },
  createdAt: { type: Date, default: Date.now },
  
  // Add OTP fields for password reset
  resetPasswordOTP: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  
  studentId: { type: String, unique: true, sparse: true,
    required: function() { return this.role === 'student'; } },
  university: { type: String, required: function() { return this.role === 'student'; } },
  faculty: { type: String, required: function() { return this.role === 'student'; } },
  department: String,
  academicYear: { type: String, required: function() { return this.role === 'student'; } },
  qualifications: { type: String, required: function() { return this.role === 'tutor'; } },
  specialization: { type: String, required: function() { return this.role === 'tutor'; } },
  yearsOfExperience: { type: Number, required: function() { return this.role === 'tutor'; } },
  bio: { type: String, maxlength: 500, required: function() { return this.role === 'tutor'; } },
  linkedin: String,
  subjects: [{ type: String }]
}, { timestamps: true });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);