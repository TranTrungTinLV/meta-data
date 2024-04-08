import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { v4 } from 'uuid';

export enum Role {
  User = 'customer',
  Admin = 'admin',
  Staff = 'staff',
}

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [true, 'Please enter userName'],
    unique: [true, "duy nhất 1 username"]
  })
  username?: string;
  @Prop(
    {
      type: mongoose.Schema.Types.String,
      default: () => v4().split('-')[0]
    }
  )
  slug: string;
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [true, 'Please enter password'],
  })
  password: string;
  
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [false],
    unique: [true, "duy nhất 1 email"],
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

  //One to Many




  @Prop({type: mongoose.Schema.Types.String})
  refreshToken: string //refreshtoken

  @Prop({type: mongoose.Schema.Types.Boolean, default: false})
  isBlocked: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);