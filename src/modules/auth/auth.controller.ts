import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiProperty, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorations';
import { RolesGuard } from 'src/common/guard/roles.gaurd';
import { Role, User } from 'src/modules/users/schema/create-user.schema';
import { UsersService } from 'src/modules/users/users.service';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { UpdateUser } from '../users/dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/utils/uploadImage';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CacheService } from 'src/utils/cache.service';

@ApiTags('Auth')
@UseGuards(RolesGuard)
@Controller('auth')
@ApiSecurity('bearerAuth')
@ApiConsumes('multipart/form-data')

export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UsersService,
    ) {}

    @Public()
    @Post('login')
    @ApiOperation({description: 'Đăng nhập'})
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.loginIdentifier, loginDto.password);
  }


  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiProperty({
    description: 'Đăng xuất'
  })
  async logout(@Req() request: any) {
    return { message: 'Logout successful' };
  }



  @Public()
  @Post('forgot-passwordOTP')
  // @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  async forgotPasswordOTP(@Body('email') email: string) {
    return await this.userService.sendForgotPasswordOtp(email);
    
  }


  @Public()
  @Post('reset-passwordOTP')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        newPassword: {type: 'string', example: 'nhập mật khẩu mới vào'},
        otp: {type: 'number', example: 'nhập otp của bạn được gửi qua mail'}
      },
      required: ['email', 'newPassword', 'otp'],
    },
  })
  async resetPasswordOTP(@Body('email') email: string,@Body('newPassword') newPassword: string,@Body('otp') otp: string) {
    return await this.authService.resetPasswordOTP(email,otp,newPassword);
    // return {  };

  }


  
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Khi login xong thì trả về token và lấy token đó truyền vào '
  })
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user
  }

  @Roles([Role.Admin])
  @ApiOperation({summary: 'lấy hết user', description: 'Yêu cầu Admin'})
  @Get('users')
  getAll(){
    return this.userService.findAll()
  }
  @Roles(Roles[Role.Admin])
  @Get()
  getFilter(@Query('keyword') keyword:string){
    return this.userService.findWithFilter(keyword)
  }


  //delete USer
  @Roles([Role.Admin])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User delete' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Delete successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xóa' })
  @ApiOperation({summary: 'Xóa user', description: 'Yêu cầu Admin'})
  @Delete(':id')
  async deleteUser(@Param('id') id:string){
    return this.userService.deleteUser(id)
  }

  //blocked User
  @ApiOperation({ summary: 'User block' })
  @Patch(':userId/block-user')
  @Roles([Role.Admin])
  async blockUser(@Param('userId') userId: string){
    return this.userService.blockUser(userId)
  }

  //unblocked User
  @ApiOperation({ summary: 'User unblock' })
  @Patch(':userId/unblock-user')
  @Roles([Role.Admin])
  async unblockUser(@Param('userId') userId: string){
    return this.userService.unblockUser(userId)
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {type: 'string'},
        sex: {type: 'string'},
        birthday: {type: 'string'},
        phone: {type: 'string'},
        fullname: {type: 'string'},
        avatar: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiConsumes('multipart/form-data')
  //update user
  @ApiOperation({ summary: 'update User' })
  @UseInterceptors(FileInterceptor('avatar',multerOptions('avatar')))
  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUser, @UploadedFile() file: Express.Multer.File): Promise<User>{
    if(file){
      updateUserDto.avatar = `images/avatar/${file.filename}`
    }
    return this.userService.updateUser(req.user.id,updateUserDto)
  }



  // updateUserById
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {type: 'string'},
        sex: {type: 'string'},
        birthday: {type: 'string'},
        phone: {type: 'string'},
        fullname: {type: 'string'},
        avatar: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar',multerOptions('avatar')))
  @Patch('update/:userId')
  @Roles([Role.Admin])
  @ApiOperation({summary: 'Update user thông qua Role Admin'})
  async updateUserById(@Param('userId') userId: string, @Body() updateUserDto: UpdateUser, @UploadedFile() file: Express.Multer.File): Promise<User>{
    if(file){
      updateUserDto.avatar = `images/avatar/${file.filename}`
    }
    return this.userService.updateUserById(userId,updateUserDto)
  }


  @ApiOperation({summary: 'Khi người dùng đăng nhập thì mới được thay đổi mật khẩu, lấy token đăng nhập bỏ vào Beearer token'})
  // @ApiConsumes('multipart/form-data')
  // @ApiBody(
  //   {
  //     schema: {
  //       type: 'object',
  //       properties: {
  //         oldpassword: {type: 'string'},
  //         newpassword: {type: 'string'}
  //       }
  //     }
      
  //   }
  // )
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
  return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  
}
