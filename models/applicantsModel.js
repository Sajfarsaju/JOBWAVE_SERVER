const mongoose = require('mongoose');

const jobApplicantsSchema = new mongoose.Schema(
    {
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            require: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "jobPosts",
            required: true,
        },
        cvUrl: {
            type: String,
            required: true,
        },
        cvPublicId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: "Pending"
        },
        coverLetter: {
            type: String,
            required: true,
        },
        invites: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                    required: true,
                },
            },
        ],
    },

    { timestamps: true }

);

const jobApplicantsModel = mongoose.model("applicants", jobApplicantsSchema);
module.exports = jobApplicantsModel;