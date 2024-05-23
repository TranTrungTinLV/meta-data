/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Render,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { CreateProductDto } from "./dtos/create-product.dto";
import { Public } from "src/common/decorators/public.decorations";
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";

import { Roles } from "src/common/decators/roles.decorator";
// import { Role } from '../users/schema/create-user.schema';
import { Product } from "./schema/product.schema";
import { multerOptions } from "src/common/utils/uploadImage";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { FilterProductDto } from "./dtos/filter-product.dto";
import { Role } from "../users/interfaces/users.model";
import { logger } from "src/common/utils/logger";
import { Response } from "express";
import { PdfService } from "src/common/pdf-request-form/pdf.request";
import * as path from "path";
import * as fs from "fs";
import mongoose, { Mongoose } from "mongoose";
import { UsersService } from "../users/users.service";
import { IRequestWithUser } from "../uploads/interfaces";
import { BulkDeleteProductDto, GetListProductDto } from "./dtos";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";

@ApiBearerAuth()
@ApiTags("Product")
@Controller("product")
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() body: CreateProductDto) {
    return await this.productService.createProduct(body);
  }

  @Get()
  async getList(@Query() query: GetListProductDto) {
    return await this.productService.getListProduct(query);
  }

  @Patch(":id")
  async updateProduct(@Param("id") id: string, @Body() body: UpdateProductDto) {
    return await this.productService.updateProduct(id, body);
  }

  @Delete(":id")
  async deleteProduct(@Param("id") id: string) {
    return await this.productService.deleteProduct(id);
  }

  @Post("bulk-delete")
  async bulkDelete(@Body() body: BulkDeleteProductDto) {
    return await this.productService.bulkDeleteProduct(body);
  }
}
