import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { logger } from './utilities/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
    }),
  );

  app.use(compression());
  app.use(helmet());
  app.use(
    morgan('common', {
      stream: {
        write: (message) => {
          logger.http(message.trim());
        },
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
