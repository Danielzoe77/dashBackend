const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const Token = require("../model/tokenModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const nodemailer = require("nodemailer")

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  //validation
  if (!email) {
    res.status(400);
    throw new Error("please enter all email ");
  }
  if (!username) {
    res.status(400);
    throw new Error("please enter your name ");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  //checking if user exist
  const userExist = await User.findOne({ email });
  if (userExist) {
    return res.status(400).json({ error: "email already exists" })

    // res.status(400);
    // throw new Error("email already exists");
  }


  //create user
  const user = await User.create({
    username,
    email,
    password,
    confirmPassword: password,
  });

  //generate token
  const token = generateToken(user._id);

  //send http cookies to frontend
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });
  //console.log(res.cookie);

  if (user) {
    const { _id, username, email, password } = user;
    res.status(201).json({ _id, username, email, password, token });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please input your email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("User cannot be found, please sign up");
  } else {
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      res.status(400);
      throw new Error("Invalid password");
    }

    const token = jwt.sign({ id: user._id, username: user.username, email }, process.env.JWT_SECRET, {
      expiresIn: "20min",
    });

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });
    // console.log(res.cookie('token'));
    const tokenDoc = new Token({
      token,
      user: user.id,
    });
    await tokenDoc.save();

    if (user && passwordIsCorrect) {
     const { _id, username, email, password } = user;
      res.status(201).json({  _id, username, email, password, token });
    } else {
      res.status(400);
      throw new Error("Invalid email or password");
    }
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.json({ status: true, message: "Successfully logged out", logout: true });
});



const  getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User not  found in db" });
  }
  const user = await User.findById(userId);
  if (user) {
    const { _id, username, email } = user;
    res.status(200).json({ _id, username, email });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
  console.log(user);
});


const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.status(true);
  }
  return res.status(false);
});

//Update user profile

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    const { _id, username, email, photo, phone, bio } = user;
    user.email = email;
    user.username = req.body.username || username;
    user.phone = req.body.phone || phone;
    user.photo = req.body.photo || photo;
    user.bio = req.body.bio || bio;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.username,
      phone: updatedUser.phone,
      photo: updatedUser.photo,
      bio: updatedUser.bio,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//change password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");

  const { oldPassword, password } = req.body;
  //validate user

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  //check if old password is correct

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Old password is incorrect");
  }

  //change password
  user.password = password;
  user.save();
  res.status(200).json({ message: "Password updated successfully" });
});

//forgot password
const  forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }
//token
const token = generateToken(user._id);

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'drimbignation@gmail.com',
      pass: 'vndqmwivjzfwriwg'
    }
  });
  const encodedToken = encodeURIComponent(token).replace(/\./g, '%2E');
  var mailOptions = {
    from: 'drimbignation@gmail.com',
    to: email,
    subject: 'Reset Password',
    text: `http://localhost:5173/resetPassword/${encodedToken}`
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Email not sent. Please try again." });
    } else {
      console.log('Email sent: ' + info.response);
      return res.json({ status: true, message: "Email sent" });
    }
  });
  
});


const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  if (!password) {
    return res.json({ status: false, message: "Password is required" });
  }
  if (password.length < 8) {
    return res.json({ status: false, message: "Password must be at least 8 characters" });
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return res.status(400).json({ status: false, message: "Password must contain at least one special character" });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ status: false, message: "Password must contain at least one lowercase letter" });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ status: false, message: "Password must contain at least one number" });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ status: false, message: "Password must contain at least one uppercase letter" });
  }
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(
      { _id: id },
       { password: hashedPassword } 
    )
     return res.status(201).json({ status: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ status: false, message: "Password reset token is invalid or has expired" });
  }
});


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,}