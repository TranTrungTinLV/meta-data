import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const multerOptions = (folder: string) => {
  const destPath = `storage/images/${folder}`;
  return {
    limits: {
      fileSize: 4194304,
    },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|svg)$/)) {
        cb(null, true);
      } else {
        cb(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
    },
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const uploadPath = destPath;
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
      },
      filename: (req: any, file: any, cb: any) => {
        cb(null, `${uuid()}${extname(file.originalname)}`);
      },
    }),
  };
};
