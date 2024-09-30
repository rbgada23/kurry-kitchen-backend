const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// menu_id, menu_name, menu_description , menu_size, price ,imageURL , createdBy , updatedBy

const kitchenMenuSchema = new mongoose.Schema(
  {
    menuName: {
      type: String,
      required: true,
      maxLength: 50,
      unique: true,
    },
    menuType: {
      type: String,
      enum: {
        values: ["veg", "nonveg", "jain", "vegan"],
        message: `{VALUE} is not a valid menu type type`,
      },
    },
    menuDescription: {
      type: String,
    },
    price: {
      type: Number,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KitchenMenu", kitchenMenuSchema);
