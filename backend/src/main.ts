import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );

  app.use(helmet());
  app.use(cookieParser());
  const originList = config
    .get<string>('FRONTEND_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((item) => item.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || originList.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS origin denied'));
    },
    credentials: true
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Moda API')
    .setDescription('E-commerce + CMS + Builder API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.get<number>('PORT', 3000));
}

bootstrap();
