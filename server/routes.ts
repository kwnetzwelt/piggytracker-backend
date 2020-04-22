import { Application } from 'express';
import examplesRouter from './api/controllers/examples/router'
import entryRouter from './api/controllers/entry/router';
import {loginRouter, logoutRouter} from './api/controllers/auth/router';

export default function routes(app: Application): void {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/bill', entryRouter);
  app.use('/api/v1/login', loginRouter);
  app.use('/api/v1/logout', logoutRouter);
};
