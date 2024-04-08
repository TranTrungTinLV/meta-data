import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schema/category.schema';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>
    ){}
    async create(CreatecategoryDto: CreateCategoryDto): Promise<Category> {
        const newCategory = await this.categoryModel.create(CreatecategoryDto);
        return newCategory;
      }
}
