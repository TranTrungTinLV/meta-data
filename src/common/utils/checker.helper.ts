import { toString } from './converter.helper';

export function validateEmail(email: string) {
  const regex = /^[\w-\.]+@gmail\.com$/;
  return regex.test(email);
}
export function isPhoneNumber(phoneNumber: string) {
  return /((^(\+84|84|0){1})(3|5|7|8|9))+([0-9]{8})$/.test(phoneNumber);
}
export function checkArrayAInArrayB(arrayA: any[], arrayB: any[]): boolean {
  arrayB = arrayB.map((item) => toString(item));
  const isAllInArrB = arrayA.every((item) => arrayB.includes(toString(item)));
  return isAllInArrB;
}
