import { forwardRef, Inject, Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./schema/category.schema";
import { Product, ProductSchema } from "../product/schema/product.schema";
import { UsersModule } from "../users/users.module";
import { ProductModule } from "../product/product.module";
// import { APP_GUARD } from '@nestjs/core';
import { APP_GUARD } from "@nestjs/core";

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
  providers: [CategoryService],
})
export class CategoryModule {}
