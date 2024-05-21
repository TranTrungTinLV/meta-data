import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService, // Sử dụng UsersService
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneById(payload.sub); // Sửa đổi phương thức này
    if (!user) {
      return new UnauthorizedException('Login first to access this endpoint.');
    }
    if (user.isBlocked) {
      return new UnauthorizedException('Tài khoản này đã bị chặn');
    }
    return user;
  }
}
