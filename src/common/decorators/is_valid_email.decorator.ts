import { ValidationOptions, ValidateBy } from 'class-validator';
import { isEmail } from '../constants';

export const IsValidEmail = (validationOptions?: ValidationOptions) => {
  return ValidateBy(
    {
      name: 'isValidEmail',
      validator: {
        validate(value: any) {
          const regex = isEmail;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage() {
          return 'Email must be a valid format';
        },
      },
    },
    validationOptions,
  );
};
