import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { error } from "console";
import * as bcrypt from "bcrypt";

import mongoose, { Model } from "mongoose";
import { MailerService } from "src/modules/mailer/mailer.service";
import { UsersService } from "src/modules/users/users.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

import { ChangePasswordDto } from "./dto/change-password.dto";
import { CacheService } from "src/common/utils/cache.service";
import { generateOtp, validateEmail } from "src/common/utils/checker.helper";
import { Role } from "../users/interfaces/users.model";
import {
  Admin,
  AdminDocument,
  AdminSchema,
} from "../users/schema/create-admin.schema";
import { ERole } from "src/common/enums";
import { User, UserDocument } from "../users/schema/create-user.schema";
import { ResetPasswordDto } from "./dto/reset-password.dto";

// import { CacheService } from 'src/modules/cache/cache.service';
// import * as redisStore from 'cache-manager-redis-store';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly cacheService: CacheService,
    @InjectQueue("send-mail")
    private readonly sendMail: Queue,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async login(loginIdentifier: string, pwd: string) {
    let user = null;
    const isEmailLogin = validateEmail(loginIdentifier);
    if (isEmailLogin) {
      user = await this.usersService.findOneByEmail(loginIdentifier);
    } else {
      user =
        await this.usersService.findOneWithEmailorUserName(loginIdentifier);
    }
    // Kiểm tra nếu không tìm thấy người dùng
    if (!user) {
      throw new UnauthorizedException("Tài khoản không tồn tại.");
    }

    // Kiểm tra nếu người dùng bị chặn
    if (user.isBlocked) {
      throw new UnauthorizedException("Tài khoản của bạn đã bị khoá.");
    }
    const isValid = await bcrypt.compare(pwd, user.password);

    if (!isValid) {
      throw new UnauthorizedException("thông tin đăng nhập không chính xác");
    }
    // The "sub" (subject) claim identifies the principal that is the subject of the JWT
    const payload = { sub: user._id, role: user.role, username: user.username };

    if (isEmailLogin) {
      payload["email"] = loginIdentifier;
      console.log(loginIdentifier);
    } else {
      payload["username"] = loginIdentifier;
    }

    const accessToken = this.jwtService.sign(payload, { expiresIn: "1d" }); // sau 5 phút đăng nhập lại
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" }); //trả về cái này đăng nhập trả về user

    user.refreshToken = refreshToken;
    await user.save(); // 7d sau tự cập nhật lại

    await this.usersService.updateRefreshToken(user._id, refreshToken);
    return {
      access_token: await accessToken,
      refresh_token: await refreshToken,
    };
  }

  async loginWithAdmin(loginAdminIndentifier: string, password: string) {
    const admin = await this.usersService.findOneWithEmailorUserNameAdmin(
      loginAdminIndentifier
    );
    console.log(admin);
    if (!admin) {
      throw new BadRequestException(`It not found Admin ${admin}`);
    }

    if (admin.role !== Role.Admin) {
      throw new UnauthorizedException(`Only admins can log in here`);
    }

    //Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    console.log("isValidPassword", isValidPassword);

    const otp = await generateOtp();
    console.log("otp admin", otp);
    await this.cacheService.get(`OTP:${admin.email}`);
  }

  async resetPasswordOTP(body: ResetPasswordDto) {
    let user = null;
    if (body.type === ERole.CUSTOMER || body.type === ERole.USER) {
      user = await this.userModel.findOne({ email: body.email });
    }
    if (body.type === ERole.ADMIN) {
      user = await this.userModel.findOne({ email: body.email });
    }
    if (!user) {
      throw new NotFoundException("User not found!");
    }
    // Lấy OTP từ cache hoặc cơ sở dữ liệu
    const storedOtp = await this.cacheService.get(`OTP:${body.email}`);
    // if(storedOtp && storedOtp === otp){
    //   await this.cacheService.del(email);
    //   throw new BadRequestException('OTP đã bị xoá');

    // }
    // console.log(storedOtp)
    // So sánh OTP
    if (body.otp !== storedOtp) {
      throw new BadRequestException("OTP is not valid!");
    }

    // Nếu OTP đúng, tiến hành thay đổi mật khẩu
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    user.password = hashedPassword;
    try {
      await user.save();
      return { message: "Change password success!" };
    } catch (error) {
      return new BadRequestException("Không thể thay đổi", error);
    }
  }

  //Thay đổi mật khẩu khi đăng nhập
  async changePassword(
    role: string,
    userId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<any> {
    let user = null;
    if (role === ERole.ADMIN) {
      user = await this.adminModel.findById(userId);
    }
    if (
      role === ERole.USER ||
      role === ERole.CUSTOMER ||
      role === ERole.STAFF
    ) {
      user = await this.userModel.findById(userId);
    }
    if (!changePasswordDto.oldpassword || !changePasswordDto.newpassword) {
      throw new BadRequestException("New password is not empty!");
    }

    const isValid = await bcrypt.compare(
      changePasswordDto.oldpassword,
      user.password
    );
    if (!isValid) {
      throw new UnauthorizedException("Old password not correct!");
    }

    const encryptNewPassword = await bcrypt.hash(
      changePasswordDto.newpassword,
      10
    );
    user.password = encryptNewPassword;
    await user.save();
    return { message: "Change password successfully!" };
  }
}
