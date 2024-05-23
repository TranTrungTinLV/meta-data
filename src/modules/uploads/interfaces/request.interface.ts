import { Request } from "express";

export interface IRequestWithUser extends Request {
  user: {
    sub: string;
    role: string;
    username: string;
    email: string;
  };
}
