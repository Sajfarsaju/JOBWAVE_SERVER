const express = require('express');
const { registration , googleSignup , login , googleLogin , getProfile,changeProfile,changeSkill, addSkill, updateProfile, addBio, loginWithPhone, forgetPassUser } = require('../controllers/userController');
const { listJobs, getSingleJob, applyJob , appliedJobs} = require('../controllers/userJobController');
const { verifyTokenUser } = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const { setUpUserPayement, userPaymentStatus } = require('../controllers/paymentController');
const { createChat , saveChat, fetchChats ,fetchAllMessages} = require('../controllers/chatController');
const userRouter = express.Router();


userRouter.post('/login', login);
userRouter.post('/phoneLogin', loginWithPhone);
userRouter.post('/google_signin', googleLogin);
userRouter.post('/forgot_password', forgetPassUser);
userRouter.post('/signup', registration);
userRouter.post('/google_signup', googleSignup);
// userRouter.get("/:id/verify/:token", verifyTokenEmail)
userRouter.get('/profile', verifyTokenUser , getProfile);
userRouter.post('/profile/:skill', verifyTokenUser , addSkill);
userRouter.post('/profile', verifyTokenUser , addBio);
// userRouter.post('/profile',verifyTokenUser,addExperience)
userRouter.patch('/profile/:userId', verifyTokenUser , updateProfile);
userRouter.get('/jobs', verifyTokenUser , listJobs);
userRouter.get('/jobview/:jobId', verifyTokenUser , getSingleJob);
userRouter.post('/applyJob', verifyTokenUser, upload.single('CvFile'), applyJob);
userRouter.get('/applied_jobs', verifyTokenUser , appliedJobs);
userRouter.post('/user_plan', verifyTokenUser, setUpUserPayement);
userRouter.get('/payment_successfully', userPaymentStatus);
userRouter.get('/payment_failed', userPaymentStatus);
userRouter.post('/chats', verifyTokenUser , createChat);
userRouter.get('/chats', verifyTokenUser , fetchChats)
userRouter.get('/openChat', verifyTokenUser , fetchAllMessages)
userRouter.patch('/profilee/:userId', verifyTokenUser , changeProfile);
userRouter.patch('/skills', verifyTokenUser , changeSkill);

module.exports = userRouter;