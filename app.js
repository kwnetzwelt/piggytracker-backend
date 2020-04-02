const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const Config = require("./config");
const Model = require("./model");

Model.connect(Config.dbUrl);

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function(username, password, done) {
      Model.UserModel.findOne({"username" : username}, function(err, user){
        if(err) {return done(err);}
        if(!user) {return done(null, false,     {message:"incorrect username. "})}
        if(!validPassword(user,password)) {
            return done(null, false, {message:"incorrect password. "});
        }
        return done(null, user);
      });
    }));
  
  
  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  passport.deserializeUser(function(id, done) {
    //If using Mongoose with MongoDB; if other you will need JS specific to that schema.
    Model.UserModel.findById(id, (err, user) => {
        done(err, user);
    });
  });


function validPassword(user, password)
{
    return user.password == Model.hashPassword(password);
}


var app = Express();

app.use(Cors());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'haushaltssperre', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


  
app.post("/login", passport.authenticate('local', { failureRedirect: '/login' }), (request, response) => {
    try{
        response.send({"message":"ok"});
    }catch(error){
        response. status(500).send(error);
    }
});

app.post("/logout", async (req, res) => {
    req.logout();
    res.send({"message":"ok"});
});

app.post("/bill",require('connect-ensure-login').ensureLoggedIn(), async (request, response) => {
    try {
        var bill = new Model.BillModel(request.body);
        var result = await bill.save();
        response.send(result);
    }catch(error) {
        response.status(500).send(error);
    }
});

app.get("/bill/:id",require('connect-ensure-login').ensureLoggedIn(), async (request, response) => {
    try {
        var bill = await Model.BillModel.findById(request.params.id).exec();
        response.send(bill);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.put("/bill/:id",require('connect-ensure-login').ensureLoggedIn(), async (request, response) => {
    try {
        var bill = await Model.BillModel.findById(request.params.id).exec();
        bill.set(request.body);
        var result = await bill.save();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.delete("/bill/:id",require('connect-ensure-login').ensureLoggedIn(), async (request, response) => {
    try {
        var result = await Model.BillModel.deleteOne({ _id: request.params.id }).exec();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});


app.get("/bills",require('connect-ensure-login').ensureLoggedIn(), async (request, response) => {
    try {
        var result = await Model.BillModel.find().lean().exec();
        response.send(result);
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


app.listen(3000, () => {
    console.log("Listening at :3000...");
});