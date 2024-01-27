const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    otp: {
        type: String,
    },
    userEmail:{
        type:String
    }
})

const OtpModel = mongoose.model('otp', otpSchema);
module.exports = OtpModel;