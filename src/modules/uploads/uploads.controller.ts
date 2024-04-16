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
} from '@nestjs/common';

// ** DI injections
import { UploadsService } from './services/uploads.service';
import { UploadCSVFileDto } from './dtos/csv_upload.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { docUpload } from './upload.doc';
import { multerOptions } from './file_mimietype.filter';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Upload')
@Controller('import')
export class UploadController {
  constructor(private readonly uploadService: UploadsService) {}

  @ApiSecurity('bearerAuth')
  @UseInterceptors(FileInterceptor('file', multerOptions()))
  @Post('imports')
  @UseGuards(AuthGuard('jwt'))
  @docUpload.uploadFile('Upload file')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Body() body: UploadCSVFileDto,
  ): Promise<any> {
    if (!file) throw new BadRequestException('File import is required');
    return this.uploadService.importFile(req, body, file);
  }

  @Get('imports')
  @ApiSecurity('bearerAuth')
  @docUpload.getIndexExcel('Upload file')
  async getIndexExcel(@Req() req): Promise<any> {
    return [
      'code',
      'category_id',
      'name',
      'detail',
      'specification',
      'standard',
      'unit',
      'quantity',
      'images',
      'note',
    ];
  }
}
