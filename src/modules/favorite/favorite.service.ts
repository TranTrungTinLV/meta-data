import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite } from './schema/create-favorite.schema';
import { User } from '../users/schema/create-user.schema';
import { UsersService } from '../users/users.service';
import { ProductService } from '../product/product.service';
import { Product } from '../product/schema/create-product.schema';
import { FavoriteDto } from './dtos/favourite.dto';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
        private readonly usersService: UsersService,
        @InjectModel(Product.name)
        private readonly productModel: Model<Product>
    ){}

    async addFavorite(username: string, product_id: string):Promise<Favorite> {
       try{
        const product = await this.productModel.findById(product_id);
        if(!product){
            throw new BadRequestException(`Not found product with ${product}`)
        }
        const owner = await this.usersService.findOne(username);
        if (!owner) {
            throw new Error('Không tìm thấy người dùng');
          }
        const favorite =  this.favoriteModel.create({
            user_id: owner._id,
            product_id: product_id,
            
        });
        return favorite;
       }catch(e){
        return e
       }
    }

    


    
}
