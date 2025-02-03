import { promisify } from "util";
import jwt from "jsonwebtoken";

import { StatusCodes } from "../constants/status-codes.js";
import NodeError from "../extra/node-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import User from "../models/user-model.js";

//Generate a token using JWT
//@return token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Return token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

export const signup = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

/* 
    @desc Post Login
    @route POST /api/v1/users/login
    @access private
**/
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new NodeError(400, "Please provide email and password!"));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new NodeError(401, "Incorrect email or password"));
  }

  //update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
};

/* 
    @desc Update user password
    @route /api/v1/user/updatemypassword
    @access private
**/
export const updatePassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new NodeError(401, "Your current password is wrong."));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

/*  @desc check for role authorization
    @route *.*
    @access private
**/
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['player'].role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new NodeError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

/* 
    @desc Protect middlware route
    @route *.*
    @access private
**/
export const protect = asyncHandler(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;

  if (req.headers?.authorization && req.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers?.authorization?.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies?.jwt;
  }

  if (!token) {
    return next(
      new NodeError(401, "You are not logged in! Please log in to get access.")
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findOne({
    _id: decoded.id,
    isPermanentDeleted: false,
    isDeleted: false,
    isActive: true,
  }).select("+isActive");
  if (!currentUser || !currentUser.isActive) {
    return next(new NodeError(411, "This user account is deactivated or doesnot exist."));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new NodeError(403, "User recently changed password! Please log in again.")
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
