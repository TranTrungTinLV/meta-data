import { Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Favorite {}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
