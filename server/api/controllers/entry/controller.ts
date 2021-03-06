import EntryService from '../../services/entry.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { IEntryModel, ResponseModel, CreateOrUpdateModel } from '../../models/entry';
import { PagingResult } from '../../../common/paging.result';
import {format as csvFormat, writeToString} from 'fast-csv';
import { UploadedFile } from 'express-fileupload';
import csvtojson from 'csvtojson';

export class Controller {

  private static toResponseBody(doc: IEntryModel): ResponseModel {
    return {
      _id: String(doc._id),
      date: doc.date?.toISOString().substring(0, 10),
      deleted: doc.deleted,
      value: doc.value,
      remunerator: doc.remunerator,
      category: doc.category,
      info: doc.info,
    };
  }

  private static extractWriteableFieldsFromRequestBody(req: Request ) {
    const body = (req.body || {});
    return {
      date: body.date,
      deleted: body.deleted ?? false,
      value: body.value,
      remunerator: body.remunerator,
      category: body.category,
      info: body.info,
      changed: new Date(), //TODO Needs to be removed
    } as IEntryModel;
  }


  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const perPage = Math.max(0, Math.min(5000, parseInt(req.query.perPage as string)));
      const page = Math.max(1, parseInt(req.query.page as string));

      const result = await EntryService.all((req.user as UserProfile).groupId, perPage, page);
      const response: PagingResult<ResponseModel> = {
        data: result.data.map(Controller.toResponseBody),
        total: result.total,
        page: result.page
      }
      return res.status(HttpStatus.OK).json(response);
    }
    catch (err) {
      return next(err);
    }
  }
  
  async byId(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await EntryService.byId(req.params.id, (req.user as UserProfile).groupId);
      return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
    }
    catch (err) {
      return next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = Controller.extractWriteableFieldsFromRequestBody(req);
      fields.fromUser = (req.user as UserProfile).groupId

      const doc = await EntryService.create(fields);

      return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
    }
    catch (err) {
      return next(err);
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = Controller.extractWriteableFieldsFromRequestBody(req);
      const doc = await EntryService.patch(req.params.id, (req.user as UserProfile).groupId, fields);
      return res.status(HttpStatus.OK).location(`/api/v1/examples/${doc._id}`).json(Controller.toResponseBody(doc));
    }
    catch (err) {
      return next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await EntryService.remove(req.params.id, (req.user as UserProfile).groupId);
      return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc as any));
    }
    catch (err) {
      return next(err);
    }
  }
  async export(req: Request, res: Response, next: NextFunction) {
    try {

      const filename = "export.csv";
      const docs = await EntryService.export((req.user as UserProfile).groupId);

      const transformer = (doc: IEntryModel)=> {
        return {
            date: doc.date.toISOString(),
            deleted: doc.deleted,
            value: doc.value,
            category: doc.category,
            remunerator: doc.remunerator,
            info: doc.info
        };
      }
      res.attachment(filename);
      res.type('text/csv');
      
      const csv = await writeToString(docs,{headers: true, transform:transformer});
      
      res.send(csv);

    }catch(err)  {
      return next(err);
    }
  }

  async import(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.files['csv'] as UploadedFile;
      const contents = file.data.toString('utf8');
      let createdCount = 0;
      const result = await csvtojson().fromString(contents) as CreateOrUpdateModel[];
      const newIds = new Array<string>();
      for (const i in result) {
        if (result[i] !== undefined) {
          const element = result[i];
          const fields = Controller.extractWriteableFieldsFromRequestBody({body: element} as Request);
          fields.fromUser = (req.user as UserProfile).groupId;
          const newEntry = await EntryService.create(fields);
          newIds.push(newEntry.id);
          createdCount++;
        }
      }
      if(req.body.clear)
      {
        await EntryService.clearExcept(newIds, (req.user as UserProfile).groupId);
      }
      return res.status(HttpStatus.OK).json({count:createdCount});
    }catch(err)  {
      return next(err);
    }
  }
}

export default new Controller();
