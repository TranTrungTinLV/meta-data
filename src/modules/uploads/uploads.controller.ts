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
import {
  ApiOperation,
  ApiProperty,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { docUpload } from './upload.doc';
import { multerOptions } from './file_mimietype.filter';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/decators/roles.decorator';
import { Role } from '../users/interfaces/users.model';
@ApiTags('Upload')
@Controller('import')
export class UploadController {
  constructor(private readonly uploadService: UploadsService) {}

  @ApiSecurity('bearerAuth')
  @UseInterceptors(FileInterceptor('file', multerOptions()))
  @ApiOperation({
    summary: 'imports excel to data',
    description: 'required Admin',
  })
  @Post('imports')
  // @UseGuards(AuthGuard('jwt'))
  @Roles([Role.Admin])
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
  @Roles([Role.Admin])
  @ApiSecurity('bearerAuth')
  @ApiOperation({
    summary: 'get data from import',
    description: 'required Admin',
  })
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
