// Libraries
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';

// ** DI injections
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/products/product.module';
import { UsersModule } from './modules/users/users.module';
import { CategoryModule } from './modules/categories/category.module';
import { MailerModule } from './modules/emails/mailer.module';
import { RedisCacheModule } from './shared/redis/redis.module';
import { EDatabaseName } from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get<string>('DATABASE_URI')}/${EDatabaseName.SGOD_METADATA}`,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: +configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProductModule,
    UsersModule,
    CategoryModule,
    MailerModule,
    RedisCacheModule,
  ],
})
export class AppModule {}
