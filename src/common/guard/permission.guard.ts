/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { PERMISSION_KEY } from "../decorators/permission.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissionRequired = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!permissionRequired) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return permissionRequired.some((permission) =>
      user.permissions?.includes(permission)
    );
  }
}
