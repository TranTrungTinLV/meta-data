export const isPhone = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
export const isStrongPassword =
  /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
export const isCodeVerify = /^[0-9]{6}$/;
export const isStrongUsername =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])(?=.*[^\w\s]).{8,}$/;
export const isObjectIdRegex = /^[a-fA-F0-9]{24}$/;
export const dimension = {
  'chat-service': { width: 800, height: 800 },
};
