/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Public } from "src/common/decorators/public.decorations";
import { Category } from "./schema/category.schema";
import { Role } from "../users/interfaces/users.model";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import { IRequestWithUser } from "../uploads/interfaces";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { RolesGuardV2 } from "src/common/guard/roles-guard-v2.guard";
import { PermissionGuard } from "src/common/guard/permission.guard";
import {
  BulkDeleteCategoryDto,
  GetListCategoryDto,
  UpdateCategoryDto,
} from "./dto";
import { Permissions } from "src/common/decorators/permission.decorator";
import { ERole } from "src/common/enums";
import { Roles } from "src/common/decorators/roles.decorator";

@ApiTags("category")
@Controller("category")
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(
    @Req() req: IRequestWithUser,
    @Body() body: CreateCategoryDto
  ) {
    return await this.categoryService.create(body);
  }

  @Get()
  async getListCategory(
    @Req() req: IRequestWithUser,
    @Query() query: GetListCategoryDto
  ) {
    return await this.categoryService.getList(query);
  }

  @Get(":id/get-by-id")
  async getById(@Req() req: IRequestWithUser, @Param("id") id: string) {
    return await this.categoryService.getById(id);
  }

  @Delete(":id")
  async deleteById(@Req() req: IRequestWithUser, @Param("id") id: string) {
    return await this.categoryService.deleteById(id);
  }

  @Post(":id/bulk-delete")
  async bulkDelete(
    @Req() req: IRequestWithUser,
    @Body() body: BulkDeleteCategoryDto
  ) {
    return await this.categoryService.bulkDelete(body);
  }

  @Patch(":id")
  async updateCategory(
    @Req() req: IRequestWithUser,
    @Body() body: UpdateCategoryDto,
    @Param("id") id: string
  ) {
    return await this.categoryService.updateCategory(id, body);
  }
}
