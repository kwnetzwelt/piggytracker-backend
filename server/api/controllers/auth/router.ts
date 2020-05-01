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
    .get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
    .get('/auth/google/callback', controller.oauthCallbackGoogle)
    ;
