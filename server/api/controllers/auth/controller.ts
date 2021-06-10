import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import UserService, { OAuthProvider } from '../../services/user.service';
import { hashPassword, toProfile, IUserModel } from '../../../api/models/user';
import { sign } from 'jsonwebtoken';
import { OAuth2Client as GoogleClient } from 'google-auth-library';

export class Controller {
    private static generateTokenResponseObject(user: IUserModel) {
        const userProfile = toProfile(user);
        const payload = { id: user._id };
        const token = sign(payload, process.env.JWT_KEY);
        return { message: "ok", token: token, userProfile: userProfile };
    }

    private static generateTokenResponse(res: Response, user: IUserModel) {
        res.json(Controller.generateTokenResponseObject(user));
    }

    async tokenSignInGoogle(req: Request, res: Response, next: NextFunction) {
        const client = new GoogleClient(process.env.GOOGLE_CLIENT_ID);
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: req.body.idtoken,
                audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            const user = await UserService.findOrCreate(OAuthProvider.Google, payload);
            user.avatarUrl = req.body.avatarUrl;
            await user.save();

            console.log(user.avatarUrl);
            Controller.generateTokenResponse(res, user);
        }
        verify().catch(error => res.status(HttpStatus.BAD_REQUEST).send(error))
    }

    async tokenSignInGoogleOnIOS(req: Request, res: Response, next: NextFunction) {
        const client = new GoogleClient(process.env.GOOGLE_CLIENT_ID_IOS);
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: req.body.idtoken,
                audience: process.env.GOOGLE_CLIENT_ID_IOS,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            const user = await UserService.findOrCreate(OAuthProvider.Google, payload);
            user.avatarUrl = req.body.avatarUrl;
            await user.save();

            console.log(user.avatarUrl);
            Controller.generateTokenResponse(res, user);
        }
        verify().catch(error => res.status(HttpStatus.BAD_REQUEST).send(error))
    }

    async oauth2SignIn(req: Request, res: Response) {
        const data =
            "<script>\nwindow.opener.postMessage(" +
            JSON.stringify(Controller.generateTokenResponseObject(req.user as IUserModel)) +
            ", \"" + process.env.OAUTH_MESSAGE_ORIGIN + "\");\n</script>";
        res.send(data);
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
            groupId: user.groupId, //TODO add to swagger and write test
            groupName: user.groupName, //TODO add to swagger and write test
            avatarUrl: user.avatarUrl, //TODO add to swagger and write test
        });
    }

    async logout(request: Request, response: Response) {
        await request.logout();
        response.send({ "message": "ok" });
    }
}

export default new Controller();