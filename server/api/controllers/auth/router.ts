import express from 'express';
import controller from './controller'
import passport from 'passport';

export const loginRouter = express.Router()
    .post('/', controller.login)
    .get('/', passport.authenticate('jwt', { session: false }), controller.userinfo)
    ;
export const logoutRouter = express.Router()
    .post('/', controller.logout)
    ;
export const oauthRouter = express.Router()
    .post('/google/tokensignin', controller.tokenSignInGoogle)
    .get('/auth/sso', passport.authenticate('oauth2'))
    .get('/auth/sso/callback', passport.authenticate('oauth2', { session: false }), controller.oauth2SignIn)
    ;
