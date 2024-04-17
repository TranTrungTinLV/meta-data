import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose, { Types } from 'mongoose';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    required: true,
  })
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category_parent_id?: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }])
  children: Types.ObjectId[];

  @ApiProperty({ required: false, type: mongoose.Schema.Types.String })
  @IsString()
  @IsOptional()
  icon_name?: string;
}
