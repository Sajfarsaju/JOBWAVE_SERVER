const express = require('express');
const upload = require('../middlewares/multer');
const { registration, login, getCompany, updateProfile } = require('../controllers/companyController');
const { addPost, listCompanyJobs } = require('../controllers/jobController');
const { categoryList } = require('../controllers/categoryController');
const { verifyTokenCompany } = require('../middlewares/auth');
const { setUpPayement, paymentStatus } = require('../controllers/paymentController');


const companyRouter = express.Router();

companyRouter.post('/signup', registration);
companyRouter.post('/login', login);
companyRouter.post('/jobs', verifyTokenCompany, upload.single('logo'), addPost);
companyRouter.get('/jobs/:companyId', verifyTokenCompany, listCompanyJobs);
companyRouter.get('/fetch_subscription_plan', verifyTokenCompany, getCompany);
companyRouter.get('/category', verifyTokenCompany, categoryList);
companyRouter.post('/companyPlan', verifyTokenCompany, setUpPayement);
companyRouter.get('/payment_successfully', paymentStatus);
companyRouter.get('/payment_failed', paymentStatus);
companyRouter.get('/profile', verifyTokenCompany, getCompany);
companyRouter.patch('/profile', verifyTokenCompany, updateProfile);


module.exports = companyRouter;

