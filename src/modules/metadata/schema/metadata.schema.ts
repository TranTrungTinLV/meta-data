import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as paginate from "mongoose-paginate-v2";

export type MetadataDocument = HydratedDocument<Metadata>;

@Schema({ timestamps: true })
export class Metadata {
  @Prop()
  code: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Category" })
  category_id: string;

  @Prop()
  name: string;

  @Prop()
  detail: string;

  @Prop([{ type: mongoose.Schema.Types.String, default: [] }])
  specification: string[];

  @Prop([{ type: mongoose.Schema.Types.String, default: [] }])
  standard: string[];

  @Prop()
  unit: string;

  @Prop([{ type: mongoose.Schema.Types.String, default: [] }])
  other_names: string[];

  @Prop([{ type: mongoose.Schema.Types.String, default: [] }])
  images: string[];

  @Prop()
  search: string;
}

export const MetadataSchema =
  SchemaFactory.createForClass(Metadata).plugin(paginate);
