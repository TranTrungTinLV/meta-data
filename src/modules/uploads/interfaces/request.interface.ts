import { Request } from "express";

export interface IRequestWithUser extends Request {
  user: {
    _id: string;
    role: string;
    username: string;
    email: string;
  };
}
