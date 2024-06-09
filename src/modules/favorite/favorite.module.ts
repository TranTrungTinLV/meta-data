import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductModule } from "../product/product.module";
import { FavoriteService } from "./favorite.service";
import { FavoriteController } from "./favorite.controller";
import { User, UserSchema } from "../users/schema/create-user.schema";
import { Product, ProductSchema } from "../product/schema/product.schema";
import { UsersModule } from "../users/users.module";
import { Favourite, FavouriteSchema } from "./schema/favourite.schema";
import { Metadata, MetadataSchema } from "../metadata/schema/metadata.schema";

@Module({
  imports: [
    UsersModule,
    ProductModule,
    MongooseModule.forFeature([
      { name: Favourite.name, schema: FavouriteSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Metadata.name, schema: MetadataSchema },
    ]),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
