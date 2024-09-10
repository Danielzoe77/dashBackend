const express = require('express');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

const {registerUser, 
    loginUser,
     logoutUser,
      getUser,
       loginStatus, 
       updateUser,
        changePassword,
         forgotPassword,
         resetPassword,
         }  = require('../controllers/userController');

router.post('/register', registerUser);
//login
router.post('/login', loginUser);
//logout
router.get('/logout',logoutUser);
//getUser
router.get('/:id', getUser);
 //loginstatus
router.get('/loginStatus',loginStatus);
 //updateUser
 router.patch('/updateUser/:id',protect, updateUser);
 //change password
 router.patch('/changePassword/:id', changePassword);
 //forgot password
 router.post('/forgotPassword', forgotPassword);
 //reset password
 router.post('/resetPassword/:token', resetPassword);
//protect
router.get('/verify', protect, (req, res) => {
 return res.json({ status: true, message: "User is verified" });
});


module.exports = router;