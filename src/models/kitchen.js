const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for operating hours of a single day
const operatingHoursSchema = new mongoose.Schema({
  open: {
    type: String,  // Time as a string in 24-hour format (e.g., "09:00")
    default: null  // Default to null if the store is closed on that day
  },
  close: {
    type: String,  // Time as a string in 24-hour format (e.g., "18:00")
    default: null  // Default to null if the store is closed on that day
  }
});

const kitchenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
      unique: true
    },
    address: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    operatingHours: {
      monday: operatingHoursSchema,    // Nested schema for Monday
      tuesday: operatingHoursSchema,   // Nested schema for Tuesday
      wednesday: operatingHoursSchema, // Nested schema for Wednesday
      thursday: operatingHoursSchema,  // Nested schema for Thursday
      friday: operatingHoursSchema,    // Nested schema for Friday
      saturday: operatingHoursSchema,  // Nested schema for Saturday
      sunday: operatingHoursSchema     // Nested schema for Sunday
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    image: {
      data: Buffer,
      contentType: String, // Stores the MIME type (e.g., "image/png")
    },
  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model("Kitchen", kitchenSchema);