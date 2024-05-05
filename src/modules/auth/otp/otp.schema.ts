import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
// token: string;
// email: string;
//   expiry: number;
//   isVerified: boolean;

export class Otp extends Document {
  @Prop({
    type: mongoose.Schema.Types.String,
  })
  email?: string;
  @Prop({
    type: mongoose.Schema.Types.Number,
  })
  expiry: number;

  @Prop({
    type: mongoose.Schema.Types.Boolean,
  })
  isVerified: boolean;
}
