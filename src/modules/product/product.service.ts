/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./schema/product.schema";
import { FilterQuery, Model, PaginateModel, PaginateResult } from "mongoose";

import { CreateProductDto } from "./dtos/create-product.dto";
import { UsersService } from "../users/users.service";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { Category, CategoryDocument } from "../category/schema/category.schema";
import { FilterProductDto } from "./dtos/filter-product.dto";
import { MetadataService } from "../metadata/metadata.service";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Workbook } from "exceljs";
import { FilterExportDto } from "./dtos/fiter-export-dtos";
import { PDFOptions } from "puppeteer";
import { PDFService } from "@t00nday/nestjs-pdf";
import * as crypto from "crypto";
import path, { join } from "path";
import * as fs from "fs";
import { removeVietnameseDiacritics } from "src/common/utils/text.util";
import { BulkDeleteProductDto, GetListProductDto } from "./dtos";
import { GetPageLimitOffset } from "src/common/utils/paginate.util";
import { Metadata, MetadataDocument } from "../metadata/schema/metadata.schema";
import { list } from "pdfkit";
import { removeDuplicatesString } from "src/common/utils/array.util";
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Product.name)
    private productModelPaginate: PaginateModel<ProductDocument>,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) {}

  async createProduct(body: CreateProductDto) {
    try {
      const metadata = await this.metadataModel.findById(body.metadata_id);
      if (!metadata) throw new BadRequestException("Metadata not found!");
      const product = await this.productModel.create(body);
      return product;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getListProduct(query: GetListProductDto) {
    try {
      const { page, limit, offset } = GetPageLimitOffset(query);
      let filterQuery: FilterQuery<ProductDocument> = {};
      if (query.search) {
        filterQuery.search = new RegExp(
          removeVietnameseDiacritics(query.search).toLocaleLowerCase()
        );
      }
      const listProduct = await this.productModelPaginate.paginate(
        { ...filterQuery },
        {
          page,
          limit,
          offset,
          sort: query.sort ? { createdAt: +query.sort } : { createdAt: 1 },
          populate: {
            path: "metadata_id",
            populate: {
              path: "category_id",
              populate: { path: "category_children_id" },
            },
          },
        }
      );
      return listProduct;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateProduct(id: string, body: UpdateProductDto) {
    try {
      if (body.metadata_id) {
        await this.checkMedata(body.metadata_id);
      }

      const product = await this.productModel.findByIdAndUpdate(
        id,
        {
          $set: { ...body },
        },
        { new: true }
      );
      if (!product) throw new BadRequestException("Product not found!");
      return product;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteProduct(productId: string) {
    try {
      const product = await this.productModel.findByIdAndDelete(productId);
      if (!product) throw new BadRequestException("Produt not found!");
      return product;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async bulkDeleteProduct(body: BulkDeleteProductDto) {
    try {
      body.listProductId = removeDuplicatesString(body.listProductId);
      await Promise.all(
        body.listProductId.map((productId) => {
          const product = this.productModel.findById(productId);
          if (!product) throw new BadRequestException("Product not found!");
        })
      );
      await this.productModel.deleteMany({ _id: { $in: body.listProductId } });
      // ** update category relation
      return {
        statusCode: 200,
        message: "Delete products success!",
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //** Helper function */

  async checkMedata(metadataId: string) {
    try {
      const metadata = await this.metadataModel.findById(metadataId);
      if (!metadata) throw new BadRequestException("Metadata not found!");
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateProductForCategory(categoryId: string, listProductId: string) {
    try {
      const category = await this.categoryModel.findByIdAndUpdate(categoryId, {
        $pull: { products: { $in: listProductId } },
      });
      if (!category) throw new BadRequestException("Category not found!");
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
