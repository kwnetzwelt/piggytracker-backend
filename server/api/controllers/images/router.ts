import passport from 'passport';
import express from 'express';
import imagecontroller from './controller';

export default express.Router()
    .post('/', passport.authenticate('jwt', { session: false }), imagecontroller.create)
    //.get('/:id', passport.authenticate('jwt', { session: false }), imagecontroller.byId)
    //.delete('/:id', passport.authenticate('jwt', { session: false }), imagecontroller.remove);
