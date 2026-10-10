import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from './redis.service.js';

@Injectable()
export class CacheInvalidationListener {
  constructor(private readonly redis: RedisService) {}

  @OnEvent('posts.changed')
  async invalidateFeed(): Promise<void> {
    await this.redis.invalidateFeed();
  }
}