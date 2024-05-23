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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    // ElasticsearchModule.register({
    //   node: "http://192.168.68.129:7200",
    //   maxRetries: 10,
    //   requestTimeout: 60000,
    //   pingTimeout: 60000,
    //   sniffOnStart: true,
    //   auth: {
    //     username: "elastic",
    //     password: "Admin@123",
    //   },
    // }),
    ElasticsearchModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>("ELASTICSEARCH_NODE"),
        maxRetries: configService.get<number>("MAXRETRIES"),
        requestTimeout: configService.get<number>("REQUESTTIMEOUT"),
        pingTimeout: configService.get<number>("PINGTIMEOUT"),
        auth: {
          username: configService.get<string>("CLIENT_USERNAME"),
          password: configService.get<string>("CLIENT_PASSWORD"),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Metadata.name, schema: MetadataSchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
