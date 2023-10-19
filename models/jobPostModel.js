const mongoose = require('mongoose');
const postJobSchema = new mongoose.Schema({

  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  // jobCategory:{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "category",
  //     required: true

  // },
  jobCategory: {
    type: String,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  workType: {
    type: String,
    required: true,
    trim: true
  },
  workplace: {
    type: String,
    required: true,
    trim: true
  },
  salaryRange: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  qualifications: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true
  },
  companyDescription: {
    type: String,
    required: true,
    trim: true
  },
  jobResponsibilities: {
    type: String,
    required: true,
    trim: true
  },
  benefits: {
    type: String,
    required: true,
    trim: true
  },
  vacancy: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "Active",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isPostAccepted: {
    type: Boolean,
    default: false
  },
  // applicants: [
  //   {
  //     applicant: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "users",
  //       required: true,
  //     },
  //     status: {
  //       type: String,
  //       required: true,
  //       default: "pending",
  //     },
  //     coverLetter: {
  //       type: String,
  //       required: true,
  //     },
  //     resumeUrl: {
  //       type: String,
  //       required: true,
  //     },
  //     resumePublicId: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  // invites: [
  //   {
  //     userId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "users",
  //       required: true,
  //     },
  //   },
  // ],

},
  { timestamps: true }
)

const jobPostModel = mongoose.model("jobPosts", postJobSchema);

module.exports = jobPostModel;