// seed_test_resources.js
const mongoose = require('mongoose');
const Resource = require('./models/Resource');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartkuppi');
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found to attribute resources to.');
      process.exit();
    }

    const testResources = [
      {
        title: '2023 Mathematics Part I',
        description: 'Past paper for A/L 2023 Mathematics.',
        fileUrl: '/uploads/math_2023_p1.pdf',
        fileType: 'pdf',
        category: 'past_paper',
        uploadedBy: admin._id
      },
      {
        title: 'Physics Mechanics Discussion',
        description: 'Video discussion on mechanics.',
        fileUrl: '/uploads/physics_mech.mp4',
        fileType: 'video',
        category: 'paper_discussion',
        uploadedBy: admin._id
      },
      {
        title: 'Chemistry Lecture 1',
        description: 'Course specific material.',
        fileUrl: '/uploads/chem_l1.pdf',
        fileType: 'pdf',
        category: 'lecture_material',
        uploadedBy: admin._id
      }
    ];

    await Resource.deleteMany({ title: { $in: testResources.map(r => r.title) } });
    await Resource.create(testResources);
    console.log('Test resources seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
