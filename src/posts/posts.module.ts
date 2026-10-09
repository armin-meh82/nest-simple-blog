import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    JwtAuthGuard,
  ],
})
export class PostsModule {}