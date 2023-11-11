const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {Server} = require('socket.io')
require('dotenv').config();


const app = express();

const userRoute = require('./routes/UserRoute');
const companyRouter = require('./routes/companyRouter');
const adminRouter = require('./routes/adminRoute');
const { saveChat } = require('./controllers/chatController');
const connectDB = require('./config/dbConfig');

app.use(express.json({limit:'100mb',extended:true}))
app.use(cors());
app.use(cookieParser());

app.use('/',userRoute);
app.use('/company',companyRouter);
app.use('/admin',adminRouter);

connectDB()
let port = process.env.PORT || 4005;
const server = app.listen( port , ()=> console.log(`Server Connected at ${port}`))

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});
io.on("connection", (socket) => {
  console.log("Socket.io connected:",socket.id);

  socket.on("join_room",(chat_id)=>{
    socket.join(chat_id.room);
    console.log(chat_id,"connected room ");
  })

  socket.on(`send_message`,(newMessage)=>{
    const {content , createdAt} = newMessage
    console.log('message reached:',content);
    
    socket.to(newMessage.chatId).emit("message_response",newMessage);
    
    saveChat(newMessage)
  })
  
});