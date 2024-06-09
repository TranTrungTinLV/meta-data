/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import { MetadataController } from "./metadata.controller";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Metadata, MetadataSchema } from "./schema/metadata.schema";
import { Category, CategorySchema } from "../category/schema/category.schema";
import { User, UserSchema } from "../users/schema/create-user.schema";
import { PdfService } from "src/common/pdf-request-form/pdf.request";
import { ElasticModule } from "src/common/services/elastic/elastic.module";
import {
  Favourite,
  FavouriteSchema,
} from "../favorite/schema/favourite.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    ElasticModule.register({ node: process.env.ELASTICSEARCH_NODE }),
    MongooseModule.forFeature([
      { name: Metadata.name, schema: MetadataSchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
      { name: Favourite.name, schema: FavouriteSchema },
    ]),
  ],
  controllers: [MetadataController],
  providers: [MetadataService, PdfService],
  exports: [MetadataService],
})
export class MetadataModule {}
