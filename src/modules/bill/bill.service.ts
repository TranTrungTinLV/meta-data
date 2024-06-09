import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import {
  BulkDeleteBillDto,
  CreateBillDto,
  GetListBillDto,
  UpdateBillDto,
} from "./dto";
import { InjectModel } from "@nestjs/mongoose";
import { Bill, BillDocument } from "./schemta/bill.schema";
import { FilterQuery, Model, PaginateModel } from "mongoose";
import {
  MetadataBill,
  MetadataBillDocument,
} from "../metadata-bill/schema/metadata-bill.schema";
import { Metadata, MetadataDocument } from "../metadata/schema/metadata.schema";
import { GetPageLimitOffset } from "src/common/utils/paginate.util";
import { CACHE_MANAGER, CacheStore } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { RedisStore } from "src/common/interfaces/redis.interface";
import { removeVietnameseDiacritics } from "src/common/utils/text.util";

@Injectable()
export class BillService {
  constructor(
    @InjectModel(Bill.name) private billModel: Model<BillDocument>,
    @InjectModel(Bill.name)
    private billModelPaginate: PaginateModel<BillDocument>,
    @InjectModel(MetadataBill.name)
    private metadataBillModel: Model<MetadataBillDocument>,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: RedisStore
  ) {}

  async createBill(body: CreateBillDto, userId: string) {
    try {
      const bill = await this.billModel.create({
        ...body,
        user_id: userId,
        metadatas: [],
      });
      const listMetadataBillId = await this.createMetadataBill(
        body.metadatas as any,
        bill._id as any
      );
      bill.metadatas = listMetadataBillId;
      await bill.save();
      return bill;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getList(query: GetListBillDto, userId: string) {
    try {
      const { page, limit, offset } = GetPageLimitOffset(query);
      const sort = query.sort ? { createdAt: +query.sort } : { createdAt: 1 };
      delete query.sort;
      let filterQuery: FilterQuery<BillDocument> = {};
      filterQuery.user_id = userId;
      if (query.search) {
        filterQuery.search = new RegExp(
          removeVietnameseDiacritics(query.search).toLocaleLowerCase()
        );
      }
      const listBill = await this.billModelPaginate.paginate(
        { ...filterQuery },
        {
          page,
          limit,
          offset,
          sort,
          populate: { path: "metadatas", populate: { path: "metadata_id" } },
        }
      );
      return listBill;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateBill(id: string, body: UpdateBillDto, userId: string) {
    try {
      const bill = await this.billModel.findById(id);
      let newListMetadataBillId = null;
      if (!bill) throw new BadRequestException("Bill not found!");
      //** check permission */
      if (userId.toString() !== bill.user_id.toString()) {
        throw new ForbiddenException("User must be owner!");
      }
      //** xóa những field không truyền */
      Object.keys(body).forEach((key) => {
        if (!body[key] || body[key] === "") delete body[key];
      });
      //** update metadata bill */
      if (body.metadatas) {
        newListMetadataBillId = await this.updateMetadataBill(
          id,
          body.metadatas
        );
        body.metadatas = newListMetadataBillId;
        //** xóa metadata bill cũ */
        await this.metadataBillModel.deleteMany({
          _id: { $nin: newListMetadataBillId },
        });
      }
      Object.keys(body).forEach((key) => {
        bill[key] = body[key];
      });
      //** update search filed */
      bill.search = removeVietnameseDiacritics(
        `${body.bill_number} ${body.product}`
      );
      await bill.save();

      return bill;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getBillDetail(id: string, userId: string) {
    try {
      const bill = await this.billModel
        .findById(id)
        .populate({ path: "metadatas", populate: { path: "metadata_id" } });
      if (!bill) throw new BadRequestException("Bill not found!");
      if (userId.toString() !== bill.user_id.toString())
        throw new ForbiddenException("User must be owner!");
      return bill;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteBill(id: string, userId: string) {
    try {
      const bill = await this.billModel.findById(id);
      if (!bill) throw new BadRequestException("Bill not found!");
      if (userId.toString() !== bill.user_id.toString())
        throw new ForbiddenException("User must be owner!");
      //** delete metadata-bill */
      const billDel = await this.billModel.findByIdAndDelete(id);
      await this.metadataBillModel.deleteMany({ _id: { $in: bill.metadatas } });
      return billDel;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async bulkDelete(body: BulkDeleteBillDto, userId: string) {
    try {
      //** check permission */
      const userBill = (
        await this.billModel.find({ _id: { $in: body.list_bill_id } })
      ).map((item) => item.user_id.toString());
      if (!userBill.includes(userId.toString())) {
        throw new ForbiddenException("User must be owner!");
      }
      await this.billModel.deleteMany({ _id: { $in: body.list_bill_id } });
      //** delete metadata bill */
      await this.metadataBillModel.deleteMany({
        bill_id: { $in: body.list_bill_id },
      });
      return "bulk delete success!";
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //** Helper function */
  async createMetadataBill(
    listMetadataBill: MetadataBillDocument[],
    billId: string
  ) {
    try {
      if (listMetadataBill.length === 0) return [];
      let listMetadataBillId = [];
      await Promise.all(
        listMetadataBill.map(async (metadataBill) => {
          const metadata = await this.metadataModel.findById(
            metadataBill.metadata_id
          );
          if (!metadata)
            throw new BadRequestException("Metadata id not found!");
          const newMetadataBill = await this.metadataBillModel.create({
            ...metadataBill,
            bill_id: billId,
          });
          listMetadataBillId.push(newMetadataBill._id);
        })
      );
      return listMetadataBillId;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateMetadataBill(billId: string, listMetadataBill: any[]) {
    let listMetadataBillId = [];
    const list = await this.metadataBillModel.find({ bill_id: billId });
    //** map qua nếu metadata-bill có rồi thì update metadata, ngược lại tạo metadata-bill mới */
    await Promise.all(
      listMetadataBill.map(async (item) => {
        const index = list.findIndex(
          (i) => i.metadata_id.toString() === item.metadata_id.toString()
        );
        if (index === -1) {
          const newMetadataBill = await this.metadataBillModel.create({
            ...item,
            bill_id: billId,
          });
          listMetadataBillId.push(newMetadataBill._id);
        } else {
          const metadataBillUpdate =
            await this.metadataBillModel.findOneAndUpdate(
              { bill_id: billId, metadata_id: item.metadata_id },
              {
                $set: {
                  ...item,
                },
              }
            );
          listMetadataBillId.push(metadataBillUpdate._id);
        }
      })
    );
    return listMetadataBillId;
  }
}
