import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/create-product.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import { CreateProductDto } from './dtos/create-product.dto';
import { UsersService } from '../users/users.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Category } from '../category/schema/category.schema';
import { name } from 'ejs';
import { Http2ServerRequest } from 'http2';
import { FilterProductDto } from './dtos/filter-product.dto';
import { Favorite } from '../favorite/schema/create-favorite.schema';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name)  private readonly productModel: Model<Product>,
        @InjectModel(Product.name)  private readonly productModelpag: PaginateModel<Product>,

        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        // @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>
        private readonly userService: UsersService
    ){
        
    }
    async createExcel(createProductDto: CreateProductDto): Promise<Product> {


      const createdProduct = new this.productModel(createProductDto);
        return createdProduct.save();
      }

    async create(createProductDto: CreateProductDto,username: null): Promise<Product> {
        // const owner = await this.userService.findOne(username);
        // if(!owner){
        //     throw new Error('Không tìm thấy người dùng')
        // }
        const category = await this.categoryModel.findById(createProductDto.category_id)
        console.log(category)
        if (!category) {
         throw new HttpException('Không tìm thấy danh mục',HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const newProduct = this.productModel.create({
            ...createProductDto,
            // owner: owner._id,
            category_id: category._id
        })


        await this.categoryModel.findByIdAndUpdate(category._id, {
          $push: { products: (await newProduct)._id },
        }); 
        return newProduct;
    }

    async updateproduct(productId:string,updateProductDto: UpdateProductDto,newImages: Express.Multer.File[]): Promise<Product>{
        const product = await this.productModel.findById(productId);
        if(!product) {
          throw new NotFoundException(`Không tìm thấy ID ${productId} để thực hiện việc sửa sản phẩm`)
        }

        //Nếu client thêm ảnh
        if (newImages && newImages.length) {
          const newImagePaths = newImages.map(file => `images/products/${file.filename}`);
          product.images = [...product.images, ...newImagePaths];
        }
        
         // Xử lý xóa ảnh
      if (updateProductDto.deleteImages && updateProductDto.deleteImages.length) {
        product.images = product.images.filter(img => !updateProductDto.deleteImages.includes(img));
      }
        Object.entries(updateProductDto).forEach(([key,value]) => {
          if (value !== undefined && value !== '' && key !== 'newImages' && key !== 'deleteImages') {
            product[key] = value;
          }
        })
 
        return product.save();
      }

      async deleteProduct(productId:string): Promise<any> {
        const product = await this.productModel.findById(productId);
        if(!product){
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${productId}`);
        }
        const result = await this.productModel.deleteOne({_id: productId});
        if(result.deletedCount === 0) {
          throw new NotFoundException(`Không tìm thấy ${productId} để xóa`)
        }

        // Cập nhật danh mục bằng cách loại bỏ sản phẩm khỏi danh sách sản phẩm của danh mục
        await this.categoryModel.findByIdAndUpdate(product.category_id,{
          $pull: {
            products: productId
          }
        })

        // await this.favoriteModel.findByIdAndUpdate()
        return result;
      }


      async deleteMany(ids: string[]):Promise<any> {
        const result = await this.productModel.deleteMany({_id: {$in: ids}});
        if(result.deletedCount === 0) {
          console.log(result)
          throw new NotFoundException(`Không tìm thấy sản phẩm để xóa`);
        }
    
        //update category
        // await this.categoryModel.updateMany(
        //   {},
        //   {
        //     $pull: {products: {$in: ids}}
        //   }
        // )
        return result;
      }

      async findByIdProduct(productId: string): Promise<Product> {
        const product = await this.productModel.findById(productId);
        console.log(product)
        return product.populate('owner','username');
      }

      async findAllProducts(filter: FilterProductDto): Promise<PaginateResult<Product> | Product[]> {
        let query = {};
        // if(filter.name){
        //   query['name'] = {$regex: filter.name, $options: 'i' }
        // }
        if(filter.categoryId){
          query['categoryId'] = filter.categoryId;
        }
        const options = {
          page: filter.page || 1,
          limit: filter.limit || 10,
          sort: {createAt: -1},
          populate: 'category_id'
        }
        if(filter.name){
          query = {name: {$regex: filter.name, $options: 'i' }}
          const products = await this.productModel.find(query).populate('category_id','name').exec();
          console.log(products)
          if(products.length === 0){
            throw new NotFoundException(`Oops, we don’t have any results for "${filter.name}"`);
          }
          return this.productModelpag.paginate(query,options)
        }
        else{
          return this.productModel.find().populate('category_id')
    
        }
      }
    
    
}
