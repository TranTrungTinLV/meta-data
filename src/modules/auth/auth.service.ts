// ** Libraries
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

// ** DI injections
import { UsersService } from 'src/modules/users/users.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { RedisService } from 'src/shared/redis/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schema/users.schema';
import { Model } from 'mongoose';
import { CreateRegisterDto, LoginDto } from './dtos';
import { ConfigService } from '@nestjs/config';
import { isPasswordMatch } from 'src/common/utils';
@Injectable()
export class AuthService {
  constructor(
    // ** Models
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    // ** Services
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,

    // ** Redis
    @Inject(RedisService)
    private readonly cacheService: RedisService,
  ) {}

  async login(body: LoginDto) {
    const { loginIdentifier, password } = body;

    const isEmailLogin = this.usersService.validateEmail(loginIdentifier);

    const user = await this.userModel.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier },
        { phone: loginIdentifier },
      ],
    });
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại.');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khoá.');
    }

    if (!isPasswordMatch(password, user.password)) {
      throw new UnauthorizedException('thông tin đăng nhập không chính xác');
    }

    const payload = { sub: user._id, role: user.role };

    if (isEmailLogin) {
      payload['email'] = loginIdentifier;
    } else {
      payload['username'] = loginIdentifier;
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('EX_AT_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('EX_RT_SECRET'),
    });

    user.refreshToken = refreshToken;
    await user.save();

    await this.usersService.updateRefreshToken(user._id, refreshToken);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async resetPasswordOTP({
    email,
    password,
    otp,
  }: {
    email: string;
    password: string;
    otp: string;
  }) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Lấy OTP từ cache hoặc cơ sở dữ liệu
    const storedOtp = await this.cacheService.get(`OTP:${email}`);

    if (storedOtp && storedOtp === otp) {
      await this.cacheService.delJSON(email, '$');
      throw new BadRequestException('OTP đã bị xoá');
    }
    // console.log(storedOtp)
    // So sánh OTP
    if (otp !== storedOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Nếu OTP đúng, tiến hành thay đổi mật khẩu
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    user.password = hashedPassword;
    try {
      await user.save();
      return { message: 'Mật khẩu được thay đổi' };
    } catch (error) {
      return new BadRequestException('Không thể thay đổi', error);
    }
  }

  //Thay đổi mật khẩu khi đăng nhập
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    const user = await this.usersService.findOneById(userId);
    console.log(user);

    if (!changePasswordDto.oldpassword || !changePasswordDto.newpassword) {
      throw new BadRequestException(
        'Mật khẩu cũ hoặc mật khẩu mới không được rỗng',
      );
    }
    const encryptOldPassword = crypto
      .createHash('sha256')
      .update(changePasswordDto.oldpassword)
      .digest('hex');
    console.log(encryptOldPassword);
    if (user.password !== encryptOldPassword) {
      throw new UnauthorizedException('Mật khẩu cũ của bạn không chính xác');
    }

    const encryptNewPassword = crypto
      .createHash('sha256')
      .update(changePasswordDto.newpassword)
      .digest('hex');
    console.log(encryptNewPassword);
    user.password = encryptNewPassword;
    await user.save();
    return { message: 'Mật khẩu đã được thay đổi thành công.' };
  }

  async registerUser(signUpDto: CreateRegisterDto) {
    const { username, password, email, role, slug } = signUpDto;

    if (email && !this.validateEmail(email)) {
      throw new HttpException(
        'Email không hợp lệ hoặc không phải là địa chỉ Gmail',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (email) {
      const existingEmail = await this.userModel.findOne({ email: email });
      if (existingEmail) throw new ConflictException('Email already taken');
    }

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) throw new ConflictException('Username already taken');

    let user = new this.userModel({
      username,
      password,
      role,
      ...(email && { email }),
      slug,
    });

    user = await user.save();
    delete user['_doc'].password;
    return user;
  }

  validateEmail(email: string) {
    const regex = /^[\w-\.]+@gmail\.com$/;
    return regex.test(email);
  }
}
