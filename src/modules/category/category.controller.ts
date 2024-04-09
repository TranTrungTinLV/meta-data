import { Body, Controller, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {

  
  }
  @Post()
  create(@Body() body: CreateCategoryDto){
    return this.categoryService.createCategory(body)
  }
}
