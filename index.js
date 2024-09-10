require("dotenv").config();
const express = require("express");
const connectDB = require("./config.js");
// const Tasked = require ('./model.js');
const userRoute = require("./Routes/userRoute");
const recordRoute = require("./Routes/recordsRoute");
const errorHandler = require("./middleware/errorMiddleware");
var cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const session = require ("express-session");
const passport = require ("passport");
const userDb = require ("./model/userModel.js")
const OAuth2Strategy = require ("passport-google-oauth2").Strategy


const corsOptions = {
  origin: ["http://localhost:5173", "https://admin-dash-mauve.vercel.app"],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: [
//     " Access-Control-Allow-Origins ",
//     "Content-Type,",
//     "Authorization",
//   ],
};

const port = 3001;
//  connectDB();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api/users", userRoute);
app.use("/api/records", recordRoute);


//setup session
app.use(session({
secret : process.env.sessionSecret,
resave : false,
saveUninitialized : true
}))

//errorHandler
app.use(errorHandler);

//set up passport

app.use(passport.initialize())

app.use(passport.session())

passport.use(
  new OAuth2Strategy({
    clientID : process.env.googleClientId,
    clientSecret : process.env.googleSecret,
    callbackURL :"/auth/google/callback",
    scope : ["profile", "email"]
  },
  async (accessToken,refreshToken,profile,done)=>{
    try{
        let user = await userDb.findOne({googleId:profile.id});

        if(!user){
            user = new userDb({
                googleId:profile.id,
                googleDisplayName : profile.displayName,
                email : profile.emails[0].value,
              username : profile.displayName,
                
            });
            await user.save()
        }

        return(null, user)
    }catch (error){
        return done (error, null)
    }
  }
)
)

passport.serializeUser((user, done)=>{
    done (null,user)
})
passport.deserializeUser((user, done)=>{
    done (null,user)
})

//initial oauth login

app.get("/auth/google", passport.authenticate("google", {scope: ["profile","email"]}))

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect:"http://localhost:5173/dashboard",
    failureRedirect:"http://localhost:5173/login",
}))




app.get("/", (req, res) => {
  res.send("Hello World!");
});
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("error:", error.message);
  }
};
startServer();
