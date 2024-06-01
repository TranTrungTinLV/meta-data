/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { CreateFavouriteDto, GetListFavouriteDto } from "./dtos";
import { InjectModel } from "@nestjs/mongoose";
import { Favourite, FavouriteDocument } from "./schema/favourite.schema";
import { Model, PaginateModel } from "mongoose";
import { Product, ProductDocument } from "../product/schema/product.schema";
import { GetPageLimitOffset } from "src/common/utils/paginate.util";
import { Metadata, MetadataDocument } from "../metadata/schema/metadata.schema";

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favourite.name)
    private favouriteModel: Model<FavouriteDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Favourite.name)
    private favouriteModelPaginate: PaginateModel<FavouriteDocument>,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>
  ) {}

  async create(userId: string, body: CreateFavouriteDto) {
    try {
      const [metadata, favouriteExists] = await Promise.all([
        this.metadataModel.findById(body.metadata_id),
        this.favouriteModel.findOne({
          user_id: userId,
          metadata_id: body.metadata_id,
        }),
      ]);
      if (!metadata) throw new BadRequestException("Metadata not found!");
      if (favouriteExists)
        throw new BadRequestException("Metadata existed in favourite!");
      const favourite = await this.favouriteModel.create({
        user_id: userId,
        metadata_id: body.metadata_id,
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
              path: "metadata_id",
              populate: {
                path: "category_id",
                populate: { path: "category_children_id" },
              },
            },
          ],
        }
      );
      return listFavourite;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
