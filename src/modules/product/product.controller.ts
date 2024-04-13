import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiConsumes, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dtos/create-product.dto';
import { Public } from 'src/common/decorators/public.decorations';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { importExcel2Data, multerExcelOptions } from 'src/utils/exceltoJSON';
import { Roles } from 'src/common/decators/roles.decorator';
// import { Role } from '../users/schema/create-user.schema';
import { Product } from './schema/create-product.schema';
import { multerOptions } from 'src/utils/uploadImage';
import { UpdateProductDto } from './dtos/update-product.dto';
import { RolesGuard } from 'src/common/guard/roles.gaurd';

@ApiSecurity('bearerAuth')
@ApiTags('Product')
@Controller('product')
@UseGuards(RolesGuard)

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerExcelOptions))
  async uploadFile(
    @UploadedFile() file,
    @Body('mapping') mapping: string // 'mapping' là một chuỗi JSON của mảng quy định
    ) {
    if (!file) {
      throw new HttpException('File is empty', HttpStatus.BAD_REQUEST);
    }
    const filePath = file.path; // lấy đường dẫn file đã được upload
    await importExcel2Data(filePath,this.productService,mapping);
    return 'File has been uploaded and data is being processed.';
  }


  // @Roles([Role.Admin])
  @Public()
  @UseInterceptors(
    FilesInterceptor('images',5,multerOptions('products')),
    ) //images
    @ApiConsumes('multipart/form-data')
    @ApiOperation({description:'Thêm sản phẩm'})

  @Post()
  async create( 
    @UploadedFiles() files: Array<Express.Multer.File>, //images
  @Body() createProductDto: CreateProductDto,
  @Req() request: any,): Promise<Product>{
    console.log('files',files)
    const imagePath = files.map(file => file.path)
    console.log(imagePath)
    console.log("imagePath",imagePath)
    createProductDto.images = files.map(file => `images/products/${file.filename}`)
    //images + products + images 
    console.log(createProductDto.images)
    const username = null;
    console.log(username);
   
    return await this.productService.create(createProductDto, username);
  }

  //sửa sản phẩm
  @Patch(':productId')
  @UseInterceptors(
    FilesInterceptor('newImages',5,multerOptions('products')),
    ) //images
  @ApiConsumes('multipart/form-data')

  // @Roles([Role.Admin,Role.Staff])
  @Public()
  @ApiOperation({ summary: 'Cập nhật sản phẩm', description: 'Yêu cầu role: Staff hoặc Admin' })
  async updateProduct(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: {newImages: Array<Express.Multer.File>},
  ){

    console.log('files',files)
    // const imagePath = files.map(file => file.path)
    // console.log(imagePath)
    // console.log("imagePath",imagePath)
    updateProductDto.newImages = files.newImages.map(file => `images/products/${file.filename}`)
   return this.productService.updateproduct(productId,updateProductDto,files.newImages)
  }



  //Xóa sản phẩm
  @Delete(':productId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Xóa thất bại' })
  // @Roles([Role.Admin,Role.Staff])
  @ApiOperation({ summary: 'Xoá Sản phẩm', description: 'Yêu cầu role: Staff hoặc Admin' })
  async deleteProduct(
    @Param('productId') productId:string
  ){
    return this.productService.deleteProduct(productId)
  }

  //Xóa nhiều sản phẩm
  @Delete()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Xóa thất bại' })
  @ApiOperation({ summary: 'Xoá nhiều sản phẩm', description: 'Yêu cầu role: Admin' })
  // @Roles([Role.Admin,Role.Staff])
  async deleteManyProducts(
    @Body() ids: string[]
  ): Promise<any> {
    return this.productService.deleteMany(ids)
  }


  //lấy sản phẩm
  @Get(':id')
  @Public()
  async getproductById(@Param('id') id: string): Promise<Product> {
    return this.productService.findByIdProduct(id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy hết sản phẩm', description: 'Yêu cầu role: Staff hoặc Admin, User' })
  async getAllProducts(@Query() filterProductDto: CreateProductDto): Promise<Product[]> {
    return this.productService.findAllProducts(filterProductDto.name);
  }
}
