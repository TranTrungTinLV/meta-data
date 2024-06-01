/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Category, CategoryDocument } from "./schema/category.schema";
import mongoose, { Model, PaginateModel } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  BulkDeleteCategoryDto,
  CreateCategoryDto,
  GetListCategoryDto,
  UpdateCategoryDto,
} from "./dto";
import { GetPageLimitOffset } from "src/common/utils/paginate.util";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Category.name)
    private categoryModelPaginate: PaginateModel<CategoryDocument>
  ) {}

  async create(body: CreateCategoryDto) {
    try {
      let categoryParent = null;
      if (body.category_parent_id) {
        categoryParent = await this.categoryModel.findById(
          body.category_parent_id
        );
        if (!categoryParent)
          throw new NotFoundException("Category parent not found");
      }
      const category = await this.categoryModel.create(body);
      //** update children */
      if (categoryParent) {
        await this.categoryModel.findByIdAndUpdate(categoryParent._id, {
          $push: { category_children_id: category._id },
        });
      }
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getList(query: GetListCategoryDto) {
    try {
      const { page, limit, offset } = GetPageLimitOffset(query);
      const populate = this.populateChildrenCategory(5);
      const listCategory = await this.categoryModelPaginate.paginate(
        { category_parent_id: { $exists: false } },
        { page, limit, offset, populate }
      );
      return listCategory;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getById(id: string) {
    try {
      const populate = this.populateChildrenCategory(5);
      const category = await this.categoryModel.findById(id).populate(populate);
      if (!category) throw new BadRequestException("Category not found!");
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteById(id: string) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) throw new BadRequestException("Category not found!");
      //** delete all children */
      await this.categoryModel.deleteMany({ category_parent_id: category._id });
      await this.categoryModel.findByIdAndDelete(id);
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async bulkDelete(body: BulkDeleteCategoryDto) {
    try {
      await this.categoryModel.deleteMany({ _id: { $in: body } });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCategory(id: string, body: UpdateCategoryDto) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) throw new BadRequestException("Category not found!");
      if (body.category_parent_id) {
        const categoryParent = await this.categoryModel.findById(
          body.category_parent_id
        );
        if (!categoryParent)
          throw new BadRequestException("Category parent not found");
      }
      return await this.categoryModel.findByIdAndUpdate(
        category._id,
        {
          $set: { ...body },
        },
        { new: true }
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //** Helper function */

  populateChildrenCategory(depth: number) {
    return depth > 0
      ? [
          {
            path: "category_children_id",
            populate: this.populateChildrenCategory(depth - 1),
          },
        ]
      : [];
  }
}
