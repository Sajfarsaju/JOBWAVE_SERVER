const Job = require('../models/jobPostModel');
const Category = require('../models/categoryModel');


module.exports = {

    addPost: async (req, res) => {
        try {
            const {
                jobTitle,
                jobCategory,
                workType,
                workplace,
                salaryRange,
                deadline,
                qualifications,
                jobDescription,
                companyDescription,
                jobResponsibilities,
                benefits,
                vacancy,
                companyId
            } = req.body;

            const jobCategoryId = jobCategory.value


            if (!jobTitle || jobTitle.trim().length === 0) {
                return res.status(400).json({ errMsg: 'Job Title is required' });
            }

            if (!jobCategory) {
                return res.status(400).json({ errMsg: 'Job Category is required' });
            }

            if (!workType || workType.trim().length === 0) {
                return res.status(400).json({ errMsg: 'Job Type is required' });
            }

            if (!salaryRange || salaryRange.trim().length === 0) {
                return res.status(400).json({ errMsg: 'Salary Range is required ' });
            }
            if (!workplace || workplace.trim().length === 0) {
                return res.status(400).json({ errMsg: 'Workplace is required' });
            }
            if (!vacancy || vacancy.trim().length === 0) {
                return res.status(400).json({ errMsg: 'Vacancy is required and must be a number' });
            }
            if (!deadline || isNaN(Date.parse(deadline))) {
                return res.status(400).json({ errMsg: 'Deadline is required and must be a valid date' });
            }


            if (!qualifications || qualifications.trim().length === 0) {
                return res.status(400).json({ errMsg: 'Qualifications is required and must be an array of strings' });
            }

            const stringFields = [
                'jobDescription',
                'companyDescription',
                'jobResponsibilities',
                'benefits'
            ];

            for (const field of stringFields) {
                if (!req.body[field] || req.body[field].trim().length === 0) {
                    return res.status(400).json({ errMsg: `${field} is required` });
                }
            }

            const existingJob = await Job.findOne({
                jobTitle,
                workType,
                workplace,
                jobCategory: jobCategory.label,
                salaryRange,
                deadline,
                qualifications,
                jobDescription,
                companyDescription,
                jobResponsibilities,
                benefits,
                vacancy,

            });
            const selectedCategory = await Category.findOne({ _id: jobCategoryId });
            if (existingJob) {
                return res.status(400).json({ errMsg: 'Job with the same details already exists' });
            } else {

                const newJob = new Job({
                    jobTitle,
                    jobCategory: selectedCategory.categoryName,
                    workType,
                    workplace,
                    salaryRange,
                    deadline,
                    qualifications,
                    jobDescription,
                    companyDescription,
                    jobResponsibilities,
                    benefits,
                    vacancy,
                    companyId
                });

                await newJob.save();
                res.status(200).json({ newJob });
            }



        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: 'An error occurred while saving job details at controller' });
        }
    },
    listCompanyJobs: async (req, res) => {
        try {
            const companyId = req.params.companyId;
            const Jobs = await Job.find({ companyId: companyId });
            res.status(200).json({ Jobs });
        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "An error occurred while listing job details at controller" });
        }
    },
    enableDisableJob: async (req, res) => {
        try {
            const { companyId } = req.payload
            const { jobPostId, action } = req.body
            console.log(req.body)

            if (action === 'enableJob') {
                await Job.findOneAndUpdate({ _id: jobPostId }, { $set: { isJobDisabled: false } })
            }
            if (action === 'disableJob') {
                await Job.findOneAndUpdate({ _id: jobPostId }, { $set: { isJobDisabled: true } }, { new: true })
            }
            const updatedJobPost = await Job.find({ companyId: companyId })
            
            return res.status(200).json({ updatedJobPost })
        } catch (error) {
            console.log(error)
            res.status(500).json({ errMsg: "An error occurred while enable or disable job at controller" });
        }
    }

}
