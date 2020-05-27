import { Application } from 'express';
import entryRouter from './api/controllers/entry/router';
import targetRouter from './api/controllers/targets/router';
import {loginRouter, logoutRouter, oauthRouter} from './api/controllers/auth/router';
import invitesRouter from './api/controllers/invites/router';
import updatesRouter from './api/controllers/updates/router';
import imagesRouter from './api/controllers/images/router';
import healthRouter from './api/controllers/health/router';
import remuneratorRouter from './api/controllers/remunerator/router';

export default function routes(app: Application): void {
  app.use('/api/v1/bills', entryRouter);
  app.use('/api/v1/updates', updatesRouter);
  app.use('/api/v1/targets', targetRouter);
  app.use('/api/v1/invites', invitesRouter);
  app.use('/api/v1/login', loginRouter);
  app.use('/api/v1/logout', logoutRouter);
  app.use('/api/v1/images', imagesRouter);
  app.use('/api/v1/remunerator', remuneratorRouter);
  app.use('/health', healthRouter);
  app.use('/', oauthRouter)
  ;
}
