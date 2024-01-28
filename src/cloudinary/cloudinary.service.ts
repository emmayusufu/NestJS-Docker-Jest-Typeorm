import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<any> {
    try {
      const base64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = 'data:' + file.mimetype + ';base64,' + base64;

      const result = await cloudinary.uploader.upload(dataURI);
      return result;
    } catch (error) {
      throw new Error(`Failed to upload image file: ${error.message}`);
    }
  }

  async uploadImages(files: Express.Multer.File[]): Promise<any[]> {
    return Promise.all(files.map((file) => this.uploadImage(file)));
  }
}
