/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
// ** Libraries
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

// ** DI injections
import { UploadsService } from "./services/uploads.service";
import { UploadCSVFileDto } from "./dtos/csv_upload.dto";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { docUpload } from "./upload.doc";
import { multerOptions } from "./file_mimietype.filter";
import { Public } from "src/common/decorators/public.decorations";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { RolesGuardV2 } from "src/common/guard/roles-guard-v2.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { ERole } from "src/common/enums";
import * as XLSX from "xlsx";
import { ImportExcelDto } from "./dtos/import-excel.dto";
@ApiBearerAuth()
@ApiTags("Upload")
@UseGuards(JwtAuthGuard, RolesGuardV2)
@Controller("import")
export class UploadController {
  constructor(private readonly uploadService: UploadsService) {}

  @UseInterceptors(FileInterceptor("file", multerOptions()))
  @ApiOperation({
    summary: "imports excel to data",
    description: "required Admin",
  })
  @Roles(ERole.ADMIN)
  @Post("imports")
  @docUpload.uploadFile("Upload file")
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Body() body: UploadCSVFileDto
  ): Promise<any> {
    if (!file) throw new BadRequestException("File import is required");
    return this.uploadService.importFile(req, body, file);
  }

  @Roles(ERole.ADMIN)
  @Get("imports")
  @ApiOperation({
    summary: "get data from import",
    description: "required Admin",
  })
  @docUpload.getIndexExcel("Upload file")
  async getIndexExcel(@Req() req): Promise<any> {
    return [
      "code",
      "category_id",
      "name",
      "detail",
      "specification",
      "standard",
      "unit",
      "quantity",
      "images",
      "note",
    ];
  }

  @docUpload.exportToExcel("export data")
  @Get("export-data")
  async exportToExcel(@Res() res) {
    // Tạo dữ liệu mẫu
    const data = await this.uploadService.getAllMetadata();
    // Tạo workbook và worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Tạo file Excel và gửi về phía client
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=metadata.xlsx");
    res.send(buffer);
  }
}
