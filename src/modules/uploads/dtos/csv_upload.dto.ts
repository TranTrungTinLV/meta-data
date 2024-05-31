import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UploadCSVFileDto {
  @ApiProperty({
    example: {
      code: "B",
      category_id: "C",
      name: "D",
      detail: "E",
      specification: "F",
      standard: "G",
      unit: "H",
      images: "J",
    },
  })
  @IsOptional()
  index: any;

  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
