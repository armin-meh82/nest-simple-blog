import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service.js';
import { CacheInvalidationListener } from './cache.listener.js';

@Global()
@Module({
  providers: [
    RedisService,
    CacheInvalidationListener,
  ],
  exports: [
    RedisService,
  ],
})
export class RedisModule {}