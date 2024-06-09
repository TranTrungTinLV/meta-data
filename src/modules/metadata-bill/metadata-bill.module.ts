import { Module } from '@nestjs/common';
import { MetadataBillService } from './metadata-bill.service';
import { MetadataBillController } from './metadata-bill.controller';

@Module({
  controllers: [MetadataBillController],
  providers: [MetadataBillService],
})
export class MetadataBillModule {}
