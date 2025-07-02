
const User = require('../models/user.model');

const seedAdmin = async () => {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const newAdmin = new User({
        name: 'admin',
        email: 'admin@kc.com',
        password: 'kashmir@2025',
        passwordConfirm: 'kashmir@2025',
        role: 'admin',
        invoiceNumber : "2061",
        watakNumber : "24500",
        secretCode:"000000"
      });
      await newAdmin.save();
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin already exists.');
    }
};

seedAdmin();
const seedSuperAdmin = async () => {
  const admin = await User.findOne({ role: 'SuperAdmin' });
  if (!admin) {
    const newAdmin = new User({
      name: 'superadmin',
      email: 'superadmin@example.com',
      password: 'kashmir@2025',
      passwordConfirm: 'kashmir@2025',
      role: 'SuperAdmin',
      
    });
    await newAdmin.save({validateBeforeSave:false});
    console.log('Super Admin  created successfully.');
  } else {
    console.log('Super Admin already exists.');
  }
};


// seedSuperAdmin()