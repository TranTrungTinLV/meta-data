import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Product } from "src/modules/product/schema/create-product.schema";


export type CategoryDocument = HydratedDocument<Category>
@Schema({
    timestamps: true
})

export class Category {
    
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({})
    slug: string;
    
    @Prop({type: mongoose.Schema.Types.String,unique: [true,"Danh mục này đã tồn tại"],required:[true,"Vui lòng nhập danh mục"]})
    name: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Category'})
    category_parent_id: Types.ObjectId;

    @Prop({type: [mongoose.Schema.Types.ObjectId], ref: 'Product'})
    products: Product[];

    @Prop([{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}])
    children: Types.ObjectId[];
    
    @Prop({type: mongoose.Schema.Types.String})
    icon_name: string;



}

export const CategorySchema = SchemaFactory.createForClass(Category)