import { ApiProperty } from "@nestjs/swagger";

export class ImportExcelDto {
  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
