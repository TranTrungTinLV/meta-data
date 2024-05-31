import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";

import { UsersService } from "src/modules/users/users.service";
import { BullModule } from "@nestjs/bull";
import * as redisStore from "cache-manager-redis-store";

import { MailerModule } from "../mailer/mailer.module";
import { EmailConsumer } from "../jobs/email.consumer";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheService } from "src/common/utils/cache.service";
import { UserSchema } from "./schema/create-user.schema";
import { PasswordResetSchema } from "./schema/passwordReset.schema";
import { ProductSchema } from "../product/schema/product.schema";
import { Admin, AdminSchema } from "./schema/create-admin.schema";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,

        host: configService.get<string>("REDIS_HOST"),
        port: configService.get<number>("REDIS_PORT"),
        // auth_pass: configService.get<string>("REDIS_PASS"),
        // ttl: 300000,
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule,
    PassportModule.register({
      defaultStrategy: "jwt",
    }),

    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },

      {
        name: "PasswordReset",
        schema: PasswordResetSchema,
      },
      { name: "Product", schema: ProductSchema },
    ]),

    BullModule.registerQueueAsync({
      name: "send-mail",
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("REDIS_HOST"),
          port: configService.get<number>("REDIS_PORT"),
          // password: configService.get<string>("REDIS_PASS"),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("REDIS_HOST"),
          port: configService.get<number>("REDIS_PORT"),
          // password: configService.get<string>("REDIS_PASS"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UsersService, CacheService, EmailConsumer],
  exports: [UsersService],
})
export class UsersModule {}
