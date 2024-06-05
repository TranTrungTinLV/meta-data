/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { removeVietnameseDiacritics } from "src/common/utils/text.util";
import * as paginate from "mongoose-paginate-v2";

@Schema({
  timestamps: true,
})
export class Category {
  @Prop()
  name: string;

  @Prop()
  icon_name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Category" })
  category_parent_id: string;

  @Prop([
    { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: [] },
  ])
  category_children_id: string[];

  @Prop()
  search: string;
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema =
  SchemaFactory.createForClass(Category).plugin(paginate);
CategorySchema.pre<CategoryDocument>("save", function (next) {
  this.search = removeVietnameseDiacritics(`${this.name}`);
  next();
});
