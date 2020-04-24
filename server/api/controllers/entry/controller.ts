import EntryService from '../../services/entry.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { IEntryModel } from '../../models/entry';

export class Controller {

  private static toResponseBody(doc: IEntryModel) {
    return {
      _id: String(doc._id),
      date: doc.date.toISOString().substring(0, 10),
      value: doc.value,
      remunerator: doc.remunerator,
      category: doc.category,
      info: doc.info,
      dummy: doc.dummy,
    };
  }

  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await EntryService.all();
      return res.status(HttpStatus.OK).json(docs);
    }
    catch (err) {
      return next(err);
    }
  }

  async byId(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await EntryService.byId(req.params.id);
      return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
    }
    catch (err) {
      return next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = (req.body || {}) as IEntryModel;
      fields.changed = new Date();
      fields.fromUser = (req.user as UserProfile).group

      const doc = await EntryService.create(fields);

      return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
    }
    catch (err) {
      return next(err);
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await EntryService.patch(req.params.id, req.body);
      return res.status(HttpStatus.OK).location(`/api/v1/examples/${doc._id}`).json(doc);
    }
    catch (err) {
      return next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await EntryService.remove(req.params.id);
      return res.status(HttpStatus.NO_CONTENT).send();
    }
    catch (err) {
      return next(err);
    }
  }

}

export default new Controller();
