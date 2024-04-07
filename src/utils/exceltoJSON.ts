import { HttpException, HttpStatus } from "@nestjs/common";
import excelToJson from "convert-excel-to-json";
import * as ExcelJS from 'exceljs'
import { existsSync, mkdirSync, writeFile } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { Product } from "src/modules/product/schema/create-product.schema";
import { v4 as uuid} from 'uuid'
import { promises as fsPromises } from 'fs';
import { ProductService } from "src/modules/product/product.service";

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
  // export async function saveImageFromCell(data: any, rowNumber: number, categoryName: string): Promise<string | null> {
  //   if (!data) return null;

  // const cellValue = data.value;
  // if (!cellValue) return null;

  // const tempDir = join(BASE_STORAGE_PATH, 'temp');
  // if (!existsSync(tempDir)) {
  //   mkdirSync(tempDir, { recursive: true });
  // }

  // const tempFile = join(tempDir, `temp_${rowNumber}.png`);
  // await fsPromises.writeFile(tempFile, cellValue, 'base64');

  // const imageDir = join(BASE_STORAGE_PATH, 'images', categoryName);
  // if (!existsSync(imageDir)) {
  //   mkdirSync(imageDir, { recursive: true });
  // }

  // const imageName = `image_${rowNumber}.png`;
  // const imagePath = join(imageDir, imageName);

  // // Move the temporary file to the final destination
  // await fsPromises.rename(tempFile, imagePath);

  // return imageName;
  // }

  export async function saveImageFromCell(data: any, rowNumber: number, categoryName: string): Promise<string | null> {
    if (!data) return null;
  
    const cellValue = data.value;
    if (!cellValue) return null;
  
    const tempDir = join(BASE_STORAGE_PATH, 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
  
    const tempFile = join(tempDir, `temp_${rowNumber}.png`);
    await fsPromises.writeFile(tempFile, cellValue, 'base64url');
  
    const imageDir = join(BASE_STORAGE_PATH, 'images', categoryName);
    if (!existsSync(imageDir)) {
      mkdirSync(imageDir, { recursive: true });
    }
  
    const imageName = `image_${rowNumber}.png`;
    const imagePath = join(imageDir, imageName);
  
    // Move the temporary file to the final destination
    await fsPromises.writeFile(tempFile, imagePath);
  
    return imageName;
  }

  
export async function importExcel2Data(filePath:string,productService: ProductService) { 
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
            const category = row.getCell(3);
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
            // const image = imageMap.get(rowNumber); // Điều chỉnh số cột phù hợp với cấu trúc file của bạn
            // const image = imageMap.get(9);
            const imageCell = row.getCell(10).value; 
            // let imagePath = null;

            // const imageData = image.xxx;
            let imagePath = (await saveImageFromCell(imageCell, rowNumber, categoryName));
            console.log("imagePath",String(imagePath))


            const product = {
                code: String(row.getCell(2).value),
                category_id: String(categoryName),
                name: String(row.getCell(4).value),
                detail: String(row.getCell(5).value),
                specification: String(row.getCell(6).value),
                standard: String(row.getCell(7).value),
                unit: String(row.getCell(8).value),
                quantity: !isNaN(Number(row.getCell(9).value)) ? Number(row.getCell(9).value) : undefined,
                images: imagePath ? [imagePath] : ["khong co hinh"],
                note: String(row.getCell(11).value)
            };
            try{
                console.log(`Product ${product.name} saved successfully.`)
                return await productService.create(product);
            }catch(error){
                console.error(`Error saving product: `, error);
            }
        }
    })
}