import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { v4 } from 'uuid';
import { Role } from '../interfaces/users.model';

@Schema({ timestamps: true })
export class Admin {
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [true, 'Please enter userName'], // Correctly set as required
    unique: [true, 'Username must be unique'],
  })
  username?: string;
  @Prop({
    type: mongoose.Schema.Types.String,
    default: () => v4().split('-')[0],
  })
  slug: string;
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [true, 'Please enter password'],
  })
  password: string;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: [false],
    unique: [false, 'duy nhất 1 email'],
  })
  email?: string;
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [false, 'Please enter sex'],
  })
  sex: string;

  @Prop({
    type: mongoose.Schema.Types.Date,
    required: [false, 'Please enter birthday'],
  })
  birthday: Date;
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [false, 'Please enter numberPhone'],
  })
  phone: string;

  @Prop({
    type: mongoose.Schema.Types.String,
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Prop({
    type: String,
  })
  avatar: string;

  @Prop({
    type: mongoose.Schema.Types.String,
  })
  fullname: string;

  //One to Many

  @Prop({ type: mongoose.Schema.Types.String })
  refreshToken: string; //refreshtoken

  
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
