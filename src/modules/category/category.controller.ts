import { Body, Controller, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Public } from 'src/common/decorators/public.decorations';

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
}
