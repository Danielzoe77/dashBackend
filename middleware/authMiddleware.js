const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
// const protect =  asyncHandler(async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.userData = decoded;
//       console.log("Token verified")
//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401);
//       throw new Error("Not authorized, token failed");
//     }
//   }
// })

const protect = asyncHandler(async (req, res, next) => {
  try{
    const token = req.cookies.token;

    if(!token){
      res.json({ status : false  ,message: "Not authorized, token failed"})
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user = await User.findById(decoded.id).select("-password");
    next();
  }catch(error){
    res.json({ status : false  ,message: "Not authorized, token failed"})
  }
})

module.exports = protect;