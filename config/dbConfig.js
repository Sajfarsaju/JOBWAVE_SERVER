const mongoose = require('mongoose');
require('dotenv').config();

module.exports = function mongooseConnectoin() {
    mongoose.set('strictQuery',true);
    mongoose.connect(process.env.MONGOOSE_CONNECTION , {
        useNewUrlParser : true,
        useUnifiedTopology : true,
    })
    .then(()=>{
        console.log("DB CONNECTED");
    })
    .catch((err)=>{
        console.log("Error connecting to DB",err);
    })
};