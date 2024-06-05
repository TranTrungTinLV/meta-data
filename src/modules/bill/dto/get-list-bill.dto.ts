import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional } from "class-validator";

export class GetListBillDto {
  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  page: string;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  limit: string;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  offset: string;
}
