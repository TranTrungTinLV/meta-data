/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorations";
import { User } from "src/modules/users/schema/create-user.schema";
import { UsersService } from "src/modules/users/users.service";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login-dto";
import { UpdateUser } from "../users/dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/common/utils/uploadImage";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { CreateRegistorDto } from "./dto/create-users.dto";
import { CreateAdminDto } from "../users/dto/create-admin.dto";
import { Role } from "../users/interfaces/users.model";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { RolesGuardV2 } from "src/common/guard/roles-guard-v2.guard";
import { IRequestWithUser } from "../uploads/interfaces";
import { ERole } from "src/common/enums";
import { Roles } from "src/common/decorators/roles.decorator";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@ApiTags("Auth")
@UseGuards(JwtAuthGuard, RolesGuardV2)
@Controller("auth")
@ApiBearerAuth()
@ApiConsumes("multipart/form-data")
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UsersService
  ) {}

  @Public()
  @Post("login")
  @ApiOperation({ description: "Login", summary: "Login" })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: HttpStatus.OK, description: "Login successful" })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(
      loginDto.loginIdentifier,
      loginDto.password
    );
  }

  @Public()
  @Post("/register")
  @ApiOperation({ description: "Signup", summary: "Signup" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("avatar", multerOptions("avatar")))
  async registration(
    @Body() registerDto: CreateRegistorDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      registerDto.avatar = `images/avatar/${file.filename}`;
    }
    return await this.userService.registerUser(registerDto);
  }

  @Post("/admin")
  @Public()
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        username: { type: "string" },
        password: { type: "string" },
        email: { type: "string" },
        sex: { type: "string" },
        birthday: { type: "string" },
        phone: { type: "string" },
        fullname: { type: "string" },
        avatar: {
          type: "string",
          format: "binary",
        },
      },
      required: ["username", "password", "email"],
    },
  })
  @ApiOperation({ description: "Signup Admin", summary: "Signup Admin" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("avatar", multerOptions("avatar")))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User Signup Admin" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Signup Admin successful",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      createAdminDto.avatar = `images/avatar/${file.filename}`;
    }
    console.log(
      `Registration of user '${createAdminDto.username}' in progress.`
    );
    return this.userService.registerAdmin(createAdminDto);
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiProperty({
    description: "Đăng xuất",
  })
  async logout(@Req() request: any) {
    return { message: "Logout successful" };
  }

  @Public()
  @Post("forgot-passwordOTP")
  async forgotPasswordOTP(@Body() body: ForgotPasswordDto) {
    return await this.userService.sendForgotPasswordOtp(body);
  }

  @Public()
  @Post("reset-passwordOTP")
  async resetPasswordOTP(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPasswordOTP(body);
  }

  // @UseGuards(AuthGuard('jwt'))

  @ApiOperation({
    summary: "Khi login xong thì trả về token và lấy token đó truyền vào ",
  })
  @Get("profile")
  getProfile(@Req() req: any) {
    return {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      sex: req.user.sex,
      birthday: req.user.birthday,
      role: req.user.role,
      phone: req.user.phone,
      avatar: req.user.avatar,
      fullname: req.user.fullname,
    };
  }

  @ApiOperation({ summary: "lấy hết user", description: "Yêu cầu Admin" })
  @Roles(ERole.ADMIN)
  @Get("users")
  getAll() {
    return this.userService.findAll();
  }
  @Roles(ERole.ADMIN)
  @Get()
  getFilter(@Query("keyword") keyword: string) {
    return this.userService.findWithFilter(keyword);
  }

  //delete USer

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User delete" })
  @ApiResponse({ status: HttpStatus.OK, description: "Delete successful" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Lỗi xóa" })
  @ApiOperation({ summary: "Xóa user", description: "Yêu cầu Admin" })
  @Roles(ERole.ADMIN)
  @Delete(":id")
  async deleteUser(@Param("id") id: string) {
    return this.userService.deleteUser(id);
  }

  //blocked User
  @ApiOperation({ summary: "User block" })
  @Roles(ERole.ADMIN)
  @Patch(":userId/block-user")
  async blockUser(@Param("userId") userId: string) {
    return this.userService.blockUser(userId);
  }

  //unblocked User
  @ApiOperation({ summary: "User unblock" })
  @Patch(":userId/unblock-user")
  @Roles(ERole.ADMIN)
  async unblockUser(@Param("userId") userId: string) {
    return this.userService.unblockUser(userId);
  }

  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        sex: { type: "string" },
        birthday: { type: "string" },
        phone: { type: "string" },
        fullname: { type: "string" },
        avatar: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  //update user
  @ApiOperation({ summary: "update User" })
  @UseInterceptors(FileInterceptor("avatar", multerOptions("avatar")))
  @Patch("update")
  async updateUser(
    @Req() req: IRequestWithUser,
    @Body() updateUserDto: UpdateUser,
    @UploadedFile() file: Express.Multer.File
  ): Promise<User> {
    if (file) {
      updateUserDto.avatar = `images/avatar/${file.filename}`;
    }
    return await this.userService.updateUser(
      req.user._id,
      req.user.role,
      updateUserDto
    );
  }

  // updateUserById
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        sex: { type: "string" },
        birthday: { type: "string" },
        phone: { type: "string" },
        fullname: { type: "string" },
        avatar: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Update user thông qua Role Admin" })
  @Roles(ERole.ADMIN)
  @UseInterceptors(FileInterceptor("avatar", multerOptions("avatar")))
  @Patch("update/:userId")
  async updateUserById(
    @Param("userId") userId: string,
    @Body() updateUserDto: UpdateUser,
    @UploadedFile() file: Express.Multer.File
  ): Promise<User> {
    if (file) {
      updateUserDto.avatar = `images/avatar/${file.filename}`;
    }
    return this.userService.updateUserById(userId, updateUserDto);
  }

  @Post("change-password")
  async changePassword(
    @Req() req: IRequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(
      req.user.role,
      req.user._id,
      changePasswordDto
    );
  }
}
