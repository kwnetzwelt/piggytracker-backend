import passport from 'passport';
import express from 'express';
import entrycontroller from './entry';

export default express.Router()
    .post('/', passport.authenticate('jwt', { session: false }), entrycontroller.create)
    //.post('/', entrycontroller.create)
    .get('/', entrycontroller.all)
    .get('/:id', entrycontroller.byId)
    .put('/:id', entrycontroller.patch)
    .delete('/:id', entrycontroller.remove);
