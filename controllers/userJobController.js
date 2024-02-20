const Job = require('../models/jobPostModel');
const Application = require('../models/applicantsModel');
const Company = require('../models/companyModel');
const Chat = require('../models/chatModel');
const { uploadToCloudinary } = require('../config/cloudinary');

module.exports = {

    listJobs: async (req, res) => {
        try {
            const { userId, search, limit, filters, worktype } = req.query;
            const filterArray = filters ? filters.split(',') : [];
            const workTypeFilter = worktype ? worktype.split(',') : [];

            const jobsForFindCatg = await Job.find()
            const JobsLength = jobsForFindCatg.length

            const uniqueCategories = [...new Set(jobsForFindCatg?.map((job) => job?.jobCategory))]
            const uniqueWorkTypes = [...new Set(jobsForFindCatg?.map((job) => job?.workType))]

            let Jobs = []
            if (filterArray.length > 0 && workTypeFilter.length > 0) {
                Jobs = await Job.find({
                    $and: [
                        { isPostAccepted: true },
                        {
                            $or: [
                                { jobTitle: { $regex: search, $options: 'i' } },
                                { jobCategory: { $regex: search, $options: 'i' } },
                                { workType: { $regex: search, $options: 'i' } },
                                { workplace: { $regex: search, $options: 'i' } },
                                { qualifications: { $regex: search, $options: 'i' } }
                            ],
                        },
                        { jobCategory: { $in: filterArray } },
                        { workType: { $in: workTypeFilter } },
                    ],
                }).populate('companyId').limit(limit);

            } else if (workTypeFilter.length > 0) {
                Jobs = await Job.find({
                    $and: [
                        { isPostAccepted: true },
                        {
                            $or: [
                                { jobTitle: { $regex: search, $options: 'i' } },
                                { jobCategory: { $regex: search, $options: 'i' } },
                                { workType: { $regex: search, $options: 'i' } },
                                { workplace: { $regex: search, $options: 'i' } },
                                { qualifications: { $regex: search, $options: 'i' } }
                            ],
                        },
                        { workType: { $in: workTypeFilter } },
                    ],
                })
                    .populate('companyId')
                    .sort({ createdAt: -1 })
                    .limit(limit);

            } else if (filterArray.length > 0) {
                Jobs = await Job.find({
                    $and: [
                        { isPostAccepted: true },
                        {
                            $or: [
                                { jobTitle: { $regex: search, $options: 'i' } },
                                { jobCategory: { $regex: search, $options: 'i' } },
                                { workType: { $regex: search, $options: 'i' } },
                                { workplace: { $regex: search, $options: 'i' } },
                                { qualifications: { $regex: search, $options: 'i' } }
                            ],
                        },
                        { jobCategory: { $in: filterArray } },
                    ],
                })
                    .populate('companyId')
                    .sort({ createdAt: -1 })
                    .limit(limit);

            }
            else {
                Jobs = await Job.find({
                    $and: [
                        { isPostAccepted: true },
                        {
                            $or: [
                                { jobTitle: { $regex: search, $options: 'i' } },
                                { jobCategory: { $regex: search, $options: 'i' } },
                                { workType: { $regex: search, $options: 'i' } },
                                { workplace: { $regex: search, $options: 'i' } },
                                { qualifications: { $regex: search, $options: 'i' } }
                            ],
                        }
                    ],
                })
                    .populate('companyId')
                    .sort({ createdAt: -1 })
                    .limit(limit);

            }


            const userApplications = await Application.find({ applicant: userId, jobId: { $in: Jobs.map(job => job._id) } });

            const jobApplicationsMap = {};
            userApplications.forEach(application => {
                jobApplicationsMap[application.jobId.toString()] = application;
            });

            const jobsWithApplications = Jobs.map(job => {
                const jobInfo = job.toObject();
                const application = jobApplicationsMap[job._id.toString()];

                if (application) {
                    jobInfo.appliedStatus = true;
                } else {
                    jobInfo.appliedStatus = false;
                }
                return jobInfo;
            });

            //? Date base filtering
            const currentDate = new Date();
            const filteredJobsForDateChecking = jobsWithApplications.filter((job) => {
                const jobDeadline = new Date(job.deadline);
                return currentDate <= jobDeadline;
            })
            //?
            res.status(200).json({ Jobs: filteredJobsForDateChecking, JobsLength, uniqueCategories, uniqueWorkTypes });
        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "An error occurred while listing job details at controller" });
        }
    },
    getSingleJob: async (req, res) => {
        try {
            const jobId = req.params.jobId;
            const singleJob = await Job.findById(jobId)
                .populate({
                    path: 'companyId',
                    select: 'companyName profile'
                });


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

            const uploadedUrl = await uploadToCloudinary(CvFile, { upload_preset: 'CvFiles' });
            if (uploadedUrl) {
                const cvUrl = uploadedUrl;

                const newApplication = new Application({
                    coverLetter: CoverLetter,
                    jobId: jobId,
                    applicant: userId,
                    cvUrl: cvUrl,
                });

                await newApplication.save();

                res.status(200).json({ newApplication, existingApplication });
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
    },
    fetchLandingJobs: async (req, res) => {
        try {
            const jobs = await Job
                .find({ isPostAccepted: true }, { jobTitle: 1, companyId: 1, workType: 1, logo: 1, jobDescription: 1, isPostAccepted: 1, status: 1, createdAt: 1 })
                .populate('companyId')
                .sort({ createdAt: -1 })
                .limit(3);

            return res.status(200).json({ jobs: jobs })
        } catch (error) {
            console.log(error)
            res.status(500).json({ errMsg: "Something went wrong at fetching landing page jobs" });
        }
    },
    fetchAboutCompany: async (req, res) => {
        try {
            const { companyId } = req.query
            const { id } = req.payload;

            const company = await Company.findById(companyId)
            const Jobs = await Job.find({ companyId: companyId }).sort({ createdAt: -1 }).populate('companyId')

            //? Setting true for applied jobs
            const userApplications = await Application.find({ applicant: id, jobId: { $in: Jobs.map(job => job._id) } });

            const jobApplicationsMap = {};
            userApplications.forEach(application => {
                jobApplicationsMap[application.jobId.toString()] = application;
            });

            const jobsWithApplications = Jobs.map(job => {
                const jobInfo = job.toObject();
                const application = jobApplicationsMap[job._id.toString()];

                if (application) {
                    jobInfo.appliedStatus = true;
                } else {
                    jobInfo.appliedStatus = false;
                }
                return jobInfo;
            });
            //?

            const selectedChat = await Chat.findOne({
                companyId: companyId,
                userId: id
            })
            let isChatExist = false
            if (selectedChat) {
                isChatExist = true
            }

            return res.status(200).json({ company, Jobs: jobsWithApplications, isChatExist })
        } catch (error) {
            console.log(error)
            res.status(500).json({ errMsg: "Something went wrong at fetching about company on user side" });
        }
    }
}