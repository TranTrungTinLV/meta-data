import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as paginate from "mongoose-paginate-v2";

export type FavouriteDocument = HydratedDocument<Favourite>;

@Schema({ timestamps: true })
export class Favourite {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Metadata" })
  metadata_id: string;
}

export const FavouriteSchema =
  SchemaFactory.createForClass(Favourite).plugin(paginate);
