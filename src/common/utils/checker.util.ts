import mongoose from 'mongoose';
import { toString } from './converter.util';
import * as bcrypt from 'bcrypt';
import { isObjectIdRegex } from '../constants';

export function isEmail(value: string): boolean {
  return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(value);
}

export function isPhone(value: string): boolean {
  return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value);
}

export function isStrongPassword(value): boolean {
  return /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(
    value,
  );
}

export function isPositiveInteger(num: number): boolean {
  return num >= 0 && Math.floor(num) === num;
}

export function isMatchTwoArray(arr1, arr2): boolean {
  const isMatch =
    arr1.every((item) => arr2.includes(item)) &&
    arr2.every((item) => arr1.includes(item));
  return isMatch;
}

export function hasPermission(arr1, arr2): boolean {
  return arr2.every((per) => arr1.includes(per));
}

export function checkArrayAInArrayB(arrayA: any[], arrayB: any[]): boolean {
  arrayB = arrayB.map((item) => toString(item));
  const isAllInArrB = arrayA.every((item) => arrayB.includes(toString(item)));
  return isAllInArrB;
}

export function isLeapYear(year: number): boolean {
  if (year % 4 !== 0) {
    return false;
  } else if (year % 100 !== 0) {
    return true;
  } else if (year % 400 !== 0) {
    return false;
  } else {
    return true;
  }
}

export function isFieldValid(field: any): boolean {
  if (typeof field === 'string' && field !== '') {
    return true;
  }

  if (Array.isArray(field) && field.length > 0) {
    return true;
  }

  if (
    typeof field === 'object' &&
    field !== null &&
    Object.keys(field).length > 0
  ) {
    return true;
  }
  return false;
}

export function isNumber(value: any): boolean {
  if (typeof value === 'number' && !isNaN(value)) {
    return true;
  } else {
    return false;
  }
}

export function isDateTime(value: any): boolean {
  if (value instanceof Date) {
    return true;
  } else {
    return false;
  }
}

export function isBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return true;
  } else {
    return false;
  }
}

export function isObjectId(value: any): boolean {
  const regexObjectId = new RegExp(isObjectIdRegex);
  return mongoose.Types.ObjectId.isValid(value) && regexObjectId.test(value);
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}

export function isObjectNotEmpty(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  return Object.keys(obj).length !== 0;
}

export function isValidTypeEnOrDecrypt(value: string): boolean {
  return (
    !isNumber(value) &&
    !isDateTime(value) &&
    !isBoolean(value) &&
    !isObjectId(value) &&
    !isArray(value) &&
    !isObjectNotEmpty(value)
  );
}


/**
 * check document is exits in redis
 * @param documents
 * @param target is document name
 */
export function hasDataRedisExit(
  PRedisEnterprise,
  documents,
  attribute: string,
): boolean {
  const documentsTarget = PRedisEnterprise?.[attribute];

  if (!documentsTarget) return false;

  if (documentsTarget) {
    for (const doc of documents) {
      if (documentsTarget.includes(toString(doc._id))) {
        return true;
      }
    }
  }
  return false;
}

/**
 * check object exists field require
 * @param obj
 * @param fields : list field to check exist in object ?
 */
export function isValidObject(obj: any, fields: string[]): boolean {
  for (const item of fields) {
    if (!(item in obj) || obj[item] === undefined) {
      return false;
    }
  }
  return true;
}

export function isValidTokenDevice(value: any): boolean {
  return typeof value === 'string' && value.length > 10;
}

export async function isPasswordMatch(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
