import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './users.schema';

@Schema({
  timestamps: true,
})
export class Email extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: User;

  @Prop({
    type: String,
    required: [true, 'Yêu cầu nhập email'],
  })
  email: string;

  @Prop({
    type: String,
    required: [false, 'Yêu cầu nhập username'],
  })
  username: string;

  @Prop({
    type: String,
    required: [false, 'Yêu cầu nhập role'],
  })
  role: string;

  @Prop({
    type: String,
    required: [true, 'Yêu cầu nhập OTP'],
  })
  otp: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createAt: Date;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
