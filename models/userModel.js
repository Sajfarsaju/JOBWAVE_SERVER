
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
        experienceDetails: [{
            experienceTitle: {
                type: String
            },
            expCompany: {
                type: String
            },
            expCompLocation: {
                type: String
            },
            expStartDate: {
                type: String
            },
            expEndDate: {
                type: String
            }
        }],
        location: {
            type: String
        },
        currentCTC:{
            type: String
        },
        age: {
            type: Number
        },
        subscriptionPlan: {
            planAmt: {
                type: String,
            },
            date: {
                type: Date,
            },
        },
        skills: {
            type: [String],
        },
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