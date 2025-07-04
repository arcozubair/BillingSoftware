const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/user.model");

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("you are not logged in please login to get access", 401)
    );
  }
  //verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }
  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.checkAdmin = catchAsync(async (req, res, next) => {
  
  if (req.user.role === "admin") {
    next();
  } else {
    return res.status(400).json({
      status: "Fail",
      message: " Yor are not authorised to perform this task",
    });
  }
});

exports.checkSuperAdmin = catchAsync(async (req, res, next) => {
  
  if (req.user.role === "SuperAdmin") {
    next();
  } else {
    return res.status(400).json({
      status: "Fail",
      message: " Yor are not authorised to perform this task",
    });
  }
});
