const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");


const protect = asyncHandler(async (req, res, next) => {
  try{
    const token = req.cookies.token;

    if(!token){
      res.json({ status : false  ,message: "Not authorized, token failed"})
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    next();
  }catch(error){
    res.json({ status : false  ,message: "Not authorized, token failed"})
  }
})

module.exports = protect;