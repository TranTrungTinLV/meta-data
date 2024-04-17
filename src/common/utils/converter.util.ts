import * as _ from 'lodash';
import mongoose, { Types } from 'mongoose';
import moment from 'moment';
import { IFileImage, IFilesImage, IFullName } from '../interfaces';
import { Grouped } from '../types';
import { resizeImage } from './transfer.helper';
import { dimension } from '../constants';

export function capitalize(text: string): string {
  return text.length > 0 ? text[0].toUpperCase() + text.slice(1) : text;
}

export function toFile(filename: string, elements = filename.split(/\./)) {
  return {
    name: filename.slice(
      0,
      filename.length - elements[elements.length - 1].length - 1,
    ),
    formatImgPath,
    extension: filename.slice(
      filename.length - elements[elements.length - 1].length - 1,
    ),
  };
}

/**
 * Func filters special characters in the path and converts to -
 *
 * @param urlImage
 * @returns
 */
export function formatImgPath(urlImage: string): string {
  let imgPath = urlImage.trim();
  if (imgPath.includes('\\') || imgPath.includes('/')) {
    imgPath = urlImage
      .replace(/\\/g, '/')
      .split('/')
      [imgPath.length - 1].replace(/\s/g, '-');
  }
  return imgPath;
}

/**
 * Func random character to generate prefix for image
 *
 * @param originalname
 * @returns
 */
export function ranDomImagePath(originalname: string): string {
  const firstDashIndex = originalname.indexOf('-');
  const prefix = originalname.substring(0, firstDashIndex + 1);
  const randomSuffix = Math.round(Math.random() * 1e5);
  const replacedString =
    prefix + randomSuffix + originalname.substring(firstDashIndex + 6);
  return replacedString;
}

/**
 * Func convert to ObjectId type
 *
 * @param value
 * @returns
 */
export function toObjectId(
  value: string | Types.ObjectId | any,
): Types.ObjectId | undefined {
  if (value) return new mongoose.Types.ObjectId(value);
  else return undefined;
}

/**
 * Func convert to string type
 *
 * @param value
 * @returns
 */
export function toString(value: string | Types.ObjectId | any): string {
  if (value) return value.toString();
}

export function toArrayObjectId(array): Types.ObjectId[] {
  return array.map((record) => record._id);
}

/**
 * Func get full name account
 *
 * @param full_name
 * @param nameEnterprise
 * @returns
 */
export function getFullName(full_name: IFullName): string {
  return `${full_name.first} ${full_name.last}`;
}

export function sortObject(obj: Record<string, any>): Record<string, any> {
  // Get the keys of the object, encode them, and sort them
  const keys = Object.keys(obj)
    .map(encodeURIComponent)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  // Create a new object with the sorted keys and encoded values
  const sorted = keys.reduce((result, key) => {
    result[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    return result;
  }, {});

  return sorted;
}

/**
 * Func group by list item by field specific
 *
 * @param list
 * @param keyGetter
 * @returns
 */
export function groupBy<T>(
  list: T[],
  keyGetter: (item: T) => string,
): Grouped<T> {
  return list.reduce((grouped, item) => {
    const key = keyGetter(item);
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
    return grouped;
  }, new Map<string, T[]>());
}

/**
 * Func to group by list array by field Date type
 *
 * @param list
 * @param field
 * @returns
 */
export function groupByDate<T>(list: T[], field: string): Grouped<T> {
  return list.reduce((grouped, item) => {
    const key = moment(item[field]).format('DD/MM/YYYY');
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
    return grouped;
  }, new Map<string, T[]>());
}

/**
 * Func to convert map to object
 *
 * @param inputMap
 * @returns
 */
export function mapToObject<T>(inputMap: Map<string, T>): { [key: string]: T } {
  return Object.fromEntries(inputMap);
}

/**
 * Func remove field in object
 *
 * @param obj
 * @param fields
 * @returns
 */
export function removeFieldsObject(obj: any, fields: string[]) {
  if (fields.length > 0 && obj) {
    fields.forEach((field) => {
      obj.hasOwnProperty('_id') ? delete obj[field] : delete obj['_doc'][field];
    });
  }
  return obj;
}

/** Func convert string to normalized and lowercase
 *
 * @param inputString
 * @returns
 */
export function convertToLowerCaseWithoutAccents(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' ',
  );
  return str.toLowerCase();
}

export async function convertPathFiles(
  files: IFilesImage,
  folder: string,
): Promise<IFilesImage> {
  const result = files.map(async (file: IFileImage) => ({
    ...file,
    path:
      file.path.slice(-4) === '.svg'
        ? file.path
        : await resizeImage(file.path, dimension[folder]),
  }));
  return Promise.all(result);
}

/**
 * Func convert object to object with fields string type
 *
 * @param obj
 * @returns
 */
export function objectFieldsToString(
  obj: Record<string, any>,
): Record<string, string> {
  const data: Record<string, string> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      data[key] =
        typeof obj[key] === 'object' && obj[key] !== null
          ? JSON.stringify(obj[key])
          : toString(obj[key]);
    }
  }
  return data;
}

/**
 * Func to remove accents (diacritics) from a string
 * @param str
 * @returns
 */
export function removeAccent(str: string) {
  return str
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd');
}

/**
 * Convert array to object
 *
 * @param arr
 * @returns
 */
export function arrayToObject(arr) {
  const obj = {};
  arr.forEach((item) => {
    const key = Object.keys(item)[0]; // Extracting the key
    obj[key] = item[key];
  });
  return obj;
}
