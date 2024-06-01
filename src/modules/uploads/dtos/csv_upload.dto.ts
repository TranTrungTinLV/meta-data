import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UploadCSVFileDto {
  @ApiProperty({
    example: {
      ma_vat_tu: "A",
      danh_muc: "B",
      ten_vat_tu: "C",
      mo_ta: "D",
      quy_cach: "E",
      tieu_chuan: "F",
      dvt: "G",
      ten_khac: "H",
      anh: "I",
      ghi_chu: "J",
    },
  })
  @IsOptional()
  index: any;

  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
