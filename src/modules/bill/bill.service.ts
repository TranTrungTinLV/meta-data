import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateBillDto, GetListBillDto, UpdateBillDto } from "./dto";
import { InjectModel } from "@nestjs/mongoose";
import { Bill, BillDocument } from "./schemta/bill.schema";
import { Model, PaginateModel } from "mongoose";
import {
  MetadataBill,
  MetadataBillDocument,
} from "../metadata-bill/schema/metadata-bill.schema";
import { Metadata, MetadataDocument } from "../metadata/schema/metadata.schema";
import { GetPageLimitOffset } from "src/common/utils/paginate.util";

@Injectable()
export class BillService {
  constructor(
    @InjectModel(Bill.name) private billModel: Model<BillDocument>,
    @InjectModel(Bill.name)
    private billModelPaginate: PaginateModel<BillDocument>,
    @InjectModel(MetadataBill.name)
    private metadataBillModel: Model<MetadataBillDocument>,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>
  ) {}

  async createBill(body: CreateBillDto, userId: string) {
    try {
      const listMetadataBillId = await this.createMetadataBill(
        body.metadatas as any
      );
      const bill = await this.billModel.create({
        ...body,
        user_id: userId,
        metadatas: listMetadataBillId,
      });
      return bill;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getList(query: GetListBillDto, userId: string) {
    try {
      const { page, limit, offset } = GetPageLimitOffset(query);
      const listBill = await this.billModelPaginate.paginate(
        {},
        {
          page,
          limit,
          offset,
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
      Object.keys(body).forEach((key) => {
        if (!body[key] || body[key] === "") delete body[key];
      });
      //** update metadata bill */
      if (body.metadatas) {
        newListMetadataBillId = await this.updateMetadataBill(body.metadatas);
      }
      console.log(newListMetadataBillId);
      return await this.billModel.findByIdAndUpdate(
        id,
        { $set: { ...body, metadatas: newListMetadataBillId } },
        { new: true }
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //** Helper function */
  async createMetadataBill(listMetadataBill: MetadataBillDocument[]) {
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
          const newMetadataBill =
            await this.metadataBillModel.create(metadataBill);
          listMetadataBillId.push(newMetadataBill._id);
        })
      );
      return listMetadataBillId;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateMetadataBill(listMetadataBill: any[]) {
    let listMetadataBillId = [];
    await Promise.all(
      listMetadataBill.map(async (item) => {
        //** tìm kiếm với metadata id, nếu có thì update, chwua có thì tạo mới metadata bill */
        const metadataBill = await this.metadataBillModel.findOne({
          metadata_id: item.metadata_id,
        });
        if (!metadataBill) {
          const newMetadataBill = await this.metadataBillModel.create({
            ...item,
          });
          listMetadataBillId.push(newMetadataBill._id);
        }
        /** nếu đã có rồi thì update */
        await this.metadataBillModel.findByIdAndUpdate(metadataBill._id, {
          $set: { ...item },
        });
        listMetadataBillId.push(metadataBill._id);
      })
    );
    return listMetadataBillId;
  }
}
