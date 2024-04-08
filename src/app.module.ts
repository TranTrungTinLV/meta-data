import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';

import { UsersModule } from './modules/users/users.module';
import { BullModule } from '@nestjs/bull';


import { MailerModule } from './modules/mailer/mailer.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


// import { PaymentModule } from './modules/payment/payment.module';
// import { rateLimitMiddleware } from './utils/rating-limit';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '@nestjs-modules/ioredis';
import * as redisStore from 'cache-manager-redis-store';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CacheService } from './utils/cache.service';
import { RegisterModule } from './modules/register/register.module';
import { CategoryModule } from './modules/category/category.module';
// import { CacheService } from './modules/cache/cache.service';
// import { CacheModule } from './modules/cache/cache.module';
@Module({
  imports: [
    
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore, 
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      // auth_pass: configService.get<string>('REDIS_PASS'),
      ttl: 2000,
      isGlobal: true,
      }),
      inject: [ConfigService]
      
    }),
    
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'storage/images'),
      serveRoot: '/images/'
  }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      }
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProductModule,
    UsersModule,
    RedisModule,
    CategoryModule,
    RegisterModule,
    MailerModule,
  
    BullModule.forRootAsync({
      useFactory: async(configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT')
        }
      }),
      inject: [ConfigService]
     
    })
    // CacheModule
  ],
  providers: [CacheService]
 
})
export class AppModule{
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(rateLimitMiddleware)
  //     .forRoutes('auth/register'); // Áp dụng middleware cho route đăng ký
  // }
}
