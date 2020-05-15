import passport from 'passport';
import express from 'express';
import entrycontroller from './controller';

export default express.Router()
    .post('/', passport.authenticate('jwt', { session: false }), entrycontroller.create)
    .get('/', passport.authenticate('jwt', { session: false }), entrycontroller.all)
    .post('/import', passport.authenticate('jwt', {session:false}), entrycontroller.import)
    .get('/export', passport.authenticate('jwt', {session: false}), entrycontroller.export)
    .get('/:id', passport.authenticate('jwt', { session: false }), entrycontroller.byId)
    .put('/:id', passport.authenticate('jwt', { session: false }), entrycontroller.patch)
    .delete('/:id', passport.authenticate('jwt', { session: false }), entrycontroller.remove);

