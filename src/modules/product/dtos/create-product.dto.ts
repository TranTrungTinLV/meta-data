import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsString } from "class-validator";

export class CreateProductDto {
  @ApiProperty({ example: "" })
  @IsString()
  metadata_id: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 92000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: "Customer" })
  @IsString()
  position: string;

  @ApiProperty({ example: "2024-05-10T18:58:41.550+00:00" })
  @IsDateString()
  date_of_manufacture: string;

  @ApiProperty({ example: "2024-05-10T18:58:41.550+00:00" })
  @IsDateString()
  expired_date: string;

  @ApiProperty({ example: "Note here" })
  @IsString()
  note: string;
}
