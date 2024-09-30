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

const authRouter = require("./routes/auth");
const kitchenRouter = require("./routes/kitchen")
app.use("/", authRouter);
app.use("/", kitchenRouter);


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
