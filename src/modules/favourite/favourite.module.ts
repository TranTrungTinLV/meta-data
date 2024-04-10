import { Module } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { FavouriteController } from './favourite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Favourite, FavouriteSchema } from './schema/create-favourtie.schema';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [

    MongooseModule.forFeature([{
    name: Favourite.name,
    schema: FavouriteSchema
  }])],
  controllers: [FavouriteController],
  providers: [FavouriteService],
})
export class FavouriteModule {}
