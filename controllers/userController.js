const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const { generateToken } = require('../middlewares/auth');
const Token = require('../models/tokenModel');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
let message, errMsg


module.exports = {

  registration: async (req, res) => {

    try {
      const { firstName, lastName, email, phone, password } = req.body

      let existingUser = await User.findOne({ email })

      if (existingUser.email) return res.status(401).json({ errMsg: "User already exists with this Email!" });
      if (existingUser.phone) return res.status(401).json({ errMsg: "User already exists with this Phone!" });

      if (firstName.trim().length === 0 || lastName.trim().length === 0 || email.trim().length === 0 || phone.trim().length === 0 || password.trim().length === 0) return res.status(401).json({ errMsg: "Please fill all the fields" })

      const salt = await bcrypt.genSalt(6);
      const hashedPass = await bcrypt.hash(password, salt);

      const newUser = new User(
        {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPass
        }
      )

      existingUser = await newUser.save();
      console.log(existingUser)
      // const token = await new Token({
      //   userId : existingUser._id,
      //   token : crypto.randomBytes(32).toString("hex")
      // }).save();

      // const url = `${process.env.BASE_URL}${existingUser._id}/verify/${token.token}`;

      // await sendEmail(existingUser.email , 'Verify Email' , url)

      // res.status(200).json({ message: "An Email sent to your account. Please verify" });
      res.status(200).json({ message: "Your registration has been successfully" });

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Registration" });
    }
  },
  googleSignup: async (req, res) => {
    try {

      const { firstName, lastName, email, isEmailVerified, profile } = req.body;
      console.log('firstName;', firstName);
      console.log('lastName;', lastName);
      console.log('email;', email);
      console.log('isEmailVerified;', isEmailVerified);
      console.log('profile;', profile);

      

      let existingUser = await User.findOne({ email: email });

      if (existingUser) return res.status(401).json({ errMsg: "User already exists with this account!" });

      const newUser = new User(
        {
          firstName,
          lastName,
          email,
          isEmailVerified,
          profile
        }
      );
      console.log("newUser;", newUser)
      const user = await newUser.save();

      const token = generateToken(user._id, 'user');

      res.status(200).json({ message: "Your registration has been successfully" });

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Registration" });
    }
  },
  // verifyTokenEmail: async (req, res) => {
  //   try {
  //     const user = await User.findOne({ _id: req.params.id });
  //     if (!user) return res.status(400).json({ errMsg: "Invalid link" });

  //     const token = await Token.findOne({
  //       userId: user._id,
  //       token: req.params.token
  //     });

  //     if (!token) return res.status(400).json({ errMsg: "Invalid link" });

  //     await User.updateOne({ _id: user._id, isEmailVerified: true });

  //     res.status(200).json({ message: "Email verified successfully" })

  //   } catch (error) {

  //     console.log(error);
  //     res.status(500).json({ errMsg: "Something went wrong at Email verification" });

  //   }
  // },
  login: async (req, res) => {

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email })
      // req.user = user;
      // console.log('log',req.user.isActive)

      if (!user) return res.status(401).json({ errMsg: "User not found!" });

      if (email.trim().length === 0 || password.trim().length === 0) return res.status(401).json({ errMsg: "Please fill all the fields" });

      const passMatch = await bcrypt.compare(password, user.password)

      if (!passMatch) return res.status(401).json({ errMsg: "Your Password is incorrect!" });
      
      if (!user.isActive) return res.status(401).json({ errMsg: "Your account has been blocked" });

      // if(!user.isEmailVerified){

      //   let token = await Token.findOne({ userId : user._id });
      //   if(!token){
      //     token = await new Token({
      //       userId : user._id,
      //       token : crypto.randomBytes(32).toString("hex")
      //     }).save();

      //     const url = `${process.env.BASE_URL}${user._id}/verify/${token.token}`;

      //     await sendEmail(user.email , 'Verify Email' , url)
      //   }
      //   res.status(400).json({ errMsg : "An Email sent to your account please verify"});
      // }

      const token = generateToken(user._id, 'user');

      res.status(200).json({ message: "Welcome to JobWave", isActive: user.isActive, name: user.firstName, token, role: 'user', id: user._id });

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Login" });
    }
  },
  googleLogin : async(req,res) => {
    try{

      const { email } = req.body;
      
      const user = await User.findOne({ email: email });

      if (!user) return res.status(401).json({ errMsg: "User not found!" });

      if (!user.isActive) return res.status(401).json({ errMsg: "Your account has been blocked" });

      const token = generateToken(user._id, 'user');

      res.status(200).json({ message: "Welcome to JobWave", isActive: user.isActive, name: user.firstName, token, role: 'user', id: user._id });

    }catch(error){
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Login" });
    }
  },
  loginWithPhone: async (req, res) => {
    try {
      const { Number } = req.body;
      console.log(Number)

      const user = await User.findOne({ phone: Number });
      req.user = user;

      if (!user) return res.status(401).json({ errMsg: "You are not registered with this number. Please proceed to the registration page." });

      if (!user.isActive) return res.status(401).json({ errMsg: "Your account has been blocked" });
      
      const token = generateToken(user._id, 'user');

      res.status(200).json({ message: "Welcome to JobWave", isActive: user.isActive, name: user.firstName, token, role: 'user', id: user._id });

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Somthing went wrong at get profile" })
    }
  },
  forgetPassUser: async (req, res) => {
    try {
      const { password, Number, action } = req.body;
      console.log(req.body)
      if (action === 'verifyPhone') {

        const user = await User.findOne({ phone: Number });

        if (!user) return res.status(401).json({ errMsg: "User not found!" });
        console.log(user.isActive)
        if (!user.isActive) return res.status(401).json({ errMsg: "Your account is blocked" });

        return res.status(200).json({ message: "Phone number is ok" });

      } else if (action === 'updatePassword') {

        const user = await User.findOne({ phone: Number });
        if (!user) return res.status(401).json({ errMsg: "User not found!" });

        const salt = await bcrypt.genSalt(6);
        const hashedPass = await bcrypt.hash(password, salt);

        user.password = hashedPass;
        console.log(user.password)

        await user.save();
        return res.status(200).json({ message: "You can now log in with your new password." });
      }


    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Somthing went wrong at get profile" })
    }
  },
  getProfile: async (req, res) => {
    try {
      const { id } = req.payload;
      const user = await User.findById(id)
      res.json({ user }).status(200)
    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Somthing went wrong at get profile" })
    }
  },
  addSkill: async (req, res) => {
    try {
      const { skill } = req.params
      const { id } = req.payload;
      const user = await User.findById(id)
      if (req.body.action !== 'remove') {

        user.skills.addToSet(skill);
        await user.save();
        console.log("added skill:", user.skills)
        return res.status(200).json({ user })
      }
      //  remove skills
      user.skills.pull(skill);
      await user.save();
      console.log("removed skill:", user.skills)
      return res.status(200).json({ user })
    } catch (error) {
      console.log(error);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const userId = req.params.userId;
      let updatedUserData = req.body;
      const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { upsert: true });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the user profile' });
    }
  },
  addExperience: async (req, res) => {
    try {
      const { role, yearOfExp, compName, action } = req.body;
      const { userId } = req.payload

      if (action === 'add-experience') {

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const newExperience = {
          role,
          yearOfExp,
          compName,
        };

        user.experienceDetails.push(newExperience);

        await user.save();

        res.status(200).json({ user });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ errMsg: 'An error occurred while adding experience' });
    }
  },
  addBio: async (req, res) => {
    try {
      const { id } = req.payload;
      const { action, bio } = req.body;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ errMsg: 'User not found' });
      }
      if (bio.trim().length === 0) return res.status(400).json({ errMsg: "Fill your bio!!" })
      if (action === 'updateBio') {
        user.bio = bio;

        await user.save();
        console.log(user.bio)
        return res.status(200).json({ user: user });
      } else {
        return res.status(400).json({ errMsg: 'Invalid action' });
      }
    } catch (error) {
      console.error("Error handling request:", error);
      return res.status(500).json({ errMsg: 'Internal server error' });
    }
  },
}