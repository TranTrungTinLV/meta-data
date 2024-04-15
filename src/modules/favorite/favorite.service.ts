import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite } from './schema/create-favorite.schema';
import { User } from '../users/schema/create-user.schema';
import { UsersService } from '../users/users.service';
import { ProductService } from '../product/product.service';
import { Product } from '../product/schema/create-product.schema';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
        private readonly usersService: UsersService,
        private readonly productModel: Model<Product>
    ){}

    addFavorite():Promise<Favorite[]> {
        
        return null;
    }
    
}
