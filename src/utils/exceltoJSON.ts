import { HttpException, HttpStatus } from "@nestjs/common";
import * as ExcelJS from 'exceljs'
import { existsSync, mkdirSync, writeFile } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
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
  




  export async function saveImageAsBase64(imageBuffer) {
    // Generate a random filename for the image
    const imageName = `${uuid()}.png`;
    const imagePath = join(BASE_STORAGE_PATH, 'images', imageName);
  
    // Save the image and convert to Base64
    await fsPromises.writeFile(imagePath, imageBuffer);
    return imageBuffer.toString('base64');
  }

  async function extractImagesFromWorkbook(workbook) {
    let images = {};
    // Assuming there's a way to access images in the media collection in the workbook
    workbook.model.media.forEach((media, index) => {
      if (media.type === 'image') {
        // The key can be a unique identifier, index can be used if imageId is not available
        images[index] = media.buffer;
      }
    });
    return images;
  }
  
export async function importExcel2Data(filePath:string,productService: ProductService) { 
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const images = await extractImagesFromWorkbook(workbook);
  const worksheet = workbook.getWorksheet('Sheet1') || workbook.worksheets[0];



   for(let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++){
    const row = worksheet.getRow(rowNumber);
    console.log(`Row ${rowNumber}:`, row.values);
    worksheet.eachRow({
      includeEmpty: false
  },async (row,rowNumber) => { //hàng và số hàng
      if(rowNumber > 1){ //Hàng đầu tiên là tiêu đề 
        if (rowNumber === 1) return;
        
          const category = row.getCell(3);
          
          const categoryName = row.getCell(3).value?.toString().trim() || '';
          const imageCell = row.getCell(10);
          let imageAsBase64 = "khong co hinh";
          const imageBuffer = images[rowNumber];
          if (imageBuffer) {
            imageAsBase64 = await saveImageAsBase64(imageBuffer);
          }
          // if (images[rowNumber]) {
          //   const imageBuffer = images[rowNumber];
          //   const savedImage = await saveImageBuffer(imageBuffer, rowNumber, categoryName);
          //   imageAsBase64 = savedImage.imageAsBase64;
          // }
          // if (typeof category.value === 'string') {
          //     categoryName = category.value.trim();
          // }

          if(categoryName){
              const categpryPath = join(__dirname,'storage',categoryName);
              if(!existsSync(categpryPath)){
                  mkdirSync(categpryPath,{recursive: true})
              }
          }
       
          // const imageCell = row.getCell(10); 
          // if (imageCell && imageCell.text && imageCell.hyperlink) {
          //   const imageBuffer = await fsPromises.readFile(imageCell.hyperlink)
          //   const {imageAsBase64,imagePath} = await saveImageBuffer(imageBuffer, rowNumber, categoryName);
          //   console.log("hahahaha",imageAsBase64);
          //   console.log(imagePath)
          //   return imageAsBase64;
          // }

          const product = {
              code: String(row.getCell(2).value),
              category_id: String(categoryName),
              name: String(row.getCell(4).value),
              detail: String(row.getCell(5).value),
              specification: String(row.getCell(6).value),
              standard: String(row.getCell(7).value),
              unit: String(row.getCell(8).value),
              quantity: !isNaN(Number(row.getCell(9).value)) ? Number(row.getCell(9).value) : undefined,
              images: [],
              note: String(row.getCell(11).value)
          };
          if (images[rowNumber]) {
            try {
              const imageAsBase64 = await saveImageAsBase64(images[rowNumber]);
              if (imageAsBase64) {
                product.images.push(imageAsBase64);
              }
            } catch (error) {
              console.error(`Error processing image for row ${rowNumber}:`, error);
            }
          }
          try{
              console.log(`Product ${product.name} saved successfully.`)
              return await productService.create(product);
          }catch(error){
              console.error(`Error saving product: `, error);
          }
      }
  })
   }
  }