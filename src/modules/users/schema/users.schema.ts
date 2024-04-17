import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { ETypeRole } from 'src/common/enums';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({
    type: mongoose.Schema.Types.String,
    required: [true, 'Please enter userName'],
    unique: [true, 'duy nhất 1 username'],
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
    unique: [true, 'duy nhất 1 email'],
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
    enum: ETypeRole,
    default: ETypeRole.User,
  })
  role: ETypeRole;

  @Prop({
    type: String,
  })
  avatar: string;

  @Prop({ type: mongoose.Schema.Types.String })
  refreshToken: string;

  @Prop({ type: mongoose.Schema.Types.Boolean, default: false })
  isBlocked: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(this.password, salt);
  this.password = hashPassword;
  next();
});