import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return true; // Cho phép truy cập nếu không có JWT
    }
    return super.canActivate(context); // Tiếp tục xác thực nếu có JWT
  }

  handleRequest(err, user, info, context) {
    return user; // Trả về người dùng nếu xác thực thành công, ngược lại trả về null
  }
}