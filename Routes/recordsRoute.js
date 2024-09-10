const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { creatRecord,updateRecord,getRecords,getRecordsByUser,deleteRecord } = require('../controllers/recordController')


router.post('/add/',protect, creatRecord);

//updateRecord
router.patch('/updateRecord/:id', updateRecord);

//getRecords
router.get('/getRecords/:id', getRecordsByUser);

//getAllRecords
router.get('/getRecords', getRecords);

//deleteRecord
router.delete('/deleteRecord/:id', deleteRecord);
module.exports = router;