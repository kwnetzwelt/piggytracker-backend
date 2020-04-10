const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

const passport = require("passport");

var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

const Config = require("./config");
const Model = require("./model");


Model.connect(Config.dbUrl);

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = Config.pwd_salt;

var strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  await Model.UserModel.findById(jwt_payload.id, function(err, user){
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    });
});

passport.use(strategy);
  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
//   passport.serializeUser(function(user, done) {
//     done(null, user._id);
//   });
  
//   passport.deserializeUser(function(id, done) {
//     //If using Mongoose with MongoDB; if other you will need JS specific to that schema.
//     Model.UserModel.findById(id, (err, user) => {
//         done(err, user);
//     });
//   });


function validPassword(user, password)
{
    return user.password == Model.hashPassword(password);
}

var corsOptions = {
    origin: Config.hostUrl,
    //credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
var app = Express();

app.use(Cors(corsOptions));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());


app.get("/secretDebug",
  function(req, res, next){
    console.log(req.get('Authorization'));
    next();
  }, function(req, res){
    res.json("debugging");
});
app.options("/", Cors());
//https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/
//passport.authenticate('JWT', { session: false })
app.post("/login", async (request, response) => {
    try{
        var user = await Model.UserModel.findOne({"username" : request.body.username}).exec();
        var hash = Model.hashPassword(request.body.password);
        if(!user){
            response.status(401).json({"message":"user not found"});
        }
        if(hash === user.password)
        {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var userProfile = Model.convertToProfile(user);
            var payload = {id: user.id};
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            response.json({message: "ok", token: token, userProfile: userProfile});
        }else{
            response.status(401).json({"message":"invalid password"});
        }
    }catch(error){
        if(!response.headersSent)
            response.status(500).send(error);
    }
});

app.get("/login",passport.authenticate('jwt', { session: false }), async (request, response) => {
    try{
        if(request.isAuthenticated)
            var user = request.user;
            user.password = "";
            response.send(user);
        
    }finally{
        response.status(500).send();
    }
});

app.post("/logout", async (req, res) => {
    await req.logout();
    res.send({"message":"ok"});
});

app.post("/bill",passport.authenticate('jwt', { session: false }), async (request, response) => {
    try {
        var bill = new Model.BillModel(request.body);
        bill.changed = new Date();
        var result = await bill.save();
        response.send(result);
    }catch(error) {
        response.status(500).send(error);
    }
});

app.get("/bill/:id",passport.authenticate('jwt', { session: false }), async (request, response) => {
    try {
        var bill = await Model.BillModel.findById(request.params.id).exec();
        response.send(bill);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.put("/bill/:id",passport.authenticate('jwt', { session: false }), async (request, response) => {
    try {
        var bill = await Model.BillModel.findById(request.params.id).exec();
        bill.set(request.body);
        bill.changed = new Date();
        var result = await bill.save();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.delete("/bill/:id",passport.authenticate('jwt', { session: false }), async (request, response) => {
    try {
        var result = await Model.BillModel.deleteOne({ _id: request.params.id }).exec();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});


app.get("/bills",passport.authenticate('jwt', { session: false }), async (request, response) => {
    try {
        var perPage = Math.max(0,Math.min(5000,parseInt( request.query.perPage)));
        var page = Math.max(0,parseInt(request.query.page));
        console.log(perPage + " " + page)
        var result = await Model.BillModel.find().sort([["date",-1]]).skip((page-1) * perPage).limit(perPage).lean().exec();
        var countResult = await Model.BillModel.count();
        response.send({data:result,page:page,total:countResult});
    }catch(error) {
        response.status(500).send(error);
    }
});

/*
app.post("/person", async (request, response) => {

});
app.get("/person/:id", async (request, response) => {

});
app.put("/person/:id", async (request, response) => {

});
app.delete("/person/:id", async (request, response) => {

});


app.post("/category", async (request, response) => {

});
app.get("/category/:id", async (request, response) => {

});
app.put("/category/:id", async (request, response) => {

});
app.delete("/category/:id", async (request, response) => {

});

*/


app.listen(3030, () => {
    console.log("Listening at :3030...");
});