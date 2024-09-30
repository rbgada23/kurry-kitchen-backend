const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema(
  {
     name: {
      type: String,
      required: true,
      maxLength: 50,
      unique : true
    },
    zipCode : {
        type : String,
    },
    contactNumber : {
        type : String,
    },
    address : {
        type : String,
    }
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Customer", customerSchema);