import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorations';
import { Roles } from 'src/common/decators/roles.decorator';
import { Role } from '../users/schema/create-user.schema';
import { FavoriteDto } from './dtos/favourite.dto';

@ApiTags('Favorite')
@Controller('favorite')
@ApiSecurity('bearerAuth')
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService
    ) {}

  @Post('add/:product_id')
  @Roles([Role.User,Role.Admin])
  addFavorite(
    @Req() request: any,
    @Param('product_id') product_id: string
  ) {
    const username = request.user.username;
    console.log(username)
    return this.favoriteService.addFavorite(username,product_id);
  }

  @Delete('remove/:favorite_id')
  @Roles([Role.User,Role.Admin])
  removeFavorite(
    @Req() request: any,
    @Param('favorite_id') favorite_id: string
  ){
    const username = request.user.username;
    console.log(username)
    return this.favoriteService.unFavorite(username,favorite_id)
  }


  @Get()
  @Roles([Role.User,Role.Admin])
  getListFavoriteByUser(@Req() request: any,){
    const username = request.user.username;
    console.log(username)
    return this.favoriteService.listUserFavorite(username)
  }
}
