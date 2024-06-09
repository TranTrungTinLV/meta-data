/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FavoriteService } from "./favorite.service";
import { CreateFavouriteDto, GetListFavouriteDto } from "./dtos";
import { IRequestWithUser } from "../uploads/interfaces";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { RolesGuardV2 } from "src/common/guard/roles-guard-v2.guard";
import { Public } from "src/common/decorators/public.decorations";

@ApiTags("favourite")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuardV2)
@Controller("favourite")
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  async createFavourite(
    @Body() body: CreateFavouriteDto,
    @Req() req: IRequestWithUser
  ) {
    return await this.favoriteService.create(req.user._id, body);
  }

  @Get()
  async getListFavourite(
    @Query() query: GetListFavouriteDto,
    @Req() req: IRequestWithUser
  ) {
    return await this.favoriteService.getListFavourite(query, req.user._id);
  }

  @Delete(":id")
  async deleteFavourite(@Param("id") id: string, @Req() req: IRequestWithUser) {
    return await this.favoriteService.deleteFavourite(id, req.user._id);
  }
}
