const express = require("express");
const connectDB = require("../src/config/database");
const User = require("./models/user");
const app = express();
const { validateSignUpData } = require("../src/utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

//Lets the request convert the object it gets in body into json.
app.use(express.json());

app.use(cookieParser());

app.post("/signup", async (req, res) => {
  const user = User(req.body);
  try {
    validateSignUpData(req);
    const passwordHash = await bcrypt.hash(user.password, 10);
    user.password = passwordHash
    await user.save();
    res.send("User added succesfully");
  } catch (err) {
    res.status(400).send("Error saving the user :" + err.message);
  }
});

app.post("/login", async (req, res) => {
    const {emailId,password} = req.body;
    try {
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
          throw new Error("Invalid credentials");
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(isPasswordValid){
            
            const token = await jwt.sign({_id : user._id},"Kurry@ABD$17");
            console.log("token",token);
            res.cookie("token",token);
            res.send("Login Successfull");
        }else{
            throw new Error("Invalid credentials");
        }
    } catch (err) {
       res.status(400).send("ERROR : "+ err.message);
    }
});


connectDB()
  .then((e) => {
    console.log("Database connection established");
  })
  .catch(() => {
    console.log("Database cannot be connected");
  });

app.listen(3001, () => {
  console.log("Server started successfully");
});
