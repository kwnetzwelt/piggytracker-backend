import '../server/common/env';
import { program } from 'commander';
import L from '../server/common/logger'
import { question } from 'readline-sync';
import Mongoose from '../server/common/mongoose';
import UserService from '../server/api/services/user.service';
import { hashPassword, User } from '../server/api/models/user';

const mongoose = new Mongoose;
mongoose.init();

program
    .command('setpassword <username>')
    .description("set the password for the given user. ")
    .action(async (username) => {
        const user = await UserService.findByName(username);
        if (!user) {
            L.error("User not found");
        } else {
            const newpassword = getConsoleInput('Enter new password: ');
            user.password = hashPassword(newpassword);
            user.save();
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

program.parse(process.argv);

function getConsoleInput(questiontext) {
    return question(questiontext);
}
