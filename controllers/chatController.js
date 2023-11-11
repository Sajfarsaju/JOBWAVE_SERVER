const mongoose = require("mongoose");
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

module.exports = {

    createChat: async (req, res) => {

        try {
            
            const { compId, senderRole } = req.body

            if (senderRole === "users" && !compId) {
                return res.status(400).json({ errMsg: 'Bad Request' })
            }

            let companyId = compId;
            let userId;

            if (senderRole === 'users') {

                userId = req.payload.id;

                const selectedChat = await Chat.findOne({
                    companyId: companyId,
                    userId: userId
                })
                if (!selectedChat) {
                    const chatData = {
                        companyId: companyId,
                        userId: userId
                    };
                    const newChat = await Chat.create(chatData);

                    console.log('worked newchat', newChat);

                    return res.status(200)
                } else {
                    console.log('reached exists')
                    return res.status(200)
                }


            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ errMsg: 'Something went wrong at fetching initial chats' });
        }
    },
    fetchChats: async (req, res) => {
        try {
            const { compId, senderRole } = req.query

            if (senderRole === "users" && !compId) {
                return res.status(400).json({ errMsg: 'Bad Request' })
            }

            let companyId = compId;
            let selectedChat
            // ?
            let senderId;
            let senderIdField

            if (senderRole === 'users') {
                senderId = new mongoose.Types.ObjectId(req.payload.id);
                senderIdField = 'userId'
                
                selectedChat = await Chat.findOne({
                    companyId: companyId,
                    userId: req.payload.id
                }).populate({
                    path: 'companyId',
                    select: 'companyName profile'
                });

            }else{
                senderId = new mongoose.Types.ObjectId(req.payload.companyId);
                senderIdField = 'companyId'
            }
            const chats = await Chat
                .find({[senderIdField]: senderId })
                .populate({ path: 'userId', select: 'firstName lastName profile' })
                .populate({ path: 'companyId', select: 'companyName profile' })
                .populate({ path: 'latestMessage', populate: { path: 'senderId', select: 'firstName lastName profile companyName' } })
                .sort({ updatedAt: -1 });
                
            res.status(200).json({ chatList : chats , selectedChat})

        } catch (error) {
            console.log(error);
            return res.status(500).json({ errMsg: 'Internal Server Error' });
        }
    },
    saveChat: async (newMessageData) => {
        try {

            const { content, chatId, senderId, senderRole, createdAt } = newMessageData;

            const newMessages = {
                senderRole: senderRole,
                senderId: senderId,
                content: content,
                chat: chatId,
                createdAt: createdAt
            }

            const newMessage = await Message.create(newMessages);
            
            await Chat.findByIdAndUpdate(chatId, {
                latestMessage: newMessage
            })
            return true;
            
        } catch (error) {
            console.log(error);
        }
    },
    fetchAllMessages: async(req,res)=>{
        try {
          const messages = await Message.find({chat : req.query.chatId})
            .populate("senderId","firstName lastName profile companyName")
            .populate("chat")
             res.status(200).json({allMessages:messages})
            
        } catch (error) {
            console.log(error);
            return res.status(500)
        }
    },
    
}