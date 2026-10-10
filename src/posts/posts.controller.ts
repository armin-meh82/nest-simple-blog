import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create.dto.js';
import { UpdatePostDto } from './dto/update.dto.js';
import { QueryPostsDto } from './dto/query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PostRateLimitGuard } from './guards/post-rate-limit.guard.js';

type AuthenticatedRequest = Request & {
  user: {
    sub: number;
    username: string;
  };
};

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PostRateLimitGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(
      Number(request.user.sub),
      dto,
    );
  }

  @Get()
  feed(@Query() query: QueryPostsDto) {
    return this.postsService.feed(query);
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.postsService.thread(
      id,
      Math.max(1, Number(page) || 1),
      Math.min(50, Math.max(1, Number(limit) || 10)),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(
      id,
      Number(request.user.sub),
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.postsService.remove(
      id,
      Number(request.user.sub),
    );
  }
}