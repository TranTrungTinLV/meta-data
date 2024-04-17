import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsValidEmail, trim } from 'src/common';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'sgod-info@gmail.com' })
  @Transform(({ value }) => trim(value))
  @IsValidEmail()
  email: string;
}
