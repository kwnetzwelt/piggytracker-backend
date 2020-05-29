import passport from 'passport';
import express from 'express';
import remuneratorcontroller from './controller';

export default express.Router()
    .post('/', passport.authenticate('jwt', { session: false }), remuneratorcontroller.create)
    .get('/', passport.authenticate('jwt', { session: false }), remuneratorcontroller.all)
    

