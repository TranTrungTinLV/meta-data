import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
// import { RegiterSchema } from './schema/registor.schema';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';
import { UserSchema } from '../users/schema/create-user.schema';
import { RegistorController } from './register.controller';
import { RegisterService } from './register.service';
// import { rateLimitMiddleware } from 'src/utils/rating-limit';
// import { UsersModule } from 'src/users/users.module';
// import { UserSchema } from 'src/users/schema/users.schema';

@Module({
  imports: [
    // UsersModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [RegistorController],
  providers: [RegisterService],
})

export class RegisterModule {}
// export class RegistorModule implements NestModule{
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(rateLimitMiddleware)
//       .forRoutes('register'); // Áp dụng middleware cho route 'register'
//   }
// }
