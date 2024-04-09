import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/create-user.schema';
import { Product, ProductSchema } from './schema/create-product.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { UsersModule } from '../users/users.module';
import { FavouriteModule } from '../favourite/favourite.module';
import { Favourite, FavouriteSchema } from '../favourite/schema/create-favourtie.schema';

@Module({
  imports: [
    UsersModule,
    FavouriteModule,
    forwardRef(() => ProductModule),
    MongooseModule.forFeature(
    [
    {name: User.name, schema: UserSchema},
    {name: Product.name, schema: ProductSchema},
    {
      name: Category.name,
      schema: CategorySchema
    },
    {name: Favourite.name, schema: FavouriteSchema},

  ]
  )],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
