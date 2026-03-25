// verify_api.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Resource = require('./models/Resource');

async function verify() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartkuppi');
    const common = await Resource.find({ 
      category: { $in: ['past_paper', 'paper_discussion'] } 
    }).populate('uploadedBy', 'name');
    
    console.log('--- COMMON RESOURCES ---');
    console.log(`Count: ${common.length}`);
    common.forEach(r => {
      console.log(`- [${r.category}] ${r.title} (By: ${r.uploadedBy?.name})`);
    });

    const lecture = await Resource.find({ category: 'lecture_material' });
    console.log('\n--- LECTURE MATERIALS (Should NOT be common) ---');
    console.log(`Count: ${lecture.length}`);
    lecture.forEach(r => {
      console.log(`- ${r.title}`);
    });

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
