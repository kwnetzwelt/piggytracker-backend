import { Application } from 'express';
import entryRouter from './api/controllers/entry/router';
import targetRouter from './api/controllers/targets/router';
import {loginRouter, logoutRouter, oauthRouter} from './api/controllers/auth/router';
import passport from 'passport';

export default function routes(app: Application): void {
  app.use('/api/v1/bills', entryRouter);
  app.use('/api/v1/targets', targetRouter);
  app.use('/api/v1/login', loginRouter);
  app.use('/api/v1/logout', logoutRouter);
  app.use('/', oauthRouter)
  ;
}
