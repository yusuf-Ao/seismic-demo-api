import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'https://seismic-demo.aycodes.live',
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true, // Keep this only if your front end needs to send credentials with the request
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
