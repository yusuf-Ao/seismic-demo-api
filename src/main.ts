import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Update this to restrict origins as needed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1');

  const config = app.get(ConfigService);
  await app.listen(3000);
}
bootstrap();
