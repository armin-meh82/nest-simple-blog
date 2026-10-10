import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PostsModule } from './posts/posts.module.js';

import { RedisModule } from './redis/redis.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    EventEmitterModule.forRoot(),

    PrismaModule,
    RedisModule,
    AuthModule,
    PostsModule,

  ],
})
export class AppModule {}