import { Module } from "@nestjs/common";
import { BillService } from "./bill.service";
import { BillController } from "./bill.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Bill, BillSchema } from "./schemta/bill.schema";
import {
  MetadataBill,
  MetadataBillSchema,
} from "../metadata-bill/schema/metadata-bill.schema";
import { Metadata, MetadataSchema } from "../metadata/schema/metadata.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bill.name, schema: BillSchema },
      { name: MetadataBill.name, schema: MetadataBillSchema },
      { name: Metadata.name, schema: MetadataSchema },
    ]),
  ],
  controllers: [BillController],
  providers: [BillService],
})
export class BillModule {}
