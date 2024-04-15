import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/create-user.schema';
import { Product, ProductSchema } from './schema/create-product.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { UsersModule } from '../users/users.module';
import { Favorite, FavoriteSchema } from '../favorite/schema/create-favorite.schema';
// import { FavouriteModule } from '../favourite/favourite.module';



@Module({
  imports: [
    UsersModule,
    forwardRef(() => ProductModule),
    MongooseModule.forFeature(
    [
    {name: User.name, schema: UserSchema},
    {name: Product.name, schema: ProductSchema},
    {
      name: Category.name,
      schema: CategorySchema
    },
    {name: Favorite.name, schema: FavoriteSchema},

  ]
  )],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
