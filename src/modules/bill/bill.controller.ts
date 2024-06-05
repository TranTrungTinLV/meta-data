import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BillService } from "./bill.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateBillDto, GetListBillDto, UpdateBillDto } from "./dto";
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

  @Post()
  async createBill(@Body() body: CreateBillDto, @Req() req: IRequestWithUser) {
    return await this.billService.createBill(body, req.user._id);
  }

  @Get()
  async getList(@Query() query: GetListBillDto, @Req() req: IRequestWithUser) {
    return await this.billService.getList(query, req.user._id);
  }

  @Patch(":id")
  async updateBill(
    @Param("id") id: string,
    @Body() body: UpdateBillDto,
    @Req() req: IRequestWithUser
  ) {
    return await this.billService.updateBill(id, body, req.user._id);
  }
}
