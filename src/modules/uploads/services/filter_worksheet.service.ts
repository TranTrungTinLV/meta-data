import * as xlsx from "xlsx";
import * as ExcelJS from "exceljs";
import { IObjectNumberType } from "src/common/interfaces";
import { DataItem } from "../interfaces";

/** Func find address cell */
export function getCellAddress(row: number, col: number): string {
  const cellAddress = xlsx.utils.encode_cell({ r: row, c: col });
  return cellAddress;
}

/** Func find address column */
export function getColAddress(col: number): string {
  const colAddress = xlsx.utils.encode_col(col);
  return colAddress;
}

/** Func index cols of worksheet */
/** A,B,C,D => 0,1,2,3 */
export function indexColsWorksheet(
  range: xlsx.Range,
): IObjectNumberType<string> {
  const result = {};
  for (let col = range.s.c; col <= range.e.c; col++) {
    const colAddress = xlsx.utils.encode_col(col);
    result[colAddress] = col;
  }
  return result;
}

/** Func get all value of cold in worksheet */
export async function getValueInCol(
  colName: string,
  worksheet: xlsx.WorkSheet,
  range: xlsx.Range,
  index: string[],
): Promise<string[]> {
  const result: string[] = [];
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = getCellAddress(row, parseInt(index[col]));
      const cell = worksheet[cellAddress];
      result.push(cell?.v);
    }
  }
  return result;
}

/**
 * Func convert images in excel to object with item is
 * - key: address cell
 * - value: array with item is object contain full data image
 */
export async function filterImageFromCSV(file) {
  const result = {};
  const workbookJS = new ExcelJS.Workbook();
  await workbookJS.xlsx.readFile(file.path);
  const worksheetJS = workbookJS.worksheets[0];
  for (const image of worksheetJS.getImages()) {
    let imagesMerge = [];
    const img = workbookJS.model.media.find(
      (m) => m["index"] === image.imageId,
    );
    const addressCell = getCellAddress(
      image.range.tl.nativeRow,
      image.range.tl.nativeCol,
    );
    const imagesExits = result[addressCell];
    if (imagesExits) {
      imagesMerge = imagesMerge.concat(imagesExits);
      imagesMerge = imagesMerge.concat([img]);
    } else {
      imagesMerge = [img];
    }
    result[addressCell] = imagesMerge;
  }
  return result;
}

export async function filterDuplicates(data: DataItem[]): Promise<DataItem[]> {
  const nameMap = new Map<string, DataItem>();
  const uniqueItems = new Map<string, DataItem>();
  data.forEach((item) => {
    if (!item.other_name) {
      // Nếu không có other_name, chỉ giữ mục đầu tiên với tên đó
      if (!nameMap.has(item.name)) {
        nameMap.set(item.name, item);
      }
    } else {
      // Nếu có other_name, giữ tất cả các mục có other_name khác nhau
      const key = `${item.name}_${item.other_name}`;
      if (!nameMap.has(key)) {
        nameMap.set(key, item);
      }
    }
  });

  return Array.from(nameMap.values());
}
