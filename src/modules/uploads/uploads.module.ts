// ** Libraries
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

// ** DI injections
import { UploadsService } from './services/uploads.service';
import { UploadController } from './uploads.controller';
import { User, UserSchema } from '../users/schema/create-user.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { Product, ProductSchema } from '../product/schema/create-product.schema';
import { UsersModule } from '../users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/common/guard/roles.gaurd';


@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    JwtModule,
  ],
  controllers: [UploadController],
  providers: [UploadsService, 
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },],
  exports: [UploadsService],
})
export class UploadsModule {}