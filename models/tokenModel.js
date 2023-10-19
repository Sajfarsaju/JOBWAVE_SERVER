const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
    {
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"users",
            unique : true,
        },
        token : {
            type:String,
            required:true
        },
        createdAt :{
            type:Date,
            default:Date.now(),
            expires:3600 //* 1 Hour
        }
    }
);
module.exports = mongoose.model("token",tokenSchema);