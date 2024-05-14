// ** Libraries
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

// ** DI injections
import { UploadsService } from './services/uploads.service';
import { UploadController } from './uploads.controller';
import { User, UserSchema } from '../users/schema/create-user.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { Product, ProductSchema } from '../product/schema/create-product.schema';
import { UsersModule } from '../users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/common/guard/roles.gaurd';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { MetadataModule } from '../metadata/metadata.module';


@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'https://127.0.0.1:9200',
      maxRetries: 10,
      requestTimeout: 60000,
      pingTimeout: 60000,
      sniffOnStart: true,
      auth: {
        username: 'tin',
        password: 'Sgod111!',
      },
    }),
    MetadataModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    JwtModule,
  ],
  controllers: [UploadController],
  providers: [UploadsService, 
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },],
  exports: [UploadsService],
})
export class UploadsModule {}