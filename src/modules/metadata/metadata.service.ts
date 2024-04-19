import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Client } from '@elastic/elasticsearch';
@Injectable()
export class MetadataService {
  private readonly client: Client;
  constructor(
    private readonly elasticService: ElasticsearchService
    
    ) {
    this.client = new Client({
      node: 'https://localhost:9200/',
      auth: {
        username: 'elastic',
        password: 'ApV-4EaiuiPlJMDZh5*+',
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  }

  async indexExists(index: string): Promise<boolean> {
    return this.client.indices.exists({ index });
  }

  async createIndex(index: string,indexBody: any): Promise<void> {
     indexBody = {
      settings: { number_of_shards: 1, number_of_replicas: 1 },
      mappings: {
        properties: {
          name: { type: 'text' },
          code: { type: 'text' },
          detail: { type: 'text' },
          images: { type: 'keyword' }
        }
      }
    };

    await this.client.indices.create({
      index,
      body: indexBody
    });
  }

  async index(index: string, document: any): Promise<any> {
    return this.client.index({
      index,
      document
    });
  }

  async searchElastic(index: string, query: any): Promise<any> {
    return this.client.search({
      index,
      body: {
        query: {
          match: {
            name: query
          }
        }
      }
    });
  }
}
