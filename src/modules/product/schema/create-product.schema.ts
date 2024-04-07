import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
// import { User } from 'src/users/schema/users.schema';
import {v4} from 'uuid'

@Schema(
    {
        timestamps: true
    }
)

export class Product extends Document{
    @Prop(
        {
          type: mongoose.Schema.Types.String,
          required: true
        }
      )
      code: string; 

    @Prop(
      { 
         type: mongoose.Schema.Types.String,
         required: false
        }
    )
    category_id: string;

    @Prop(
        {
            type: mongoose.Schema.Types.String,
            required: true,
        }
    )
    name: string;

    @Prop({
        type: mongoose.Schema.Types.String,
        required: false
    })
    detail: string;

    @Prop({
        type: mongoose.Schema.Types.String,
        required: false
    })
    specification: string;

    @Prop(
        {
            type: mongoose.Schema.Types.String,
            required: false
        }
    )
    standard: string;

    @Prop(
        {
            type: mongoose.Schema.Types.String,
            required: false
        }
    )
    unit: string;

    @Prop(
        {
            type: mongoose.Schema.Types.Number,
            required: false
        }
    )
    quantity: number;

    @Prop({ type: [String], required: false })
    images: string[];
    
    @Prop({type: mongoose.Schema.Types.String,required: false})
    note: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
