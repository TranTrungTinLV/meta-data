import { toString } from "./converter.helper";

export function checkArrayAInArrayB(arrayA: any[], arrayB: any[]): boolean {
  arrayB = arrayB.map((item) => toString(item));
  const isAllInArrB = arrayA.every((item) => arrayB.includes(toString(item)));
  return isAllInArrB;
}
