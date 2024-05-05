import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PHONE_REGEX } from 'src/common/constant/phone.constant';
import { PASSWORD_REGEX } from 'src/common/constant/password.constant';

export class CreateAdminDto {
  @ApiProperty({
    required: true,
    example: 'username',
    description: 'Tên người dùng',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' }) // Make sure it’s not empty
  readonly username: string;

  @ApiProperty({ required: true, description: 'Email' })
  @IsString()
  @IsNotEmpty()
  // @ApiProperty({ required: true,example: 'username', description: 'Email người dùng', type:'string'  })
  readonly email: string;

  @ApiProperty({
    required: false,
    example: 'female or male',
    description: 'Giới tính',
    type: 'boolean',
  })
  @IsOptional()
  readonly sex: string;

  @ApiProperty({
    required: false,
    example: '08/06/2002',
    description: 'Ngày sinh',
    type: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly birthday: string;

  @ApiProperty({
    required: false,
    example: '0123456789',
    description: 'Số điện thoại',
    type: 'string',
  })
  @ValidateIf((i) => i.phone !== undefined)
  @Matches(PHONE_REGEX, {
    message: 'Invalid phone number',
  })
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  readonly level_member: string;

  @ApiProperty({
    required: false,
    example: 'Full Name',
    description: 'Tên đầy đủ',
    type: 'FullName',
  })
  @IsOptional()
  @IsString()
  readonly fullname: string;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
    example: 'avatar-url',
    description: 'URL ảnh đại diện',
  })
  @IsString()
  @IsOptional()
  avatar: string;

  @ApiProperty({
    required: true,
    example: 'Password123!',
    description:
      'Mật khẩu (ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số hoặc ký tự đặc biệt)',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(PASSWORD_REGEX, {
    message: 'Passwork to weak',
  })
  readonly password: string;

  @IsString()
  @IsOptional()
  readonly role: string;

  
}
