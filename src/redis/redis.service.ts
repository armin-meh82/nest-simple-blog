import {
    Injectable,
    OnModuleDestroy,
  } from '@nestjs/common';
  import { Redis } from 'ioredis';
  
  @Injectable()
  export class RedisService implements OnModuleDestroy {
    readonly client: Redis;
  
    constructor() {
      this.client = new Redis(
        process.env.REDIS_URL ?? 'redis://localhost:6379',
        {
          maxRetriesPerRequest: 1,
          lazyConnect: false,
        },
      );
  
      this.client.on('error', (error) => {
        console.error('Redis error:', error.message);
      });
    }
  
    async get<T>(key: string): Promise<T | null> {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    }
  
    async set(
      key: string,
      value: unknown,
      ttlSeconds = 60,
    ): Promise<void> {
      await this.client.set(
        key,
        JSON.stringify(value),
        'EX',
        ttlSeconds,
      );
    }
  
    async invalidateFeed(): Promise<void> {
      await this.client.incr('feed:version');
    }
  
    async getFeedVersion(): Promise<string> {
      return (await this.client.get('feed:version')) ?? '0';
    }
  
    async onModuleDestroy(): Promise<void> {
      await this.client.quit();
    }
  }