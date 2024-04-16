import { Types } from "mongoose";

/**
 * Func convert to string type
 *
 * @param value
 * @returns
 */
export function toString(value: string | Types.ObjectId | any): string {
  if (value) return value.toString();
}
