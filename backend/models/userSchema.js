const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique:true
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      required: true,
      default:
        "https://cdn.pixabay.com/photo/2022/09/08/15/16/cute-7441224_640.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash Password
userSchema.pre("save",async function(next){
  if(!this.isModified("password")){
    next();
  }
  this.password = await bcrypt.hash(this.password,10);
});


// Compare Password
userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password,this.password);
}

const User = mongoose.model("User", userSchema);

module.exports = User;
