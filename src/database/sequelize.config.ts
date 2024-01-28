import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Dialect } from 'sequelize/types';
import { User } from './schemas/user.model';
import { Post } from './schemas/post.model';
import { Image } from './schemas/image.model';
import { Message } from './schemas/message.model';

export const sequelizeOptions: SequelizeModuleOptions = {
  dialect: 'postgres' as Dialect,
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  models: [User, Post, Image, Message],
  autoLoadModels: true,
  synchronize: true,
};

// __dirname + '/schemas/*.model.ts'
