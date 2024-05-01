import { forwardRef, Inject, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schema/category.schema';
import {
  Product,
  ProductSchema,
} from '../product/schema/create-product.schema';
import { UsersModule } from '../users/users.module';
import { ProductModule } from '../product/product.module';
// import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/common/guard/roles.gaurd';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/common/guard/auth.gaurd';

@Module({
  imports: [
    UsersModule,
    ProductModule,
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService,
   {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class CategoryModule {
  
}
