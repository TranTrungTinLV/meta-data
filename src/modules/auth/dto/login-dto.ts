import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {


  @ApiProperty({ description: "Nhập username hoặc email",example: "user or email" })
  @IsString({message: 'username or email'})
  @IsNotEmpty()
  @IsOptional()
  readonly loginIdentifier: string;

  @ApiProperty({description: "Nhập password"})
  @IsNotEmpty()
  @IsString()
  readonly password: string;




}
