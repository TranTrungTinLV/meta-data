import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, ValidateNested } from "class-validator";
import { CreateMetadataBillDto } from "src/modules/metadata-bill/dto";

export class CreateBillDto {
  @ApiProperty({ required: true, example: "CODE_001" })
  @IsString()
  bill_code: string;

  @ApiProperty({ required: true, example: "SGOD" })
  @IsString()
  organization: string;

  @ApiProperty({ required: true, example: "Bill 001" })
  @IsString()
  title: string;

  @ApiProperty({ required: true, example: 120987125 })
  @IsNumber()
  bill_number: number;

  @ApiProperty({ required: true, example: "NX2510" })
  @IsString()
  product: string;

  @ApiProperty({ required: true, example: "Điện tử" })
  @IsString()
  department: string;

  @ApiProperty({ required: true, example: "X51" })
  @IsString()
  factory: string;

  @ApiProperty({ required: true, example: "Tổ D" })
  @IsString()
  part: string;

  @ApiProperty({ required: true, example: "Sửa chữa ngành điện" })
  @IsString()
  bill_content: string;

  @ApiProperty({ required: true, example: "2024-05-31T02:48:53.981+00:00" })
  @IsString()
  date_begin: string;

  @ApiProperty({ required: true, example: "2024-06-03T02:48:53.981+00:00" })
  @IsString()
  date_end: string;

  @ApiProperty({
    required: true,
    example: [
      {
        metadata_id: "",
        quantity_estimates: 12,
        quantity_offer: 10,
        quantity_real: 10,
        note: "Note content",
        order_note: "OrderNote 001",
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateMetadataBillDto)
  metadatas: CreateMetadataBillDto[];

  @ApiProperty({ required: true, example: "2024-06-03T02:48:53.981+00:00" })
  @IsString()
  date_export: string;

  @ApiProperty({ required: true, example: "Nguyễn Đức Đức" })
  @IsString()
  technician: string;

  @ApiProperty({ required: true, example: "Nguyễn Đức Nam" })
  @IsString()
  manager: string;

  @ApiProperty({ required: true, example: "Nguyễn Đức Anh" })
  @IsString()
  vice_director: string;
}
