// ** Libraries
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";

// ** DI injections
import { UploadsService } from "./services/uploads.service";
import { UploadController } from "./uploads.controller";
import { User, UserSchema } from "../users/schema/create-user.schema";
import { Category, CategorySchema } from "../category/schema/category.schema";
import { Product, ProductSchema } from "../product/schema/product.schema";
import { UsersModule } from "../users/users.module";
import { MetadataModule } from "../metadata/metadata.module";
import { Metadata, MetadataSchema } from "../metadata/schema/metadata.schema";

@Module({
  imports: [
    MetadataModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Metadata.name, schema: MetadataSchema },
    ]),
    JwtModule,
  ],
  controllers: [UploadController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
