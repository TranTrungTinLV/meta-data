import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Category, CategoryDocument } from './schema/category.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>
    ){}
    
    async create(category: CreateCategoryDto): Promise<Category> {
        const newCategory = await this.categoryModel.create(category);
        return newCategory;
    }
}
