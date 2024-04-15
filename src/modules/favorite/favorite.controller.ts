import { Body, Controller, Param, Post, Req } from '@nestjs/common';
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
  @Roles([Role.User])
  addFavourite(
    @Req() request: any,
    @Param('product_id') product_id: string
  ) {
    const username = request.user.username;
    console.log(username)
    return this.favoriteService.addFavorite(username,product_id);
  }
}
