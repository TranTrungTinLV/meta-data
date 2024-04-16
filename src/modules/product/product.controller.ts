import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dtos/create-product.dto';
import { Public } from 'src/common/decorators/public.decorations';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { importExcel2Data, multerExcelOptions } from 'src/common/utils/exceltoJSON';
import { Roles } from 'src/common/decators/roles.decorator';
// import { Role } from '../users/schema/create-user.schema';
import { Product } from './schema/create-product.schema';
import { multerOptions } from 'src/common/utils/uploadImage';
import { UpdateProductDto } from './dtos/update-product.dto';
import { RolesGuard } from 'src/common/guard/roles.gaurd';
import { PaginateResult } from 'mongoose';
import { FilterProductDto } from './dtos/filter-product.dto';

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

    const username = null;
    console.log(username);
   
    return await this.productService.create(createProductDto, username);
  }

  //sửa sản phẩm
  @Patch(':productId')
  // @Roles([Role.Admin,Role.Staff])

  @UseInterceptors(
    FileFieldsInterceptor([
    { name: 'newImages', maxCount: 5 },
  ], multerOptions('products')))
  @ApiConsumes('multipart/form-data')

  @Public()
  @ApiOperation({ summary: 'Cập nhật sản phẩm', description: 'Yêu cầu role: Staff hoặc Admin' })
  async updateProduct(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: { newImages?: Express.Multer.File[] }
  ){
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
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm', description: 'Có thể lọc theo tên, danh mục, phân trang' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Từ khóa tìm kiếm sản phẩm theo tên' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'ID danh mục để lọc sản phẩm' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng sản phẩm trên mỗi trang' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách sản phẩm', type: Product, isArray: true })
  async getAllProducts(@Query() filter: FilterProductDto) {
    return await this.productService.findAllProducts(filter);
  }
}
