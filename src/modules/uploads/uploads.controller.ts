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
  constructor(private readonly uploadService: UploadsService) { }

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
      "other_names",
      "images",
      "note",
    ];
  }

  @docUpload.getIndexExcel("import v2")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  @Post("import-v2")
  async importV2(@UploadedFile() file, @Body() body: ImportExcelDto) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return await this.uploadService.excelToMetadata(data);
  }
}
