import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PHONE_REGEX } from "src/common/constant/phone.constant";
import { PASSWORD_REGEX } from "src/common/constant/password.constant";

export class CreateRegistorDto {
  @IsString()
  @IsOptional()
  readonly slug?: string;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  readonly username: string;

  @ApiProperty({ required: true, description: "Email" })
  @IsString()
  @IsOptional()
  readonly email?: string;

  @ApiProperty({ required: true })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  readonly sex: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly birthday: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  readonly level_member: string;

  @ApiProperty({
    required: false,
    example: "Full Name",
    description: "Tên đầy đủ",
    type: "FullName",
  })
  @IsOptional()
  @IsString()
  readonly fullname: string;

  @ApiProperty({
    required: false,
    type: "string",
    format: "binary",
    example: "avatar-url",
    description: "URL ảnh đại diện",
  })
  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  @IsOptional()
  readonly role: string;
}
