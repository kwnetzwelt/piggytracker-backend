import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import { IImageData } from '../models/image';
import fsExtra from 'fs-extra';
export class ImagesService {
  
  static uploadPath = "public/uploads";

  async createCategoryImage(sentData:IImageData, fromUser: string): Promise<void> {
    const uri = "/" + fromUser + "-c-" + sentData.category;
    await sentData.image.mv(ImagesService.uploadPath + uri );
  }
  async createRemuneratorImage(sentData:IImageData, fromUser: string): Promise<void> {
    const uri = "/" + fromUser + "-r-" + sentData.remunerator;
    await sentData.image.mv(ImagesService.uploadPath + uri );
  }
  async removeCategoryImage(sentData:IImageData, fromUser: string): Promise<void> {
    const uri = "/" + fromUser + "-c-" + sentData.category;
    await fsExtra.remove(ImagesService.uploadPath + uri);
  }
  async removeRemuneratorImage(sentData:IImageData, fromUser: string): Promise<void> {
    const uri = "/" + fromUser + "-r-" + sentData.remunerator;
    await fsExtra.remove(ImagesService.uploadPath + uri);
  }
}

export default new ImagesService();