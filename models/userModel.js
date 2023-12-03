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
            default: 'https://i.pinimg.com/1200x/60/07/0e/60070ed889df308cbe80253e8c36b3a3.jpg'
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
        subscriptionPlan: {
            planAmt: {
                type: String,
            },
            date: {
                type: Date,
            },
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
        isAdmin: {
            type: Boolean,
            default: false
        }
    }
)

const userModel = mongoose.model("users", userSchema);
module.exports = userModel