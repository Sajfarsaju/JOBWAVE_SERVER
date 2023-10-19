const express = require('express');
const { login , getUsersList , block_unblockUser , getJobs , handle_posted_job } = require('../controllers/adminController');
const { addCategory,categoryList,editCategory} = require('../controllers/categoryController');
const {verifyTokenAdmin} = require('../middlewares/auth')


const adminRouter = express.Router();

adminRouter.post('/login' , login);
adminRouter.post('/category', verifyTokenAdmin , addCategory);
adminRouter.get('/category', verifyTokenAdmin , categoryList);
adminRouter.patch('/category' , verifyTokenAdmin , editCategory);
adminRouter.get('/users', verifyTokenAdmin , getUsersList);
adminRouter.patch('/block-unblockUser', verifyTokenAdmin , block_unblockUser);
adminRouter.get('/job_list', verifyTokenAdmin , getJobs );
adminRouter.patch('/handle_posted_job', verifyTokenAdmin , handle_posted_job );



module.exports = adminRouter;