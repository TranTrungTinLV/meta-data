// ** Libraries
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

// ** DI injections
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import { UpdateUser } from '../users/dtos/update-user.dto';
import { multerOptions } from 'src/common/utils/uploadImage';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ETypeRole, Roles, RolesGuard } from 'src/common';
import { User } from '../users/schema/users.schema';
import { CreateRegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dtos';
import { docUsers } from 'src/common/swaggers/docs/user.swagger.doc';

@ApiTags('Auth')
@UseGuards(RolesGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('users')
  @docUsers.register('register user')
  async register(@Body() body: CreateRegisterDto) {
    return await this.authService.registerUser(body);
  }

  @Post('login')
  @docUsers.login('login user')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(
      body
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @docUsers.login('logout user')
  async logout(@Req() request: any) {
    return { message: 'Logout successful' };
  }

  @Post('forgot-password')
  @docUsers.forgotPassword('forgot password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.userService.sendForgotPasswordOtp(body.email);
  }

  @Post('reset-password')
  @docUsers.resetPassword('reset password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPasswordOTP(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @docUsers.getProfile('get profile')
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Roles([ETypeRole.Admin])
  @UseGuards(RolesGuard)
  @Get('users')
  @docUsers.getAll('get all user')
  getAll() {
    return this.userService.findAll();
  }

  @Roles(Roles[ETypeRole.Admin])
  @UseGuards(RolesGuard)
  @Get()
  @docUsers.getFilter('get user filter')
  getFilter(@Query('keyword') keyword: string) {
    return this.userService.findWithFilter(keyword);
  }

  @Roles([ETypeRole.Admin])
  @UseGuards(RolesGuard)
  @Delete(':id')
  @docUsers.deleteUser('delete user')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Roles([ETypeRole.Admin])
  @UseGuards(RolesGuard)
  @Patch(':userId/block-user')
  @docUsers.blockUser('block user')
  async blockUser(@Param('userId') userId: string) {
    return this.userService.blockUser(userId);
  }

  @Roles([ETypeRole.Admin])
  @UseGuards(RolesGuard)
  @Patch(':userId/unblock-user')
  @docUsers.unblockUser('unlock user')
  async unblockUser(@Param('userId') userId: string) {
    return this.userService.unblockUser(userId);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', multerOptions('avatar')))
  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  @docUsers.updateUser('update user')
  async updateUser(
    @Req() req,
    @Body() updateUserDto: UpdateUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    if (file) {
      updateUserDto.avatar = `images/avatar/${file.filename}`;
    }
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', multerOptions('avatar')))
  @Roles([ETypeRole.Admin])
  @UseGuards(RolesGuard)
  @Patch('update/:userId')
  @docUsers.updateUserById('update user by Id')
  async updateUserById(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    if (file) {
      updateUserDto.avatar = `images/avatar/${file.filename}`;
    }
    return this.userService.updateUserById(userId, updateUserDto);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @docUsers.changePassword('change password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
