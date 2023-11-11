const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    senderRole: {
        type: String,
        enum: ["users", "company"],
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "senderRole"
    },
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chats'
    },
    is_read: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)

const messageModel = mongoose.model('messages', messageSchema);
module.exports = messageModel;