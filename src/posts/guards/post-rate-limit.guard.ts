import {
    CanActivate,
    ExecutionContext,
    Injectable,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import type { Request } from 'express';
  import { RedisService } from '../../redis/redis.service.js';
  
  type AuthenticatedRequest = Request & {
    user: { sub: number };
  };
  
  @Injectable()
  export class PostRateLimitGuard implements CanActivate {
    constructor(private readonly redis: RedisService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp()
        .getRequest<AuthenticatedRequest>();
  
      const userId = request.user?.sub;
  
      if (userId === undefined || userId === null) {
        throw new HttpException(
          'Unauthorized',
          HttpStatus.UNAUTHORIZED,
        );
      }
  
      const key = `rate:posts:${userId}`;
      const count = await this.redis.client.incr(key);
  
      if (count === 1) {
        await this.redis.client.expire(key, 60);
      }
  
      if (count > 5) {
        throw new HttpException(
          'Too many posts. Try again in a minute.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
  
      return true;
    }
  }