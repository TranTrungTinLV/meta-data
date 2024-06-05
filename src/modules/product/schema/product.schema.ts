/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as paginate from "mongoose-paginate-v2";
import { removeVietnameseDiacritics } from "src/common/utils/text.util";

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

  @Prop({ type: mongoose.Schema.Types.String })
  search: string;
}

export const ProductSchema =
  SchemaFactory.createForClass(Product).plugin(paginate);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ProductSchema.pre("save", function (next) {
  this.search = removeVietnameseDiacritics(
    `${this.position} ${this.note} ${this.price} ${this.quantity}`
  ).toLocaleLowerCase();
  next();
});
