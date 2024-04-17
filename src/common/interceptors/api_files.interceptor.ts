import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import multerOptions from '../filters/file_mimetype.filter';

export function ApiFiles(
  fieldName = 'files',
  required = false,
  maxCount = 20,
  dir = '',
) {
  return applyDecorators(
    UseInterceptors(FilesInterceptor(fieldName, maxCount, multerOptions())),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    }),
  );
}
