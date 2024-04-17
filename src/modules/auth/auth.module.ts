// ** Libraries
import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { JwtModule } from '@nestjs/jwt';

// ** DI injections
import { UsersModule } from 'src/modules/users/users.module';
import { AuthGuard } from '../../common/guard/auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from '../emails/mailer.module';
import { RedisCacheModule } from 'src/shared/redis/redis.module';
import { JwtStrategy } from './strategies';
import { EBullQueueName } from 'src/common';
import { ConsumersModule } from 'src/shared/consumers/consumers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/users.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BullModule.registerQueue({ name: EBullQueueName.SEND_EMAIL }),
    UsersModule,
    MailerModule,
    RedisCacheModule,
    JwtModule,
    ConsumersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
