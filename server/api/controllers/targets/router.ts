import passport from 'passport';
import express from 'express';
import targetscontroller from './controller';

export default express.Router()
    .post('/', passport.authenticate('jwt', { session: false }), targetscontroller.create)
    .get('/', passport.authenticate('jwt', { session: false }), targetscontroller.all)
    .get('/:id', passport.authenticate('jwt', { session: false }), targetscontroller.byId)
    .put('/:id', passport.authenticate('jwt', { session: false }), targetscontroller.patch)
    .delete('/:id', passport.authenticate('jwt', { session: false }), targetscontroller.remove);
