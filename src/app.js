const express = require("express");
const connectDB = require("../src/config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');

//Lets the request convert the object it gets in body into json.
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

const authRouter = require("./routes/auth");
const kitchenRouter = require("./routes/kitchen")
const orderRouter = require("./routes/order")
app.use("/", authRouter);
app.use("/", kitchenRouter);
app.use("/", orderRouter);



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
