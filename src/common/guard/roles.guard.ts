import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsersService } from '../../modules/users/users.service';
import { ROLES_KEY } from '../decorators';
import { ETypeRole } from '../enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ETypeRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    let foundUser;
    if (user?.username) {
      foundUser = await this.usersService.findOne(user.username);
    } else if (user?.email) {
      foundUser = await this.usersService.findOneByEmail(user.email);
    }

    const role = foundUser?.role;
    if (!requiredRoles.includes(role)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
