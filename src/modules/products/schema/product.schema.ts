import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Product extends Document {
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
  })
  code: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  category_id: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
  })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: false,
  })
  detail: string;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: false,
  })
  specification: string;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: false,
  })
  standard: string;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: false,
  })
  unit: string;

  @Prop({
    type: mongoose.Schema.Types.Number,
    required: false,
  })
  quantity: number;

  @Prop({ type: [String], required: false })
  images: string[];

  @Prop({ type: mongoose.Schema.Types.String, required: false })
  note: string;
}

const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.plugin(mongoosePaginate);

export { ProductSchema };
