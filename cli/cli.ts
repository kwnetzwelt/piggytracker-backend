import '../server/common/env';
import { program } from 'commander';
import L from '../server/common/logger'
import { question } from 'readline-sync';
import Mongoose from '../server/common/mongoose';
import UserService from '../server/api/services/user.service';
import EntryService from '../server/api/services/entry.service';
import { hashPassword, User } from '../server/api/models/user';
import { Entry } from '../server/api/models/entry';

const mongoose = new Mongoose;
mongoose.init();

program
    .command('setpassword <username>')
    .description("set the password for the given user. ")
    .action(async (username) => {
        const user = await User.findOne({"username":username});
        if (!user) {
            L.error("User not found");
        } else {
            const newpassword = getConsoleInput('Enter new password: ');
            user.password = hashPassword(newpassword);
            await user.save();
        }
        await mongoose.done();
    });

program
    .command('createuser <username>')
    .description("create user")
    .action(async (username) => {
        const existing_user = await UserService.findByName(username);
        if (existing_user) {
            L.error("User already exists. To change password, use setpassword command");
        } else {
            var fullname = getConsoleInput("Enter Full Name: ");
            var newpassword = getConsoleInput('Enter new password: ');
            newpassword = hashPassword(newpassword);

            const user = new User({ "username": username, "fullname": fullname, "password": newpassword });
            await user.save();
        }
        await mongoose.done();
    });

program
    .command('deleteuser <username>')
    .description("delete user")
    .action(async (username) => {
        await UserService.deleteByName(username);
        L.info(`User ${username} deleted.`);
        await mongoose.done();
    });


    program
    .command('createdata <username> <amount>')
    .description("create dummy data. ")
    .action(async (username, amount) => {
        const user = await UserService.findByName(username);
        const remunerators =  ['user a', 'user b', 'user c'];
        const categories = ['cat a', 'cat b', 'cat c'];
        const inf = ['info a', 'info b', 'info c'];

        for (let index = 0; index < amount; index++) {
            
            
            const d = new Entry({
                remunerator : rnd(remunerators),
                category : rnd(categories),
                info : rnd(inf),
                value: Math.floor(Math.random() * 10000) / 100,
                dummy : true,
                fromUser: user._id
            });
            await EntryService.create(d);
        }
        L.info(`User ${amount} created.`);
        await mongoose.done();
    });

    program
    .command('deletedata <username>')
    .description("delete dummy data for user. ")
    .action(async (username) => {

        const user = await UserService.findByName(username);
        const result = await Entry.remove({dummy: true, fromUser: user._id});
        L.info(`User ${result.deletedCount} deleted.`);
        await mongoose.done();
    });

program.parse(process.argv);

function rnd(array: Array<String>) {
    return array[Math.floor(Math.random() * array.length)];
}

function getConsoleInput(questiontext) {
    return question(questiontext);
}
