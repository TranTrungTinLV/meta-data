import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParsePricesPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value.prices === 'string') {
      try {
        value.prices = JSON.parse(value.prices);
      } catch (error) {
        throw new BadRequestException('Prices must be a valid JSON array');
      }
    }
    return value;
  }
}
