import { resolve } from 'path';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { formatImgPath } from '../utils';

const getPathDestination = (req: any): string => {
  const userInReq = req.user;

  let path = `${req.query?.folder}/${userInReq._id}/${req.query.type_upload}`;

  // if (req.query?.folder === EFolderUploadIcon.icons) {
  //   path += `/${req.query?.type_service}`;
  // }

  return `${process.env.DIR_UPLOADS}/${path}`;
};

const fileFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype.match(/\/(jpg|jpeg|png|gif)$/) ||
    file.mimetype == 'application/pdf' ||
    file.mimetype == 'image/svg+xml'
  ) {
    cb(null, true);
  } else {
    return cb(
      new BadRequestException(
        `Unsupported file type ${extname(file.originalname)}`,
      ),
      false,
    );
  }
};

const diskStorageFile = diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    if (
      req.method === 'POST' &&
      req.route?.path === '/upload-service/upload-icon' &&
      file.mimetype !== 'image/svg+xml'
    ) {
      return cb(
        new BadRequestException(` File upload must be in the .svg format.`),
        false,
      );
    }

    if (
      req.method === 'POST' &&
      req.route?.path === '/upload-service/upload-image' &&
      !file.mimetype.match(/\/(jpg|jpeg|png)$/)
    ) {
      return cb(
        new BadRequestException(
          ` File upload must be in the .jpeg or .png format.`,
        ),
        false,
      );
    }

    const path = getPathDestination(req);
    const rootPathDestination = resolve(__dirname, `../../../${path}`);

    if (!existsSync(`${rootPathDestination}`)) {
      mkdirSync(rootPathDestination, { recursive: true });
    }
    cb(null, path);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + formatImgPath(file.originalname));
  },
});

const limitSize = {
  fileSize: +(10 * 1024 * 1024),
};

export default function multerOptions() {
  return {
    // Check the mime types to allow for upload
    fileFilter: fileFilter,
    // Storage properties
    storage: diskStorageFile,
    // Enable file size limits
    limits: limitSize,
  };
}
