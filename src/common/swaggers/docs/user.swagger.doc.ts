import { GenerateApiSwagger } from 'src/common/decorators';
import { SwaggerMethod } from 'src/common/types';
import { AuthController } from 'src/modules/auth/auth.controller';

export const docUsers: SwaggerMethod<AuthController> = {
  register: (summary: string) =>
    GenerateApiSwagger(summary, { OK: 'Register account' }),
  login: (summary: string) => GenerateApiSwagger(summary, { OK: 'Login' }),
  logout: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Logout' },
      { isBearer: true, file: true },
    ),
  forgotPassword: (summary: string) =>
    GenerateApiSwagger(summary, { OK: 'Forgot password' }),
  resetPassword: (summary: string) =>
    GenerateApiSwagger(summary, { OK: 'Reset password' }),
  getProfile: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Get Profile' },
      { isBearer: true, file: true },
    ),
  getAll: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Get all user' },
      { isBearer: true, file: true },
    ),
  getFilter: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Get filter' },
      { isBearer: true, file: true },
    ),
  deleteUser: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Delete user' },
      { isBearer: true, file: true },
    ),
  blockUser: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Block user' },
      { isBearer: true, file: true },
    ),
  unblockUser: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Unlock user' },
      { isBearer: true, file: true },
    ),
  updateUser: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Update user' },
      { isBearer: true, file: true },
    ),
  updateUserById: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Update user by Id' },
      { isBearer: true, file: true },
    ),
  changePassword: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: 'Change password user' },
      { isBearer: true, file: true },
    ),
};
