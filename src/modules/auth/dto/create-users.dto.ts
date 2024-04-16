import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class CreateRegistorDto {
    @IsString()
    readonly slug:string
  
    @ApiProperty({ required: true,example: 'username', description: 'Tên người dùng'  })
    @IsNotEmpty()
    @IsString()
    readonly  username: string;
  
   
    // @ApiProperty({ required: false, description: 'Email' })
    @IsString()
  @IsOptional()
  readonly email?: string;
  
    @ApiProperty({ required: false,example: 'female or male', description: 'Giới tính', type: Boolean })
    @IsNotEmpty()
    @IsBoolean()
    readonly sex: string;
  
    @ApiProperty({ required: false,example: '08/06/2002', description: 'Ngày sinh' })
    @IsNotEmpty()
    @IsString()
    readonly birthday: string;
  
    @ApiProperty({ required: false,example: '0123456789', description: 'Số điện thoại' })
    @IsNotEmpty()
    @IsString()
    readonly phone: string;
  
    @IsString()
    readonly level_member: string;
  
    @ApiProperty({ required: false,example: 'Full Name', description: 'Tên đầy đủ' })
    @IsNotEmpty()
    @IsString()
    readonly fullname: string;
  
    @ApiProperty({ required: false,type: 'string', format: 'binary', example: 'avatar-url', description: 'URL ảnh đại diện'})
    @IsString()
    readonly avatar: string;
  
    @ApiProperty({
    required: true,    example: 'Password123!',
      description: 'Mật khẩu (ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số hoặc ký tự đặc biệt)',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'Passwork to weak',
    })
    readonly password: string;
  
    @IsString()
    @IsOptional()
    readonly role: string;
  }
  