import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/create-product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name)  private readonly productModel: Model<Product>,
    ){
        
    }
    async create(createProductDto: CreateProductDto): Promise<Product> {
        const createdProduct = new this.productModel(createProductDto);
        return createdProduct.save();
      }
}
