
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PostRateLimitGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @ApiResponse({
    status: 429,
    description: 'Post creation rate limit exceeded',
  })
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
  @ApiOperation({
    summary: 'Get the paginated global post feed',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number, starting at 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page; maximum 50',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated feed',
  })
  feed(@Query() query: QueryPostsDto) {
    return this.postsService.feed(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a post thread with paginated top-level comments',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Post ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Post details and comments',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update your post' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found or not owned by user',
  })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete your post' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found or not owned by user',
  })
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
