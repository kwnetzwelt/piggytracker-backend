
const Mongoose = require("mongoose");
const Crypto = require("crypto");
const Config = require("./Config");

module.exports = {
    connect : (dbUrl) => {
        Mongoose.connect(dbUrl,{ useNewUrlParser: true });
    },
    hashPassword : (password) => {
        const hash = Crypto.createHmac('sha256', Config.pwd_salt)
            .update(password)
            .digest('hex');
        return hash.trim();
    },
    UserModel : Mongoose.model("user",{
        username:String,
        fullname:String,
        password:String
    }),

    BillModel : Mongoose.model("bill",{
        date:Date,
        amount:Number,
        person:String,
        category:String,
        comment:String
    })
}