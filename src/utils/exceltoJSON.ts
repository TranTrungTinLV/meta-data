import { HttpException, HttpStatus } from "@nestjs/common";
import excelToJson from "convert-excel-to-json";
import * as ExcelJS from 'exceljs'
import { existsSync, mkdirSync, writeFile } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { Product } from "src/modules/product/schema/create-product.schema";
import { v4 as uuid} from 'uuid'
import { promises as fsPromises } from 'fs';

const BASE_STORAGE_PATH = join(__dirname, 'storage');

export const multerImageOptions = {
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new HttpException(`Unsupported image file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
      }
    },
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const uploadPath = join(BASE_STORAGE_PATH, 'images'); // Thư mục cho hình ảnh
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req: any, file: any, cb: any) => {
        cb(null, `${uuid()}${extname(file.originalname)}`);
      }
    })
  };
  
  export const multerExcelOptions = {
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$/)) {
        cb(null, true);
      } else {
        cb(new HttpException(`Unsupported excel file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
      }
    },
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const uploadPath = join(BASE_STORAGE_PATH, 'excel'); // Thư mục cho file Excel
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req: any, file: any, cb: any) => {
        cb(null, `${uuid()}${extname(file.originalname)}`);
      }
    })
  };
  export async function saveImageFromCell(cell, rowNumber, categoryName) {
    // Giả định rằng cell.value chứa dữ liệu hình ảnh dạng base64
    const base64Data = cell.value;
    if (!base64Data) return null;
  
    const imageData = base64Data.split('base64,').pop();
  
    const imagePath = join(BASE_STORAGE_PATH, 'excel', 'images', categoryName, `image_${rowNumber}.png`);
    await fsPromises.writeFile(imagePath, imageData,'base64');
  
    return imagePath;
  }

  
export async function importExcel2Data(filePath:string) { 
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet('Sheet1') || workbook.worksheets[0];
    const imageMap = new Map();
    worksheet.getImages().forEach(image => {
        imageMap.set(image.range.tl.nativeRow, image);
    });
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
            const imageCell = row.getCell(9); // Điều chỉnh số cột phù hợp với cấu trúc file của bạn
            const imagePath = await saveImageFromCell(imageCell, rowNumber, categoryName);

            const product = new Product({
                code: row.getCell(1).value,
                category: categoryName,
                name: row.getCell(3).value,
                detail: row.getCell(4).value,
                specification: row.getCell(5).value,
                standard: row.getCell(6).value,
                unit: row.getCell(7).value,
                quantity: row.getCell(8).value,
                // images:imagePath  ? [imagePath] : [],
                note: row.getCell(10).value
            });
            try{
                await product;
                console.log(`Product ${product.name} saved successfully.`)
            }catch(error){
                console.error(`Error saving product: `, error);
            }
        }
    })
}