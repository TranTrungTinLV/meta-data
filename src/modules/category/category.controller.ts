import { Body, Controller, Post, UploadedFile } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dtos/create-category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  create(@Body() createCategoryDto: CreateCategoryDto) {}

}
