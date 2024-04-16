import {
  Body,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorations';

import { RegisterService } from './register.service';
import { CreateRegistorDto } from './dtos/create-users.dto';

// import { rateLimitMiddleware } from 'src/utils/rating-limit';


@Public()
@Controller('register')
@ApiTags('Register')
export class RegistorController {
  constructor(private readonly registorService: RegisterService) {}

  // @UseInterceptors(rateLimitMiddleware)

  @Post('users')
  @ApiOperation({
    summary: 'đăng ký',
    description: 'Yêu cầu nhập đủ user và pass',
  })
  async registration(@Body() Registor: CreateRegistorDto) {
    console.log(`Registration of user '${Registor.username}' in progress.`);
    return await this.registorService.registerUser(Registor);
  }
}
