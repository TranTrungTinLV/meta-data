/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  BulkDeleteMetadataDto,
  CreateMetadataDto,
  GetListMetadataDto,
  UpdateMetadataDto,
} from "./dto";
import { IRequestWithUser } from "../uploads/interfaces";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/common/utils/uploadImage";
import { Public } from "src/common/decorators/public.decorations";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "../users/interfaces/users.model";
import { RolesGuardV2 } from "src/common/guard/roles-guard-v2.guard";
import { EMetadataPermission, ERole } from "src/common/enums";
import { PermissionGuard } from "src/common/guard/permission.guard";
import { Permissions } from "src/common/decorators/permission.decorator";
import { Response } from "express";

@UseGuards(JwtAuthGuard, RolesGuardV2, PermissionGuard)
@ApiBearerAuth()
@ApiTags("metadata")
@Controller("metadata")
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @UseInterceptors(FilesInterceptor("images", 5, multerOptions("metadatas"))) //images
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ description: "require Admin", summary: "Add Metadata" })
  @Post()
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>, //images
    @Body() createProductDto: CreateMetadataDto,
    @Req() request: IRequestWithUser
  ) {
    console.log("files", files);
    const imagePath = files.map((file) => file.path);
    console.log(imagePath);
    console.log("imagePath", imagePath);
    createProductDto.images = files.map(
      (file) => `images/products/${file.filename}`
    );
    const username = request.user.username;
    return await this.metadataService.createMetadata(
      createProductDto,
      username
    );
  }

  @Get()
  async getAllMetadata(@Query() query: GetListMetadataDto) {
    return await this.metadataService.getListMetadata(query);
  }

  @UseInterceptors(FilesInterceptor("images", 5, multerOptions("metadatas"))) //images
  @ApiConsumes("multipart/form-data")
  @Patch(":id")
  async updateMetadata(
    @Body() body: UpdateMetadataDto,
    @Param("id") id: string
  ) {
    return await this.metadataService.uploadMetadata(id, body);
  }

  @Delete(":id")
  async deleteMetadata(@Param("id") id: string) {
    return await this.metadataService.deleteMetadata(id);
  }

  @Post("bulk-delete")
  async bulkDeleteMetadata(@Body() body: BulkDeleteMetadataDto) {
    return await this.metadataService.bulkDeleteMetadata(body);
  }

  @Get("test")
  async test(@Res() res: Response) {
    return res.json({ data: "hello-world" });
  }

  @Header("Content-Type", "text/xlsx")
  @Get("download-excel")
  async downloadExcel(@Res() res: Response) {
    const file = await this.metadataService.downloadExcel();
    return res
      .set("Content-Disposition", `attachment; filename=example.xlsx`)
      .send(file);
  }
}
