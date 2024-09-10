const asyncHandler = require("express-async-handler");
const Record = require("../model/recordModel");
const User = require("../model/userModel");

//creatRecord

const creatRecord = asyncHandler(async (req, res) => {
  const { id } = req.userData;
  const user = await User.findById(id);
  if (!user) {
    res.status(401);
    throw new Error("Please login to create a record");
  }
  const { className, studentName, amountToBePaid, amountDeposited } = req.body;
  const balanceAmount = amountToBePaid - amountDeposited;
  const userId = await User.findById(req.userData.id);

  //validation
  if (!className) {
    res.status(400);
    throw new Error("please enter all name ");
  }
  if (!studentName) {
    res.status(400);
    throw new Error("please enter your class ");
  }

  if (!amountToBePaid) {
    res.status(400);
    throw new Error("please enter the totalAmount");
  }
  if (!amountDeposited) {
    res.status(400);
    throw new Error("please enter your depositedAmount");
  }
  //create record
  const record = await Record.create({
    className,
    studentName,
    amountToBePaid,
    amountDeposited,
    balanceAmount,
    userId,
  });

  if (record) {
    const {
      _id,
      className,
      studentName,
      amountToBePaid,
      amountDeposited,
      balanceAmount,
      userId,
    } = record;
    res
      .status(201)
      .json({
        _id,
        className,
        studentName,
        amountToBePaid,
        amountDeposited,
        balanceAmount,
        userId,
      });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const updateRecord = asyncHandler(async (req, res) => {
  const record = await Record.findById(req.params.id);
  if (record) {
    const {
      _id,
      className,
      studentName,
      amountToBePaid,
      amountDeposited,
      balanceAmount,
    } = record;
    record.className = req.body.className || className;
    record.studentName = req.body.studentName || studentName;
    record.amountToBePaid = req.body.amountToBePaid || amountToBePaid;
    record.amountDeposited = req.body.amountDeposited || amountDeposited;
    record.balanceAmount = req.body.balanceAmount || balanceAmount;

    const updateRecord = await record.save();
    res.status(200).json({
      _id: updateRecord._id,
      className: updateRecord.className,
      studentName: updateRecord.studentName,
      amountToBePaid: updateRecord.amountToBePaid,
      amountDeposited: updateRecord.amountDeposited,
      balanceAmount: updateRecord.balanceAmount,
    });
  } else {
    res.status(400);
    throw new Error("Record not found");
  }
});

const getRecords = asyncHandler(async (req, res) => {
  const records = await Record.find();

  if (records) {
    res.json(records);
  } else {
    res.status(404);
    throw new Error("No records found");
  }
});

const getRecordsByUser = asyncHandler(async (req, res) => {
  const records = await Record.find({ userId: req.params.id });

  if (records) {
    res.json(records);
  } else {
    res.status(404);
    throw new Error("No records found");
  }
});


const updateRecordByUser = asyncHandler(async (req, res) => {
  const records = await Record.find({ userId: req.params.id });
  if (records.length > 0) {
    const record = records[0];
    record.className = req.body.className;
    record.studentName = req.body.studentName;
    record.amountToBePaid = req.body.amountToBePaid;
    record.amountDeposited = req.body.amountDeposited;
    record.balanceAmount = req.body.balanceAmount;
    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } else {
    res.status(404);
    throw new Error("Record not found");
  }
});

//deleteRecord
const deleteRecord = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const record = await Record.findByIdAndDelete({ _id: id });

  if (record) {
    res.json({ message: "Record removed" });
  } else {
    res.status(404);
    throw new Error("Record not found");
  }
});

module.exports = {
  creatRecord,
  updateRecord,
  getRecords,
  getRecordsByUser,
  deleteRecord,
  updateRecordByUser,
};
