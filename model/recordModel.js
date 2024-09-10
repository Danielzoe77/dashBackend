const mongoose = require("mongoose");
const user = require('./userModel');
const recordSchema = mongoose.Schema({
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    require: true,
    ref : user
},
  className: String,
  studentName: String,
  amountToBePaid: Number,
  amountDeposited: Number,
  balanceAmount: Number
});
recordSchema.pre('save', function(next) {
  this.balanceAmount =  this.amountDeposited - this.amountToBePaid;
  next();
});
const recordModel = mongoose.model('Record', recordSchema);
module.exports = recordModel;