import { Application } from 'express';
import examplesRouter from './api/controllers/examples/router'
import entryrouter from './api/controllers/examples/entryrouter';
import authrouter from './api/controllers/auth/router';

export default function routes(app: Application): void {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/bill', entryrouter);
  app.use('/api/v1/login', authrouter)
};
