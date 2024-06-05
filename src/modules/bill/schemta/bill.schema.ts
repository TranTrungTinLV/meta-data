import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as paginate from "mongoose-paginate-v2";

export type BillDocument = HydratedDocument<Bill>;

@Schema({ timestamps: true })
export class Bill {
  @Prop({ type: mongoose.Schema.Types.String })
  user_id: string;

  @Prop({ type: mongoose.Schema.Types.String })
  bill_code: string;

  @Prop({ type: mongoose.Schema.Types.String })
  organization: string;

  @Prop({ type: mongoose.Schema.Types.String })
  title: string;

  @Prop({ type: mongoose.Schema.Types.Number })
  bill_number: number;

  @Prop({ type: mongoose.Schema.Types.String })
  product: string;

  @Prop({ type: mongoose.Schema.Types.String })
  department: string;

  @Prop({ type: mongoose.Schema.Types.String })
  factory: string;

  @Prop({ type: mongoose.Schema.Types.String })
  part: string;

  @Prop({ type: mongoose.Schema.Types.String })
  bill_content: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  date_begin: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  date_end: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: "MetadataBill" }])
  metadatas: string[];

  @Prop({ type: mongoose.Schema.Types.Date })
  date_export: string;

  @Prop({ type: mongoose.Schema.Types.String })
  technician: string;

  @Prop({ type: mongoose.Schema.Types.String })
  manager: string;

  @Prop({ type: mongoose.Schema.Types.String })
  vice_director: string;
}

export const BillSchema = SchemaFactory.createForClass(Bill).plugin(paginate);
