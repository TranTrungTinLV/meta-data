import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UploadCSVFileDto {
  @ApiProperty({
    example: {
      code: "A",
      category_id: "B",
      name: "C",
      // detail: "E",
      specification: "D",
      // standard: "G",
      unit: "E",
      // images: "J",
      // other_names: "L",
      note: "F",
    },
  })
  @IsOptional()
  index: any;

  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
