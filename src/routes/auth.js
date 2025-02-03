const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password, userType, contactNumber } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      userType,
      contactNumber
    });
    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,     // Prevents client-side JS access
      secure: true,       // Ensures cookie is sent only over HTTPS
      sameSite: "None",   // Required for cross-origin cookies
    });

    console.log(token);

    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        httpOnly: true,     // Prevents client-side JS access
        secure: true,       // Ensures cookie is sent only over HTTPS
        sameSite: "None",   // Required for cross-origin cookies
      });
      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,     // Prevents client-side JS access
    secure: true,       // Ensures cookie is sent only over HTTPS
    sameSite: "None",   // Required for cross-origin cookies
  });
  res.send("Logout Successful!!");
});

// Get all the kitchen menu
authRouter.get("/userProfile", userAuth, async (req, res) => {
  try {
    const emailId = req.query.emailId;
    const userProfile = await User.findOne({ emailId: emailId });

    res.json({
      message: "Data fetched successfully",
      data: userProfile,
    });
  } catch (err) {
    req.statusCode(400).send(err.message);
  }
});

// Update user profile
// Update user profile by userId
authRouter.put("/updateProfile", userAuth, async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query params
    const { firstName, lastName, emailId, contactNumber, address } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If the user attempts to update the emailId, ensure it's unique
    if (emailId && emailId !== user.emailId) {
      const existingUser = await User.findOne({ emailId: emailId });
      if (existingUser) {
        throw new Error("Email ID already in use");
      }
    }

    // Update the user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.emailId = emailId || user.emailId;
    user.contactNumber = contactNumber || user.contactNumber;
    user.address = address || user.address;

    // Save the updated user profile
    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});



module.exports = authRouter;