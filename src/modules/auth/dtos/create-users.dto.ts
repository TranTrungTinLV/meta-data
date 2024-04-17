import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ESex, IsValidEmail, trim } from 'src/common';

export class CreateRegisterDto {
  @IsOptional()
  @IsString()
  readonly slug: string;

  @ApiProperty({
    required: true,
    example: 'username',
    description: 'Tên người dùng',
  })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsOptional()
  @ApiProperty({ example: 'sgod-info@gmail.com' })
  @Transform(({ value }) => trim(value))
  @IsValidEmail()
  readonly email?: string;

  @ApiProperty({
    required: false,
    example: 'female or male',
    description: 'Giới tính',
    type: Boolean,
  })
  @IsEnum(ESex)
  readonly sex: string;

  @ApiProperty({
    required: false,
    example: '08/06/2002',
    description: 'Ngày sinh',
  })
  @IsNotEmpty()
  @IsString()
  readonly birthday: string;

  @ApiProperty({
    required: false,
    example: '0123456789',
    description: 'Số điện thoại',
  })
  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @IsOptional()
  @IsString()
  readonly level_member: string;

  @ApiProperty({
    required: false,
    example: 'Full Name',
    description: 'Tên đầy đủ',
  })
  @IsNotEmpty()
  @IsString()
  readonly fullname: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'avatar-url',
    description: 'URL ảnh đại diện',
  })
  @IsString()
  readonly avatar: string;

  @ApiProperty({
    required: true,
    example: 'Password123!',
    description:
      'Mật khẩu (ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số hoặc ký tự đặc biệt)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Passwork to weak',
  })
  readonly password: string;

  readonly role: string;
}
  