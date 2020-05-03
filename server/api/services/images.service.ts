import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import { IImageData } from '../models/image';

export class ImagesService {
  
  async createCategoryImage(sentData:IImageData, fromUser: string): Promise<void> {
    const uri = fromUser + "-c-" + sentData.category;
    sentData.image.mv("public/uploads/" +uri );
  }
  async createRemuneratorImage(sentData:IImageData, fromUser: string): Promise<void> {
    const uri = fromUser + "-r-" + sentData.remunerator;
    
  }

}

export default new ImagesService();