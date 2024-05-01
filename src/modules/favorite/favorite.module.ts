import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductModule } from '../product/product.module';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { Favorite, FavoriteSchema } from './schema/create-favorite.schema';
import { User, UserSchema } from '../users/schema/create-user.schema';
import { Product, ProductSchema } from '../product/schema/create-product.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    ProductModule,
    MongooseModule.forFeature(
    [
        
  {name: Favorite.name, schema: FavoriteSchema},

  {name: User.name, schema: UserSchema},
  {name: Product.name, schema: ProductSchema}
])],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
