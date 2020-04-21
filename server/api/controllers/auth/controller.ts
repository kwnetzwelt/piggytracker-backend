import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import UserService from '../../services/user.service';
import { hashPassword, User, toProfile } from '../../../api/models/user';
import { sign } from 'jsonwebtoken';

export class Controller {
    async login(request: Request, response: Response) {
        try {
            var user = await UserService.findByName(request.body.username);
            var hash = hashPassword(request.body.password);
            if (user?.password == hash) {
                // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
                var userProfile = toProfile(user);
                var payload = { id: user._id };
                var token = sign(payload, process.env.PWD_SALT);
                response.json({ message: "ok", token: token, userProfile: userProfile });
            } else {
                response.status(HttpStatus.UNAUTHORIZED).json({ "message": "invalid password" });
            }
        } catch (error) {
            if (!response.headersSent)
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }

}

export default new Controller();