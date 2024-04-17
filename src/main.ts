// ** Libraries
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { resolve } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import * as compression from 'compression';

// ** DI injections
import { AllExceptionsFilter } from './common/filters';

const logger = new Logger('Main');

async function bootstrap() {
  const { PORT, NODE_ENV } = process.env;
  const isProduction = NODE_ENV === 'production';
  const port = PORT || 5000;

  // ** initial app
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn', 'debug', 'verbose', 'log'],
    cors: true,
  });

  //** OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Metadata API')
    .setDescription('Metadata description')
    .setLicense('Amazon Web Service', 'http://sgod.vn')
    .setTermsOfService('5 years')
    .setContact('SGOD', '', 'sgod.support@gmail.com')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer(`http://192.168.68.129:5909`)
    .addServer(`http://localhost:5909`)
    .addOAuth2()
    .addBasicAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // ** express middleware
  app.use(compression()).use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: false,
    }),
  );

  // ** pipes & interceptors & exceptions with global scopes
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ** serving static file;
  app.use(`/images`, express.static(resolve(__dirname, `../storage`)));

  await app.listen(port, () => {
    logger.log(`🚀 Metadata server is running on port ${port}`);
  });
}
bootstrap();
