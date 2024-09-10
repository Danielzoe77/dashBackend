const mongoose = require("mongoose")



const connectDb = async () => {
    try {
       const connect = await mongoose.connect(process.env.MONGO_URI, {
           useNewUrlParser: true,
           useUnifiedTopology: true
       })
        console.log("connected to MongoDB");
    }
    catch (error){
        console.error("error connecting to mongoDB:", error.message);
        process.exit(1);
    }
}
module.exports = connectDb;