import { HttpException, HttpStatus } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { existsSync, mkdirSync, writeFile } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import { promises as fsPromises } from 'fs';
import { ProductService } from 'src/modules/product/product.service';

import fs from 'fs';

const BASE_STORAGE_PATH = join(__dirname, 'storage');

export const multerImageOptions = {
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          `Unsupported image file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
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
    },
  }),
};

export const multerExcelOptions = {
  fileFilter: (req: any, file: any, cb: any) => {
    if (
      file.mimetype.match(
        /\/(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$/,
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          `Unsupported excel file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
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
    },
  }),
};

// export async function saveImageAsBase64(imageBuffer) {
//   // Generate a random filename for the image
//   const imageName = `${uuid()}.png`;
//   const imagePath = join(BASE_STORAGE_PATH, 'images', imageName);

//   // Save the image and convert to Base64
//   await fsPromises.writeFile(imagePath, imageBuffer);
//   return imageBuffer.toString('base64');
// }

export async function saveImageAsBase64(imageBuffer: Buffer): Promise<string> {
  // Tạo tên file ngẫu nhiên cho hình ảnh
  const imageName = `${uuid()}.png`;
  const imagePath = join(BASE_STORAGE_PATH, 'images', imageName);
  const imageDir = join(BASE_STORAGE_PATH, 'images');
  // await fsPromises.mkdir(imageDir, { recursive: true });
  try {
    await fsPromises.mkdir(imageDir, { recursive: true });
    await fsPromises.writeFile(imagePath, imageBuffer);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error saving image as Base64:', error);
    throw error; // Hoặc xử lý lỗi theo cách bạn muốn
  }
  // Lưu hình ảnh và chuyển đổi sang Base64
  // await fsPromises.writeFile(imagePath, imageBuffer);
  // return imageBuffer.toString('base64');
}

// const finished = promisify(stream.finished);
async function extractImagesFromWorkbook(
  workbook: ExcelJS.Workbook,
): Promise<{ [key: string]: string }> {
  const images: { [key: string]: string } = {};
  // Assuming there's a way to access images in the media collection in the workbook
  for (const media of workbook.model.media) {
    if (media.type === 'image') {
      // Ép kiểu media.buffer sang Buffer chuẩn của Node.js
      const buffer = Buffer.from(media.buffer as any);
      const base64Image = await saveImageAsBase64(buffer);
      images[media.name || uuid()] = base64Image;
    }
  }
  return images;
}

export async function bufferToBase64(buffer: Buffer): Promise<string> {
  return buffer.toString('base64');
}

export async function importExcel2Data(
  filePath: string,
  productService: ProductService,
) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const images = await extractImagesFromWorkbook(workbook);
  console.log('hình ảnh', images);
  const worksheet = workbook.getWorksheet('Sheet1') || workbook.worksheets[0];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    console.log(`Row ${rowNumber}:`, row.values);
    
    worksheet.eachRow(
      {
        includeEmpty: false,
      },
      async (row, rowNumber) => {
        //hàng và số hàng
        if (rowNumber > 1) {
          //Hàng đầu tiên là tiêu đề
          if (rowNumber === 1) return;

          const category = row.getCell(3);

          const categoryName = row.getCell(3).value?.toString().trim() || '';
          const imageCell = row.getCell(10);
          let imageAsBase64 = 'khong co hinh';
          const imageBuffer = images[rowNumber];

          if (
            imageBuffer && typeof imageBuffer === 'string' && imageBuffer.trim() !== ''
          ) {
            // Đã là chuỗi Base64, chỉ cần gán trực tiếp
            console.log('có hình ảnh');
            imageAsBase64 = imageBuffer;
            console.log('Added image for row ' + rowNumber);
          }
          //   if (imageBuffer && imageBuffer instanceof Buffer) {
          //     // Chỉ khi imageBuffer là một instance của Buffer mới thực hiện chuyển đổi
          //     imageAsBase64 = await saveImageAsBase64(imageBuffer);
          // }

          if (categoryName) {
            const categpryPath = join(__dirname, 'storage', categoryName);
            if (!existsSync(categpryPath)) {
              mkdirSync(categpryPath, { recursive: true });
            }
          }

          const product = {
            code: String(row.getCell(2).value),
            category_id: String(categoryName),
            name: String(row.getCell(4).value),
            detail: String(row.getCell(5).value),
            specification: String(row.getCell(6).value),
            standard: String(row.getCell(7).value),
            unit: String(row.getCell(8).value),
            quantity: !isNaN(Number(row.getCell(9).value))
              ? Number(row.getCell(9).value)
              : undefined,
            images:  imageAsBase64 !== 'khong co hinh' ? [imageAsBase64] : [],
            note: String(row.getCell(11).value),
          };
          if (images[rowNumber]) {
            try {
              // const imageAsBase64 = await saveImageAsBase64(images[rowNumber].t);
              if (imageAsBase64) {
                // product.images.push(imageAsBase64);
                // console.log(imageAsBase64,"hình nè")
                const base64Image = await bufferToBase64(imageBuffer as any);
                product.images.push(base64Image);
              }
            } catch (error) {
              console.error(
                `Error processing image for row ${rowNumber}:`,
                error,
              );
            }
          }
          try {
            console.log(`Product ${product.name} saved successfully.`);
            await productService.create(product);
          } catch (error) {
            console.error(`Error saving product: `, error);
          }
        }
      },
    );
  }
}
