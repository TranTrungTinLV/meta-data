import { BadRequestException, Get, HttpStatus, Injectable, NotFoundException, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { error } from 'console';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import mongoose from 'mongoose';
import { MailerService } from 'src/modules/mailer/mailer.service';
import { UsersService } from 'src/modules/users/users.service';
import {InjectQueue} from '@nestjs/bull'
import {Queue} from 'bull'

import { ChangePasswordDto } from './dto/change-password.dto';
import { CacheService } from 'src/utils/cache.service';
// import { CacheService } from 'src/modules/cache/cache.service';
// import * as redisStore from 'cache-manager-redis-store';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly cacheService: CacheService,
    @InjectQueue('send-mail')
    private readonly sendMail: Queue
  ) {}

  async login(loginIdentifier: string, pwd: string) { //đăng nhập
    // const { email, password } = loginDto;

    // const user = await this.usersService.findOneWithPassword(username);
    // const user = await this.usersService.findOneWithEmailorUserName(loginIdentifier)
    let user;
    const isEmailLogin = this.usersService.validateEmail(loginIdentifier);

    if(isEmailLogin){
      user = await this.usersService.findOneByEmail(loginIdentifier);
    } else{
      user = await this.usersService.findOneWithEmailorUserName(loginIdentifier);
    }
    console.log(user)
    // Kiểm tra nếu không tìm thấy người dùng
  if (!user) {
    throw new UnauthorizedException('Tài khoản không tồn tại.');
  }

  // Kiểm tra nếu người dùng bị chặn
  if (user.isBlocked) {
    throw new UnauthorizedException('Tài khoản của bạn đã bị khoá.');
  }
    const encryptedPassword = crypto
      .createHash('sha256')
      .update(pwd)
      .digest('hex');

    if (user?.password !== encryptedPassword) {
      throw new UnauthorizedException("thông tin đăng nhập không chính xác");
    }
    // The "sub" (subject) claim identifies the principal that is the subject of the JWT
    const payload = { sub: user._id, role: user.role };

    if (isEmailLogin) {
      payload['email'] = loginIdentifier;
    } else {
      payload['username'] = loginIdentifier;
    }

    const accessToken = this.jwtService.sign(payload,{expiresIn: '1d'}) // sau 5 phút đăng nhập lại
    const refreshToken = this.jwtService.sign(payload,{expiresIn: '7d'}) //trả về cái này đăng nhập trả về user

    user.refreshToken = refreshToken;
    await user.save(); // 7d sau tự cập nhật lại

    await this.usersService.updateRefreshToken(user._id,refreshToken)
    return {
      access_token: await accessToken,
      // refresh_token: await refreshToken
    };
  }


  


async resetPasswordOTP(email: string, otp: string, newPassword: string) {
  const user = await this.usersService.findOneByEmail(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  console.log(user)
// Lấy OTP từ cache hoặc cơ sở dữ liệu
  const storedOtp = await this.cacheService.get(`OTP:${email}`);


  if(storedOtp && storedOtp === otp){
    await this.cacheService.del(email);
    throw new BadRequestException('OTP đã bị xoá');

  }
  // console.log(storedOtp)
  // So sánh OTP
  if (otp !== storedOtp) {
    throw new BadRequestException('Invalid OTP');
  }

  // Nếu OTP đúng, tiến hành thay đổi mật khẩu
  const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
  user.password = hashedPassword;
  try{
    await user.save()
  return {message: "Mật khẩu được thay đổi"};
  }catch(error){
    return new BadRequestException('Không thể thay đổi',error)
  }

}

// async sendOTP(email: string) {
//   const config = await Math.floor(100000 + Math.random() * 900000).toString();
//   const otpExpires = new Date(Date.now() + 10 * 60000);
//   await this.saveOTP(email, otp, otpExpires);

//   return config;
 
  
// }


//Thay đổi mật khẩu khi đăng nhập
async changePassword(userId: string, changePasswordDto: ChangePasswordDto):Promise<any>{
  const user = await this.usersService.findOneById(userId)
  console.log(user)

  if (!changePasswordDto.oldpassword || !changePasswordDto.newpassword) {
    throw new BadRequestException('Mật khẩu cũ hoặc mật khẩu mới không được rỗng');
  }
  const encryptOldPassword = crypto.createHash('sha256').update(changePasswordDto.oldpassword).digest('hex');
  console.log(encryptOldPassword)
  if(user.password !== encryptOldPassword) {
    throw new UnauthorizedException('Mật khẩu cũ của bạn không chính xác')
  }

  const encryptNewPassword = crypto.createHash('sha256').update(changePasswordDto.newpassword).digest('hex');
  console.log(encryptNewPassword);
  user.password = encryptNewPassword;
  await user.save()
  return { message: 'Mật khẩu đã được thay đổi thành công.' };
}
}