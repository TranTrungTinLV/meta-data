import { HttpException, HttpStatus } from "@nestjs/common";
import excelToJson from "convert-excel-to-json";
import * as ExcelJS from 'exceljs'
import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { Product } from "src/modules/product/schema/create-product.schema";
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

export async function importExcel2Data(filePath:string) { 
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet('Sheet1') || workbook.worksheets[0];

    worksheet.eachRow({
        includeEmpty: true
    },async (row,rowNumber) => { //hàng và số hàng
        if(rowNumber > 1){ //Hàng đầu tiên là tiêu đề 
            const category = row.getCell(2);
            let categoryName = '';
            if (typeof category.value === 'string') {
                categoryName = category.value.trim();
            }

            if(categoryName){
                const categpryPath = join(__dirname,'storage',categoryName);
                if(!existsSync(categpryPath)){
                    mkdirSync(categpryPath,{recursive: true})
                }
            }

            const product = new Product({
                code: row.getCell(1).value,
                category: categoryName,
                name: row.getCell(3).value,
                detail: row.getCell(4).value,
                specification: row.getCell(5).value,
                standard: row.getCell(6).value,
                unit: row.getCell(7).value,
                quantity: row.getCell(8).value,
                note: row.getCell(9).value
            });
            try{
                await product.save();
                console.log(`Product ${product.name} saved successfully.`)
            }catch(error){
                console.error(`Error saving product: `, error);
            }
        }
    })
}