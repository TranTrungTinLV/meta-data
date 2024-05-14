import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
// import { User } from 'src/users/schema/users.schema';
import { v4 } from 'uuid';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { ProductUnit } from '../enums/product.unit.enum';
@Schema({
  timestamps: true,
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
  // @Prop()
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

  @Prop({ type: [String], required: false })
  images: string[];

  @Prop({ type: mongoose.Schema.Types.String, required: false })
  note: string;

  @Prop({
    type: [mongoose.Schema.Types.String],
    required: [false],
  })
  alternativeName: string[];

  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    enum: Object.values(ProductUnit),
  })
  unit: ProductUnit;

  @Prop({ type: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' } })
  likedBy: Types.ObjectId[];
}

const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.plugin(mongoosePaginate);

export { ProductSchema };
