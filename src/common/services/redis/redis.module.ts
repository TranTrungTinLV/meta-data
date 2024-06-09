import { DynamicModule, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { CacheModule } from "@nestjs/cache-manager";
import { RedisClientOptions } from "redis";
import * as redisStore from "cache-manager-redis-store";

export interface IRedisOption {}

@Module({
  controllers: [],
  providers: [RedisService],
})
export class RedisModule {
  static register(): DynamicModule {
    return {
      module: RedisModule,
      imports: [
        CacheModule.register<RedisClientOptions>({
          store: redisStore,
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        }),
      ],
      exports: [CacheModule],
    };
  }
}
