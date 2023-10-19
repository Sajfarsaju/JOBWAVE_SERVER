const Job = require('../models/jobPostModel');
const Application = require('../models/applicantsModel');
const { uploadToCloudinary } = require('../config/cloudinary');

module.exports = {

    listJobs: async (req, res) => {
        try {
            const Jobs = await Job.find({ isPostAccepted: true }).populate('companyId');

            res.status(200).json({ Jobs });
        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "An error occurred while listing job details at controller" });
        }
    },
    getSingleJob: async (req, res) => {
        try {
            const jobId = req.params.jobId;
            const singleJob = await Job.findById(jobId);
            res.status(200).json({ singleJob })
        } catch (error) {
            res.status(500).json({ errMsg: "An error occurred while getting single job details at controller" })
        }
    },
    applyJob: async (req, res) => {
        try {
            const { CoverLetter, jobId, userId, CvFile } = req.body
            if (!CvFile && CvFile.trim().length === 0 && !CoverLetter && CoverLetter.trim().length === 0) return res.status(400).json({ errMsg: 'Please fill in all the required fields.' });
            if (!CvFile || CvFile.trim().length === 0) return res.status(400).json({ errMsg: 'CV file is required' });
            if (!CoverLetter || CoverLetter.trim().length === 0) return res.status(400).json({ errMsg: 'Cover letter is required' });

            const existingApplication = await Application.findOne({
                applicant: userId,
                jobId: jobId,
            });
            if (existingApplication) return res.status(400).json({ errMsg: 'Already applied for this job.' });

            const uploadResponse = await uploadToCloudinary(CvFile, { upload_preset: 'CvFiles' });
            if (uploadResponse) {
                const cvUrl = uploadResponse.url;
                const cvPublicId = uploadResponse.public_id;

                const newApplication = new Application({
                    coverLetter: CoverLetter,
                    jobId: jobId,
                    applicant: userId,
                    cvUrl: cvUrl,
                    cvPublicId: cvPublicId,
                });

                await newApplication.save();
                console.log(newApplication, ":::::saved to database");
                res.status(200).json({ newApplication });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ errMsg: "An error occurred while applying job at controller" })
        }
    },
    appliedJobs: async (req, res) => {
        try {
            const { id } = req.payload;
            const appliedJobs = await Application.find({ applicant: id }).populate('jobId');
            for (const application of appliedJobs) {
                const jobId = application.jobId;

                const job = await Job.findById(jobId).populate('companyId');

                application.jobId = job;
            }
            res.status(200).json({ appliedJobs });

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at listing applied jobs" });
        }
    }
}