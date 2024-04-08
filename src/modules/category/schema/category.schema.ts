import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Product } from "src/modules/product/schema/create-product.schema";

@Schema({
    timestamps: true
})

export class Category {
    @Prop({unique: [true, 'it exists'], required: [true, "Vui lòng nhập tên danh mục"]})
    name: string;

    //Many to Many
    @Prop({type: [mongoose.Schema.Types.ObjectId], ref: 'Product'})
    category_parent_id: Product[];


    @Prop({type: mongoose.Schema.Types.String})
    icon_name?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category)