import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FavoriteService } from './favourite.service';

@ApiTags('Favorite')
@Controller('Favorite')
export class FavoriteController {
  constructor(private readonly FavoriteService: FavoriteService) {}
}
