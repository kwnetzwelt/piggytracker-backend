import passport from 'passport';
import express from 'express';
import healthcontroller from './controller';

export default express.Router()
    .get('/', healthcontroller.get)
    

