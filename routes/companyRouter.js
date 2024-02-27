const express = require('express');
const upload = require('../middlewares/multer');
const { registration, login, getCompany, updateProfile ,
         fetchCandidates , shortListCandidate , fetchShortlistDetails ,
         hireCandidate , fetchHiredCandidate, viewUserProfile} = require('../controllers/companyController');
const { addPost, listCompanyJobs, enableDisableJob } = require('../controllers/jobController');
const { categoryList } = require('../controllers/categoryController');
const { verifyTokenCompany } = require('../middlewares/auth');
const { setUpPayement, paymentStatus } = require('../controllers/paymentController');
const { fetchChats , fetchAllMessages} = require('../controllers/chatController');

const companyRouter = express.Router();

companyRouter.post('/signup', registration);
companyRouter.post('/login', login);
companyRouter.post('/jobs', verifyTokenCompany, upload.single('logo'), addPost);
companyRouter.get('/jobs/:companyId', verifyTokenCompany, listCompanyJobs);
companyRouter.patch('/enable_disable_job', verifyTokenCompany, enableDisableJob);
companyRouter.get('/fetch_subscription_plan', verifyTokenCompany, getCompany);
companyRouter.get('/category', verifyTokenCompany, categoryList);
companyRouter.post('/companyPlan', verifyTokenCompany, setUpPayement);
companyRouter.get('/payment_successfully', paymentStatus);
companyRouter.get('/payment_failed', paymentStatus);
companyRouter.get('/profile', verifyTokenCompany, getCompany);
companyRouter.patch('/profile', verifyTokenCompany, updateProfile);
companyRouter.get('/chats', verifyTokenCompany , fetchChats);
companyRouter.get('/openChat', verifyTokenCompany , fetchAllMessages);
companyRouter.get('/candidates', verifyTokenCompany , fetchCandidates);
companyRouter.get('/viewUserProfile', verifyTokenCompany , viewUserProfile);
companyRouter.post('/shortlist' , verifyTokenCompany , shortListCandidate);
companyRouter.get('/shortlist' , verifyTokenCompany , fetchShortlistDetails);
companyRouter.post('/hired' , verifyTokenCompany , hireCandidate);
companyRouter.get('/hired' , verifyTokenCompany , fetchHiredCandidate);


module.exports = companyRouter;


