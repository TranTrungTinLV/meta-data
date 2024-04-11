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
        let newCategory = new this.categoryModel(category);

        if(category.category_parent_id){
            const parentCategory = await this.categoryModel.findById(category.category_parent_id);
            if (!parentCategory) {
                throw new BadRequestException('Parent category does not exist.');
            }


            const existingParentCategory = await this.categoryModel.findOne({children: newCategory._id});
            if(existingParentCategory) {
                throw new BadRequestException(`Danh mục này đã là con của danh mục ${existingParentCategory.name}`)
            }
            // category.category_parent_id = category.category_parent_id;
            newCategory = await newCategory.save();

            // Thêm danh mục mới vào mảng children của danh mục cha và cập nhật danh mục cha
            parentCategory.children.push(newCategory._id);
            await parentCategory.save();

            return newCategory;


        }else{
            return await newCategory.save();
        }
        //  newCategory = await this.categoryModel.create(category);
    }

    // async findCategoryWithSearch(keyword: string): Promise<Category[]> {
    //     if(!keyword){
    //         return this.categoryModel.find().exec();
    //     }
        
    //     return this.categoryModel.find({
    //         name: {
    //             $regex: keyword, $options: 'i'
    //         }
    //     }).populate('products','name detail')
    // }

    async findAllWithProductCount(keyword?:string): Promise<Category[]> {
      let query = {}
      if(keyword){
        query = {
          $match: {
            name: { $regex: keyword, $options: 'i' },
          },
        };
      }
  
      const pipeline: any[] = [query,
        {
          $lookup: {
          from: "products", // Đảm bảo đây là tên chính xác của collection sản phẩm
          localField: "name",
          foreignField: "category_id", // Trường trong sản phẩm chứa ID của danh mục
          as: "products"
          }
        },
        {
          $addFields: {
            productCount: { $size: "$products" }
          },
          
          
          
        },
        {
          $project: {
          _id: 1,
          name: 1,
          image: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          productCount: 1,
          products: 1 // Đảm bảo rằng mảng products được trả về
        }}
      ];
      
  
      if (!keyword) {
        pipeline.shift(); // Loại bỏ phần tử đầu tiên của mảng nếu không có từ khóa
      }
  
  
      return await this.categoryModel.aggregate(pipeline).exec();
  
    }


    
}
