import passport from 'passport';
import express from 'express';
import imagecontroller from './controller';

export default express.Router()
    .post('/remunerator', passport.authenticate('jwt', { session: false }), imagecontroller.createRemunerator)
    .delete('/remunerator/:remunerator', passport.authenticate('jwt', { session: false }), imagecontroller.removeRemunerator)

    .post('/category', passport.authenticate('jwt', { session: false }), imagecontroller.createCategory)
    .delete('/category/:category', passport.authenticate('jwt', { session: false }), imagecontroller.removeCategory);

    