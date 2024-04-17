// ** Libraries
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

// ** DI injections
import {
  Product,
  ProductSchema,
} from '../products/schema/product.schema';
import { RolesGuard } from '../../common/guard/roles.guard';
import { UsersService } from 'src/modules/users/users.service';
import { User, UserSchema } from './schema/users.schema';
import { Email, EmailSchema } from './schema/email.schema';
import { MailerModule } from '../emails/mailer.module';
import { EBullQueueName } from 'src/common/enums';
import { RedisCacheModule } from 'src/shared/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { ConsumersModule } from 'src/shared/consumers/consumers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Email.name, schema: EmailSchema },
    ]),
    BullModule.registerQueue({ name: EBullQueueName.SEND_EMAIL }),
    MailerModule,
    JwtModule,
    RedisCacheModule,
    ConsumersModule,
  ],
  providers: [UsersService, { provide: APP_GUARD, useClass: RolesGuard }],
  exports: [UsersService],
})
export class UsersModule {}
