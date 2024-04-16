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
            throw new BadRequestException(`Not found product with ${product_id}`)
        }
        const owner = await this.usersService.findOne(username);
        if (!owner) {
            throw new Error('Không tìm thấy người dùng');
          }
          const existingFavorite = await this.favoriteModel.findOne({product_id: product_id});
        if (existingFavorite) {
            throw new BadRequestException('Sản phẩm này đã có trong danh sách yêu thích của bạn');
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

    async unFavorite(username: string, favorite_id: string) {
        const owner = await this.usersService.findOne(username);
        if (!owner) {
            throw new BadRequestException('Không tìm thấy người dùng');
        }
        const favorite = await this.favoriteModel.findById(favorite_id);
        if (!favorite) {
            throw new BadRequestException('Sản phẩm không có trong danh sách yêu thích');
        }
        if(favorite.user_id.toString() !== owner._id.toString()){
            throw new BadRequestException('Lỗi khi xóa sản phẩm khỏi danh sách yêu thích');
        }
        return { message: 'Đã xóa sản phẩm khỏi danh sách yêu thích' };
    }    

    async listUserFavorite(username: string): Promise<Favorite[]> {
        const user = await this.usersService.findOne(username)
        if (!user) {
            throw new BadRequestException('Không tìm thấy người dùng');
        }
        return await this.favoriteModel.find({user_id: user._id}).populate('product_id')
    }
}
