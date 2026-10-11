import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PostsModule } from './posts/posts.module.js';

import { RedisModule } from './redis/redis.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { ProfileModule } from './users/profile.module.js';

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
    CommentsModule,
    ProfileModule,

  ],
})
export class AppModule {}