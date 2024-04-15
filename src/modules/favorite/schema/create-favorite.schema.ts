import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { Product } from "src/modules/product/schema/create-product.schema";
import { User } from "src/modules/users/schema/create-user.schema";

@Schema({
    timestamps: true
})

export class Favorite {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    })
    user_id: User;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product',
    })
    product_id: Product[]

}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite)