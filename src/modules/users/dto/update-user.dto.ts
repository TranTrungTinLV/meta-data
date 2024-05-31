/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from "class-validator";
import { PHONE_REGEX } from "src/common/constant/phone.constant";
export class UpdateUser {
  @ApiProperty({ description: "Nhập email", required: false })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ description: "Nhập giới tính true/false", required: false })
  @IsOptional()
  sex: "male" | "female";

  @ApiProperty({ description: "Nhập ngày sinh", required: false })
  @IsString()
  @IsOptional()
  birthday: Date;

  @ApiProperty({ description: "Nhập sdt", required: false, type: "string" })
  @ValidateIf((i) => i.phone !== undefined)
  @Matches(PHONE_REGEX, {
    message: "Invalid Number",
  })
  @IsOptional()
  phone: string;

  @ApiProperty({ description: "Nhập họ tên", required: false })
  @IsString()
  @IsOptional()
  fullname: string;

  @ApiProperty({
    description: "avatar",
    required: false,
    type: "string",
    format: "binary",
  })
  // @IsString()
  avatar: string;
}
