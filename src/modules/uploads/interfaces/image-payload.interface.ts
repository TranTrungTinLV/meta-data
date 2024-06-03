import { Types } from "mongoose";
import * as xlsx from "xlsx";

export interface IImagePayload {
  idUser?: string | Types.ObjectId;
  idAsset?: string | Types.ObjectId;
  idCategory?: string | Types.ObjectId;
  idPaymentMethod?: string | Types.ObjectId;
  avatar?: string;
  dir: string;
  image?: string | string[];
  width?: number;
  height?: number;
}

export interface IImageBuffer {
  Buffer: Buffer;
  filename: string;
  mimetype: string;
}

export interface IPImport {
  workbook: xlsx.WorkBook;
  worksheet: xlsx.WorkSheet;
  range: xlsx.Range;
  fieldsOriginSubject: string[];
  colsWorksheet: string[];
  keysWorksheet: string[];
  imagesFromCSV: object;
  // data: DataItem[]
}

// update filter data
export interface DataItem {
  name: string;
  other_name?: string;
}
