import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from '../database/schemas/post.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostsController } from './posts.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Image } from '../database/schemas/image.model';

@Module({
  imports: [SequelizeModule.forFeature([Post, Image]), CloudinaryModule],
  providers: [PostsService, CloudinaryService],
  controllers: [PostsController],
})
export class PostsModule {}
