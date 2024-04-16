import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBodyOptions, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GenerateApiSwagger(
  summary: string,
  responses?: { [key in keyof typeof HttpStatus]?: string },
  options?: { isBearer?: boolean; file?: boolean; files?: boolean },
  body?: ApiBodyOptions,
) {
  const decorators = [ApiOperation({ summary }), ApiResponse({ status: 500, description: 'Internal server error' })];

  for (const status in responses) {
    decorators.push(
      ApiResponse({
        status: Number(HttpStatus[status]),
        description: responses[status],
      }),
    );
  }

  if (options) {
    if (options.isBearer) decorators.push(ApiBearerAuth(), ApiResponse({ status: 401, description: 'Unauthorized' }));
    if (options.file || options.files) decorators.push(ApiConsumes('multipart/form-data'));
  }

  return applyDecorators(...decorators);
}
