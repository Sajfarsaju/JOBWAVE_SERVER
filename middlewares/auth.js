const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const userModel = require('../models/userModel');
require('dotenv').config();
let errMsg;

module.exports = {

    generateToken: (id, role) => {
        const token = jwt.sign({ id, role }, process.env.JWT_SECRET)
        return token;
    },
    verifyTokenAdmin: async (req, res, next) => {
        try {
            let token = req.headers['authorization'];
            if (!token) return res.status(403).json({ errMsg: "Access Denied" });

            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length).trimLeft();
            }
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.payload = verified;

            if (req.payload.role === 'admin') {
                next();
            } else {
                return res.status(403).json({ errMsg: "Access Denied" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ errMsg: "Server down" });
        }
    },
    verifyTokenUser: async (req, res, next) => {
        try {
            // var token = req.headers.authorization.split(' ')[1];
            let token = req.headers['authorization'];
            if (!token || !token.startsWith('Bearer ')) return res.status(403).json({ errMsg: "Access Denied" });

            if (token.startsWith('Bearer ')) token = token.slice(7, token.length).trimLeft();

            const verified = jwt.verify(token, process.env.JWT_SECRET);

            req.payload = { token, ...verified };

            const user = await userModel.findById(verified.id);

            if (!user) {
                return res.status(404).json({ errMsg: "User not found" });
            }

            if (req.payload.role === 'user' && user.isActive) {
                next();
            } else if (!user.isActive) {
                return res.status(401).json({ errMsg: "Your account has been blocked", isBlocked: true });
            } else {
                console.log('access denied')
                return res.status(403).json({ errMsg: "Access Denied" });
            }
        } catch (error) {
            console.error(error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ errMsg: "Unauthorized" });
            } else {
                return res.status(500).json({ errMsg: "Server down" });
            }
        }
    },
    verifyTokenCompany: async (req, res, next) => {
        try {
            // var token = req.headers.authorization.split(' ')[1];
            let token = req.headers['authorization'];
            const companyId = req.headers['company-id'];

            if (!token || !token.startsWith('Bearer ')) return res.status(403).json({ errMsg: "Access Denied" });

            if (token.startsWith('Bearer ')) token = token.slice(7, token.length).trimLeft();

            const verified = jwt.verify(token, process.env.JWT_SECRET);
            // req.payload = verified;
            req.payload = { token, companyId, ...verified };

            if (req.payload.role === 'company') {
                next();
            } else {
                return res.status(403).json({ errMsg: "Access Denied" });
            }
        } catch (error) {
            console.error(error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ errMsg: "Unauthorized" });
            } else {
                return res.status(500).json({ errMsg: "Server down" });
            }
        }
    }

}