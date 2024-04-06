import { HttpException, HttpStatus } from "@nestjs/common";
import excelToJson from "convert-excel-to-json";
import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuid} from 'uuid'


export const multerOptions = (folder: string) => {
    const destPath = `storage/images/${folder}`;
    console.log(destPath);
    return{
        fileFilter: (req: any, file: any, cb: any) => {
            if (file.mimetype.match(/\/(env)$/)) {
                cb(null, true);
            } else {
                // Reject file
                cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false); //file không được hỗ trợ
            }
        },

        storage:diskStorage({
            destination: (req: any, file: any, cb: any) => {
                const uploadPath = destPath;
                // Create folder if doesn't exist
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath);
                }
                cb(null, uploadPath);
            },
            filename: (req: any, file: any, cb: any) => {
                cb(null, `${uuid()}${extname(file.originalname)}`);
            }
        })
    }
}

export function importExcel2Data(filePath:string) { 
    const excelData =  excelToJson({
        sourceFile: filePath,
        sheets:[{
            name: 'Material',

            
            header: {
                rows: 1
            }
        }]
    })
    
}