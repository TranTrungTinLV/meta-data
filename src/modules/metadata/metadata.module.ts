/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Metadata, MetadataSchema } from './schema/metadata.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { User, UserSchema } from '../users/schema/create-user.schema';
import { PdfService } from 'src/common/pdf-request-form/pdf.request';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ElasticsearchModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
        maxRetries: configService.get<number>('MAXRETRIES') || 10,
        requestTimeout: configService.get<number>('REQUESTTIMEOUT') || 60000,
        pingTimeout: configService.get<number>('PINGTIMEOUT') || 60000,
        auth: {
          username: configService.get<string>('CLIENT_USERNAME'),
          password: configService.get<string>('CLIENT_PASSWORD'),
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
  providers: [MetadataService, PdfService],
  exports: [MetadataService],
})
export class MetadataModule {}
