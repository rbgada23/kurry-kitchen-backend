const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// menu_id, menu_name, menu_description , menu_size, price ,imageURL , createdBy , updatedBy

const kitchenMenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },
    type: {
      type: String,
    },
    items: {
      type: String,
    },
    price: {
      type: Number,
    },
    kitchen : {type: Schema.Types.ObjectId, ref: 'Kitchen'},
    image: {
      data: Buffer,
      contentType: String, // Stores the MIME type (e.g., "image/png")
    },
  },
  {
    timestamps: true,
  },
 
);

module.exports = mongoose.model("KitchenMenu", kitchenMenuSchema);
