const mongoose = require("mongoose");

const connectDB = async()=>{
    await mongoose.connect(
        "mongodb+srv://rishabhgada:8rqvEF0ROk7RCvot@kurrykitchen.mlams.mongodb.net/kurryKitchen"
    )
}

module.exports = connectDB;