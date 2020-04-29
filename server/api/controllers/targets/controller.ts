import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { PagingResult } from '../../../common/paging.result';
import TargetsService from '../../services/targets.service';
import { ITargetModel, ResponseModel, CreateOrUpdateModel } from '../../models/target';
import targetsService from '../../services/targets.service';
import { ICategoryAcount } from '../../models/categoryaccount';

export class Controller {
    private static toResponseBody(doc: ITargetModel): ResponseModel {
        return {
            _id: String(doc._id),
            totals: doc.totals.map(t => ({ category: t.category, value: t.value })),
            tid: doc.tid,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    private static extractWriteableFieldsFromRequestBody(req: Request) {
        const body = (req.body || {});
        const r = {};
        if (body.tid) {
            r['tid'] = body.tid;
        }
        if (Array.isArray(body.totals)) {
            r['totals'] = body.totals.map((t: ICategoryAcount) => ({category: t.category, value: t.value}));
        }
        return r as ITargetModel;
      }

      async create(req: Request, res: Response, next: NextFunction) {
        try {
            const fields = req.body;
            fields.fromUser = (req.user as UserProfile).group

            const doc = await TargetsService.create(req.body);

            return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
        }
        catch (err) {
            return next(err);
        }
    }

    async byId(req: Request, res: Response, next: NextFunction) {
        try {
            const doc = await targetsService.byId(req.params.id, (req.user as UserProfile).group);
            return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
        }
        catch (err) {
            return next(err);
        }
    }

    async patch(req: Request, res: Response, next: NextFunction) {
        try {
          const fields = Controller.extractWriteableFieldsFromRequestBody(req);
          const doc = await targetsService.patch(req.params.id, (req.user as UserProfile).group, fields);
          return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
        }
        catch (err) {
          return next(err);
        }
      }
}

export default new Controller();
