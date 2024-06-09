import { DynamicModule, Module } from "@nestjs/common";
import { ElasticService } from "./elastic.service";
import { ElasticsearchModule } from "@nestjs/elasticsearch";

export interface IElasticOptions {
  node: string;
}

@Module({
  controllers: [],
  providers: [ElasticService],
})
export class ElasticModule {
  static register({ node }: IElasticOptions): DynamicModule {
    return {
      module: ElasticModule,
      imports: [
        ElasticsearchModule.register({
          node,
          maxRetries: +process.env.MAXRETRIES,
          requestTimeout: +process.env.REQUESTTIMEOUT,
          pingTimeout: +process.env.PINGTIMEOUT,
          auth: {
            username: process.env.CLIENT_USERNAME,
            password: process.env.CLIENT_PASSWORD,
          },
        }),
      ],
      exports: [ElasticsearchModule],
    };
  }
}
