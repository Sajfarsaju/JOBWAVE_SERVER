const Company = require('../models/companyModel');
const bcrypt = require('bcrypt');
const Application = require('../models/applicantsModel');
const Job = require('../models/jobPostModel');
const { generateToken } = require('../middlewares/auth');
const { uploadToCloudinary } = require('../config/cloudinary');
const sendVerifyMail = require('../config/verifyEmail');
const User = require('../models/userModel');
const hiringModel = require('../models/hiringModel');
let message, errMsg


module.exports = {

    registration: async (req, res) => {

        try {

            const { concernName, companyName, email, phone, GSTNumber, password } = req.body;

            const { address, state, district, city, zip } = req.body;

            const existingCompanyPhone = await Company.findOne({ phone });
            const existingCompanyEmail = await Company.findOne({ email });

            if (existingCompanyPhone && existingCompanyEmail) return res.status(409).json({ errMsg: "This Phone and Email already exists!" });

            if (existingCompanyEmail) return res.status(409).json({ errMsg: "This Email already exists!" });

            if (existingCompanyPhone) return res.status(409).json({ errMsg: "This Phone already exists!" });

            if (concernName.trim().length === 0 || companyName.trim().length === 0 || email.trim().length === 0 || phone.trim().length === 0 || GSTNumber.trim().length === 0 || password.trim().length === 0 || address.trim().length === 0 || state.trim().length === 0 || district.trim().length === 0 || city.trim().length === 0 || zip.trim().length === 0) return res.status(400).json({ errMsg: "Please fill all the fields!" });

            const salt = await bcrypt.genSalt(6);
            const hashedPass = await bcrypt.hash(password, salt);

            const newCompany = new Company(
                {
                    concernName,
                    companyName,
                    email,
                    phone,
                    GSTNumber,
                    companyAddress: {
                        address,
                        state,
                        district,
                        city,
                        zip
                    },
                    password: hashedPass,
                }
            )
            await newCompany.save()

            res.status(200).json({ message: "Your registration has been successfully" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at Company Registration" })
        }
    },

    login: async (req, res) => {

        try {

            const { email, password } = req.body;

            const company = await Company.findOne({ email });

            if (!company) return res.status(401).json({ errMsg: "Company not found!" });
            if (email.trim().length === 0 || password.trim().length === 0) return res.status(401).json({ errMsg: "Please fill all the fields" });

            const isMatch = await bcrypt.compare(password, company.password);

            if (!isMatch) return res.status(401).json({ errMsg: "Your Password is incorrect!" });

            const token = generateToken(isMatch._id, 'company');

            res.status(200).json({ message: "Welcome to JobWave", id: company._id, name: company.companyName, role: 'company', token });

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at Company Login" })

        }
    },
    getCompany: async (req, res) => {
        try {
            const { companyId } = req.payload;
            const company = await Company.findById(companyId);

            res.status(200).json({ company });
        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at Company Profile" });
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { profile, bio, companyId, isImageSelected } = req.body;

            let updatedCompany;

            const company = await Company.findById(companyId);

            if (!company) {
                return res.status(404).json({ errMsg: 'company not found' });
            }
            if (profile && isImageSelected) {

                const uploadedUrl = await uploadToCloudinary(profile, { upload_preset: 'companyProfile' });
                console.log(uploadedUrl)
                if (uploadedUrl) {
                    company.profile = uploadedUrl;
                    updatedCompany = await company.save();
                }
            }
            if (bio) {
                company.bio = bio
                updatedCompany = await company.save();
            }

            return res.status(200).json({ updatedCompany })

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at Company update Profile" })
        }
    },
    fetchCandidates: async (req, res) => {
        try {
            const { companyId } = req.payload;

            const myPosts = await Job.find({ companyId });


            const candidates = await Application.find({ jobId: { $in: myPosts.map(post => post._id) } })
                .populate({
                    path: 'applicant',
                    select: 'firstName lastName email profile',
                })
                .populate({
                    path: 'jobId',
                    select: 'jobTitle workType',
                });
            return res.status(200).json({ candidates });

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at fetching candidates" })
        }
    },
    shortListCandidate: async (req, res) => {

        try {
            const { selectedOption, interviewTime, userId, companyId, applicationId, jobId, jobTitle } = req.body;

            if (!interviewTime) {
                return;
            }
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const dateTime = new Date(interviewTime);
            const InterviewTime = dateTime.toLocaleDateString('en-US', options);

            if (selectedOption === 'shortlisted') {

                const company = await Company.findById(companyId)
                const user = await User.findById(userId)
                const { companyName, email, phone } = company

                //? calling send mail function
                const mailVerificationResult = await sendVerifyMail(companyName, email, InterviewTime, jobTitle, user.email, user.firstName, user.lastName, phone);

                if (mailVerificationResult.success) {

                    //? saving 
                    const application = await Application.findById(applicationId);
                    application.status = selectedOption;
                    await application.save();

                    const newHiringProcess = new hiringModel({
                        companyId: companyId,
                        applicationId: applicationId,
                        jobId: jobId,
                        candidate: userId,
                        interViewTime: InterviewTime,
                        status: selectedOption,
                    });

                    await newHiringProcess.save();
                    console.log('shortlist done');

                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false, errMsg: 'Mail verification failed.' });
                }
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ errMsg: "Something went wrong at shortlist candidate" })
        }
    },
    fetchShortlistDetails: async (req, res) => {

        try {
            const { companyId } = req.query

            const myPosts = await Job.find({ companyId });

            const shortlistedDetail = await hiringModel.find({ companyId: companyId, status: 'shortlisted' })
                .populate('candidate')
                .populate('jobId')
                .populate({
                    path: 'applicationId',
                    select: 'cvUrl'
                })

            return res.status(200).json({ shortlistedDetail })
        } catch (error) {
            console.log(error)
        }
    },
    hireCandidate: async (req, res) => {
        try {
            const { shortlistedId, applicationId, newStatus } = req.body

            if (newStatus === 'Hired') {

                const application = await Application.findById(applicationId);

                application.status = newStatus
                await application.save();


                const hiring = await hiringModel.findById(shortlistedId);
                hiring.status = newStatus
                await hiring.save();


                return res.status(200).json()
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at hiring candidate" });
        }
    },
    fetchHiredCandidate: async (req, res) => {

        try {
            const { companyId } = req.query
            const hiredCandidate = await hiringModel.find({ companyId: companyId, status: 'Hired' })
                .populate('candidate')
                .populate('jobId')

            return res.status(200).json({ hiredCandidate })

        } catch (error) {
            console.log(error);
            res.status(500).json({ errMsg: "Something went wrong at hiring candidate" })
        }
    },
    viewUserProfile: async (req, res) => {

        try {
            const { userId } = req.query

            const user = await User.findOne({ _id: userId })

            if(user){

                return res.status(200).json({ user })
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({ errMsg: "Something went wrong at fetching candidate profile" })
        }
    }
}

