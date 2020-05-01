import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import UserService from '../../services/user.service';
import { hashPassword, User, toProfile, IUserModel } from '../../../api/models/user';
import { sign } from 'jsonwebtoken';
import passport from 'passport';

export class Controller {
    async oauthCallbackGoogle(req: Request, res: Response, next: (err: any) => void) {
        passport.authenticate('google', function (err, user, info, status) {
            if (err) { return next(err) }
            if (!user) { return res.redirect('/signin') }
            const userProfile = toProfile(user);
            const payload = { id: user._id };
            const token = sign(payload, process.env.JWT_KEY);
            res.json({ message: "ok", token: token, userProfile: userProfile });
        })(req, res, next);
    }

    async login(request: Request, response: Response) {
        try {
            const user = await UserService.findByName(request.body.username);
            const hash = hashPassword(request.body.password);
            if (user?.password == hash) {
                // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
                const userProfile = toProfile(user);
                const payload = { id: user._id };
                const token = sign(payload, process.env.JWT_KEY);
                response.json({ message: "ok", token: token, userProfile: userProfile });
            } else {
                response.status(HttpStatus.UNAUTHORIZED).json({ "message": "invalid password" });
            }
        } catch (error) {
            if (!response.headersSent)
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    async userinfo(request: Request, response: Response) {
        const user = request.user as IUserModel;
        user['password'] = "";
        response.send({
            username: user.username,
            fullname: user.fullname,
        });
    }

    async logout(request: Request, response: Response) {
        await request.logout();
        response.send({ "message": "ok" });
    }
}

export default new Controller();