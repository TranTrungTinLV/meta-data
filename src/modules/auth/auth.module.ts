import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { MailerModule } from "src/modules/mailer/mailer.module";
import { UsersModule } from "src/modules/users/users.module";
import { BullModule } from "@nestjs/bull";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CacheService } from "src/common/utils/cache.service";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "../users/schema/create-admin.schema";
import { User, UserSchema } from "../users/schema/create-user.schema";
// import { OtpModule, OtpService } from '@ognicki/nestjs-otp';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>("REDIS_HOST"),
        port: configService.get<number>("REDIS_PORT"),
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    BullModule.registerQueue({
      name: "send-mail",
    }),
    MailerModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>("JWT_SECRET"),
          signOptions: { expiresIn: config.get<string | number>("JWT_EXPIRE") },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CacheService],
  exports: [JwtModule],
})
export class AuthModule {}
