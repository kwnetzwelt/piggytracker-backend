import '../server/common/env';
import { program } from 'commander';
import { question } from 'readline-sync';
import Mongoose from '../server/common/mongoose';

const mongoose = new Mongoose;
mongoose.init();      

program
    .command('setpassword <username>')
    .description("set the password for the given user. ")
    .action(async (username) => {
        const newpassword = getConsoleInput('Enter new password: ');
        await mongoose.done();
    });

program.parse(process.argv);

function getConsoleInput(questiontext) {
    return question(questiontext);
}
