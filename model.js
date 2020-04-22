
const Mongoose = require("mongoose");
const Crypto = require("crypto");
const Config = require("./config");

module.exports = {
    connect : (dbUrl) => {
        Mongoose.connect(dbUrl,{ useNewUrlParser: true });
    },
    /**
     * @param {UserModel} user
     */
    getUserGroup:(user) => {
        if(user.groupId && user.groupId.length > 0)
        {
            return user.groupId;
        }
        return user._id.toString();
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
        avatarUrl:String,
        groupId:String,
        groupName:String
    }), 

    BillModel : Mongoose.model("bill",{
        date:Date,
        value:Number,
        remunerator:String,
        category:String,
        info:String,
        changed:Date,
        dummy:Boolean,
        fromUser:String
    }),

    TargetModel : Mongoose.model("target",{
        totals:Array, // objects: {category:CATEGORYNAME,value:VALUE}
        tid:{type:Number, unique:true},
        fromUser:String
    }),
    InviteMode: Mongoose.model("invite", {
        expires: Date,
        fromUser:{type:Mongoose.SchemaTypes.ObjectId, ref:"UserModel"},
        code:String
    })
}