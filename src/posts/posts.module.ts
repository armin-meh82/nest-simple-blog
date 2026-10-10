import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PostRateLimitGuard } from './guards/post-rate-limit.guard.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [
    ConfigModule,
    RedisModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    JwtAuthGuard,
    PostRateLimitGuard,
  ],
})
export class PostsModule {}