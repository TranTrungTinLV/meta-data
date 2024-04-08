import { Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: true
})

export class Category {}

export const CategorySchema = SchemaFactory.createForClass(Category)