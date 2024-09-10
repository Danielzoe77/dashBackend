const mongoose = require('mongoose');
const user = require('./userModel');
const Schema = mongoose.Schema;
const tokenSchema = new Schema({
userId : {
    type : mongoose.Schema.Types.ObjectId,
    require: true,
    ref : user
},
token : {
    type :String,
    require:true,
},
createdAt: {
    type: Date,
    require : true,
},
expiresAt: {
    type: Date,
    require : true,
}
})
const tokenModel = mongoose.model('Token', tokenSchema);
module.exports = tokenModel