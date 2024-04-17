import { SetMetadata } from '@nestjs/common';
import { ETypeRole } from '../enums';


export const ROLES_KEY = 'roles';
export const Roles = (roles: ETypeRole[]) => SetMetadata(ROLES_KEY, roles);