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
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Public } from 'src/common/decorators/public.decorations';
import { SearchCategoryFilter } from './dto/filter-category.dto';
import { Category } from './schema/category.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from 'src/common/decators/roles.decorator';
import { Role } from '../users/schema/create-user.schema';
import { RolesGuard } from 'src/common/guard/roles.gaurd';

@ApiTags('Category')
@UseGuards(RolesGuard)
@Controller('category')
@ApiSecurity('bearerAuth')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles([Role.Admin])
  @ApiOperation({description: 'yêu cầu Admin'})
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get()
  @Roles([Role.Admin])
  @ApiOperation({
    description: 'Lấy hết danh mục',
    summary: 'Lấy hết danh mục',
  })
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategoriesWithFull();
  }

  @Patch(':categoryId')
  @Roles([Role.Admin])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'cập nhật danh mục thành công',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'cập nhật danh mục thất bại',
  })
  @ApiOperation({ summary: 'cập nhật danh mục' })
  async update(
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.updateCategory(categoryId, body);
  }

  @Delete(':categoryId')
  @Roles([Role.Admin])
  async delete(@Param('categoryId') categoryId: string) {
    return this.categoryService.deleteCategory(categoryId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'lấy danh mục theo id' })
  async getCategoryChildrenAndProducts(@Param('id') id: string) {
    return this.categoryService.populateChildrenCategoryandProducts(id);
  }
}
