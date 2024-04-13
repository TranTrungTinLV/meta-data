import { Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: true
})

export class Favourite {}

export const FavouriteSchema = SchemaFactory.createForClass(Favourite)