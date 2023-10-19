const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: Number,
        },
        password: {
            type: String,
            trim: true
        },
        isEmailVerified : {
            type: Boolean,
            default: false
        },
        profile: {
            type: String,
        },
        bio: {
            type: String,
        },
        experienceDetails: {
            role: {
                type: String,
            },
            yearOfExp: {
                type: String
            },
            compName: {
                type: String,
            }
        },
        //   education:{
        //      type:String,
        //       required:true,
        //     },
        // }
        skills: [{
            type: String
        }],
        isActive: {
            type: Boolean,
            default: true
        },
    }
)

const userModel = mongoose.model("users", userSchema);
module.exports = userModel