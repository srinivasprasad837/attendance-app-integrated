const mongoose = require('mongoose');
const Student = require('./models/student');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB for seeding');

    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
    await Student.deleteMany({});
    await Student.insertMany(data.students);
    console.log('Database seeded!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

seedDB();
