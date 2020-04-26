import passport from 'passport';
import express from 'express';
import targetscontroller from './controller';

export default express.Router()
    .post('/', passport.authenticate('jwt', { session: false }), targetscontroller.create);
