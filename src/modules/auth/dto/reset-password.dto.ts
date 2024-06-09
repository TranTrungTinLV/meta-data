import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ERole } from "src/common/enums";

export class ResetPasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  newPassword: string;

  @ApiProperty({ required: true })
  @IsString()
  otp: string;

  @ApiProperty({ required: true, enum: ERole })
  @IsString()
  type: string;
}
