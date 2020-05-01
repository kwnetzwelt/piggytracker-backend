import passport from 'passport';
import express from 'express';
import inviteController from './controller';

export default express.Router()
    .post('/', passport.authenticate('jwt', { session: false }), inviteController.consume)
    .get('/', passport.authenticate('jwt', { session: false }), inviteController.create)
    .delete('/', passport.authenticate('jwt', { session: false }), inviteController.remove);
