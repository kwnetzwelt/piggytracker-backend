import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import UserService from '../../services/user.service';
import { hashPassword, toProfile, IUserModel } from '../../../api/models/user';
import { sign } from 'jsonwebtoken';
import passport from 'passport';

export class Controller {
    private static generateTokenResponse(res: Response, user: IUserModel) {
        const userProfile = toProfile(user);
        const payload = { id: user._id };
        const token = sign(payload, process.env.JWT_KEY);
        res.json({ message: "ok", token: token, userProfile: userProfile });
    }

    async oauthCallbackGoogle(req: Request, res: Response, next: NextFunction) {
        passport.authenticate('google', function (err, user, info, status) {
            if (err) { return next(err) }
            if (!user) { return res.redirect('/signin') }
            Controller.generateTokenResponse(res, user);
        })(req, res, next);
    }

    async login(request: Request, response: Response) {
        try {
            const user = await UserService.findByName(request.body.username);
            const hash = hashPassword(request.body.password);
            if (user?.password == hash) {
                Controller.generateTokenResponse(response, user);
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