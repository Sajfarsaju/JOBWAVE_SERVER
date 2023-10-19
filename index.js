const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();

const userRoute = require('./routes/UserRoute');
const companyRouter = require('./routes/companyRouter');
const adminRouter = require('./routes/adminRoute');
const connectDB = require('./config/dbConfig');

app.use(express.json({limit:'100mb',extended:true}))
app.use(cors());
app.use(cookieParser());

app.use('/',userRoute)
app.use('/company',companyRouter)
app.use('/admin',adminRouter)

connectDB()
let port = process.env.PORT || 4005;
const server = app.listen( port , ()=> console.log(`Server Connected at ${port}`));