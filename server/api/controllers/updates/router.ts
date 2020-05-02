import passport from 'passport';
import express from 'express';
import updatescontroller from './controller';

export default express.Router()
    .get('/', passport.authenticate('jwt', { session: false }), updatescontroller.all)