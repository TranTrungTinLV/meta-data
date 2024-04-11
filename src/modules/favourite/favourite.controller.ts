import { Controller } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Favourite')
@Controller('favourite')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}
}
