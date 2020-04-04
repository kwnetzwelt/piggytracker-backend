

const Config = require("./config");
const Model = require("./model");
const { program } = require('commander');


program
.command('setpassword <username>')
.description("set the password for the given user. ")
.action((username) =>{
    var newpassword = getConsoleInput('Enter new password: ');
    Model.connect(Config.dbUrl);
    Model.UserModel.findOne({"username" : username},(err, user) =>{
        if(!user){
            console.log("user not found. ");
        }
        if(err){
            console.log(err);
            process.exit(1);
        }
        try{
            user.password = Model.hashPassword(newpassword);
            var result = user.save();
        }catch(error)
        {
            console.log(error);
            process.exit(1);
        }
        process.exit(0);
    });
});


program
.command('createuser <username>')
.description("create user ")
.action(async(username) =>{
    var fullname = getConsoleInput("Enter Full Name: ");
    var newpassword = getConsoleInput('Enter new password: ');
    newpassword = Model.hashPassword(newpassword);

    Model.connect(Config.dbUrl);
    try{
        var newuser = new Model.UserModel({"username":username,"fullname":fullname,"password":newpassword});
        await newuser.save();
    }catch(error)
    {
        console.log(error);
        process.exit(1);
    }
    process.exit(0);
    
});

program
.command('deleteuser <username>')
.description("delete user ")
.action(async (username) =>{
    
    Model.connect(Config.dbUrl);
    try{
         await Model.UserModel.deleteOne({"username":username}, (error) => {
            if(error) {
                console.log(error);
                process.exit(1);
            }
            console.log("done");
            process.exit(0);
        });
    }catch(error)
    {
        console.log(error);
        process.exit(1);
    }
    process.exit(0);
    
});

  //.option('h, --hash', 'generate a new password hash')
  //.option('-u, --user <name>', 'user to generate the password hash for')
  //.option('-p, --pizza-type <type>', 'flavour of pizza');

program.parse(process.argv);

//if (program.debug) console.log(program.opts());
//console.log('pizza details:');
//if (program.small) console.log('- small pizza size');
//if (program.pizzaType) console.log(`- ${program.pizzaType}`);

function getConsoleInput(questiontext)
{
    const readlineSync = require('readline-sync');
    return readlineSync.question(questiontext);
    
}
