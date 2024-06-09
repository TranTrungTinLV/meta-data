import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BillService } from "./bill.service";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  BulkDeleteBillDto,
  CreateBillDto,
  GetListBillDto,
  UpdateBillDto,
} from "./dto";
import { IRequestWithUser } from "../uploads/interfaces";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { RolesGuardV2 } from "src/common/guard/roles-guard-v2.guard";
import { GetListMetadataDto } from "../metadata/dto";

@ApiBearerAuth()
@ApiTags("bill")
@UseGuards(JwtAuthGuard, RolesGuardV2)
@Controller("bill")
export class BillController {
  constructor(private readonly billService: BillService) {}

  @ApiOperation({ summary: "create new bill", description: "create new bill" })
  @Post()
  async createBill(@Body() body: CreateBillDto, @Req() req: IRequestWithUser) {
    return await this.billService.createBill(body, req.user._id);
  }

  @ApiOperation({ summary: "bulk delete bills" })
  @Post("bulk-delete")
  async bulkDelete(
    @Body() body: BulkDeleteBillDto,
    @Req() req: IRequestWithUser
  ) {
    return await this.billService.bulkDelete(body, req.user._id);
  }

  @ApiOperation({ summary: "get list bill with page and limit" })
  @Get()
  async getList(@Query() query: GetListBillDto, @Req() req: IRequestWithUser) {
    return await this.billService.getList(query, req.user._id);
  }

  @ApiOperation({ summary: "get bill detail" })
  @Get(":id")
  async getDetail(@Param("id") id: string, @Req() req: IRequestWithUser) {
    return await this.billService.getBillDetail(id, req.user._id);
  }

  @ApiOperation({ summary: "update bill" })
  @Patch(":id")
  async updateBill(
    @Param("id") id: string,
    @Body() body: UpdateBillDto,
    @Req() req: IRequestWithUser
  ) {
    return await this.billService.updateBill(id, body, req.user._id);
  }

  @ApiOperation({ summary: "delete bill" })
  @Delete(":id")
  async deleteBill(@Param("id") id: string, @Req() req: IRequestWithUser) {
    return await this.billService.deleteBill(id, req.user._id);
  }
}
