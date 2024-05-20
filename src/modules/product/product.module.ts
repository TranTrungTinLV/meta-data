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
// import { MetadataModule } from '../metadata/metadata.module';
// import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { PdfService } from 'src/common/pdf-request-form/pdf.request';
import { PDFModule, PDFModuleOptions } from '@t00nday/nestjs-pdf';

@Module({
  imports: [
    PDFModule.registerAsync({
      isGlobal: true,
      useFactory: (): PDFModuleOptions => ({
        view: {
          root: `${__dirname}`,
          engine: 'handlebars',
          extension: 'hbs'
        }
      })
    }),
    UsersModule,
    // MetadataModule,

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
    PdfService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ProductModule { }
