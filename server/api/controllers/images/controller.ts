import ImagesService from '../../services/images.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import {IImageData} from '../../models/image';
import { UserProfile } from '../../models/user';

export class Controller {

    private static extractWriteableFieldsFromRequest(req: Request) {
        const body = (req.body || {});
        const r = {};
        if (req.params.category) {
            r['category'] = String(req.params.category);
        }else if(body.category) {
          r['category'] = String(body.category);
        }
        if (req.params.remunerator) {
            r['remunerator'] = String(req.params.remunerator);
        }else if(body.remunerator) {
          r['remunerator'] = String(body.remunerator);
        }
        if(req.files.image)
        {
            r['image'] = req.files.image;
        }
        return r as IImageData;
    }

    private static checkCategoryValid(fields: IImageData) {
      const m = fields.category.match(/[^a-z0-9-]/);
      return m === null;
    }

    private static checkRemuneratorValid(fields: IImageData) {
      const m = fields.remunerator.match(/[^a-z0-9-]/);
      return m === null;
    }

    async createCategory(req: Request, res: Response, next: NextFunction) {
      try {
        const fields = Controller.extractWriteableFieldsFromRequest(req);
        
        if(fields.category && Controller.checkCategoryValid(fields))
        {
          await ImagesService.createCategoryImage(fields, (req.user as UserProfile).groupId);
          return res.status(HttpStatus.OK).json({message: "ok"});
        }
        else
        {
          return res.status(HttpStatus.BAD_REQUEST).json({message: "missing or malformated parameter"});
        }
      }
      catch (err) {
          return next(err);
      }
  }
  async createRemunerator(req: Request, res: Response, next: NextFunction) {
    try {
        const fields = Controller.extractWriteableFieldsFromRequest(req);
        
        if(fields.remunerator && Controller.checkRemuneratorValid(fields))
        {
          await ImagesService.createRemuneratorImage(fields, (req.user as UserProfile).groupId);
          return res.status(HttpStatus.OK).json({message: "ok"});
        
        }
        else
        {
          return res.status(HttpStatus.BAD_REQUEST).json({message: "missing or malformated parameter"});
        }
    }
    catch (err) {
        return next(err);
    }
}

  async removeCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = Controller.extractWriteableFieldsFromRequest(req);
      if(fields.category && Controller.checkCategoryValid(fields))
      {
        await ImagesService.removeCategoryImage(fields, (req.user as UserProfile).groupId);
        return res.status(HttpStatus.OK).json({message: "ok"});
      }
      else
      {
        return res.status(HttpStatus.BAD_REQUEST).json({message: "missing or malformated parameter"});
      }
    }
    catch (err) {
      return next(err);
    }
  }

  async removeRemunerator(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = Controller.extractWriteableFieldsFromRequest(req);
      if(fields.remunerator && Controller.checkRemuneratorValid(fields))
      {
        await ImagesService.removeRemuneratorImage(fields, (req.user as UserProfile).groupId);
        return res.status(HttpStatus.OK).json({message: "ok"});
      }else
      {
        return res.status(HttpStatus.BAD_REQUEST).json({message: "missing or malformated parameter"});
      }
    }
    catch (err) {
      return next(err);
    }
  }
}

export default new Controller();
