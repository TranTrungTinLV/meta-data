// ** Libraries
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// ** DI injections
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { User, UserSchema } from '../users/schema/users.schema';
import { Product, ProductSchema } from './schema/product.schema';
import { Category, CategorySchema } from '../categories/schema/category.schema';
import { UsersModule } from '../users/users.module';
import { FavoriteModule } from '../favourite/favourite.module';
import { Favorite, FavoriteSchema } from '../favourite/schema/favoritechema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    UsersModule,
    FavoriteModule,
    forwardRef(() => ProductModule),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
