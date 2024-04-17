import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches } from "class-validator";
import { IsValidEmail, trim } from "src/common";
import { isCodeVerify, isStrongPassword } from "src/common/constants";

export class ResetPasswordDto {
  @ApiProperty({ example: 'sgod-info@gmail.com' })
  @Transform(({ value }) => trim(value))
  @IsValidEmail()
  email: string;

  @ApiProperty({ example: 'Sgod123@' })
  @Transform(({ value }) => trim(value))
  @IsString()
  @Matches(isStrongPassword, {
    message:
      'Please choose a stronger password. Try a mix of upper or lowercase letters, numbers, and symbols (use 8 or more characters).',
  })
  password: string;

  @ApiProperty({ example: '123456' })
  @IsOptional()
  @Transform(({ value }) => trim(value))
  @Matches(isCodeVerify, {
    message: 'Otp must be 6 numbers',
  })
  otp: string;
}
