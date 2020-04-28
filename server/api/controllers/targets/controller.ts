import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { PagingResult } from '../../../common/paging.result';
import TargetsService from '../../services/targets.service';
import { ITargetModel, ResponseModel } from '../../models/target';
import targetsService from '../../services/targets.service';

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
}

export default new Controller();
