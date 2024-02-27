const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    otp: {
        type: String,
    },
    userEmail: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1m' }
    }
});

otpSchema.index({ createdAt:   1 }, { expireAfterSeconds:   60 });

const OtpModel = mongoose.model('otp', otpSchema);
module.exports = OtpModel;