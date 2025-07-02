const User = require("../models/user.model");
const Veg = require("../models/veg.model")
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { signToken } = require("./auth.controller");


exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() - 10 * 1000), 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
  });
  res.status(200).json({ status: "success" });
};

exports.getInvoiceNumber = async(req, res) => {
  const invoiceNumber= await User.find();
  res.status(200).json({ status: "success",invoiceNumber:invoiceNumber[0].invoiceNumber });
};

exports.getWatakNumber = async(req, res) => {
  const watakNumber= await User.find();
  res.status(200).json({ status: "success",watakNumber:watakNumber[0].watakNumber });
};

exports.addveg = async (req, res) => {
  console.log(req.body);
  const { vegName } = req.body;
  try {
    const newVeg = new Veg({
      name: vegName
    });
    await newVeg.save();
    res.status(201).json({ message: 'Vegetable added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add vegetable' });
  }
};
exports.getveg = async (req, res) => {
  try {
    const vegetables = await Veg.find();
    res.json(vegetables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vegetables' });
  }
};
exports.updateInvoiceNumber = async (req, res) => {
  try {
    const { invoiceNumber } = req.body;

    // Find all users (assuming you want to update the first user)
    const users = await User.find();

    if (!users.length) {
      return res.status(404).json({ status: "fail", message: "No users found" });
    }

    // Access the first user
    const user = users[0];
    console.log("User before update:", user);

    // Update the user's invoice number
    user.invoiceNumber = invoiceNumber;

    // Save the updated user document with validation disabled
    await user.save({ validateBeforeSave: false });

    console.log("User after update:", user);

    res.status(200).json({ status: "success", invoiceNumber: user.invoiceNumber });
  } catch (error) {
    console.error('Error updating invoice number:', error);
    res.status(500).json({ status: "error", message: "An error occurred while updating the invoice number" });
  }
};

exports.updateWatakNumber = async (req, res) => {
  try {
    const { watakNumber } = req.body;

    // Find all users (assuming you want to update the first user)
    const users = await User.find();

    if (!users.length) {
      return res.status(404).json({ status: "fail", message: "No users found" });
    }

    // Access the first user
    const user = users[0];
    console.log("User before update:", user);

    // Update the user's invoice number
    user.watakNumber = watakNumber;

    // Save the updated user document with validation disabled
    await user.save({ validateBeforeSave: false });

    console.log("User after update:", user);

    res.status(200).json({ status: "success", watakNumber: user.watakNumber });
  } catch (error) {
    console.error('Error updating Watak number:', error);
    res.status(500).json({ status: "error", message: "An error occurred while updating the Watak number" });
  }
};