// import { Module } from '@nestjs/common';
// import { MetadataService } from './metadata.service';
// import { MetadataController } from './metadata.controller';
// import { ElasticsearchModule } from '@nestjs/elasticsearch';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       envFilePath: '.env',
//       isGlobal: true,
//     }),
//     ElasticsearchModule.registerAsync({
//       useFactory: async (configService: ConfigService) => ({
//         node: configService.get<string>('ELASTICSEARCH_NODE'),
//         maxRetries: configService.get<number>('MAXRETRIES'),
//         requestTimeout: configService.get<number>('REQUESTTIMEOUT'),
//         pingTimeout: configService.get<number>('PINGTIMEOUT'),
//         sniffOnStart: true,
//         auth: {
//           username: configService.get<string>('USERNAME'),
//           password: configService.get<string>('PASSWORD'),
//         },
//         tls: {
//           rejectUnauthorized: false,
//         },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   controllers: [MetadataController],
//   providers: [MetadataService],
//   exports: [MetadataService],
// })
// export class MetadataModule {}
