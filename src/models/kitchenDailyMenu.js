//seller_id, menu_id , date ,isAvailable
const mongoose = require("mongoose");

const kitchenDailyMenu = new mongoose.Schema(
  {
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
    },
    kitchenMenuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KitchenMenu",
      required: true,
    },
    isAvailable: {
      type: Boolean,
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ConnectionRequestModel = new mongoose.model(
  "KitchenDailyMenu",
  kitchenDailyMenu
);

module.exports = ConnectionRequestModel;
