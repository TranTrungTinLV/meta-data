import { Controller } from '@nestjs/common';
import { MetadataBillService } from './metadata-bill.service';

@Controller('metadata-bill')
export class MetadataBillController {
  constructor(private readonly metadataBillService: MetadataBillService) {}
}
