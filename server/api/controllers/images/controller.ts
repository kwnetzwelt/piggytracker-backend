import ImagesService from '../../services/images.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import {IImageData} from '../../models/image';
import { UserProfile } from '../../models/user';

export class Controller {

    private static extractWriteableFieldsFromRequest(req: Request) {
        const body = (req.body || {});
        const r = {};
        if (body.category) {
            r['category'] = String(body.category);
        }
        if (body.remunerator) {
            r['remunerator'] = String(body.remunerator);
        }
        if(req.files.image)
        {
            r['image'] = req.files.image;
        }
        return r as IImageData;
    }


    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const fields = Controller.extractWriteableFieldsFromRequest(req);
            
            if(fields.category)
            {
                if(fields.category.match(/[^a-z0-9-]/))
                {
                    res.status(HttpStatus.BAD_REQUEST).send({});
                }
                
                await ImagesService.createCategoryImage(fields, (req.user as UserProfile).groupId);
            }
            else
            {
                if(fields.remunerator.match(/[^a-z0-9-]/))
                {
                    res.status(HttpStatus.BAD_REQUEST).send({});
                }
                await ImagesService.createRemuneratorImage(fields, (req.user as UserProfile).groupId);
            }
            return res.status(HttpStatus.OK).json({message: "ok"});
        }
        catch (err) {
            return next(err);
        }
    }

  /*async byId(req: Request, res: Response, next: NextFunction) {
    try {

      const doc = await EntryService.byId(req.params.id, (req.user as UserProfile).groupId);
      return res.status(HttpStatus.OK).json(Controller.toResponseBody(doc));
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
  }*/

}

export default new Controller();
