import { Application } from 'express';
import entryRouter from './api/controllers/entry/router';
import targetRouter from './api/controllers/targets/router';
import invitesRouter from './api/controllers/invites/router';
import updatesRouter from './api/controllers/updates/router';
import {loginRouter, logoutRouter} from './api/controllers/auth/router';

export default function routes(app: Application): void {
  app.use('/api/v1/bills', entryRouter);
  app.use('/api/v1/updates', updatesRouter);
  app.use('/api/v1/targets', targetRouter);
  app.use('/api/v1/invites', invitesRouter);
  app.use('/api/v1/login', loginRouter);
  app.use('/api/v1/logout', logoutRouter);
}
