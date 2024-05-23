/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Category } from "./schema/category.schema";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>
  ) {}

  async create(category: CreateCategoryDto): Promise<Category> {
    let newCategory = new this.categoryModel(category);

    if (category.category_parent_id) {
      const parentCategory = await this.categoryModel.findById(
        category.category_parent_id
      );
      if (!parentCategory) {
        throw new BadRequestException("Parent category does not exist.");
      }

      const existingParentCategory = await this.categoryModel.findOne({
        children: newCategory._id,
      });
      if (existingParentCategory) {
        throw new BadRequestException(
          `Danh mục này đã là con của danh mục ${existingParentCategory.name}`
        );
      }
      // category.category_parent_id = category.category_parent_id;
      newCategory = await newCategory.save();

      // Thêm danh mục mới vào mảng children của danh mục cha và cập nhật danh mục cha
      parentCategory.children.push(newCategory._id);
      await parentCategory.save();

      return newCategory;
    } else {
      return await newCategory.save();
    }
  }

  async findAllWithProductCount(keyword?: string): Promise<Category[]> {
    let query = {};
    if (keyword) {
      query = {
        $match: {
          name: { $regex: keyword, $options: "i" },
        },
      };
    }

    const pipeline: any[] = [
      query,
      {
        $lookup: {
          from: "products", // Đảm bảo đây là tên chính xác của collection sản phẩm
          localField: "_id",
          foreignField: "category_id", // Trường trong sản phẩm chứa ID của danh mục
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
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
          products: 1, // Đảm bảo rằng mảng products được trả về
        },
      },
    ];

    if (!keyword) {
      pipeline.shift(); // Loại bỏ phần tử đầu tiên của mảng nếu không có từ khóa
    }

    return await this.categoryModel.aggregate(pipeline).exec();
  }

  async findAllWithDetails(): Promise<Category[]> {
    const categories = await this.categoryModel
      .find()
      .populate("products")
      .exec();

    //mỗi danh mục, truy vấn lấy sp của con và lấy luôn con
    for (let category of categories) {
      const children = await this.categoryModel.find({
        children: category._id,
      });
      console.log(children);
      // for (let child of children) {
      //   child.products = await this.categoryModel.populate(child, { path: 'products' })
      // }
      // category.children = children;
    }
    return;
  }

  async findProductsByCategory(categoryId: string): Promise<Category> {
    const category = await this.categoryModel.findById(categoryId);
    console.log(category);
    return category.populate(
      "products",
      "code name detail specification images"
    );
  }

  async updateCategory(
    categoryId: string,
    updateCategory: UpdateCategoryDto
  ): Promise<Category> {
    const category = await this.categoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Không tìm thấy ID ${category} để chỉnh sửa`);
    }
    Object.entries(updateCategory).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        category[key] = value;
      }
    });

    return category.save();
  }

  // async deleteCategory(id:string) {
  //   //check category exist?
  //   const category = await this.categoryModel.findById(id);
  //   if(!category) {
  //     throw new NotFoundException(`Không tìm thấy danh mục với ID ${id} để xóa.`);
  //   }

  //   //check category có chứa danh mục không?
  //   const hasProducts = await this.categoryModel.findOne({
  //     _id: id,
  //     products: {
  //       $exists: true, $not: { $size: 0 }
  //     }
  //   })
  //   if (hasProducts) {
  //     throw new BadRequestException(`Danh mục với ID ${id} chứa sản phẩm và không thể xóa.`);
  //   }

  //   //check danh mục con
  //   const hasChildren = await this.categoryModel.findOne({ children: id });
  //   if (hasChildren) {
  //     throw new BadRequestException(`Danh mục với ID ${id} chứa danh mục con và không thể xóa.`);
  //   }

  //   //được xoá nếu không tồn tại sản phẩm hoặc danh mục con
  //   const result = await this.categoryModel.deleteOne({ _id: id });
  //   if (result.deletedCount === 0) {
  //     throw new NotFoundException(`Không tìm thấy ${id} để xóa danh mục.`);
  //   } else {
  //     return { message: `Đã xóa danh mục với ID ${id}.` };
  //   }

  // }

  //API  để xóa danh mục
  async deleteCategory(id: string) {
    //check category exist?
    await this.deleteCategoryRecursively(id);
    return {
      message: `Đã xóa danh mục và tất cả danh mục con của danh mục với ID ${id}.`,
    };
  }

  async deleteCategoryRecursively(categoryId: string): Promise<void> {
    //Kiểm tra danh mục có tồn tại hay không?
    const category = await this.categoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundException(
        `Không tìm thấy danh mục với ID ${categoryId} để xóa.`
      );
    }

    //Kiểm tra sản phẩm trong danh mục
    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        `Danh mục với ID ${categoryId} có chứa sản phẩm và không thể xóa.`
      );
    }

    //kiểm tra danh mục con trong danh mục
    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        `Danh mục với ID ${categoryId} chứa danh mục con và không thể xóa.`
      );
    }

    //kiểm tra danh mục có chứa sản phẩm hay không
    const result = await this.categoryModel.deleteOne({ _id: categoryId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Không thể xóa danh mục với ID ${categoryId}`
      );
    }
    // return null;
  }

  async getAllCategoriesWithFull(): Promise<Category[]> {
    // Lấy tất cả danh mục gốc (các danh mục không có cha)
    const rootCategories = await this.categoryModel
      .find({ category_parent_id: { $exists: false } })
      .exec();

    // Xử lý đệ quy cho mỗi danh mục gốc để lấy toàn bộ cây danh mục
    const allCategories = await Promise.all(
      rootCategories.map((rootCategory) =>
        this.populateChildrenCategoryandProducts(rootCategory._id.toString())
      )
    );

    return allCategories;
  }

  async populateChildrenCategoryandProducts(id: string): Promise<Category> {
    if (!id) {
      console.error(
        "ID không được cung cấp cho populateChildrenCategoryandProducts."
      );
      throw new BadRequestException("ID không được cung cấp.");
    }
    console.log(`Bắt đầu truy vấn cho danh mục với id: ${id}`);
    const objectId = new mongoose.Types.ObjectId(id);

    const category = await this.categoryModel
      .findById(objectId)
      .populate("products");

    if (!category) {
      throw new BadRequestException(`Không tìm thấy danh mục với id ${id}`);
    }
    console.log(
      `Tìm thấy danh mục: ${category.name}, tiếp tục xử lý danh mục con`
    );

    // Thực hiện aggregate query để tính productCount và populate thông tin children
    const result = await this.categoryModel.aggregate([
      { $match: { _id: category._id } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category_id",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "category_parent_id",
          as: "childrenDetails",
        },
      },
      {
        $unwind: {
          path: "$childrenDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "childrenDetails._id",
          foreignField: "category_id",
          as: "childrenDetails.products",
        },
      },

      {
        $addFields: {
          "childrenDetails.productCount": {
            $size: "$childrenDetails.products",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          products: { $first: "$products" },
          productCount: { $first: "$productCount" },
          children: { $push: "$childrenDetails" },
          icon_name: { $first: "$icon_name" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
        },
      },
    ]);

    if (result.length > 0) {
      let aggregatedCategory = result[0];
      console.log("Đang xử lý danh mục:", aggregatedCategory);
      // for (let child of aggregatedCategory.children) {
      for (let i = 0; i < aggregatedCategory.children.length; i++) {
        if (aggregatedCategory.children[i]._id) {
          //đệ quy
          aggregatedCategory.children[i] =
            await this.populateChildrenCategoryandProducts(
              aggregatedCategory.children[i]._id.toString()
            );
        }
      }
      return aggregatedCategory;
    } else {
      throw new NotFoundException(
        `Không thể truy vấn thông tin chi tiết cho danh mục với id ${id}`
      );
    }
  }
}
