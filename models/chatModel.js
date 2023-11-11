const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    },
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'messages'
    }
},
    {
        timestamps: true
    }
)

const chatModel = mongoose.model('chats', chatSchema);
module.exports = chatModel;