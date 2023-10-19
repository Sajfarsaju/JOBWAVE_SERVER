const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        concernName: {
            type: String,
            required: true,
            trim: true
        },
        companyName: {
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
            required: true,
            trim: true
        },
        GSTNumber: {
            type: String,
            required: true,
            trim: true
        },
        companyAddress: {
            address: {
                type: String,
                trim: true
            },
            state: {
                type: String,
                trim: true
            },
            district: {
                type: String,
                trim: true
            },
            city: {
                type: String,
                trim: true
            },
            zip: {
                type: Number,
                trim: true
            }
        },
        profile: {
            type: String,
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        subscriptionPlan: {
            planAmt: {
                type: String,
            },
            date: {
                type: Date,
            },
        },
        isBlocked: {
            type: Boolean,
            default: false
        }


    });

const companyModel = mongoose.model('company', companySchema);
module.exports = companyModel;