import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsersService } from '../../modules/users/users.service';
import { ROLES_KEY } from '../decators/roles.decorator';
import { Role } from '../../modules/users/interfaces/users.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Running RolesGuard');

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // Access allowed since no required roles have been specified in the controller
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
      // console.log(`${role} không có quyền`);
      throw new UnauthorizedException(`${role} không có quyền`);
    }
    return true;
  }
}
