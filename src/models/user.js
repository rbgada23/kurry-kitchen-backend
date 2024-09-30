const mongoose = require('mongoose');

//Has some good validator functions
const validator = require('validator');

const userSchema = mongoose.Schema({
    firstName : {
        type : String,
        //Mongoose will not allow to insert a document
        required : true,
    },
    lastName : {
        type : String,
        lowercase : true,
        trim : true
    },
    emailId : {
        type : String,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email not valid : "+value);
            }
        },
    },
    password : {
        type : String
    },
    zipCode : {
        type : Number
    },userType :{
        type : Number
    },
    photoUrl : {
        type : String,
        default : "This is default photoUrl"
    },
 },{
    timestamps : true
 });

const User = mongoose.model("User",userSchema);

module.exports = User;