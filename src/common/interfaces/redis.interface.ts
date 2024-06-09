import { CacheStore, CacheStoreSetOptions } from "@nestjs/cache-manager";

export interface RedisStore extends CacheStore {
  setJSON<T>(
    key: string,
    value: T,
    options?: CacheStoreSetOptions<T> | number
  ): Promise<void> | void;
}
