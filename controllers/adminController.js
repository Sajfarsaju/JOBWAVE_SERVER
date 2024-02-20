const { generateToken } = require('../middlewares/auth');
const User = require('../models/userModel');
const Job = require('../models/jobPostModel');
const Company = require('../models/companyModel')
const bcrypt = require("bcrypt");
require('dotenv').config()
let msg, errMsg;

module.exports = {

  login: async (req, res) => {

    try {

      const { email, password } = req.body;

      const admin = await User.findOne({ email: email })

      if (!admin) return res.status(401).json({ errMsg: "Not found details" });

      const passMatch = await bcrypt.compare(password, admin.password)

      if (!passMatch) return res.status(401).json({ errMsg: "Your Password is incorrect!" });

      if (admin.isAdmin) {

        const token = generateToken(email, 'admin');

        return res.status(200).json({ message: "Login Successful", name: "sajfarm", token, role: "admin" });
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ errMsg: "Something went wrong at admin login" })
    }
  },
  getUsersList: async (req, res) => {
    try {
      const users = await User.find()
      res.status(200).json({ users })
    } catch (error) {
      console.log(error)
      res.status(500).json({ errMsg: "Something went wrong at get users" })
    }
  },
  block_unblockUser: async (req, res) => {
    try {
      const { id, action } = req.body;

      const user = await User.findById(id);

      if (!user) {
        return res.status(400).json({ errMsg: "User does not exist" });
      }

      if (action === "blockUser" || action === "unblockUser") {

        user.isActive = action === "blockUser" ? false : true;

        await user.save();
        console.log("after save:", user.isActive)

        return res.status(200).json({ userStatus: user });

      } else {
        return res.status(400).json({ errMsg: "Invalid action" });
      }
    } catch (error) {

      console.error(error);
      return res.status(500).json({ errMsg: "Something went wrong at block-unblock user" });
    }
  },
  getJobs: async (req, res) => {
    try {
      const jobs = await Job.find().populate('companyId')
      return res.status(200).json({ jobs })
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errMsg: "Something went wrong at fetching jobs" });
    }
  },
  handle_posted_job: async (req, res) => {
    try {
      const { jobId, action } = req.body;

      const job = await Job.findById(jobId).populate('companyId')

      if (action === 'approve_post') {

        job.isPostAccepted = true

        await job.save();
        console.log("after save:", job.isPostAccepted)

        return res.status(200).json({ jobStatus: job });

      } else {
        return res.status(400).json({ errMsg: "Invalid action" });
      }

    } catch (error) {
      console.log(error);
      return res.status(500).json({ errMsg: "Something went wrong at fetching jobs" });
    }
  },
  getDashboard: async (req, res) => {
    try {
      const users = await User.find().count()

      const company = await Company.find().count()

      const jobs = await Job.find().count()

      return res.status(200).json({ users, company, jobs })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ errMsg: "Something went wrong at fetching dashboard" });
    }
  }
}