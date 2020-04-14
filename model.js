
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
    convertToProfile : (user) => {
        return {
            username : user.username,
            fullname : user.fullname
        };
    },
    UserModel : Mongoose.model("user",{
        username:String,
        fullname:String,
        password:String,
        avatarUrl:String
    }), 

    BillModel : Mongoose.model("bill",{
        date:Date,
        value:Number,
        remunerator:String,
        category:String,
        info:String,
        changed:Date,
        dummy:Boolean
    }),

    TargetModel : Mongoose.model("target",{
        totals:Array, // objects: {category:CATEGORYNAME,value:VALUE}
        tid:{type:Number, unique:true}
    })
}