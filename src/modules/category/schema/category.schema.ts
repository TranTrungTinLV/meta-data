import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Product } from "src/modules/product/schema/create-product.schema";


export type CategoryDocument = HydratedDocument<Category>
@Schema({
    timestamps: true
})

export class Category {

    @Prop({})
    slug: string
    @Prop({type: mongoose.Schema.Types.String})
    name: string;

    @Prop([{type: mongoose.Schema.Types.ObjectId, ref: 'Categories'}])
    children: Types.ObjectId[];

    @Prop({type: [mongoose.Schema.Types.ObjectId], ref: 'Product'})
    products: Product[];
}

export const CategorySchema = SchemaFactory.createForClass(Category)