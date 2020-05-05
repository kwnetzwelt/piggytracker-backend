import {UploadedFile} from 'express-fileupload';

export interface IImageData
{
    category: string;
    remunerator: string;
    image: UploadedFile;
}

