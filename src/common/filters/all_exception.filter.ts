import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as fs from 'fs';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const files = request.files;
    const filesFiled = request.files;

    // ** delete files when encountering intermediate errors
    request.file &&
      fs.existsSync(request.file.path) &&
      fs.rmSync(request.file.path, { force: true });
    files?.length &&
      files.map((file) => {
        fs.existsSync(file.path) && fs.rmSync(file.path);
      });
    filesFiled &&
      Object.keys(filesFiled)?.length &&
      Object.keys(filesFiled).map((key) => {
        filesFiled[key]?.length &&
          filesFiled[key].map((file) => {
            fs.existsSync(file.path) && fs.rmSync(file.path);
          });
      });
    files?.length &&
      files
        .map((file) => file.destination)
        .filter(
          (destination, i, destinations) =>
            destinations.indexOf(destination) === i && /id/.test(destination),
        )
        .map(
          (destination) =>
            fs.existsSync(destination) && fs.rmdirSync(destination),
        );

    this.logger.error(exception);
    super.catch(exception, host);
  }
}
