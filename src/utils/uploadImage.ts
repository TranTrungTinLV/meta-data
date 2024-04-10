import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

// export const multerConfig = {
//     dest: `images/introductions`,

// };

// Multer upload options
export const multerOptions = (folder:string) => {
    const destPath = `storage/images/${folder}`;
console.log('Upload path:', destPath);

    return{
        limits: {
            fileSize: 4194304,
        },
        // Check the mimetypes to allow for upload
        fileFilter: (req: any, file: any, cb: any) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif|svg)$/)) {
                // Allow storage of file
                cb(null, true);
            } else {
                // Reject file
                cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false); //file không được hỗ trợ
            }
        },
        // Storage properties
        storage: diskStorage({
            // Destination storage path details
            destination: (req: any, file: any, cb: any) => {
                const uploadPath = destPath;
                // Create folder if doesn't exist
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath);
                }
                cb(null, uploadPath);
            },
            // File modification details
            filename: (req: any, file: any, cb: any) => {
                // Calling the callback passing the random name generated with the original extension name
                cb(null, `${uuid()}${extname(file.originalname)}`);
            },
        }),
    }
    // Enable file size limits
   
    
};