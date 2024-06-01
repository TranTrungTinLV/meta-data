import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UploadCSVFileDto {
  @ApiProperty({
    example: {
      code: "A",
      category_id: "B",
      name: "C",
      detail: "D",
      specification: "E",
      standard: "F",
      unit: "G",
      other_names: "H",
      images: "I",
      note: "J",
    },
  })
  @IsOptional()
  index: any;

  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
