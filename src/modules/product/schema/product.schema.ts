import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as paginate from "mongoose-paginate-v2";

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Metadata" })
  metadata_id: string;

  @Prop({ type: mongoose.Schema.Types.Number })
  quantity: number;

  @Prop({ type: mongoose.Schema.Types.Number })
  price: number;

  @Prop({ type: mongoose.Schema.Types.String })
  position: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  date_of_manufacture: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  expired_date: string;

  @Prop({ type: mongoose.Schema.Types.String })
  note: string;
}

export const ProductSchema =
  SchemaFactory.createForClass(Product).plugin(paginate);
