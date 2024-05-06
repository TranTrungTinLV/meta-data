import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/create-product.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import { CreateProductDto } from './dtos/create-product.dto';
import { UsersService } from '../users/users.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Category } from '../category/schema/category.schema';
import { FilterProductDto } from './dtos/filter-product.dto';
import { MetadataService } from '../metadata/metadata.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Workbook } from 'exceljs';
import { FilterExportDto } from './dtos/fiter-export-dtos';
import { PDFOptions } from 'puppeteer';
import { PDFService } from '@t00nday/nestjs-pdf';
import * as crypto from 'crypto';
import path, { join } from 'path';
import * as fs from 'fs';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Product.name)
    private readonly productModelpag: PaginateModel<Product>,
    private readonly pdfService: PDFService,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    // @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>
    private readonly userService: UsersService,
    private readonly metadataService: MetadataService,
    // private readonly elasticService: ElasticsearchService,
  ) {}
  async createExcel(
    createProductDto: CreateProductDto,
  ): Promise<Product | any> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async create(
    createProductDto: CreateProductDto,
    username: string,
  ): Promise<Product> {
    const owner = await this.userService.findOne(username);
    if (!owner) {
      throw new Error('Không tìm thấy người dùng');
    }
    const category = await this.categoryModel.findById(
      createProductDto.category_id,
    );
    console.log(category);
    if (!category) {
      throw new HttpException(
        'Không tìm thấy danh mục',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const newProduct = await this.productModel.create({
      ...createProductDto,
      owner: owner._id,
      category_id: category._id,
    });

    const index = 'newproduct';
    const body = {
      settings: { number_of_shards: 1, number_of_replicas: 1 },
      mappings: {
        properties: {
          name: newProduct.name,
          code: newProduct.code,
          detail: newProduct.detail,
          images: newProduct.images,
        },
      },
    };
    const existsElastic = index
      ? await this.metadataService.indexExists(index)
      : await this.metadataService.createIndex(index, body);
    console.log('existsElastic', existsElastic);
    if (!existsElastic) {
      console.log('existsElastic', existsElastic);
      await this.metadataService.createIndex(index, body);
    } else {
      console.log('existsElastic tồn tại');
    }
    //Elastic
    this.metadataService.index(index, {
      id: String(newProduct._id),
      name: newProduct.name,
      code: newProduct.code,
      detail: newProduct.detail,
      image: newProduct.images,
    });

    await this.categoryModel.findByIdAndUpdate(category._id, {
      $push: { products: (await newProduct)._id },
    });
    return newProduct;
  }

  async updateproduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    newImages: Express.Multer.File[],
  ): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy ID ${productId} để thực hiện việc sửa sản phẩm`,
      );
    }

    //Nếu client thêm ảnh
    if (newImages && newImages.length) {
      const newImagePaths = newImages.map(
        (file) => `images/products/${file.filename}`,
      );
      product.images = [...product.images, ...newImagePaths];
    }

    // Xử lý xóa ảnh
    if (updateProductDto.deleteImages && updateProductDto.deleteImages.length) {
      product.images = product.images.filter(
        (img) => !updateProductDto.deleteImages.includes(img),
      );
    }
    Object.entries(updateProductDto).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        key !== 'newImages' &&
        key !== 'deleteImages'
      ) {
        product[key] = value;
      }
    });

    return product.save();
  }

  async deleteProduct(productId: string): Promise<any> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với ID ${productId}`,
      );
    }
    const result = await this.productModel.deleteOne({ _id: productId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Không tìm thấy ${productId} để xóa`);
    }

    // Cập nhật danh mục bằng cách loại bỏ sản phẩm khỏi danh sách sản phẩm của danh mục
    await this.categoryModel.findByIdAndUpdate(product.category_id, {
      $pull: {
        products: productId,
      },
    });

    return result;
  }

  async deleteMany(ids: string[]): Promise<any> {
    const result = await this.productModel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      console.log(result);
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
    console.log(product);
    return product;
  }

  async findAllProducts(
    filter: FilterProductDto,
  ): Promise<PaginateResult<Product> | Product[] | any> {
    if (filter.name) {
      console.log('elastic');
      return this.metadataService.searchElastic('newproduct', filter.name);
      ///
    } else {
      console.log('mongodb');
      const query = {};
      if (filter.name) {
        query['name'] = { $regex: filter.name, $options: 'i' };
      }

      if (filter.categoryId) {
        query['category_id'] = filter.categoryId;
      }
      // query = { name: { $regex: filter.name, $options: 'i' } };
      // const products = await this.productModel
      //   .find(query)
      //   .populate('category_id', 'name')
      //   .exec();
      // console.log(products);
      // if (products.length === 0) {
      //   throw new NotFoundException(
      //     `Oops, we don’t have any results for "${filter.name}"`,
      //   );
      // }
      const options = {
        page: filter.page || 1,
        limit: filter.limit || 10,
        sort: { createAt: -1 },
        populate: 'category_id',
      };
      const paginatedResult = await this.productModelpag.paginate(
        query,
        options,
      );
      // Kiểm tra kết quả và xử lý kịch bản không tìm thấy sản phẩm
      if (paginatedResult.docs.length === 0) {
        throw new NotFoundException(
          'Không tìm thấy sản phẩm nào với bộ lọc hiện tại.',
        );
      }
      console.log(paginatedResult.docs);

      return paginatedResult;

      // return this.productModel.find().populate('category_id');

      // if (filter.categoryId) {
      //   query['categoryId'] = filter.categoryId;
      // }

      // return this.productModelpag.paginate(query, options);
    }
  }

  // async fetchData() {
  //   try {
  //     const selectString = fields.join(' ');
  //     const products = await this.productModel
  //       .find({})
  //       .select(selectString)
  //       .lean();

  //     return products.map((product) => {
  //       const result = {};
  //       fields.forEach((field) => {
  //         result[field] = product[field];
  //       });
  //       return result;
  //     });
  //     //   const query = { ...fields };
  //     //   return this.productModel.find(query).lean();
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     throw error;
  //   }
  // }

  async fetchData(filters: FilterExportDto) {
    const query: any = {};
    if (filters.code) {
      query.code = filters.code;
    }
    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' }; // case-insensitive search
    }
    if (filters.minQuantity) {
      query.quantity = { ...query.quantity, $gte: filters.minQuantity };
    }
    if (filters.maxQuantity) {
      query.quantity = { ...query.quantity, $lte: filters.maxQuantity };
    }
    if (filters.category_id) {
      query.category_id = filters.category_id;
    }
    try {
      // Truy vấn tất cả sản phẩm, lọc và chỉ lấy các trường cần thiết
      // const products = await this.productModel
      //   .find({})
      //   .select({
      //     _id: 1,
      //     name: 1,
      //     quantity: 1,
      //     price: 1,
      //     code: 1,
      //     // thêm các trường khác mà bạn muốn xuất
      //   })
      //   .lean(); // `.lean()` để nhận được đối tượng JavaScript thuần túy
      const products = await this.productModel.find(query).lean();
      return products;

      // Xử lý hoặc chỉnh sửa dữ liệu nếu cần
      // return products.map((product) => ({
      //   id: product._id.toString(), // Chuyển đổi ObjectId thành string
      //   name: product.name,
      //   quantity: product.quantity,
      //   code: product.code,
      //   note: product.note,
      //   // price: product.price,
      //   // map thêm các trường khác tùy thuộc vào nhu cầu
      // }));
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Xử lý lỗi phù hợp
    }
  }

  async exportProductToExcel(filters: FilterProductDto) {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      // { header: 'Product ID', key: 'id', width: 10 },
      { header: 'mã', key: 'code', width: 10 },
      { header: 'Tên Sản Phẩm', key: 'name', width: 35 },
      { header: 'Mô tả', key: 'description', width: 50 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Số Lượng', key: 'quantity', width: 10 },
      { header: 'Giá', key: 'price', width: 10 },
      { header: 'Images', key: 'images', width: 30 },

      // Khai báo thêm các cột cần thiết
    ];

    const data = await this.fetchData(filters);
    data.forEach((product) => {
      sheet.addRow({
        name: product.name,
        code: product.code,
        quantity: product.quantity,
        images: product.images.join(', '),
        note: product.note,
      });
    });

    const path = 'storage/dataexcel/ProductsExport.xlsx';
    await workbook.xlsx.writeFile(path);
    return path;
  }


  

  //pdf
  // async getViewName(): Promise<string> {
  //   return 'index';
  // }
  // pdf;

  // async generatePDFToFile(
  //   template: string,
  //   filename: string,
  //   options?: PDFOptions,
  // ) {
  //   console.log('filename', filename);
  //   console.log('template', template);
  //   return await this.pdfService.toStream(template, options as any); // returns Observable<FileInfo>;
  // }

  // async GetMessage(): Promise<string> {
  //   return (Math.random() * 100000000).toString();
  // }

  // async GetTotal(items): Promise<number> {
  //   let total = 0;
  //   for (const item of items) {
  //     total += item.cost;
  //   }
  //   return total;
  // }

  // async GetItemList(): Promise<any> {
  //   const items = [];
  //   const no_of_items = Math.ceil(Math.random() * 20);
  //   for (let i = 0; i < no_of_items; i++) {
  //     items.push({
  //       id: i + 1,
  //       date: new Date(),
  //       name: crypto.randomBytes(5).toString('hex'),
  //       cost: Math.ceil(Math.random() * 100),
  //     });
  //   }
  //   const total = await this.GetTotal(items);
  //   return { total: total, items: items };
  // }
}
