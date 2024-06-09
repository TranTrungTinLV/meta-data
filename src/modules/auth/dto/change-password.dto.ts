import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly oldpassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly newpassword: string;
}
