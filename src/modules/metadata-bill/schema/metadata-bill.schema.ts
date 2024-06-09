import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type MetadataBillDocument = HydratedDocument<MetadataBill>;

@Schema({ timestamps: true })
export class MetadataBill {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Metadata" })
  metadata_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Bill" })
  bill_id: string;

  @Prop({ type: mongoose.Schema.Types.Number })
  quantity_estimates: number;

  @Prop({ type: mongoose.Schema.Types.Number })
  quantity_offer: number;

  @Prop({ type: mongoose.Schema.Types.Number })
  quantity_real: number;

  @Prop({ type: mongoose.Schema.Types.String })
  note: string;

  @Prop({ type: mongoose.Schema.Types.String })
  order_note: string;
}

export const MetadataBillSchema = SchemaFactory.createForClass(MetadataBill);
