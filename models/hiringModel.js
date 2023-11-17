const mongoose = require('mongoose');

const hiringSchema = new mongoose.Schema(
    {
        companyId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'company'
        },
        jobId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'jobPosts'
        },
        candidate:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'users'
        },
        applicationId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'applicants'
        },
        interViewTime: {
            type: String,
        },
        status:{
            type: String,
        }
    },
    { timestamps: true }
)

const hiringModel = mongoose.model("hired", hiringSchema);
module.exports = hiringModel;