import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Public } from 'src/common/decorators/public.decorations';
import { SearchCategoryFilter } from './dto/filter-category.dto';
import { Category } from './schema/category.schema';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {
  }

  @Public()
  @Post()
  create(@Body() body: CreateCategoryDto){
    return this.categoryService.create(body)
  }

  @Get()
  @Public()
  async getAllCategories(@Query() filterCateDto:SearchCategoryFilter): Promise<Category[]> {
    return this.categoryService.findAllWithProductCount(filterCateDto.name);
    // return this.categoryService.findAllWithProductCount()
  }

}
