import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

import { rateLimit } from 'express-rate-limit';
import { existsSync, mkdirSync } from 'fs';
import * as hbs from 'express-handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const basePath = path.join(__dirname, '..', 'storage');
  const imageStorageDir = path.join(__dirname, '..', 'storage', 'images');
  const pdfStorageDir = path.join(__dirname, '..', 'storage', 'pdf');

  console.log(`Base Path: ${basePath}`);
  console.log(`Image Path: ${imageStorageDir}`);
  console.log(`PDF Path: ${pdfStorageDir}`);

  if (!existsSync(imageStorageDir)) {
    console.log('Creating images directory...');
    mkdirSync(imageStorageDir, { recursive: true });
  }

  if (!existsSync(pdfStorageDir)) {
    console.log('Creating PDF directory...');
    mkdirSync(pdfStorageDir, { recursive: true });
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
  // app.useStaticAssets(path.join(__dirname, '..', 'storage/images'), {
  //   prefix: '/storage/images',
  // });

  // app.useStaticAssets(path.join(__dirname, '..', 'storage/pdf'), {
  //   prefix: '/storage/pdf',
  // });

  app.useStaticAssets(imageStorageDir, {
    prefix: '/storage/images',
  });

  app.useStaticAssets(pdfStorageDir, {
    prefix: '/storage/pdf',
  });

  // app.use('/pdf', express.static(pdfStorageDir));
  const viewsPath = path.join(__dirname, '..', 'views');
  console.log('viewsPath ', viewsPath);
  app.setBaseViewsDir(viewsPath);
  // app.engine(
  //   'hbs',
  //   hbs({
  //     extname: 'hbs',
  //     defaultLayout: undefined,
  //     layoutsDir: path.join(viewsPath, 'layouts'),
  //     partialsDir: path.join(viewsPath, 'partials'),
  //   }),
  // );
  app.setViewEngine('hbs');
  // app.set('view engine', '.hbs');
  app.set('views', path.join(__dirname, '..', 'views'));

  const hbsPath = path.resolve(__dirname, '..', 'views');
  console.log('Path to html.hbs:', hbsPath);
  if (existsSync(hbsPath)) {
    console.log('File exists!');
  } else {
    console.log('File does not exist!');
  }

  // app.use(express.static(__dirname));
  app.setBaseViewsDir(hbsPath);
  app.setViewEngine('hbs');
  // const viewsPath = path.join(__dirname, '..', 'views');
  // app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  // app.engine(
  //   'hbs',
  //   hbs({
  //     extname: '.hbs',
  //     defaultLayout: 'index', // Ensure 'main.hbs' is inside '/views/layouts/'
  //     layoutsDir: path.join(viewsPath, 'layouts'),
  //     // partialsDir: path.join(viewsPath, 'partials'),
  //   }),
  // );

  // app.setViewEngine('hbs');
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

  app.use('/images', express.static('/storage'));
  await app.listen(3002).then(() => {
    console.log('successfully deploy server');
  });
}
bootstrap();
