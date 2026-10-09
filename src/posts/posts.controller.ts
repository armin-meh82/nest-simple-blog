import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  
  import type { Request } from 'express';
  
  import { PostsService } from './posts.service.js';
  import { CreatePostDto } from './dto/create.dto.js';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
  
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
    @UseGuards(JwtAuthGuard)
    create(
      @Req() request: AuthenticatedRequest,
      @Body() dto: CreatePostDto,
    ) {
      return this.postsService.create(
        request.user.sub,
        dto,
      );
    }
  
    @Get(':id')
    findById(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.postsService.findById(id);
    }
  }