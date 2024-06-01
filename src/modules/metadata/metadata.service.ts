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
import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { searchElasticSearch } from "src/common/utils/elasticsearch.util";

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
  ) {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE,
      auth: {
        username: process.env.CLIENT_USERNAME,
        password: process.env.CLIENT_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  //************************   */
  async createMetadata(body: CreateMetadataDto, userId: string) {
    if (body.specification)
      body.specification = JSON.parse(body.specification.toString());
    if (body.standard) body.standard = JSON.parse(body.standard.toString());
    if (body.other_names)
      body.other_names = JSON.parse(body.other_names.toString());
    //** create metadata */
    await this.checkOtherName(body.name, body.other_names);
    const [category] = await Promise.all([
      this.categoryModel.findById(body.category_id),
    ]);
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
      owner: userId,
      search,
    });

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
    if (query.search) {
      console.log('elastic')
      const elasticSearchResults = await this.getElasticSearchResults(
        query.search
      );
      //if not in elastic it using search in mongodb 
      if(elasticSearchResults.length === 0){
        console.log('mongodb')
        return listMetadata;
      }
      return {
        ...listMetadata,
        docs: elasticSearchResults,
      };
    }
    return listMetadata;
  }

  private async getElasticSearchResults(query: string) {
    try{
      const body: SearchResponse<any> = await searchElasticSearch(
        this.client,
        EElasticIndex.NEW_PRODUCTS,
        query
      );
  
      if(body.hits.hits.length === 0) {
        return [];
      }
      const categoryIds = body.hits.hits.map((hit) =>
        hit._source.category_id.toString()
      );
      const categories = await this.categoryModel
        .find({
          _id: { $in: categoryIds },
        })
        .exec();
      const categoryMap = categories.reduce((acc, category) => {
        acc[category._id.toString()] = category;
        return acc;
      }, {});
      const results = body.hits.hits.map((hit) => {
        const source = hit._source;
        return {
          ...source,
          category_id: categoryMap[source.category_id.toString()],
        };
      });
      return results;
    } catch (error){
      if (error.meta && error.meta.body && error.meta.body.error.type === 'index_not_found_exception') {
        console.error('Elasticsearch index not found, fallback to MongoDB');
        return [];
      }
      throw error;
    }
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
    //** parse JSON */
    body = this.toJSON(body);
    const metadata = await this.metadataModel.findById(id);
    if (!metadata) throw new BadRequestException("Metadata not found!");
    Object.keys(body).forEach((key) => {
      if (body[key] !== "" && key !== "images") {
        metadata[key] = body[key];
      }
      if (key === "images") {
        //** giữ lại hình cũ */
        metadata.images = metadata.images.filter((img) =>
          body.old_images.includes(img)
        );
        //** thêm hình mới */
        metadata.images = [...metadata.images, ...body["images"]];
      }
    });
    //** update search field */
    const search = removeVietnameseDiacritics(
      `${metadata.name} ${metadata.other_names.join(" ")}`
    ).toLowerCase();
    metadata.search = search;
    await metadata.save();
    if (!metadata) throw new BadRequestException("Metadata not found!");
    return metadata;
  }

  async downloadExcel() {}

  async downloadPdf() {}

  //** HELPER FUNCTION */
  toJSON(body: UpdateMetadataDto) {
    if (body.specification)
      body.specification = JSON.parse(body.specification.toString());
    if (body.standard) body.standard = JSON.parse(body.standard.toString());
    if (body.other_names)
      body.other_names = JSON.parse(body.other_names.toString());
    if (body.old_images) {
      body.old_images = JSON.parse(body.old_images.toString());
    }
    return body;
  }
}
