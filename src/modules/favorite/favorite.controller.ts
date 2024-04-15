import { Controller, Param, Post, Req } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorations';
import { Roles } from 'src/common/decators/roles.decorator';
import { Role } from '../users/schema/create-user.schema';

@ApiTags('Favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('add')
  @Roles([Role.User])
  addFavourite(
    @Req() request: any,
    @Param('productId') productId: string
  ) {
    const username = request.user.username;
    console.log(username)
    return null;
  }
}
