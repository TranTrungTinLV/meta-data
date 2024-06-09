// response-time.middleware.ts
import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  logger = new Logger("TimeMiddleWare");
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl } = req;
    res.on("finish", () => {
      const responseTime = Date.now() - start;
      this.logger.log(
        `[${method}] ${originalUrl} - Response time: ${responseTime}ms`
      );
    });
    next();
  }
}
