import { Module } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.register({
        node: 'https://localhost:9200',
        maxRetries: 10,
        requestTimeout: 6000,
        pingTimeout: 6000,
        sniffOnStart: true,
        auth: {
          username: 'elastic',
          password: 'ApV-4EaiuiPlJMDZh5*+',
        },
        tls: {
          rejectUnauthorized: false
        }
    }),
  ],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService]
})
export class MetadataModule {}
