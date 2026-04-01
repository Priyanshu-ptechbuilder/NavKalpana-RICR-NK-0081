require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@navkalpana.com";
    const adminPassword = "Admin@123";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await Teacher.findOneAndUpdate(
      { email: adminEmail },
      {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
      { upsert: true, new: true }
    );

    console.log('Admin seeded successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
