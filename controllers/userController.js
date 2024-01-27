const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const { generateToken } = require('../middlewares/auth');
const { uploadToCloudinary } = require('../config/cloudinary');
const OTPModel = require('../models/otpModel')
const crypto = require('crypto');
const sendMailOTP = require('../config/mailOTP');
let message, errMsg


module.exports = {

  registration: async (req, res) => {

    try {
      const { firstName, lastName, email, phone, password, profile, action, userOtp } = req.body
      let user

      if (action === 'checkBackendResponse&saveOTP') {

        const existingEmail = await User.findOne({ email })
        const existingPhone = await User.findOne({ phone })
        user = existingEmail

        if (existingEmail && existingPhone) return res.status(401).json({ errMsg: "Email and phone already exist!" });
        if (existingEmail) return res.status(401).json({ errMsg: "User already exists with this Email!" });
        if (existingPhone) return res.status(401).json({ errMsg: "User already exists with this Phone!" });

        if (firstName.trim().length === 0
          || lastName.trim().length === 0
          || email.trim().length === 0
          || phone.trim().length === 0
          || password.trim().length === 0) return res.status(401).json({ errMsg: "Please fill all the fields" })

        //? OTP GENERATION
        const characters = '0123456789';
        const charactersLength = characters.length;
        let OTP = '';

        for (let i = 1; i <= 6; i++) {
          const randomIndex = Math.floor(Math.random() * charactersLength);
          OTP += characters.charAt(randomIndex);
        }
        //? END OTP GENERATION

        if (OTP) {

          const newOtp = new OTPModel(
            {
              userEmail: email,
              otp: OTP
            }
          )
          await newOtp.save()

          //? calling send OTP mail function
          const mailOtpResult = await sendMailOTP(email, user.firstName, user.lastName, OTP);

          if (mailOtpResult.success) {

            return res.status(200).json({ message: "Otp sented your mail" });

          } else {
            return res.status(401).json({ errMsg: "Something wrong please try again" })
          }
        }

        return res.status(200).json()
      }
      if (action === 'verifyOTP&saveData') {

        const isOtp = await OTPModel.findOne({ $and: [{ userEmail: email }, { otp: userOtp }] })

        if (isOtp) {

          await OTPModel.deleteOne({ $or: [{ userEmail: email }, { otp: userOtp }] })
        } else {
          return res.status(401).json({ errMsg: "Invalid Otp, please try again" })
        }


        const salt = await bcrypt.genSalt(6);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = new User(
          {
            firstName,
            lastName,
            email,
            phone,
            profile: profile,
            password: hashedPass
          }
        )
        await newUser.save();
        return res.status(200).json({ message: "Your registration has been successfully" });
      }

      if (action === 'resendOtp') {

        //? OTP GENERATION
        const user = await User.findOne({ email: email });

        const characters = '0123456789';
        const charactersLength = characters.length;
        let OTP = '';

        for (let i = 1; i <= 6; i++) {
          const randomIndex = Math.floor(Math.random() * charactersLength);
          OTP += characters.charAt(randomIndex);
        }
        //? END OTP GENERATION
        if (OTP) {

          const updatedOTP = await OTPModel.findOneAndUpdate(
            { userEmail: email },
            { $set: { otp: OTP } },
            { new: true }
          )
          const mailOtpResult = await sendMailOTP(email, user.firstName, user.lastName, OTP);

          if (mailOtpResult.success) {
            const token = generateToken(user._id, 'user');
            return res.status(200).json({ message: "Otp sented your mail", isActive: user.isActive, token, name: user.firstName, role: 'user', id: user._id });

          } else {
            return res.status(401).json({ errMsg: "Something wrong please try again" })
          }
        }
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Registration" });
    }
  },
  googleSignup: async (req, res) => {
    try {

      const { firstName, lastName, email, isEmailVerified, profile } = req.body;

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
      const user = await newUser.save();

      const token = generateToken(user._id, 'user');

      res.status(200).json({ message: "Your registration has been successfully" , name: user.firstName, token, role: 'user', id: user._id  });

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Registration" });
    }
  },
  login: async (req, res) => {

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email })

      if (!user) return res.status(401).json({ errMsg: "User not found!" });

      if (email.trim().length === 0 || password.trim().length === 0) return res.status(401).json({ errMsg: "Please fill all the fields" });

      const passMatch = await bcrypt.compare(password, user.password)

      if (!passMatch) return res.status(401).json({ errMsg: "Your Password is incorrect!" });

      if (!user.isActive) return res.status(401).json({ errMsg: "Your account has been blocked" });

      if (user.isAdmin) {
        return res.status(401).json({ errMsg: "User not found!" });
      } else {
        const token = generateToken(user._id, 'user');
        res.status(200).json({ message: "Welcome to JobWave", isActive: user.isActive, name: user.firstName, token, role: 'user', id: user._id });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Login" });
    }
  },
  googleLogin: async (req, res) => {
    try {

      const { email } = req.body;

      const user = await User.findOne({ email: email });

      if (!user) return res.status(401).json({ errMsg: "User not found!" });

      if (!user.isActive) return res.status(401).json({ errMsg: "Your account has been blocked" });

      const token = generateToken(user._id, 'user');

      res.status(200).json({ message: "Welcome to JobWave", isActive: user.isActive, name: user.firstName, token, role: 'user', id: user._id });

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Something went wrong at Login" });
    }
  },
  loginWithOTP: async (req, res) => {
    try {
      const { userId, email, action, userOtp, otpId } = req.body;

      if (action === 'sendOtp&SaveOtp') {

        const user = await User.findOne({ email: email });

        if (!user) return res.status(401).json({ errMsg: "You are not registered with this email. Please proceed to the registration page." });

        if (!user.isActive) return res.status(401).json({ errMsg: "Your account has been blocked" });

        //? OTP GENERATION
        const characters = '0123456789';
        const charactersLength = characters.length;
        let OTP = '';

        for (let i = 1; i <= 6; i++) {
          const randomIndex = Math.floor(Math.random() * charactersLength);
          OTP += characters.charAt(randomIndex);
        }
        //? END OTP GENERATION

        if (OTP) {

          const newOtp = new OTPModel(
            {
              userId: user._id,
              otp: OTP
            }
          )
          await newOtp.save()
          //? calling send OTP mail function
          const mailOtpResult = await sendMailOTP(email, user.firstName, user.lastName, OTP);

          if (mailOtpResult.success) {
            const token = generateToken(user._id, 'user');
            return res.status(200).json({ message: "Otp sented your mail", isActive: user.isActive, token, name: user.firstName, role: 'user', id: user._id, otpId: newOtp._id });

          } else {
            return res.status(401).json({ errMsg: "Something wrong please try again" })
          }
        }

      }
      if (action === 'verifyOtp') {
        console.log(userId, userOtp)
        const isOtp = await OTPModel.findOne({ $and: [{ userId: userId }, { otp: userOtp }] })

        if (isOtp) {
          res.status(200).json({ success: true })

          await OTPModel.deleteOne({ $or: [{ userId: userId }, { otp: userOtp }] })

          return
        } else {
          return res.status(401).json({ errMsg: "Invalid Otp, please try again" })
        }
      }

      if (action === 'resendOtp') {

        //? OTP GENERATION
        const user = await User.findOne({ email: email });

        if (!user.isActive) return res.status(401).json({ errMsg: "Your account has been blocked" });

        const characters = '0123456789';
        const charactersLength = characters.length;
        let OTP = '';

        for (let i = 1; i <= 6; i++) {
          const randomIndex = Math.floor(Math.random() * charactersLength);
          OTP += characters.charAt(randomIndex);
        }
        //? END OTP GENERATION
        if (OTP) {

          const updatedOTP = await OTPModel.findOneAndUpdate(
            { _id: otpId },
            { $set: { otp: OTP } },
            { new: true }
          )
          const mailOtpResult = await sendMailOTP(email, user.firstName, user.lastName, OTP);

          if (mailOtpResult.success) {
            const token = generateToken(user._id, 'user');
            return res.status(200).json({ message: "Otp sented your mail", isActive: user.isActive, token, name: user.firstName, role: 'user', id: user._id });

          } else {
            return res.status(401).json({ errMsg: "Something wrong please try again" })
          }

        }

      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Somthing went wrong at get profile" })
    }
  },
  forgetPassUser: async (req, res) => {
    try {
      const { password, email, action, userOtp, otpId } = req.body;

      if (action === 'getOTP&SaveOTP') {

        const user = await User.findOne({ email: email });

        if (!user) return res.status(404).json({ errMsg: "User not found!" });

        if (!user.isActive) return res.status(401).json({ errMsg: "Your account is blocked" });

        //? OTP GENERATION
        const characters = '0123456789';
        const charactersLength = characters.length;
        let OTP = '';

        for (let i = 1; i <= 6; i++) {
          const randomIndex = Math.floor(Math.random() * charactersLength);
          OTP += characters.charAt(randomIndex);
        }
        //? END OTP GENERATION

        if (OTP) {

          const newOtp = new OTPModel(
            {
              userId: user._id,
              otp: OTP
            }
          )
          await newOtp.save()
          //? calling send OTP mail function
          const mailOtpResult = await sendMailOTP(email, user.firstName, user.lastName, OTP);

          if (mailOtpResult.success) {
            const token = generateToken(user._id, 'user');
            return res.status(200).json({ message: "Otp sented your mail", otpId: newOtp._id });

          } else {
            return res.status(401).json({ errMsg: "Something wrong please try again" })
          }
        }
      }
      if (action === 'verifyOtp') {
        const user = await User.findOne({ email: email })

        const isOtp = await OTPModel.findOne({ $and: [{ userId: user._id }, { otp: userOtp }] })


        if (isOtp) {
          res.status(200).json({ success: true })

          await OTPModel.deleteOne({ $or: [{ userId: user._id }, { otp: userOtp }] })

          return
        } else {
          return res.status(401).json({ errMsg: "Invalid Otp, please try again" })
        }
      }
      if (action === 'updatePassword') {

        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).json({ errMsg: "User not found!" });

        const salt = await bcrypt.genSalt(6);
        const hashedPass = await bcrypt.hash(password, salt);

        const updatedUser = await User.findOneAndUpdate(
          { email: email },
          { $set: { password: hashedPass } },
          { new: true, upsert: true }
        );

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

      return res.json({ user, skills: user.skills }).status(200);
    } catch (error) {
      console.log(error);
      res.status(500).json({ errMsg: "Somthing went wrong at get profile" })
    }
  },
  getPlan: async (req, res) => {
    try {
      const { userId } = req.query;

      const user = await User.findById(userId);

      return res.status(200).json({ user })
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
  // 
  changeProfile: async (req, res) => {
    try {
      const { profileImage, bio } = req.body;
      const { firstName, lastName, email, action } = req.body

      const userId = req.params.userId;

      if (action === 'updatePersonal') {

        const updateObject = {};
        if (firstName) {
          updateObject.firstName = firstName;
        }

        if (lastName) {
          updateObject.lastName = lastName;
        }

        if (email) {
          updateObject.email = email;
        }

        const user = await User.findByIdAndUpdate(
          userId,
          {
            $set: updateObject,

          },
          { new: true },
        );

      } else if (action === 'updateProfile') {

        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ errMsg: 'User not found' });
        }
        const uploadedUrl = await uploadToCloudinary(profileImage, { upload_preset: 'userProfile' });

        if (uploadedUrl) {
          user.profile = uploadedUrl;
        }
        if (bio) {
          user.bio = bio;
        }

        await user.save();

      }
      return res.status(200).json({ message: true })

    } catch (error) {
      console.log(error);
      return res.status(500).json({ errMsg: 'An error occurred' });
    }
  },
  // 
  changeSkill: async (req, res) => {
    try {
      const { skill, action } = req.body;
      const userId = req.payload.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ errMsg: 'User not found' });
      }
      if (action === 'add_skill') {
        const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
        // const existingSkill = await Skill.findOne({ name: capitalizedSkill });

        if (user.skills.some(existingSkill => existingSkill.toLowerCase() === capitalizedSkill.toLowerCase())) {
          console.log('Skill already exists:', capitalizedSkill);
          return res.status(402).json({ errMsg: "Skill already exists in your profile" })
        } else {

          user.skills.addToSet(capitalizedSkill);
          console.log('Added:', capitalizedSkill);
        }

      } else if (action === 'remove') {
        user.skills.pull(skill);
        console.log('removed;', skill)
      }

      await user.save();

      return res.status(200).json({ user })
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(500).json({ errMsg: 'An error occurred' });
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