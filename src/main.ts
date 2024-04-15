import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express'
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { ValidationPipe } from '@nestjs/common';
import { rateLimit } from 'express-rate-limit'


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true, // Kích hoạt chuyển đổi tự động
  //   transformOptions: {
  //     enableImplicitConversion: true, // Cho phép chuyển đổi ngầm định
  //   }
  // }));
  
  //Serve static 
  app.useStaticAssets(join(__dirname,'..','storage'),{
    prefix: 'images\introductions'
  })
  


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
        bearerFormat: 'JWT'
      },'bearerAuth'
    )
    .addTag('Auth')
    .addTag('Product')
    .addTag('Favourite')
    .addTag('Category')
    .addTag('Register')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  app.use('/images', express.static('storage'))
  await app.listen(3002).then(() => {
    console.log('successfully deploy server');
  });
}
bootstrap();
