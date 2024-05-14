import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

const fileFilter = (req: any, file: any, cb: any) => {
  cb(null, true);
};

const diskStorageFile = diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    const rootPathUploadDir = path.resolve(
      __dirname,
      `../../../${process.env.DIR_UPLOADS}/${process.env.SUB_DIR_UPLOADS}/products`,
    );

    if (!existsSync(`${rootPathUploadDir}`)) {
      mkdirSync(rootPathUploadDir, { recursive: true });
    }
    cb(null, rootPathUploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e5);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/ /g, '-'));
  },
});

const limitSize = {
  fileSize: +(100 * 1024 * 1024),
};

export function multerOptions() {
  return {
    // Check the mime types to allow for upload
    fileFilter: fileFilter,
    // Storage properties
    storage: diskStorageFile,
    // ** Enable file size limits
    limits: limitSize,
  };
}
