import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { rateLimit } from 'express-rate-limit';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const storageDir = './storage/images';
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }

  app.enableCors();
  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true, // Kích hoạt chuyển đổi tự động
  //   transformOptions: {
  //     enableImplicitConversion: true, // Cho phép chuyển đổi ngầm định
  //   }
  // }));

  // *** Global exception & pipe
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // app.useGlobalFilters();

  //Serve static
  app.useStaticAssets(join(__dirname, '..', 'storage/images'), {
    prefix: '/storage/images',
  });

  // rating limit request client
  // tránh DDos
  // const limmiter = rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 phút
  //   max: 100, //giới hạn 100 req mỗi IP máy tính
  //   standardHeaders: true, //trả về thông tin rating limit
  //   legacyHeaders: false, //vô hiệu hóa này đọc tài liệu chưa tới
  // })
  // app.use(limmiter)
  // app.set('trust proxy', 1);

  const config = new DocumentBuilder()
    .setTitle('METADATA')
    .setDescription('List API tesing for Sgarden foods by Levi')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearerAuth',
    )
    .addTag('Auth')
    .addTag('Product')
    .addTag('Favorite')
    .addTag('Category')
    .addTag('Upload')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use('/images', express.static('storage'));
  await app.listen(3002).then(() => {
    console.log('successfully deploy server');
  });
}
bootstrap();
