import { Body, Controller, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dtos/create-product.dto';
import { Public } from 'src/common/decorators/public.decorations';
import { FileInterceptor } from '@nestjs/platform-express';
import { importExcel2Data, multerExcelOptions } from 'src/utils/exceltoJSON';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerExcelOptions))
  async uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new HttpException('File is empty', HttpStatus.BAD_REQUEST);
    }
    const filePath = file.path; // lấy đường dẫn file đã được upload
    await importExcel2Data(filePath);
    return 'File has been uploaded and data is being processed.';
  }

}
