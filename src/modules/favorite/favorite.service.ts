import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { CreateFavouriteDto, GetListFavouriteDto } from "./dtos";
import { InjectModel } from "@nestjs/mongoose";
import { Favourite, FavouriteDocument } from "./schema/favourite.schema";
import { Model, PaginateDocument, PaginateModel } from "mongoose";
import { Product, ProductDocument } from "../product/schema/product.schema";
import { GetPageLimitOffset } from "src/common/utils/paginate.util";

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favourite.name)
    private favouriteModel: Model<FavouriteDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Favourite.name)
    private favouriteModelPaginate: PaginateModel<FavouriteDocument>
  ) {}

  async create(userId: string, body: CreateFavouriteDto) {
    try {
      const product = await this.productModel.findById(body.product_id);
      if (!product) throw new BadRequestException("Product not found!");
      const favourite = await this.favouriteModel.create({
        user_id: userId,
        product_id: body.product_id,
      });
      return favourite;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteFavourite(id: string, userId: string) {
    try {
      const favourite = await this.favouriteModel.findById(id);
      if (!favourite) throw new BadRequestException("Favourite not found!");
      if (userId.toString() !== favourite.user_id.toString())
        throw new ForbiddenException("Delete must be owner!");
      return await this.favouriteModel.findByIdAndDelete(favourite._id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getListFavourite(query: GetListFavouriteDto, userId: string) {
    try {
      const { page, limit, offset } = GetPageLimitOffset(query);
      const listFavourite = await this.favouriteModelPaginate.paginate(
        { user_id: userId },
        {
          page,
          limit,
          offset,
          populate: [
            {
              path: "user_id",
              select: ["_id", "username", "email", "sex", "fullname"],
            },
            { path: "product_id" },
          ],
        }
      );
      return listFavourite;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
