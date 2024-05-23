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
import { SearchCategoryFilter } from "./dto/filter-category.dto";
import { Category } from "./schema/category.schema";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Roles } from "src/common/decators/roles.decorator";
import { Role } from "../users/interfaces/users.model";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

@ApiTags("Category")
@Controller("category")
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  // @Roles([Role.Admin])
  @ApiOperation({ description: "yêu cầu Admin" })
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get()
  @Public()
  @ApiOperation({
    description: "Lấy hết danh mục",
    summary: "Lấy hết danh mục",
  })
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategoriesWithFull();
  }

  @Patch(":categoryId")
  @Roles([Role.Admin])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "cập nhật danh mục thành công",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "cập nhật danh mục thất bại",
  })
  @ApiOperation({ summary: "cập nhật danh mục" })
  async update(
    @Param("categoryId") categoryId: string,
    @Body() body: UpdateCategoryDto
  ): Promise<Category> {
    return this.categoryService.updateCategory(categoryId, body);
  }

  @Delete(":categoryId")
  @Roles([Role.Admin])
  async delete(@Param("categoryId") categoryId: string) {
    return this.categoryService.deleteCategory(categoryId);
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "lấy danh mục theo id" })
  async getCategoryChildrenAndProducts(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    let workBook = new Workbook();
    const sheet = workBook.addWorksheet("books");
    sheet.columns = [
      { header: "_id", key: "_id" },
      { header: "name", key: "name" },
    ];
    sheet.addRow({ _id: "asalksdkams", name: "helloo" });
    res.setHeader(
      "Content-Type",
      "appication/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment;filename=" + "books.xlsx");

    const r = await workBook.xlsx.write(res);
    return res.send(r);
  }
}
