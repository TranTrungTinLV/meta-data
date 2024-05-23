/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Client } from "@elastic/elasticsearch";
import { ConfigService } from "@nestjs/config";
import {
  BulkDeleteMetadataDto,
  CreateMetadataDto,
  GetListMetadataDto,
  UpdateMetadataDto,
} from "./dto";
import { InjectModel } from "@nestjs/mongoose";
import { Metadata, MetadataDocument } from "./schema/metadata.schema";
import { FilterQuery, Model, PaginateModel } from "mongoose";
import { User, UserDocument } from "../users/schema/create-user.schema";
import { Category, CategoryDocument } from "../category/schema/category.schema";
import { removeVietnameseDiacritics } from "src/common/utils/text.util";
import {
  GetPageLimitOffset,
  GetPageLimitOffsetSort,
} from "src/common/utils/paginate.util";
import { removeDuplicatesString } from "src/common/utils/array.util";
import { EElasticIndex } from "src/common/enums";
import { Workbook } from "exceljs";
import * as tmp from "tmp";
@Injectable()
export class MetadataService {
  private readonly client: Client;
  constructor(
    // private readonly elasticService: ElasticsearchService,
    private configService: ConfigService,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Metadata.name)
    private metadataModelPaginate: PaginateModel<MetadataDocument>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  //************************   */
  async createMetadata(body: CreateMetadataDto, username: string) {
    body.specification = JSON.parse(body.specification.toString());
    body.standard = JSON.parse(body.standard.toString());
    body.other_names = JSON.parse(body.other_names.toString());
    await this.checkOtherName(body.name, body.other_names);
    const [owner, category] = await Promise.all([
      this.userModel.findOne({ username }),
      this.categoryModel.findById(body.category_id),
    ]);
    if (!owner) throw new BadRequestException("User not exist!");
    if (!category) throw new BadRequestException("Category not found!");
    //** check product code and other names */
    const metadataExist = await this.metadataModel.findOne({
      code: body.code,
    });
    if (metadataExist)
      throw new BadRequestException("Metadata code already exists!");
    const search = removeVietnameseDiacritics(
      `${body.name} ${body.other_names.join(" ")}`
    ).toLowerCase();
    const newMetadata = await this.metadataModel.create({
      ...body,
      owner: owner._id,
      search,
    });
    //** handle elastic search */
    // const index = "newproduct";
    // const body = {
    //   settings: { number_of_shards: 1, number_of_replicas: 1 },
    //   mappings: {
    //     properties: {
    //       name: newProduct.name,
    //       code: newProduct.code,
    //       detail: newProduct.detail,
    //       images: newProduct.images,
    //     },
    //   },
    // };
    // const existsElastic = index
    //   ? await this.metadataService.indexExists(index)
    //   : await this.metadataService.createIndex(index, body);
    // console.log("existsElastic", existsElastic);
    // if (!existsElastic) {
    //   console.log("existsElastic", existsElastic);
    //   await this.metadataService.createIndex(index, body);
    // } else {
    //   console.log("existsElastic tồn tại");
    // }
    // //Elastic
    // this.metadataService.index(index, {
    //   id: String(newProduct._id),
    //   name: newProduct.name,
    //   code: newProduct.code,
    //   detail: newProduct.detail,
    //   image: newProduct.images,
    // });

    await this.categoryModel.findByIdAndUpdate(category._id, {
      $push: { products: (await newMetadata)._id },
    });
    return newMetadata;
  }

  async getListMetadata(query: GetListMetadataDto) {
    const { page, limit, offset } = GetPageLimitOffset(query);
    let filterQuery: FilterQuery<MetadataDocument> = {};
    if (query.search) {
      filterQuery.search = new RegExp(
        removeVietnameseDiacritics(query.search).toLocaleLowerCase()
      );
    }
    const listMetadata = await this.metadataModelPaginate.paginate(
      filterQuery,
      {
        page,
        limit,
        offset,
        sort: query.sort ? { createdAt: +query.sort } : { createdAt: 1 },
        populate: "category_id",
      }
    );
    return listMetadata;
  }

  async deleteMetadata(id: string) {
    const metadata = await this.metadataModel.findByIdAndDelete(id);
    if (!metadata) throw new BadRequestException("Metadata not found!");
    return metadata;
  }

  async bulkDeleteMetadata(body: BulkDeleteMetadataDto) {
    try {
      body.listMetadataId = removeDuplicatesString(body.listMetadataId);
      await Promise.all(
        body.listMetadataId.map((item) => {
          const metadata = this.metadataModel.findById(item);
          if (!metadata) throw new BadRequestException("Metadata not found!");
        })
      );
      await this.metadataModel.deleteMany({
        _id: { $in: body.listMetadataId },
      });
      return {
        statusCode: 200,
        message: "Delete metadata success!",
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  //** Helper function */
  async checkOtherName(name: string, ortherName: string[]) {
    const nameSearch = removeVietnameseDiacritics(name).toLowerCase();
    const otherNameSearch = removeVietnameseDiacritics(
      ortherName.join(" ")
    ).toLocaleLowerCase();
    const listMetadata = await this.metadataModel.find({
      $or: [
        { search: new RegExp(nameSearch) },
        { search: new RegExp(otherNameSearch) },
      ],
    });
    if (listMetadata.length > 0)
      throw new BadRequestException("Metadata already exist!");
  }

  async uploadMetadata(id: string, body: UpdateMetadataDto) {
    Object.keys(body).forEach((item) => {
      if (body[item] === "") delete body[item];
    });
    //** update search field */
    const metadata = await this.metadataModel.findByIdAndUpdate(
      id,
      { $set: { ...body } },
      { new: true }
    );
    const search = removeVietnameseDiacritics(
      `${metadata.name} ${metadata.other_names.join(" ")}`
    ).toLowerCase();
    metadata.search = search;
    await metadata.save();
    if (!metadata) throw new BadRequestException("Metadata not found!");
    return metadata;
  }

  async indexMetadata(metadata: MetadataDocument) {
    const res = await this.elasticsearchService.index<any>({
      index: EElasticIndex.METADATA,
      body: metadata,
    });
  }

  async downloadExcel() {
    
  }
}
