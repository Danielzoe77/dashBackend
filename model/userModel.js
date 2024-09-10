const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userScheme = mongoose.Schema(
  {
    username: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      // required: [true, "please add a username"],
      trim: true,
    },

    googleId: {
      type: String,
    },
    googleDisplayName: {
      type: String,
    },

    email: {
      type: String,
      required: [true, "please enter a email"],
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "please add valid email",
      ],
    },

    password: {
      type: String,
      // required: [true, "please add a password"],
      required: function () {
        return !this.googleId;
      },
      minLength: [8, "password should be at least 8 characters"],
      maxLength: [12, "password should not be more than 12 characters"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/,
        "Password should contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
      ],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// console.log("Google Id:", this.googleId);

userScheme.pre("save", async function (next) {
  console.log("Google Id:", this.googleId);
  if (this.googleId && !this.username) {
    this.username = this.googleDisplayName;
  }
  if (!this.isModified("password")) {
    return next();
  }

  //encrypt password b4 saving to db
  const salt = await bcrypt.genSalt(10);
  const hashpassword = await bcrypt.hash(this.password, salt);
  this.password = hashpassword;
  next();
});
const userModel = mongoose.model("Users", userScheme);
module.exports = userModel;
