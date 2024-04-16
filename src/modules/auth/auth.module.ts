import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from 'src/modules/mailer/mailer.module';
import { JwtStrategy } from 'src/modules/auth/jwt.strategy';
import { UsersModule } from 'src/modules/users/users.module';
import {BullModule} from '@nestjs/bull'
import { AuthGuard } from '../../common/guard/auth.gaurd';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CacheService } from 'src/common/utils/cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';


@Global()
@Module({
  imports: [
    // LevelMemberModule,
    // CacheModule,
    
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore, 
      
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      auth_pass: configService.get<string>('REDIS_PASS'),
      ttl: 300000,
      isGlobal: true,
      }),
      inject: [ConfigService]
      
    }),
    UsersModule,
    BullModule.registerQueue({
      name: 'send-mail'
    }),
    MailerModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: config.get<string | number>('JWT_EXPIRE') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    CacheService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [JwtModule]
})
export class AuthModule {}
