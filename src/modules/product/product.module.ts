/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schema/create-user.schema";
import { Product, ProductSchema } from "./schema/product.schema";
import { Category, CategorySchema } from "../category/schema/category.schema";
import { UsersModule } from "../users/users.module";
import { APP_GUARD } from "@nestjs/core";
import { MetadataModule } from "../metadata/metadata.module";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { PdfService } from "src/common/pdf-request-form/pdf.request";
import { PDFModule, PDFModuleOptions } from "@t00nday/nestjs-pdf";
import { Metadata, MetadataSchema } from "../metadata/schema/metadata.schema";

@Module({
  imports: [
    PDFModule.registerAsync({
      isGlobal: true,
      useFactory: (): PDFModuleOptions => ({
        view: {
          root: `${__dirname}`,
          engine: "handlebars",
          extension: "hbs",
        },
      }),
    }),
    UsersModule,
    MetadataModule,
    ElasticsearchModule.register({
      node: "https://127.0.0.1:9200",
      maxRetries: 10,
      requestTimeout: 60000,
      pingTimeout: 60000,
      sniffOnStart: true,
      auth: {
        username: "tin",
        password: "Sgod111!",
      },
    }),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Metadata.name, schema: MetadataSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, PdfService],
})
export class ProductModule {}
