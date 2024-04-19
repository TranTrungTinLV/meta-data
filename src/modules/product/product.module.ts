import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/create-user.schema';
import { Product, ProductSchema } from './schema/create-product.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { UsersModule } from '../users/users.module';
import {
  Favorite,
  FavoriteSchema,
} from '../favorite/schema/create-favorite.schema';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/common/guard/auth.gaurd';
import { MetadataModule } from '../metadata/metadata.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    UsersModule,
    MetadataModule,
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
      maxRetries: 10,
      requestTimeout: 60000,
      pingTimeout: 60000,
      sniffOnStart: true,
      auth: {
        username: 'elastic',
        password: 'elastic',
      },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ProductModule {}
