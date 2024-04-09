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
    async createCategory(createCategoryDto:CreateCategoryDto):Promise<CategoryDocument[]>{
        const {name,parent} = createCategoryDto;
        const existingCategory = await this.categoryModel.findOne({
            name: name,

        })
        if(existingCategory){
            throw new BadRequestException('Name already exists');
        }

        const newCategory = await this.categoryModel.create({
            name,
            
        })

        //devide folder category
        for(const cate of parent) {
            await this.categoryModel.findByIdAndUpdate(
                { _id: cate },
        {
          $push: { children: newCategory._id },
        },
        { new: true }, 
            )
        }
        return null
    }
}
