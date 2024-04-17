// ** Libraries
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// ** DI injections
import {
  Product,
  ProductSchema,
} from '../products/schema/product.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategorySchema } from './schema/category.schema';
import { UsersModule } from '../users/users.module';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    UsersModule,
    ProductModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
